
import sys
import os

# Add project root to path
sys.path.append('/home/sec/mini_project/ai-stress')

from backend.database.db import SessionLocal
from backend.database.models import User
from backend.auth.jwt_utils import verify_password, get_password_hash, pwd_context

print(f"PWD Context Schemes: {pwd_context.schemes()}")

db = SessionLocal()
user = db.query(User).filter(User.email == "test@example.com").first()

if user:
    print(f"Found user: {user.email}")
    print(f"Stored Hash: {user.hashed_password}")
    
    # Try verifying
    try:
        input_password = "password123"
        print(f"Verifying password '{input_password}'...")
        result = verify_password(input_password, user.hashed_password)
        print(f"Verification Result: {result}")
    except Exception as e:
        print(f"Verification FAILED with error: {e}")
        import traceback
        traceback.print_exc()

    # Try creating a new hash and verifying it
    print("\nTest Generation:")
    new_hash = get_password_hash("test12345")
    print(f"New Hash: {new_hash}")
    print(f"Verify New Hash: {verify_password('test12345', new_hash)}")
else:
    print("User 'test@example.com' not found.")

db.close()
