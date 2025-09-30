# routes/auth.py
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from db import db
from utils.auth_utils import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user,
    ACCESS_TOKEN_EXPIRE_MINUTES
)
from bson import ObjectId
from typing import Optional

router = APIRouter(prefix="/auth", tags=["Authentication"])

class UserSignup(BaseModel):
    name: str
    email: EmailStr
    password: str
    confirm_password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserProfileUpdate(BaseModel):
    name: Optional[str] = None
    password: Optional[str] = None

@router.post("/signup")
async def signup(user: UserSignup):
    if user.password != user.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match")
    existing = await db.users.find_one({"email": user.email})
    if existing:
        raise HTTPException(status_code=400, detail="User already exists")
    hashed = hash_password(user.password)
    new_user = {"name": user.name, "email": user.email, "password": hashed}
    res = await db.users.insert_one(new_user)
    return {"message": "User created", "user_id": str(res.inserted_id)}

@router.post("/login")
async def login(user: UserLogin):
    db_user = await db.users.find_one({"email": user.email})
    if not db_user or not verify_password(user.password, db_user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    expires = ACCESS_TOKEN_EXPIRE_MINUTES
    token = create_access_token({"sub": str(db_user["_id"])})
    return {"access_token": token, "token_type": "bearer", "expires_in": expires * 60}

@router.get("/profile")
async def get_profile(current_user: dict = Depends(get_current_user)):
    return {"profile": current_user}

@router.put("/profile")
async def update_profile(update: UserProfileUpdate, current_user: dict = Depends(get_current_user)):
    upd = {}
    if update.name:
        upd["name"] = update.name
    if update.password:
        upd["password"] = hash_password(update.password)
    if not upd:
        raise HTTPException(status_code=400, detail="No fields to update")
    res = await db.users.update_one({"_id": ObjectId(current_user["_id"])}, {"$set": upd})
    if res.modified_count == 0:
        raise HTTPException(status_code=404, detail="No changes made")
    return {"message": "Profile updated"}
