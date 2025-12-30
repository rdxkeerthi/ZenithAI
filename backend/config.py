"""
Configuration settings for StressGuardAI Backend
"""

import os
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    """Application settings"""
    
    # App
    APP_NAME: str = "StressGuardAI"
    VERSION: str = "1.0.0"
    DEBUG: bool = True
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    # Frontend URL
    FRONTEND_URL: str = "http://localhost:3000"
    
    # Database
    # Use absolute path to ensure consistency regardless of where the app is run from
    BASE_DIR: str = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    DATABASE_URL: str = f"sqlite:///{os.path.join(BASE_DIR, 'backend', 'database', 'stressguard.db')}"
    
    # JWT
    SECRET_KEY: str = "stressguard-secret-2024"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000", 
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001"
    ]
    
    # ML Models
    ML_MODEL_PATH: str = "../ml/trained/stress_classifier.h5"
    ML_SCALER_PATH: str = "../ml/trained/scaler.pkl"
    
    # Games
    TOTAL_GAMES: int = 8
    GAMES_PER_SESSION: int = 4
    
    # Stress Thresholds
    STRESS_LOW_THRESHOLD: int = 33
    STRESS_MEDIUM_THRESHOLD: int = 66
    STRESS_HIGH_THRESHOLD: int = 100
    
    # WebSocket
    WS_HEARTBEAT_INTERVAL: int = 30  # seconds
    WS_MESSAGE_QUEUE_SIZE: int = 100
    
    # Logging
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
