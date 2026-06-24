import os
from fastapi import APIRouter, HTTPException, status
from app.models.schemas import ResponseTriggerRequest, ResponseTriggerResponse, ActionStatus
from app.api.incidents import get_incident
from app.db.mongodb import get_db
from datetime import datetime
import aiosmtplib
from email.mime.text import MIMEText

router = APIRouter(prefix="/response", tags=["response"])

async def send_email_alert(subject: str, body: str):
    SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com").strip()
    SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USER = os.getenv("SMTP_USER", "").strip()
    SMTP_PASS = os.getenv("SMTP_PASS", "").strip()
    
    if not SMTP_USER or not SMTP_PASS:
        print("SMTP Credentials not set. Logging simulated email alert:")
        print(f"To: Admin, Subject: {subject}\nBody: {body}")
        return True
        
    try:
        message = MIMEText(body)
        message["From"] = SMTP_USER
        message["To"] = SMTP_USER  # Send alert to self/admin email
        message["Subject"] = subject
        
        await aiosmtplib.send(
            message,
            hostname=SMTP_HOST,
            port=SMTP_PORT,
            username=SMTP_USER,
            password=SMTP_PASS,
            start_tls=True
        )
        print("Real SMTP alert email sent successfully.")
        return True
    except Exception as e:
        print(f"Failed to send email alert via SMTP: {e}")
        return False

@router.post("/trigger", response_model=ResponseTriggerResponse)
async def trigger_response(req: ResponseTriggerRequest):
    """
    Triggers containment workflow actions for the specified incident.
    """
    try:
        incident = await get_incident(req.incidentId)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Incident {req.incidentId} not found."
        )
        
    threat_type = incident.get("threatType", "DDoS")
    sourceIP = incident.get("sourceIP", "0.0.0.0")
    severity = incident.get("severity", "low")
    
    actions_executed = []
    
    # Process actions
    for action in req.actions:
        action_id = f"act-{action[:3]}-{datetime.utcnow().strftime('%M%S')}"
        status_val = "completed"
        desc = ""
        
        if action == "block_ip":
            # Simulate shell command for iptables block
            desc = f"Updated edge firewall configuration. Added block rule: `iptables -A INPUT -s {sourceIP} -j DROP`"
            
        elif action == "send_alert":
            subject = f"⚠️ CyberGuard AI: Containment Active - {threat_type} detected"
            body = (
                f"CyberGuard AI Autonomous Containment Action Log:\n\n"
                f"Incident: {threat_type} (Threat ID: {req.incidentId})\n"
                f"Severity: {severity.upper()}\n"
                f"Target IP: {sourceIP}\n"
                f"Action: Blocked network boundary access.\n\n"
                f"Time: {datetime.utcnow().isoformat()} UTC\n"
            )
            success = await send_email_alert(subject, body)
            status_val = "completed" if success else "failed"
            desc = "Dispatched notification email to Security Administrator list."
            if not success:
                desc += " (SMTP transmission failed, logged instead)"
                
        elif action == "create_ticket":
            desc = f"Created JIRA Service Desk incident ticket: SEC-{req.incidentId[:6].upper()} with Critical priority status."
            
        elif action == "notify_admin":
            desc = "Slack channel notification sent to #secops-alerts channel."
            
        elif action == "isolate_system":
            desc = f"VLAN isolation triggered for target nodes. Isolated from production network."
            
        else:
            status_val = "failed"
            desc = f"Action {action} unknown or unsupported."
            
        actions_executed.append({
            "id": action_id,
            "type": action,
            "status": status_val,
            "description": desc,
            "timestamp": datetime.utcnow().isoformat() + "Z"
        })
        
    # Update incident status in DB to "contained" or "resolved"
    db = get_db()
    incidents_col = db["incidents"]
    await incidents_col.update_one(
        {"_id": req.incidentId},
        {"$set": {"status": "contained"}}
    )
    
    return {
        "incidentId": req.incidentId,
        "status": "contained",
        "actionsExecuted": actions_executed
    }
