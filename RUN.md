# 🎯 SIMPLE SETUP - Just 2 Commands!

## The Problem
The automatic startup script hangs during pip install. Here's the simple manual way:

## Solution: Run in 2 Terminals

### Terminal 1: Start Backend
```bash
cd /home/sec/mini_project/ai-stress
./run-api.sh
```

### Terminal 2: Start Frontend  
```bash
cd /home/sec/mini_project/ai-stress
./run-web.sh
```

## Then Open Browser

**http://localhost:3000/live-demo**

## What You Get

✅ **Real-time camera analysis**
- Face detection with 468 landmarks
- Blink rate monitoring
- Eye openness tracking
- Stress level: LOW/MEDIUM/HIGH

✅ **Trained LSTM model**
- Already trained (100% accuracy on synthetic data)
- Located at: `apps/api/models/stress_lstm_trained.pth`
- Automatically loaded by inference service

✅ **AI Recommendations**
- Test with: `curl -X POST http://localhost:8000/api/v1/assistant/recommend -H "Content-Type: application/json" -d '{"user_id":"test","stress_level":0.75,"context":{}}'`

✅ **Breathing Game**
- http://localhost:3000/games/breathing

## Camera + Game Integration

The system already integrates:
1. **Camera input** → MediaPipe extracts facial features
2. **Features** → Sent to LSTM model via WebSocket
3. **Model output** → Stress level (LOW/MEDIUM/HIGH)
4. **Game data** → Can be added to context for better predictions

## Next: Enhance with Game Data

To add game performance as model input, the breathing game can send:
- Breathing rhythm accuracy
- Session completion rate
- Stress reduction over time

This data flows into the same inference pipeline!

## Troubleshooting

### If port 8000 is busy:
```bash
lsof -ti:8000 | xargs kill -9
```

### If port 3000 is busy:
```bash
lsof -ti:3000 | xargs kill -9
```

### Check if model exists:
```bash
ls -lh apps/api/models/stress_lstm_trained.pth
```

Should show: `~500KB file`

## Architecture

```
Camera → MediaPipe (Browser) → Features (JSON)
                                    ↓
                            WebSocket Stream
                                    ↓
                    FastAPI → LSTM Model → Prediction
                                    ↓
                            Dashboard Update
```

Game data can be added to the feature stream at any point!
