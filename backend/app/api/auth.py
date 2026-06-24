import os
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from jose import JWTError, jwt
from passlib.context import CryptContext
from app.db.mongodb import get_db
from app.models.schemas import UserRegister, UserLogin, Token, UserResponse, ForgotPasswordRequest

# Configs
SECRET_KEY = os.getenv("JWT_SECRET", "cyberguard-super-secret-key-development")
ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

router = APIRouter(prefix="/auth", tags=["auth"])

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

@router.post("/register", response_model=Token)
async def register(user_data: UserRegister):
    db = get_db()
    users_col = db["users"]
    
    # Check if user already exists
    existing = await users_col.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered."
        )
        
    hashed_pwd = get_password_hash(user_data.password)
    user_doc = {
        "name": user_data.name,
        "email": user_data.email,
        "password": hashed_pwd,
        "role": user_data.role,
        "createdAt": datetime.utcnow().isoformat()
    }
    
    res = await users_col.insert_one(user_doc)
    user_id = str(res.inserted_id)
    
    # Generate token
    user_payload = {
        "id": user_id,
        "name": user_data.name,
        "email": user_data.email,
        "role": user_data.role
    }
    access_token = create_access_token(data={"sub": user_data.email})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user_payload
    }

@router.post("/login", response_model=Token)
async def login(credentials: UserLogin):
    db = get_db()
    users_col = db["users"]
    
    # Check default root/admin logins for easy sandbox presentations!
    if credentials.email == "admin@cyberguard.ai" and credentials.password == "admin123":
        user_payload = {
            "id": "admin-id",
            "name": "Super Admin",
            "email": "admin@cyberguard.ai",
            "role": "admin"
        }
        access_token = create_access_token(data={"sub": credentials.email})
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": user_payload
        }
        
    user = await users_col.find_one({"email": credentials.email})
    if not user or not verify_password(credentials.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    user_payload = {
        "id": str(user["_id"]),
        "name": user["name"],
        "email": user["email"],
        "role": user["role"]
    }
    access_token = create_access_token(data={"sub": user["email"]})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user_payload
    }

@router.post("/forgot-password")
async def forgot_password(req: ForgotPasswordRequest):
    # Simulated email response code for passwords
    db = get_db()
    users_col = db["users"]
    user = await users_col.find_one({"email": req.email})
    
    # We always return success message to prevent user enumeration
    return {
        "message": f"Password reset link has been dispatched to {req.email} if it exists in our system."
    }
