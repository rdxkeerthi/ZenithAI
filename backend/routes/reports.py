"""
Reports generation routes
"""

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from backend.database.db import get_db
from backend.database.models import StressSession
from backend.utils.pdf_generator import generate_pdf_report
from backend.utils.docx_generator import generate_docx_report

router = APIRouter()

@router.get("/{session_id}")
async def get_report(session_id: str, db: Session = Depends(get_db)):
    """Get comprehensive stress report with time-series data"""
    
    from backend.database.models import StressReading, GameResult
    
    session = db.query(StressSession).filter(StressSession.session_id == session_id).first()
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Get all stress readings for time-series graph
    readings = db.query(StressReading).filter(StressReading.session_id == session.id).order_by(StressReading.timestamp).all()
    
    # Get game results if any
    game_result = db.query(GameResult).filter(GameResult.session_id == session.id).first()
    
    from backend.utils.recommendation_engine import generate_recommendations
    
    user_profile = {
        'work_hours': session.user.work_hours if session.user else 8,
        'sleep_hours': session.user.sleep_hours if session.user else 7,
        'electronics_usage': session.user.electronics_usage if session.user else 4
    }
    
    recommendations = generate_recommendations(session.average_stress_score or 50, user_profile)
    
    # Format readings for frontend
    readings_data = [
        {
            "timestamp": reading.timestamp.isoformat(),
            "stress_score": reading.stress_score,
            "confidence": reading.confidence,
            "brow_tension": reading.brow_tension,
            "eye_strain": reading.eye_strain,
            "mouth_tension": reading.mouth_tension
        }
        for reading in readings
    ]
    
    # Build response
    response = {
        "session_id": session_id,
        "stress_level": session.stress_level or "Medium",
        "average_score": session.average_stress_score or 50,
        "recommendations": recommendations,
        "readings": readings_data,
        "started_at": session.started_at.isoformat() if session.started_at else None,
        "ended_at": session.ended_at.isoformat() if session.ended_at else None
    }
    
    # Add game data if available
    if game_result:
        response.update({
            "game_name": game_result.game_name,
            "game_score": game_result.score,
            "game_duration": game_result.duration,
            "reaction_time": game_result.reaction_time,
            "error_rate": game_result.error_rate,
            "focus_score": game_result.focus_score
        })
    
    return response

@router.get("/{session_id}/pdf")
async def download_pdf(session_id: str, db: Session = Depends(get_db)):
    """Download PDF report"""
    
    session = db.query(StressSession).filter(StressSession.session_id == session_id).first()
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    pdf_path = generate_pdf_report(session)
    
    return FileResponse(pdf_path, media_type="application/pdf", filename=f"stress_report_{session_id}.pdf")

@router.get("/{session_id}/docx")
async def download_docx(session_id: str, db: Session = Depends(get_db)):
    """Download DOCX report"""
    
    session = db.query(StressSession).filter(StressSession.session_id == session_id).first()
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    docx_path = generate_docx_report(session)
    
    return FileResponse(docx_path, media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document", filename=f"stress_report_{session_id}.docx")
