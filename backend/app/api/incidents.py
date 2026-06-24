from fastapi import APIRouter, HTTPException, status
from typing import List, Optional
from app.db.mongodb import get_db
from bson import ObjectId

router = APIRouter(prefix="/incidents", tags=["incidents"])

@router.get("")
async def get_incidents(page: int = 1, limit: int = 20):
    """
    Get all incidents with pagination.
    """
    db = get_db()
    incidents_col = db["incidents"]
    
    skip = (page - 1) * limit
    cursor = incidents_col.find().sort("timestamp", -1).skip(skip).limit(limit)
    items = await cursor.to_list(length=limit)
    
    res = []
    for item in items:
        # Convert MongoDB ObjectId to string
        item_id = str(item.get("_id"))
        res.append({
            "id": item_id,
            "title": item.get("title", "Network Incident"),
            "threatType": item.get("threatType", "Unknown"),
            "severity": item.get("severity", "low"),
            "status": item.get("status", "open"),
            "timestamp": item.get("timestamp"),
            "sourceIP": item.get("sourceIP", "0.0.0.0"),
            "affectedSystems": item.get("affectedSystems", 1),
            "riskScore": item.get("riskScore", 0.0),
            "assignedTo": item.get("assignedTo")
        })
        
    # If no items are in database, return mock items so the frontend displays initial demo incidents!
    if not res and page == 1:
        from app.ml.explainer import get_mock_analysis
        from datetime import datetime, timedelta
        
        # Build 5 realistic initial entries
        threats = ['DDoS', 'Brute Force', 'Malware', 'Port Scan', 'Unauthorized Access']
        sevs = ['critical', 'high', 'critical', 'medium', 'high']
        ips = ['192.168.1.105', '10.0.0.47', '172.16.0.22', '203.0.113.45', '192.168.1.200']
        
        for i in range(5):
            res.append({
                "id": f"sim-init-00{i+1}",
                "title": f"{threats[i]} Attack on web-gate-{i}",
                "threatType": threats[i],
                "severity": sevs[i],
                "status": "open" if i < 3 else "contained" if i == 3 else "resolved",
                "timestamp": (datetime.utcnow() - timedelta(hours=i*2)).isoformat() + "Z",
                "sourceIP": ips[i],
                "affectedSystems": int(3 + i * 2),
                "riskScore": float(95 - i * 8),
                "assignedTo": "SecOps AI Core"
            })
            
    return res

@router.get("/{id}")
async def get_incident(id: str):
    """
    Get a single incident details.
    """
    db = get_db()
    incidents_col = db["incidents"]
    
    # Try finding by ObjectId first, fallback to string matching
    item = None
    try:
        if ObjectId.is_valid(id):
            item = await incidents_col.find_one({"_id": ObjectId(id)})
    except Exception:
        pass
        
    if not item:
        item = await incidents_col.find_one({"_id": id})
        
    if not item:
        # Fallback mock for demo incidents
        if id.startswith("sim-init-") or id.startswith("live-"):
            from app.ml.explainer import get_mock_analysis
            mock_res = get_mock_analysis()
            mock_res["id"] = id
            return mock_res
            
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Incident with ID {id} not found."
        )
        
    # Return details
    details = item.get("details")
    if not details:
        # If details are missing, simulate them
        from app.ml.explainer import analyze_incident_features
        import random
        # Create some random values
        feats = [random.uniform(10, 1000) for _ in range(9)]
        details = analyze_incident_features(feats)
        
    details["id"] = str(item["_id"])
    return details

@router.get("/{id}/root-cause")
async def get_incident_root_cause(id: str):
    """
    Get root cause analysis (SHAP attributes) for a single incident.
    """
    incident = await get_incident(id)
    rca = incident.get("rootCause")
    if not rca:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Root Cause details not found for this incident."
        )
    return rca

@router.get("/{id}/similar")
async def get_incident_similar(id: str):
    """
    Get similar incidents list (KNN).
    """
    incident = await get_incident(id)
    similar = incident.get("similarIncidents")
    if not similar:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Similar historical incidents not found for this incident."
        )
    return similar
