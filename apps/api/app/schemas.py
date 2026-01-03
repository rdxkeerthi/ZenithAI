from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str
    work_type: Optional[str] = None
    working_hours: Optional[float] = None
    mobile_usage: Optional[float] = None
    health_info: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    name: str
    work_type: Optional[str]
    working_hours: Optional[float]
    mobile_usage: Optional[float]
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class GameSessionCreate(BaseModel):
    user_id: int
    baseline_stress: Optional[float] = None

class GameDataCreate(BaseModel):
    game_name: str
    game_number: int
    score: float
    duration: float
    face_data: str
    stress_scores: str
    avg_stress: float
    max_stress: float
    min_stress: float

class StressReportResponse(BaseModel):
    id: int
    overall_stress: float
    stress_level: str
    stress_trend: str
    recommendations: str
    activities: str
    workouts: str
    meditation: str
    food_control: str
    medical_checkup: str
    created_at: datetime
    
    class Config:
        from_attributes = True
