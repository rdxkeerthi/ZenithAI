"""
API Endpoint for AI Assistant

Provides stress reduction recommendations based on current state.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Optional
from app.assistant.assistant_service import get_assistant

router = APIRouter()


class RecommendationRequest(BaseModel):
    """Request for stress reduction recommendation."""
    user_id: str
    stress_level: float  # 0-1
    context: Optional[Dict] = {}


class RecommendationResponse(BaseModel):
    """AI-generated recommendation."""
    message: str
    intervention: Dict
    confidence: float


@router.post("/recommend", response_model=RecommendationResponse)
async def get_recommendation(request: RecommendationRequest):
    """
    Get personalized stress reduction recommendation.
    
    Example:
    ```json
    {
      "user_id": "user123",
      "stress_level": 0.75,
      "context": {
        "blink_rate": 8,
        "session_duration": 45
      }
    }
    ```
    """
    try:
        assistant = get_assistant()
        recommendation = assistant.get_recommendation(
            stress_level=request.stress_level,
            context=request.context
        )
        
        return RecommendationResponse(
            message=recommendation["message"],
            intervention=recommendation["intervention"],
            confidence=recommendation["confidence"]
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/interventions")
async def list_interventions():
    """List all available interventions."""
    assistant = get_assistant()
    return {"interventions": assistant.knowledge_base}
