
import requests
import json
import sys
import websocket # pip install websocket-client
import threading
import time

API_URL = "http://localhost:8000"
WS_URL = "ws://localhost:8000"

# 1. Login
print("1. Testing Login...")
login_payload = {"email": "test@example.com", "password": "password123"}
try:
    resp = requests.post(f"{API_URL}/api/auth/login", json=login_payload)
    if resp.status_code != 200:
        print(f"FAILED Login: {resp.text}")
        sys.exit(1)
    
    data = resp.json()
    token = data["access_token"]
    user_id = data["user"]["id"]
    print(f"LOGIN SUCCESS. Token len: {len(token)}, User ID: {user_id}")
except Exception as e:
    print(f"Login Exception: {e}")
    sys.exit(1)

# 2. Start Analysis
print("\n2. Starting Analysis Session...")
headers = {"Authorization": f"Bearer {token}"}
start_payload = {"user_id": str(user_id)} 
# Note: api.js startAnalysis sends {"user_id": userId}
# Check backend expects what?
# backend/routes/stress_analysis.py -> class StressAnalysisRequest(BaseModel): user_id: int (or str?)

try:
    resp = requests.post(f"{API_URL}/api/analysis/start", json=start_payload, headers=headers)
    if resp.status_code != 200:
        print(f"FAILED Start Analysis: {resp.text}")
        sys.exit(1)
    
    session_data = resp.json()
    session_id = session_data["session_id"]
    print(f"SESSION CREATED: {session_id}")
except Exception as e:
    print(f"Start Analysis Exception: {e}")
    sys.exit(1)

# 3. Test Games Endpoint
print("\n3. Testing Games Endpoint...")
try:
    resp = requests.get(f"{API_URL}/api/games/random", headers=headers)
    if resp.status_code != 200:
        print(f"FAILED Get Games: {resp.text}")
    else:
        games = resp.json()
        print(f"GAMES SUCCESS: Retrieved {len(games['games'])} games")
except Exception as e:
    print(f"Games Exception: {e}")

# 4. Test WebSocket
print(f"\n4. Testing WebSocket connection to {WS_URL}/ws/stress/{session_id}")

def on_message(ws, message):
    print(f"WS Message: {message}")
    ws.close()

def on_error(ws, error):
    print(f"WS Error: {error}")

def on_close(ws, close_status_code, close_msg):
    print(f"WS Closed: {close_status_code} - {close_msg}")

def on_open(ws):
    print("WS Connected!")
    # Send a dummy frame
    payload = {
        "timestamp": time.time(),
        "image": "base64..."
    }
    ws.send(json.dumps(payload))

ws = websocket.WebSocketApp(
    f"{WS_URL}/ws/stress/{session_id}",
    on_open=on_open,
    on_message=on_message,
    on_error=on_error,
    on_close=on_close
)

# ... WS test above ...

# 5. Submit Game Result
print("\n5. Submit Game Result...")
game_result = {
    "session_id": session_id,
    "game_name": "Test Game",
    "score": 100,
    "duration": 60,
    "stress_level": "Low",
    "reaction_time": 0.5,
    "error_rate": 0.1,
    "focus_score": 0.9
}
try:
    resp = requests.post(f"{API_URL}/api/games/result", json=game_result, headers=headers)
    if resp.status_code != 200:
        print(f"FAILED Submit Game: {resp.text}")
    else:
        print(f"GAME RESULT SUBMITTED: {resp.json()}")
except Exception as e:
    print(f"Submit Game Exception: {e}")

# 6. Get Report
print(f"\n6. Get Report for {session_id}...")
try:
    resp = requests.get(f"{API_URL}/api/reports/{session_id}", headers=headers)
    if resp.status_code != 200:
        print(f"FAILED Get Report: {resp.text}")
    else:
        report = resp.json()
        print(f"REPORT RETRIEVED: Stress Level {report.get('stress_level')}")
        if 'recommendations' in report:
            print(f"Recommendations present: {len(report['recommendations'])}")
except Exception as e:
    print(f"Get Report Exception: {e}")

# ... endpoint of script ...
