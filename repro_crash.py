
import sys
import os

# Add apps/api to path
sys.path.append(os.path.abspath("apps/api"))

from app.core.database import SessionLocal, Base, engine
from app import models
from app.core.security import get_password_hash

# Try to create tables
try:
    print("Creating tables...")
    Base.metadata.create_all(bind=engine)
    print("Tables created.")
except Exception as e:
    print(f"Error creating tables: {e}")
    sys.exit(1)

# Try to insert a user
db = SessionLocal()
try:
    print("Attempting to create user...")
    user = models.User(
        email="repro@test.com",
        password_hash=get_password_hash("password123"),
        name="Repro User",
        work_type="test",
        working_hours=8.0,
        mobile_usage=2.0,
        health_info="None"
    )
    db.add(user)
    db.commit()
    print("User created successfully!")
except Exception as e:
    print(f"Error creating user: {e}")
    import traceback
    traceback.print_exc()
finally:
    db.close()
