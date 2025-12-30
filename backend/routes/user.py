"""
User routes
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from backend.database.db import get_db
from backend.database.models import User
from backend.auth.jwt_utils import get_current_user

router = APIRouter()

class UserProfileUpdate(BaseModel):
    job_role: Optional[str] = None
    work_hours: Optional[int] = None
    sleep_hours: Optional[int] = None
    work_type: Optional[str] = None
    electronics_usage: Optional[int] = None

class UserProfileResponse(BaseModel):
    id: int
    email: str
    name: str
    job_role: Optional[str] = None
    work_hours: Optional[int] = None
    sleep_hours: Optional[int] = None
    work_type: Optional[str] = None
    electronics_usage: Optional[int] = None

@router.put("/profile", response_model=UserProfileResponse)
async def update_profile(
    profile_data: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update user profile"""
    
    # Update fields if provided
    if profile_data.job_role is not None:
        current_user.job_role = profile_data.job_role
    if profile_data.work_hours is not None:
        current_user.work_hours = profile_data.work_hours
    if profile_data.sleep_hours is not None:
        current_user.sleep_hours = profile_data.sleep_hours
    if profile_data.work_type is not None:
        current_user.work_type = profile_data.work_type
    if profile_data.electronics_usage is not None:
        current_user.electronics_usage = profile_data.electronics_usage
        
    db.commit()
    db.refresh(current_user)
    
    return current_user

@router.get("/profile", response_model=UserProfileResponse)
async def get_profile(current_user: User = Depends(get_current_user)):
    """Get user profile"""
    return current_user
