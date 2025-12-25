#!/bin/bash

echo "🚀 ZenithAI - Fast Start"
echo ""

# Kill any existing
pkill -f uvicorn 2>/dev/null || true
pkill -f "next dev" 2>/dev/null || true

# Install minimal deps with system python
echo "📦 Installing dependencies..."
pip3 install -q fastapi uvicorn pydantic websockets torch numpy 2>&1 | tail -1

# Start backend
echo "🔧 Starting API..."
cd apps/api
python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 &
API_PID=$!
cd ../..

sleep 2

# Start frontend
echo "📱 Starting Frontend..."
cd apps/web
npm run dev -- --port 3000 &
WEB_PID=$!
cd ../..

sleep 2

echo ""
echo "✅ READY!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎥 Live Demo:  http://localhost:3000/live-demo"
echo "🎮 Games:      http://localhost:3000/games"
echo "📚 API Docs:   http://localhost:8000/docs"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Press Ctrl+C to stop"

trap "kill $API_PID $WEB_PID 2>/dev/null; exit" INT TERM
wait
