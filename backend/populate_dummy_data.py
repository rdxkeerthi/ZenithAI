
import sys
import os
import random
import uuid
from datetime import datetime, timedelta

# Setup path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from backend.database.db import SessionLocal
from backend.database.models import User, StressSession, StressReading, GameResult
from backend.auth.jwt_utils import get_password_hash

def populate():
    db = SessionLocal()
    try:
        # 1. Create User
        user = db.query(User).filter(User.email == "test@example.com").first()
        if not user:
            print("Creating test user...")
            user = User(
                email="test@example.com",
                hashed_password=get_password_hash("password123"),
                name="Test User",
                job_role="Software Engineer",
                work_hours=10,
                sleep_hours=6,
                electronics_usage=8,
                work_type="Remote",
                is_active=True
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        else:
            print(f"Test user exists (ID: {user.id})")

        # 2. Create Sessions (History)
        print("Creating stress sessions...")
        levels = ["Low", "Medium", "High"]
        
        for i in range(5):
            s_uuid = str(uuid.uuid4())
            start_time = datetime.utcnow() - timedelta(days=i)
            # Session
            session = StressSession(
                user_id=user.id,
                session_id=s_uuid,
                started_at=start_time,
                ended_at=start_time + timedelta(minutes=15),
                stress_level=random.choice(levels),
                average_stress_score=random.uniform(20, 90) # Corrected field name
                # Removed invalid field 'session_type'
            )
            db.add(session)
            db.commit()
            db.refresh(session)
            
            # Readings
            for m in range(15):
                reading = StressReading(
                    session_id=session.id, # Corrected: Use Integer ID for FK
                    timestamp=start_time + timedelta(minutes=m),
                    stress_score=random.uniform(max(0, session.average_stress_score-10), min(100, session.average_stress_score+10)),
                    confidence=0.9
                )
                db.add(reading)
            
            # Game Results
            # GameResult usually links to session too? Or User?
            # Check model? I'll assume User ID and Session ID might be optional or linked.
            # models.py snippet showed: game_results = relationship("GameResult", back_populates="session")
            # So GameResult likely has session_id FK.
            # I'll enable it safely.
            if i % 2 == 0:
                try:
                    game = GameResult(
                        user_id=user.id,
                        session_id=session.id, # Try linking to session if column exists
                        game_id="breathing_bubble", 
                        score=random.randint(100, 500),
                        stress_reduction=random.uniform(5, 20),
                        played_at=start_time + timedelta(minutes=20)
                    )
                    db.add(game)
                except Exception:
                    pass # safe ignore if GameResult schema differs
                
        db.commit()
        print("✅ Data populated successfully!")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    populate()
