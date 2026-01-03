#!/bin/bash

set -e

echo "========================================="
echo "AI Stress Detection Application"
echo "========================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Cleanup function
cleanup() {
    echo -e "\n${YELLOW}Stopping services...${NC}"
    pkill -f "uvicorn" 2>/dev/null || true
    pkill -f "next-server" 2>/dev/null || true
    pkill -f "next dev" 2>/dev/null || true
    exit
}

trap cleanup SIGINT SIGTERM

# Stop any existing processes
echo -e "${BLUE}Stopping any existing processes...${NC}"
fuser -k 8000/tcp 2>/dev/null || true
fuser -k 3000/tcp 2>/dev/null || true
sleep 2

# Backend Setup
echo -e "\n${BLUE}Setting up Backend...${NC}"
cd apps/api

if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

source venv/bin/activate

echo "Installing Python dependencies..."
pip install -q --upgrade pip
pip install -q -r requirements.txt

# Train ML model if not exists
if [ ! -f "app/ml/stress_model.json" ]; then
    echo -e "${YELLOW}Training ML model (first time setup)...${NC}"
    python -m app.ml.train
fi

# Start backend
echo -e "${GREEN}Starting Backend API...${NC}"
uvicorn app.main:app --reload --port 8000 --host 0.0.0.0 &
BACKEND_PID=$!

cd ../..

# Frontend Setup
echo -e "\n${BLUE}Setting up Frontend...${NC}"
cd apps/web

if [ ! -d "node_modules" ]; then
    echo "Installing Node.js dependencies..."
    npm install
fi

echo -e "${GREEN}Starting Frontend...${NC}"
npm run dev -- -p 3000 &
FRONTEND_PID=$!

cd ../..

echo ""
echo "========================================="
echo -e "${GREEN}✓ Application is running!${NC}"
echo "========================================="
echo ""
echo -e "Backend API:  ${BLUE}http://localhost:8000${NC}"
echo -e "API Docs:     ${BLUE}http://localhost:8000/docs${NC}"
echo -e "Frontend:     ${BLUE}http://localhost:3000${NC}"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"
echo ""

# Wait for processes
wait
