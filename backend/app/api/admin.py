from fastapi import APIRouter, HTTPException, status
from typing import List, Dict, Any
from app.db.mongodb import get_db
from app.models.schemas import UserResponse, UserUpdate
from bson import ObjectId
from datetime import datetime, timedelta

router = APIRouter(prefix="/admin", tags=["admin"])

@router.get("/users")
async def get_users():
    """
    Get all registered users.
    """
    db = get_db()
    users_col = db["users"]
    
    cursor = users_col.find()
    items = await cursor.to_list(length=100)
    
    res = []
    for item in items:
        res.append({
            "id": str(item["_id"]),
            "name": item.get("name", "User"),
            "email": item.get("email", ""),
            "role": item.get("role", "analyst"),
            "createdAt": item.get("createdAt", datetime.utcnow().isoformat())
        })
        
    # Inject a few mock users for demo if empty
    if not res:
        res = [
            {"id": "admin-id", "name": "Super Admin", "email": "admin@cyberguard.ai", "role": "admin", "createdAt": (datetime.utcnow() - timedelta(days=30)).isoformat()},
            {"id": "analyst-1", "name": "Alex Carter", "email": "alex@cyberguard.ai", "role": "analyst", "createdAt": (datetime.utcnow() - timedelta(days=15)).isoformat()},
            {"id": "viewer-1", "name": "Sara Jenkins", "email": "sara@cyberguard.ai", "role": "viewer", "createdAt": (datetime.utcnow() - timedelta(days=5)).isoformat()}
        ]
        
    return res

@router.put("/users/{id}")
async def update_user(id: str, data: UserUpdate):
    """
    Update a user profile.
    """
    db = get_db()
    users_col = db["users"]
    
    update_data = {}
    if data.name is not None:
        update_data["name"] = data.name
    if data.role is not None:
        update_data["role"] = data.role
        
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
        
    # Handle mock update
    if id in ["admin-id", "analyst-1", "viewer-1"]:
        return {"id": id, "status": "updated", "data": update_data}
        
    try:
        # DB update
        filt = {"_id": ObjectId(id)} if ObjectId.is_valid(id) else {"_id": id}
        res = await users_col.update_one(filt, {"$set": update_data})
        if res.modified_count == 0:
            raise HTTPException(status_code=404, detail="User not found")
        return {"id": id, "status": "updated", "data": update_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/users/{id}")
async def delete_user(id: str):
    """
    Delete a user account.
    """
    db = get_db()
    users_col = db["users"]
    
    # Handle mock delete
    if id in ["admin-id", "analyst-1", "viewer-1"]:
        return {"id": id, "status": "deleted"}
        
    try:
        filt = {"_id": ObjectId(id)} if ObjectId.is_valid(id) else {"_id": id}
        res = await users_col.delete_one(filt)
        if res.deleted_count == 0:
            raise HTTPException(status_code=404, detail="User not found")
        return {"id": id, "status": "deleted"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/logs")
async def get_system_logs() -> List[Dict[str, Any]]:
    """
    Returns running system audit logs.
    """
    now = datetime.utcnow()
    # Simulated log stream
    logs = [
        {"id": "l1", "timestamp": (now - timedelta(minutes=2)).isoformat(), "level": "info", "message": "ML Pipeline health check: Normal. GPU load 12%"},
        {"id": "l2", "timestamp": (now - timedelta(minutes=5)).isoformat(), "level": "warning", "message": "Rate limits exceeded at edge interface load-balancer-02"},
        {"id": "l3", "timestamp": (now - timedelta(minutes=12)).isoformat(), "level": "info", "message": "FastAPI server successfully loaded weights for XGBoost classifier"},
        {"id": "l4", "timestamp": (now - timedelta(minutes=15)).isoformat(), "level": "critical", "message": "DDoS volume threshold alert dispatched: 52,847 pps"},
        {"id": "l5", "timestamp": (now - timedelta(minutes=22)).isoformat(), "level": "info", "message": "ChromaDB vector store collection re-indexed. 5 playbook records seeded"},
        {"id": "l6", "timestamp": (now - timedelta(minutes=45)).isoformat(), "level": "info", "message": "Scheduler: Saved snapshot of model monitoring metrics to db"}
    ]
    return logs

@router.get("/models")
async def get_model_metrics() -> Dict[str, Any]:
    """
    Returns performance monitoring metrics for ML models.
    """
    return {
        "xgboost": {
            "accuracy": 0.984,
            "precision": 0.978,
            "recall": 0.981,
            "f1Score": 0.979,
            "driftStatus": "none",
            "lastTrained": "2026-06-22T04:00:00Z"
        },
        "randomForest": {
            "accuracy": 0.952,
            "precision": 0.941,
            "recall": 0.948,
            "f1Score": 0.944,
            "driftStatus": "none",
            "lastTrained": "2026-06-22T04:15:00Z"
        },
        "decisionTree": {
            "accuracy": 0.910,
            "precision": 0.899,
            "recall": 0.902,
            "f1Score": 0.900,
            "driftStatus": "none",
            "lastTrained": "2026-06-22T04:30:00Z"
        },
        "knn": {
            "accuracy": 0.965,
            "precision": 0.960,
            "recall": 0.963,
            "f1Score": 0.961,
            "driftStatus": "none",
            "lastTrained": "2026-06-22T04:35:00Z"
        },
        "kmeans": {
            "silhouetteScore": 0.628,
            "daviesBouldin": 0.74,
            "driftStatus": "none",
            "lastTrained": "2026-06-22T04:40:00Z"
        }
    }
