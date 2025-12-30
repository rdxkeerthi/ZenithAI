"""
Dashboard routes
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.database.db import get_db
from backend.database.models import StressSession, User
from typing import List

router = APIRouter()

@router.get("/stats/{user_id}")
async def get_user_stats(user_id: int, db: Session = Depends(get_db)):
    """Get user dashboard statistics"""
    
    sessions = db.query(StressSession).filter(StressSession.user_id == user_id).all()
    
    total_sessions = len(sessions)
    avg_stress = sum([s.average_stress_score or 0 for s in sessions]) / total_sessions if total_sessions > 0 else 0
    
    
    recent_data = []
    for s in sessions[-5:]: # Last 5 sessions
        # Get readings
        curve = [r.stress_score for r in s.readings]
        recent_data.append({
            "session_id": s.session_id,
            "stress_level": s.stress_level,
            "started_at": s.started_at,
            "ended_at": s.ended_at,
            "average_stress_score": s.average_stress_score,
            "games_played": len(s.game_results),
            "stress_curve": curve
        })

    return {
        "total_sessions": total_sessions,
        "average_stress": avg_stress,
        "recent_sessions": recent_data
    }
