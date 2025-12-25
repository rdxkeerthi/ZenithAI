"""
Report generation endpoints
"""

from fastapi import APIRouter, HTTPException
from fastapi.responses import Response
from pydantic import BaseModel
from typing import Dict, Any
import logging

from app.services.report_service import get_report_generator

logger = logging.getLogger(__name__)

router = APIRouter()


class ReportRequest(BaseModel):
    userData: Dict[str, Any]
    baselineMetrics: Dict[str, Any]
    finalMetrics: Dict[str, Any]
    metricsHistory: list
    gameScores: list
    selectedGames: list
    aiPrediction: Dict[str, Any] = None
    recommendations: Dict[str, Any] = None
    riskLevel: str = "MODERATE"
    avgStress: float = 0.5
    avgScore: float = 75.0
    aiConfidence: float = 0.8


@router.post("/generate-pdf")
async def generate_pdf_report(request: ReportRequest):
    """Generate PDF report"""
    try:
        report_gen = get_report_generator()
        pdf_bytes = report_gen.generate_pdf(request.dict())
        
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename=stress-report-{request.userData['name']}.pdf"
            }
        )
    except Exception as e:
        logger.error(f"PDF generation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/generate-docx")
async def generate_docx_report(request: ReportRequest):
    """Generate DOCX report"""
    try:
        report_gen = get_report_generator()
        docx_bytes = report_gen.generate_docx(request.dict())
        
        return Response(
            content=docx_bytes,
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            headers={
                "Content-Disposition": f"attachment; filename=stress-report-{request.userData['name']}.docx"
            }
        )
    except Exception as e:
        logger.error(f"DOCX generation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
