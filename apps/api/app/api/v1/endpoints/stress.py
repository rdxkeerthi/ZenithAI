"""
Enhanced WebSocket endpoint for stress analysis with user data support
"""

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import Dict
import json
import logging

from app.services.inference_service import get_inference_service

logger = logging.getLogger(__name__)

router = APIRouter()


@router.websocket("/ws")
async def stress_websocket(websocket: WebSocket):
    """
    WebSocket endpoint for real-time stress monitoring
    
    Receives:
    - Detailed facial metrics (20+ features)
    - Optional user data for context
    - Game performance metrics
    
    Sends:
    - Stress predictions with confidence
    - Risk assessments
    - Recommendations
    """
    await websocket.accept()
    logger.info("WebSocket connection established")
    
    inference_service = get_inference_service()
    user_data = None
    session_start = None
    
    try:
        while True:
            # Receive data
            data = await websocket.receive_text()
            message = json.loads(data)
            
            # Handle different message types
            msg_type = message.get('type', 'metrics')
            
            if msg_type == 'user_data':
                # Store user data for context
                user_data = message.get('data', {})
                logger.info(f"Received user data for: {user_data.get('name', 'Unknown')}")
                
                await websocket.send_json({
                    'type': 'user_data_received',
                    'status': 'success'
                })
                
            elif msg_type == 'metrics':
                # Process facial metrics
                metrics = message.get('data', {})
                
                # Get prediction
                prediction = inference_service.predict(metrics, user_data)
                
                # Send response
                await websocket.send_json({
                    'type': 'prediction',
                    'data': prediction
                })
                
            elif msg_type == 'reset':
                # Reset session
                inference_service.reset()
                user_data = None
                
                await websocket.send_json({
                    'type': 'reset_complete',
                    'status': 'success'
                })
                
            elif msg_type == 'ping':
                # Health check
                await websocket.send_json({
                    'type': 'pong',
                    'timestamp': message.get('timestamp')
                })
    
    except WebSocketDisconnect:
        logger.info("WebSocket disconnected")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        try:
            await websocket.send_json({
                'type': 'error',
                'message': str(e)
            })
        except:
            pass
    finally:
        # Cleanup
        inference_service.reset()
