from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import Base, engine
from app.api.v1.endpoints import auth, stress, reports
from app.services.inference_service import inference_service
import json

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI Stress Detection API",
    description="Real-time stress monitoring through facial expression analysis during gameplay",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(stress.router)
app.include_router(reports.router)

@app.get("/")
def read_root():
    return {
        "message": "AI Stress Detection API",
        "version": "1.0.0",
        "status": "online"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy", "model_loaded": inference_service.use_model}

@app.websocket("/ws/analysis")
async def websocket_analysis(websocket: WebSocket):
    """WebSocket endpoint for real-time stress analysis"""
    await websocket.accept()
    print("WebSocket connection established")
    
    try:
        while True:
            # Receive face data from client
            data = await websocket.receive_json()
            
            # Extract face metrics
            face_data = {
                'blink_rate': data.get('blink_rate', 0.0),
                'eye_openness': data.get('eye_openness', 1.0),
                'jaw_clench': data.get('jaw_clench', 0.0),
                'brow_tension': data.get('brow_tension', 0.0),
                'jitter': data.get('jitter', 0.0),
                'game_score': data.get('game_score', 0.5)
            }
            
            # Get stress prediction
            result = inference_service.predict(face_data)
            
            # Send back to client
            response = {
                'stress_score': result['stress_score'],
                'stress_level': result['stress_level'],
                'confidence': result['confidence'],
                'timestamp': data.get('timestamp', '')
            }
            
            await websocket.send_json(response)
            
    except WebSocketDisconnect:
        print("WebSocket connection closed")
    except Exception as e:
        print(f"WebSocket error: {e}")
        try:
            await websocket.close()
        except:
            pass

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
