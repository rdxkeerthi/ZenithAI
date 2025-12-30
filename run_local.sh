#!/bin/bash

# StressGuardAI - Local Run Script
# Enterprise-Grade Stress Detection System

echo "🚀 Starting StressGuardAI..."
echo "================================"

# Check if venv exists
if [ ! -d "venv" ]; then
    echo "❌ Virtual environment not found!"
    echo "Run: python3 -m venv venv"
    exit 1
fi

# Activate venv
source venv/bin/activate

# Check if models are trained
if [ ! -f "ml/trained/stress_classifier.h5" ]; then
    echo "⚠️  ML models not found. Training now..."
    cd ml/training
    python train_lstm.py
    cd ../..
fi

# Start backend in background
echo "🔧 Starting Backend API..."
cd backend
python app.py &
BACKEND_PID=$!
cd ..

# Wait for backend
sleep 5

# Start frontend
echo "🎨 Starting Frontend..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ StressGuardAI is running!"
echo "================================"
echo "📊 Backend API: http://localhost:8000"
echo "🎨 Frontend: http://localhost:3000"
echo "📚 API Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for user interrupt
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
