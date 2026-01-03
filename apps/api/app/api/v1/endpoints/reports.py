from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.core.database import get_db
from app import models, schemas
from app.services.report_service import report_service
import json

router = APIRouter(prefix="/api/v1/reports", tags=["reports"])

@router.post("/generate/{session_id}", response_model=schemas.StressReportResponse)
def generate_report(session_id: int, db: Session = Depends(get_db)):
    """Generate AI-powered stress report for a session"""
    # Get session data
    session = db.query(models.GameSession).filter(models.GameSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Get user data
    user = db.query(models.User).filter(models.User.id == session.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get game data
    games = db.query(models.GameData).filter(models.GameData.session_id == session_id).all()
    if not games:
        raise HTTPException(status_code=400, detail="No game data found for this session")
    
    # Calculate overall stress
    overall_stress = sum(g.avg_stress for g in games) / len(games)
    
    # Determine stress level
    if overall_stress < 30:
        stress_level = "Low"
    elif overall_stress < 70:
        stress_level = "Medium"
    else:
        stress_level = "High"
    
    # Determine trend (compare with baseline if available)
    if session.baseline_stress:
        if overall_stress > session.baseline_stress + 10:
            stress_trend = "Increasing"
        elif overall_stress < session.baseline_stress - 10:
            stress_trend = "Decreasing"
        else:
            stress_trend = "Stable"
    else:
        stress_trend = "Stable"
    
    # Prepare data for report generation
    user_data = {
        'name': user.name,
        'email': user.email,
        'work_type': user.work_type,
        'working_hours': user.working_hours,
        'mobile_usage': user.mobile_usage,
        'health_info': user.health_info
    }
    
    session_data = {
        'session_id': session.id,
        'games_played': session.games_played,
        'started_at': session.started_at,
        'completed_at': session.completed_at
    }
    
    stress_analysis = {
        'overall_stress': overall_stress,
        'stress_level': stress_level,
        'stress_trend': stress_trend
    }
    
    # Generate recommendations
    recommendations = report_service.generate_recommendations(
        user_data, session_data, stress_analysis
    )
    
    # Save report to database
    report = models.StressReport(
        user_id=user.id,
        session_id=session_id,
        overall_stress=overall_stress,
        stress_level=stress_level,
        stress_trend=stress_trend,
        recommendations=json.dumps(recommendations),
        activities=recommendations['activities'],
        workouts=recommendations['workouts'],
        meditation=recommendations['meditation'],
        food_control=recommendations['food_control'],
        medical_checkup=recommendations['medical_checkup']
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    
    return report

@router.get("/{report_id}", response_model=schemas.StressReportResponse)
def get_report(report_id: int, db: Session = Depends(get_db)):
    """Get a specific report"""
    report = db.query(models.StressReport).filter(models.StressReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    return report

@router.get("/session/{session_id}/report", response_model=schemas.StressReportResponse)
def get_report_by_session(session_id: int, db: Session = Depends(get_db)):
    """Get report for a specific session"""
    report = db.query(models.StressReport).filter(
        models.StressReport.session_id == session_id
    ).first()
    
    if not report:
        raise HTTPException(status_code=404, detail="Report not found for this session")
    
    return report

@router.get("/{report_id}/pdf")
def download_pdf_report(report_id: int, db: Session = Depends(get_db)):
    """Download report as PDF"""
    report = db.query(models.StressReport).filter(models.StressReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    # Get user and session data
    user = db.query(models.User).filter(models.User.id == report.user_id).first()
    session = db.query(models.GameSession).filter(models.GameSession.id == report.session_id).first()
    
    user_data = {
        'name': user.name,
        'email': user.email,
        'work_type': user.work_type,
        'working_hours': user.working_hours,
        'mobile_usage': user.mobile_usage
    }
    
    session_data = {
        'session_id': session.id,
        'games_played': session.games_played
    }
    
    recommendations = {
        'overall_stress': report.overall_stress,
        'stress_level': report.stress_level,
        'stress_trend': report.stress_trend,
        'activities': report.activities,
        'workouts': report.workouts,
        'meditation': report.meditation,
        'food_control': report.food_control,
        'medical_checkup': report.medical_checkup
    }
    
    # Generate PDF
    pdf_bytes = report_service.generate_pdf_report(user_data, session_data, recommendations)
    
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=stress_report_{report_id}.pdf"
        }
    )

@router.get("/user/{user_id}/reports")
def get_user_reports(user_id: int, db: Session = Depends(get_db)):
    """Get all reports for a user"""
    reports = db.query(models.StressReport).filter(
        models.StressReport.user_id == user_id
    ).order_by(models.StressReport.created_at.desc()).all()
    
    return {"reports": [
        {
            "id": r.id,
            "session_id": r.session_id,
            "overall_stress": r.overall_stress,
            "stress_level": r.stress_level,
            "created_at": r.created_at
        }
        for r in reports
    ]}
