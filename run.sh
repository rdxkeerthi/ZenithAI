#!/bin/bash

# StressGuardAI - Unified Run Script
# Starts both backend and frontend with proper error handling

set -e

echo "🚀 StressGuardAI - Starting Application"
echo "========================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Cleanup function
cleanup() {
    echo ""
    echo "🛑 Stopping services..."
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
    fi
    lsof -ti:8000 | xargs kill -9 2>/dev/null || true
    lsof -ti:3000 | xargs kill -9 2>/dev/null || true
    echo "✅ Services stopped"
    exit 0
}

trap cleanup INT TERM

# Check virtual environment
if [ ! -d "venv" ]; then
    echo -e "${RED}❌ Virtual environment not found!${NC}"
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate venv
source venv/bin/activate

# Install/update dependencies
echo "📦 Checking dependencies..."
pip install -q pydantic-settings email-validator 'pydantic[email]' 2>/dev/null || true

# Check if ML model exists
if [ ! -f "ml/trained/stress_classifier.h5" ]; then
    echo -e "${YELLOW}⚠️  ML model not found. Training now...${NC}"
    cd ml/training
    python train_stress_model.py
    cd ../..
fi

# Kill any existing processes on ports
echo "🧹 Cleaning up ports..."
lsof -ti:8000 | xargs kill -9 2>/dev/null || true
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
sleep 2

# Start Backend
echo -e "${GREEN}🔧 Starting Backend API...${NC}"
cd backend
python3 app.py > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..
echo -e "${GREEN}✅ Backend started (PID: $BACKEND_PID)${NC}"

# Wait for backend to be ready
echo "⏳ Waiting for backend to start..."
for i in {1..30}; do
    if curl -s http://localhost:8000/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Backend is ready!${NC}"
        break
    fi
    sleep 1
    if [ $i -eq 30 ]; then
        echo -e "${RED}❌ Backend failed to start${NC}"
        echo "Check backend.log for errors"
        cleanup
    fi
done

# Start Frontend
echo -e "${GREEN}🎨 Starting Frontend...${NC}"
cd frontend
npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..
echo -e "${GREEN}✅ Frontend started (PID: $FRONTEND_PID)${NC}"

# Wait for frontend to be ready
echo "⏳ Waiting for frontend to start..."
for i in {1..30}; do
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Frontend is ready!${NC}"
        break
    fi
    sleep 1
    if [ $i -eq 30 ]; then
        echo -e "${YELLOW}⚠️  Frontend may still be starting...${NC}"
    fi
done

echo ""
echo "========================================"
echo -e "${GREEN}✅ StressGuardAI is Running!${NC}"
echo "========================================"
echo ""
echo -e "📊 Backend:  ${GREEN}http://localhost:8000${NC}"
echo -e "🎨 Frontend: ${GREEN}http://localhost:3000${NC}"
echo -e "📚 API Docs: ${GREEN}http://localhost:8000/docs${NC}"
echo ""
echo -e "${YELLOW}Logs:${NC}"
echo "  Backend:  tail -f backend.log"
echo "  Frontend: tail -f frontend.log"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"
echo ""

# Keep script running
wait
