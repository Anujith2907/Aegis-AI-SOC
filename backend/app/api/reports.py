from fastapi import APIRouter, HTTPException, status
from app.models.schemas import ReportGenerateRequest, ReportGenerateResponse
from app.db.mongodb import get_db
from app.api.incidents import get_incident
from datetime import datetime
import os

router = APIRouter(prefix="/reports", tags=["reports"])

@router.post("/generate", response_model=ReportGenerateResponse)
async def generate_report(req: ReportGenerateRequest):
    """
    Generates a structured incident investigation report via RAG LLM.
    """
    try:
        incident = await get_incident(req.incidentId)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Cannot generate report: Incident {req.incidentId} not found."
        )
        
    threat_type = incident.get("threatType", "Unknown")
    severity = incident.get("severity", "low")
    sourceIP = incident.get("sourceIP", "0.0.0.0")
    risk_score = incident.get("riskScore", 0.0)
    business_impact = incident.get("businessImpact", "Operational systems affected.")
    
    # We query Llama 3 via Groq for high-quality report narrative if API key is active
    GROQ_API_KEY = os.getenv("GROQ_API_KEY", "").strip()
    
    report_title = f"AI Incident Investigation Report: {threat_type} anomaly ({req.type.capitalize()})"
    generated_at = datetime.utcnow().isoformat() + "Z"
    
    if GROQ_API_KEY:
        try:
            from langchain_groq import ChatGroq
            from langchain_core.prompts import ChatPromptTemplate
            
            chat = ChatGroq(
                temperature=0.3,
                groq_api_key=GROQ_API_KEY,
                model_name=os.getenv("LLM_MODEL", "llama3-8b-8192")
            )
            
            prompt = ChatPromptTemplate.from_messages([
                ("system", "You are an expert Cyber Security Forensics Examiner. Draft a detailed structured section of a security incident report based on the parameters provided. Respond in plain text without wrapping inside sections or titles."),
                ("human", "Incident: {threat} ({severity} severity), source IP: {source_ip}, risk score: {risk}. Generate a {section_name} section in a professional {report_type} report.")
            ])
            
            chain = prompt | chat
            
            # Simple helper to invoke chain for sections
            async def gen_section(name):
                res = await chain.ainvoke({
                    "threat": threat_type,
                    "severity": severity,
                    "source_ip": sourceIP,
                    "risk": risk_score,
                    "section_name": name,
                    "report_type": req.type
                })
                return res.content.strip()
                
            summary = await gen_section("Executive Summary")
            timeline = await gen_section("Detailed Incident Timeline")
            rca = await gen_section("Root Cause Analysis (SHAP explanations)")
            impact = await gen_section("Business and System Impact Assessment")
            mitigation = await gen_section("Immediate Containment and Mitigation Action Plan")
            prevention = await gen_section("Long-Term Prevention Strategy")
            
            return {
                "id": f"rep-{req.incidentId[:6] if len(req.incidentId) > 6 else '001'}",
                "title": report_title,
                "generatedAt": generated_at,
                "executiveSummary": summary,
                "incidentTimeline": timeline,
                "rootCauseAnalysis": rca,
                "impactAssessment": impact,
                "mitigationPlan": mitigation,
                "preventionStrategy": prevention
            }
        except Exception as e:
            print(f"Failed using Groq to generate report: {e}. Falling back to template generation.")
            
    # Fallback/ offline template report generator
    summary = (
        f"On {generated_at}, a critical {threat_type} attack vector was identified targeting server clusters.\n"
        f"The network security gateway observed anomalous traffic characteristics originating from host source IP: {sourceIP}.\n"
        f"Ensemble machine learning classifiers evaluated the threat profile with a calculated risk score of {risk_score}/100. "
        f"Autonomous countermeasures were dispatched to prevent service degradation."
    )
    
    timeline = (
        f"- T00:00:00 - Log entry recorded: {threat_type} indicator flag matches model parameters.\n"
        f"- T00:02:15 - Port variance evaluation signals volumetric clustering threshold exceeded.\n"
        f"- T00:03:40 - Incident flagged as {severity.upper()} severity; alert dispatched to security team.\n"
        f"- T00:04:12 - Autonomous mitigation script executed successfully."
    )
    
    rca = (
        f"Root Cause Analysis indicates that the {threat_type} was classified based on SHAP feature allocations.\n"
        f"Primary indicators: High volume bandwidth rates, UDP protocol signatures, and concentrated destination port distributions.\n"
        f"Decision Tree tracing confirmed the classification route with 95%+ classification probability."
    )
    
    impact = (
        f"Immediate impact: {business_impact}\n"
        f"External services degraded. Secondary systems remained operational due to prompt traffic scrub gating."
    )
    
    mitigation = (
        f"1. IP ACLs updated: Malicious host IP {sourceIP} blocked at perimeter firewalls.\n"
        f"2. Border rate limiter configured to throttle packets from associated subnets.\n"
        f"3. Internal server nodes placed under active sentinel scanning filters."
    )
    
    prevention = (
        f"1. Enforce Geo-IP blocking rules at edge load balancers.\n"
        f"2. Deploy continuous audit scanners for port mappings.\n"
        f"3. Calibrate K-Means classifier cluster boundaries weekly to detect sliding signature baselines."
    )
    
    return {
        "id": f"rep-{req.incidentId[:6] if len(req.incidentId) > 6 else '001'}",
        "title": report_title,
        "generatedAt": generated_at,
        "executiveSummary": summary,
        "incidentTimeline": timeline,
        "rootCauseAnalysis": rca,
        "impactAssessment": impact,
        "mitigationPlan": mitigation,
        "preventionStrategy": prevention
    }
