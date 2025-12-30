"""
FastAPI Backend Server for AI Stress Detection Platform
Handles authentication, stress analysis, games, and reports
"""

from fastapi import FastAPI, WebSocket, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
from datetime import datetime, timedelta
import jwt
import os
import sys

# Add ml-models to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'ml-models'))

from inference.stress_predictor import StressPredictor

app = FastAPI(title="AI Stress Detection API", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()
SECRET_KEY = "your-secret-key-change-in-production"
ALGORITHM = "HS256"

# Initialize ML model
stress_predictor = None

# Pydantic models
class UserRegister(BaseModel):
    email: str
    password: str
    name: str

class UserLogin(BaseModel):
    email: str
    password: str

class StressAnalysisRequest(BaseModel):
    user_id: str
    session_id: Optional[str] = None

class GameResult(BaseModel):
    user_id: str
    session_id: str
    game_name: str
    score: int
    duration: int
    stress_level: str

# In-memory storage (replace with database in production)
users_db = {}
sessions_db = {}
analysis_history = {}

@app.on_event("startup")
async def startup_event():
    """Initialize ML models on startup"""
    global stress_predictor
    try:
        model_path = os.path.join(os.path.dirname(__file__), '..', 'ml-models', 'trained', 'stress_classifier.h5')
        scaler_path = os.path.join(os.path.dirname(__file__), '..', 'ml-models', 'trained', 'scaler.pkl')
        
        if os.path.exists(model_path) and os.path.exists(scaler_path):
            stress_predictor = StressPredictor(model_path, scaler_path)
            print("✅ ML models loaded successfully")
        else:
            print("⚠️ ML models not found. Please train models first.")
    except Exception as e:
        print(f"❌ Error loading ML models: {e}")

@app.get("/")
async def root():
    return {
        "message": "AI Stress Detection API",
        "version": "1.0.0",
        "status": "running",
        "ml_model_loaded": stress_predictor is not None
    }

@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "ml_model": "loaded" if stress_predictor else "not loaded"
    }

# Authentication endpoints
@app.post("/api/auth/register")
async def register(user: UserRegister):
    """Register new user"""
    if user.email in users_db:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = f"user_{len(users_db) + 1}"
    users_db[user.email] = {
        "id": user_id,
        "email": user.email,
        "name": user.name,
        "password": user.password,  # Hash in production!
        "created_at": datetime.now().isoformat()
    }
    
    # Create JWT token
    token = jwt.encode(
        {"user_id": user_id, "email": user.email, "exp": datetime.utcnow() + timedelta(days=7)},
        SECRET_KEY,
        algorithm=ALGORITHM
    )
    
    return {"token": token, "user": {"id": user_id, "email": user.email, "name": user.name}}

@app.post("/api/auth/login")
async def login(user: UserLogin):
    """Login user"""
    user_data = users_db.get(user.email)
    
    if not user_data or user_data["password"] != user.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = jwt.encode(
        {"user_id": user_data["id"], "email": user.email, "exp": datetime.utcnow() + timedelta(days=7)},
        SECRET_KEY,
        algorithm=ALGORITHM
    )
    
    return {"token": token, "user": {"id": user_data["id"], "email": user.email, "name": user_data["name"]}}

# Analysis endpoints
@app.post("/api/analysis/start")
async def start_analysis(request: StressAnalysisRequest):
    """Start new stress analysis session"""
    session_id = f"session_{datetime.now().timestamp()}"
    
    sessions_db[session_id] = {
        "user_id": request.user_id,
        "started_at": datetime.now().isoformat(),
        "status": "active",
        "frames_analyzed": 0,
        "stress_readings": []
    }
    
    return {"session_id": session_id, "status": "started"}

@app.get("/api/analysis/history/{user_id}")
async def get_analysis_history(user_id: str):
    """Get user's analysis history"""
    user_sessions = [
        session for session_id, session in sessions_db.items()
        if session["user_id"] == user_id
    ]
    
    return {"sessions": user_sessions}

