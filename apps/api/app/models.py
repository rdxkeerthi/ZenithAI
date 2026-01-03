from sqlalchemy import Column, Integer, String, Float, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    name = Column(String, nullable=False)
    work_type = Column(String)
    working_hours = Column(Float)
    mobile_usage = Column(Float)  # hours per day
    health_info = Column(Text)  # JSON string with health details
    created_at = Column(DateTime, default=datetime.utcnow)
    
    sessions = relationship("GameSession", back_populates="user")
    reports = relationship("StressReport", back_populates="user")

class GameSession(Base):
    __tablename__ = "game_sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime)
    games_played = Column(Integer, default=0)
    baseline_stress = Column(Float)  # Initial stress level
    
    user = relationship("User", back_populates="sessions")
    game_data = relationship("GameData", back_populates="session")
    report = relationship("StressReport", back_populates="session", uselist=False)

class GameData(Base):
    __tablename__ = "game_data"
    
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("game_sessions.id"), nullable=False)
    game_name = Column(String, nullable=False)
    game_number = Column(Integer)  # 1-4 in the session
    score = Column(Float)
    duration = Column(Float)  # seconds
    face_data = Column(Text)  # JSON string with face metrics
    stress_scores = Column(Text)  # JSON array of stress scores over time
    avg_stress = Column(Float)
    max_stress = Column(Float)
    min_stress = Column(Float)
    completed_at = Column(DateTime, default=datetime.utcnow)
    
    session = relationship("GameSession", back_populates="game_data")

class StressReport(Base):
    __tablename__ = "stress_reports"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    session_id = Column(Integer, ForeignKey("game_sessions.id"), nullable=False)
    overall_stress = Column(Float)
    stress_level = Column(String)  # Low, Medium, High
    stress_trend = Column(String)  # Increasing, Stable, Decreasing
    recommendations = Column(Text)  # JSON with detailed recommendations
    activities = Column(Text)
    workouts = Column(Text)
    meditation = Column(Text)
    food_control = Column(Text)
    medical_checkup = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="reports")
    session = relationship("GameSession", back_populates="report")
