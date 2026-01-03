from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.core.database import get_db
from app import models, schemas
from app.services.inference_service import inference_service
import json

router = APIRouter(prefix="/api/v1/stress", tags=["stress"])

@router.post("/session/start")
def start_session(
    session_data: schemas.GameSessionCreate,
    db: Session = Depends(get_db)
):
    """Start a new game session"""
    # Reset inference buffer for new session
    inference_service.reset_buffer()
    
    session = models.GameSession(
        user_id=session_data.user_id,
        baseline_stress=session_data.baseline_stress,
        started_at=datetime.utcnow()
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    
    return {"session_id": session.id, "started_at": session.started_at}

@router.post("/session/{session_id}/game")
def save_game_data(
    session_id: int,
    game_data: schemas.GameDataCreate,
    db: Session = Depends(get_db)
):
    """Save game data for a session"""
    session = db.query(models.GameSession).filter(models.GameSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    game = models.GameData(
        session_id=session_id,
        game_name=game_data.game_name,
        game_number=game_data.game_number,
        score=game_data.score,
        duration=game_data.duration,
        face_data=game_data.face_data,
        stress_scores=game_data.stress_scores,
        avg_stress=game_data.avg_stress,
        max_stress=game_data.max_stress,
        min_stress=game_data.min_stress
    )
    db.add(game)
    
    # Update session
    session.games_played += 1
    db.commit()
    
    return {"message": "Game data saved", "games_played": session.games_played}

@router.post("/session/{session_id}/complete")
def complete_session(session_id: int, db: Session = Depends(get_db)):
    """Mark session as complete"""
    session = db.query(models.GameSession).filter(models.GameSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session.completed_at = datetime.utcnow()
    db.commit()
    
    return {"message": "Session completed", "session_id": session_id}

@router.get("/session/{session_id}/data")
def get_session_data(session_id: int, db: Session = Depends(get_db)):
    """Get all data for a session"""
    session = db.query(models.GameSession).filter(models.GameSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    games = db.query(models.GameData).filter(models.GameData.session_id == session_id).all()
    
    return {
        "session": {
            "id": session.id,
            "started_at": session.started_at,
            "completed_at": session.completed_at,
            "games_played": session.games_played,
            "baseline_stress": session.baseline_stress
        },
        "games": [
            {
                "game_name": g.game_name,
                "game_number": g.game_number,
                "score": g.score,
                "duration": g.duration,
                "avg_stress": g.avg_stress,
                "max_stress": g.max_stress,
                "min_stress": g.min_stress,
                "stress_scores": json.loads(g.stress_scores) if g.stress_scores else []
            }
            for g in games
        ]
    }

@router.get("/user/{user_id}/history")
def get_user_stress_history(user_id: int, db: Session = Depends(get_db)):
    """Get stress history for a user"""
    sessions = db.query(models.GameSession).filter(
        models.GameSession.user_id == user_id
    ).order_by(models.GameSession.started_at.desc()).limit(10).all()
    
    result = []
    for session in sessions:
        games = db.query(models.GameData).filter(models.GameData.session_id == session.id).all()
        avg_stress = sum(g.avg_stress for g in games) / len(games) if games else 0
        
        result.append({
            "id": session.id,
            "created_at": session.started_at,
            "games_count": session.games_played,
            "avg_stress": avg_stress
        })
    
    return result

@router.get("/session/{session_id}")
def get_session_details(session_id: int, db: Session = Depends(get_db)):
    """Get detailed session information including all games"""
    session = db.query(models.GameSession).filter(models.GameSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    games = db.query(models.GameData).filter(
        models.GameData.session_id == session_id
    ).order_by(models.GameData.game_number).all()
    
    return {
        "id": session.id,
        "user_id": session.user_id,
        "started_at": session.started_at,
        "completed_at": session.completed_at,
        "games_played": session.games_played,
        "baseline_stress": session.baseline_stress,
        "games": [
            {
                "game_name": g.game_name,
                "game_number": g.game_number,
                "score": g.score,
                "duration": g.duration,
                "avg_stress": g.avg_stress,
                "max_stress": g.max_stress,
                "min_stress": g.min_stress
            }
            for g in games
        ]
    }

