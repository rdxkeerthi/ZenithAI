"""
Games API routes
Handles game selection and results
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List
import random
from datetime import datetime
from backend.database.db import get_db
from backend.database.models import GameResult, StressSession

router = APIRouter()

# All available games
ALL_GAMES = [
    {"id": "breath_sync", "name": "Breath Sync", "description": "Synchronized breathing exercise"},
    {"id": "focus_maze", "name": "Focus Maze", "description": "Navigate through calming maze"},
    {"id": "eye_control", "name": "Eye Control", "description": "Eye movement coordination"},
    {"id": "balance", "name": "Balance Game", "description": "Mind-body balance challenge"},
    {"id": "reaction", "name": "Reaction Test", "description": "Measure stress through reactions"},
    {"id": "memory", "name": "Memory Match", "description": "Memory card matching"},
    {"id": "calm_click", "name": "Calm Click", "description": "Stress-relief clicking game"},
    {"id": "relax_flow", "name": "Relax Flow", "description": "Flow state relaxation"},
    {"id": "color_match", "name": "Color Match", "description": "Focus on color matching"},
    {"id": "pattern_memory", "name": "Pattern Memory", "description": "Short-term memory exercises"},
    {"id": "speed_type", "name": "Speed Type", "description": "Type calming words"},
    {"id": "bubble_pop", "name": "Bubble Pop", "description": "Satisfying bubble popping"},
]

class GameSelection(BaseModel):
    games: List[dict]

class GameResultSubmit(BaseModel):
    session_id: str
    game_name: str
    score: int
    duration: int
    reaction_time: float = None
    error_rate: float = None
    focus_score: float = None

@router.get("/random", response_model=GameSelection)
async def get_random_games():
    """Get 4 random unique games for session"""
    selected_games = random.sample(ALL_GAMES, 4)
    return {"games": selected_games}

@router.get("/list", response_model=GameSelection)
async def get_all_games():
    """Get all available games"""
    return {"games": ALL_GAMES}


@router.post("/result")
async def submit_game_result(result: GameResultSubmit, db: Session = Depends(get_db)):
    """Submit game result"""
    
    # Find session
    session = db.query(StressSession).filter(
        StressSession.session_id == result.session_id
    ).first()
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Create game result
    game_result = GameResult(
        session_id=session.id,
        game_name=result.game_name,
        score=result.score,
        duration=result.duration,
        reaction_time=result.reaction_time,
        error_rate=result.error_rate,
        focus_score=result.focus_score
    )
    
    db.add(game_result)
    db.commit()
    
    return {"status": "success", "message": "Game result saved"}

@router.get("/session/{session_id}")
async def get_session_games(session_id: str, db: Session = Depends(get_db)):
    """Get all games played in a session"""
    
    session = db.query(StressSession).filter(
        StressSession.session_id == session_id
    ).first()
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    games = db.query(GameResult).filter(GameResult.session_id == session.id).all()
    
    return {"games": games}