# Games endpoints
@app.get("/api/games/list")
async def get_games():
    """Get all available games"""
    all_games = [
        {"id": "breath_sync", "name": "Breath Sync", "description": " guided breathing for relaxation"},
        {"id": "focus_maze", "name": "Focus Maze", "description": "Navigate through a calming maze"},
        {"id": "eye_control", "name": "Eye Control", "description": "Track the moving object with your eyes"},
        {"id": "balance", "name": "Balance Game", "description": "Keep the ball in the center"},
        {"id": "reaction", "name": "Reaction Test", "description": "Test your reflexes gently"},
        {"id": "memory", "name": "Memory Match", "description": "Match pairs of cards"},
        {"id": "calm_click", "name": "Calm Click", "description": "Click slowly and rhythmically"},
        {"id": "relax_flow", "name": "Relax Flow", "description": "Create flowing patterns"},
        {"id": "color_match", "name": "Color Match", "description": "Match colors to words"},
        {"id": "pattern_memory", "name": "Pattern Memory", "description": "Remember the sequence"},
        {"id": "speed_type", "name": "Speed Type", "description": "Type calming words"},
        {"id": "bubble_pop", "name": "Bubble Pop", "description": "Pop bubbles for satisfaction"},
    ]
    return {"games": all_games}

@app.post("/api/games/result")
async def save_game_result(result: GameResult):
    """Save game result"""
    if result.session_id not in sessions_db:
        raise HTTPException(status_code=404, detail="Session not found")
    
    if "game_results" not in sessions_db[result.session_id]:
        sessions_db[result.session_id]["game_results"] = []
    
    sessions_db[result.session_id]["game_results"].append({
        "game_name": result.game_name,
        "score": result.score,
        "duration": result.duration,
        "stress_level": result.stress_level,
        "timestamp": datetime.now().isoformat()
    })
    
    return {"status": "saved"}

# Dashboard endpoints
@app.get("/api/dashboard/stats/{user_id}")
async def get_dashboard_stats(user_id: str):
    """Get user dashboard stats"""
    user_sessions = [s for s in sessions_db.values() if s["user_id"] == user_id]
    
    # Calculate real stats if available
    total_sessions = len(user_sessions)
    average_stress = 50
    
    if total_sessions > 0:
        # Mock calculation for validation
        average_stress = sum([50 for _ in user_sessions]) / total_sessions
        
    return {
        "current_stress": 45,
        "average_stress": int(average_stress),
        "sessions_completed": total_sessions,
        "stress_trend": "stable",
        "weekly_stats": [45, 42, 48, 40, 38, 42, 35] # Mock data for chart
    }

@app.put("/api/user/profile")
async def update_profile(data: dict):
    """Update user profile"""
    # In a real app, update users_db
    return {"status": "success", "message": "Profile updated"}

@app.get("/api/reports/{session_id}")
async def get_report(session_id: str):
    """Generate comprehensive stress report"""
    if session_id not in sessions_db:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session = sessions_db[session_id]
    
    # Generate AI recommendations
    recommendations = {
        "medical": [
            "Consider consulting a healthcare professional if stress persists",
            "Regular health check-ups recommended",
            "Monitor blood pressure and heart rate"
        ],
        "meditation": [
            "Practice mindfulness meditation for 10-15 minutes daily",
            "Try deep breathing exercises",
            "Use guided meditation apps"
        ],
        "work_life_balance": [
            "Set clear boundaries between work and personal time",
            "Take regular breaks during work",
            "Prioritize tasks and delegate when possible"
        ],
        "nutrition": [
            "Reduce caffeine intake",
            "Eat balanced meals with fruits and vegetables",
            "Stay hydrated throughout the day"
        ],
        "screen_time": [
            "Follow the 20-20-20 rule (every 20 min, look 20 feet away for 20 sec)",
            "Limit screen time before bed",
            "Use blue light filters"
        ]
    }
    
    report = {
        "session_id": session_id,
        "user_id": session["user_id"],
        "date": session["started_at"],
        "overall_stress": session.get("average_stress", "Medium"),
        "games_played": len(session.get("game_results", [])),
        "recommendations": recommendations,
        "stress_timeline": session.get("stress_readings", [])
    }
    
    return report

# WebSocket for real-time analysis
@app.websocket("/ws/analysis/{session_id}")
async def websocket_analysis(websocket: WebSocket, session_id: str):
    """WebSocket endpoint for real-time stress analysis"""
    await websocket.accept()
    
    try:
        while True:
            # Receive frame data
            data = await websocket.receive_json()
            
            # Process with ML model (placeholder)
            result = {
                "stress_level": "Medium",
                "confidence": 0.85,
                "timestamp": datetime.now().isoformat()
            }
            
            # Send result back
            await websocket.send_json(result)
            
    except Exception as e:
        print(f"WebSocket error: {e}")
    finally:
        await websocket.close()

if __name__ == "__main__":
    print("🚀 Starting AI Stress Detection API...")
    print("📊 API Docs: http://localhost:8000/docs")
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
