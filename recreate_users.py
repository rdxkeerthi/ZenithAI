
import sys
import os

# Add project root to path
sys.path.append('/home/sec/mini_project/ai-stress')

from backend.config import settings
print(f"DATABASE_URL: {settings.DATABASE_URL}")

from backend.database.db import SessionLocal, init_db
from backend.database.models import User
from backend.auth.jwt_utils import get_password_hash, verify_password, pwd_context

# Initialize DB tables if they don't exist
init_db()

db = SessionLocal()

print("Cleaning up old users...")
db.query(User).delete()
db.commit()

print("Creating new users with Argon2...")
test_users = [
    {'email': 'test@example.com', 'name': 'Test User', 'password': 'password123'},
    {'email': 'rdx@gmail.com', 'name': 'RDX User', 'password': 'test123'},
    {'email': 'admin@stressguard.ai', 'name': 'Admin', 'password': 'admin123'},
]

for user_data in test_users:
    hashed_pw = get_password_hash(user_data['password'])
    user = User(
        email=user_data['email'],
        name=user_data['name'],
        hashed_password=hashed_pw,
        is_active=True
    )
    db.add(user)
    print(f"Created user: {user_data['email']}")

db.commit()

# Verify
print("\nVerifying created users...")
user = db.query(User).filter(User.email == "test@example.com").first()
if user:
    print(f"User: {user.email}")
    print(f"Hash: {user.hashed_password}")
    is_valid = verify_password("password123", user.hashed_password)
    print(f"Password 'password123' valid? {is_valid}")
    if not is_valid:
        print("ERROR: Verification failed directly after creation!")
else:
    print("ERROR: User not found after creation!")

db.close()
