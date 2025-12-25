# 🚀 Quick Setup & Run Guide

## Step 1: Train the Model (REQUIRED - First Time Only)

```bash
./train_model.sh
```

This will:
- Generate synthetic training data
- Train an LSTM model (30 epochs, ~30 seconds)
- Save model to `apps/api/models/stress_lstm_trained.pth`

## Step 2: Start the Application

```bash
./start.sh
```

This will:
- Install dependencies (first time only)
- Start backend API on port 8000
- Start frontend on port 3000

## Step 3: Use the System

Open your browser to:
- **http://localhost:3000** - Main page
- Click **"🎥 Try Live Demo"** - Live camera stress detection
- Click **"🎮 Play Games"** - Stress-relief breathing game

## Troubleshooting

### If start.sh hangs:
```bash
# Kill any stuck processes
pkill -f uvicorn
pkill -f "next dev"

# Try again
./start.sh
```

### If model not found:
```bash
# Train the model first
./train_model.sh
```

### Check logs:
```bash
tail -f /tmp/zenith-api.log
tail -f /tmp/zenith-web.log
```

## What You Get

✅ **Live Camera Analysis**:
- Real-time facial landmark detection
- Blink rate monitoring
- Eye openness tracking
- Stress level calculation (LOW/MEDIUM/HIGH)

✅ **AI Recommendations**:
- Context-aware stress reduction tips
- Breathing exercises
- Posture corrections
- Eye rest reminders

✅ **Interactive Game**:
- Box breathing exercise
- Visual feedback
- Score tracking

## API Endpoints

- `GET http://localhost:8000/docs` - API documentation
- `POST http://localhost:8000/api/v1/assistant/recommend` - Get AI recommendations
- `WS ws://localhost:8000/api/v1/stress/ws/stress/{session_id}` - Real-time stress streaming
