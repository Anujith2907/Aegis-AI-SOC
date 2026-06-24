import os
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db.mongodb import verify_db_connection
from app.api import auth, threats, incidents, copilot, reports, response, admin

# Setup FastAPI App
app = FastAPI(
    title="CyberGuard AI API",
    description="Autonomous Network Incident Investigation & Response System Backend",
    version="2.0.0"
)

# Configure CORS for React frontend compatibility
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to the frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router)
app.include_router(threats.router)
app.include_router(incidents.router)
app.include_router(copilot.router)
app.include_router(reports.router)
app.include_router(response.router)
app.include_router(admin.router)

@app.on_event("startup")
async def startup_event():
    # Verify MongoDB connection
    await verify_db_connection()
    
    # Verify if ML models are already trained, otherwise auto-train them!
    model_path = os.path.join(os.path.dirname(__file__), "ml", "models", "xgb_model.pkl")
    if not os.path.exists(model_path):
        print("ML Models not found. Initializing automatic pipeline training...")
        try:
            from app.ml.trainer import train_and_save_models
            train_and_save_models()
        except Exception as e:
            print(f"Failed to auto-initialize ML pipeline training on startup: {e}")
    else:
        print("ML Models verified successfully. Ready for inference requests.")

@app.get("/")
async def root():
    return {
        "status": "online",
        "service": "CyberGuard AI Backend Engine",
        "version": "2.0.0"
    }

if __name__ == "__main__":
    # Get port from environment variables, default to 8000
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
