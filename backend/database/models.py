"""
Database models for StressGuardAI
"""

from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from backend.database.db import Base

class User(Base):
    """User model"""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)
    
    # Profile Data
    job_role = Column(String, nullable=True)
    work_hours = Column(Integer, nullable=True)
    sleep_hours = Column(Integer, nullable=True)
    work_type = Column(String, nullable=True)  # 'Remote', 'Onsite', 'Hybrid'
    electronics_usage = Column(Integer, nullable=True)  # Hours per day
    
    # Relationships
    sessions = relationship("StressSession", back_populates="user")

class StressSession(Base):
    """Stress analysis session"""
    __tablename__ = "stress_sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    session_id = Column(String, unique=True, index=True)
    started_at = Column(DateTime, default=datetime.utcnow)
    ended_at = Column(DateTime, nullable=True)
    average_stress_score = Column(Float, nullable=True)
    stress_level = Column(String, nullable=True)  # Low/Medium/High
    
    # Relationships
    user = relationship("User", back_populates="sessions")
    readings = relationship("StressReading", back_populates="session")
    game_results = relationship("GameResult", back_populates="session")

class StressReading(Base):
    """Individual stress reading during session"""
    __tablename__ = "stress_readings"
    
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("stress_sessions.id"))
    timestamp = Column(DateTime, default=datetime.utcnow)
    stress_score = Column(Float, nullable=False)
    confidence = Column(Float, nullable=False)
    
    # Facial features
    brow_tension = Column(Float, nullable=True)
    eye_strain = Column(Float, nullable=True)
    mouth_tension = Column(Float, nullable=True)
    
    # Relationship
    session = relationship("StressSession", back_populates="readings")

class GameResult(Base):
    """Game performance results"""
    __tablename__ = "game_results"
    
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("stress_sessions.id"))
    game_name = Column(String, nullable=False)
    score = Column(Integer, nullable=False)
    duration = Column(Integer, nullable=False)  # seconds
    stress_during_game = Column(Float, nullable=True)
    completed_at = Column(DateTime, default=datetime.utcnow)
    
    # Game-specific metrics
    reaction_time = Column(Float, nullable=True)
    error_rate = Column(Float, nullable=True)
    focus_score = Column(Float, nullable=True)
    
    # Relationship
    session = relationship("StressSession", back_populates="game_results")
