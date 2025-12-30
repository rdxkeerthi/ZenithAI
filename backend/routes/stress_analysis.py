"""
Stress analysis routes
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime
from backend.database.db import get_db
from backend.database.models import StressSession, StressReading
import uuid

router = APIRouter()

class StartSession(BaseModel):
    user_id: int

@router.post("/start")
async def start_analysis(data: StartSession, db: Session = Depends(get_db)):
    """Start new stress analysis session"""
    
    session_id = str(uuid.uuid4())
    
    new_session = StressSession(
        user_id=data.user_id,
        session_id=session_id,
        started_at=datetime.utcnow()
    )
    
    db.add(new_session)
    db.commit()
    
    return {"session_id": session_id, "status": "started"}

@router.get("/history/{user_id}")
async def get_analysis_history(user_id: int, db: Session = Depends(get_db)):
    """Get user's analysis history"""
    
    sessions = db.query(StressSession).filter(StressSession.user_id == user_id).all()
    
    return {"sessions": sessions}
@router.post("/complete/{session_id}")
async def complete_analysis(session_id: str, db: Session = Depends(get_db)):
    """Complete stress analysis session"""
    session = db.query(StressSession).filter(StressSession.session_id == session_id).first()
    if session:
        session.ended_at = datetime.utcnow()
        # Calculate final average stress logic here if needed, or leave it to report generation
        db.commit()
        return {"status": "completed"}
    return {"status": "not_found"}
