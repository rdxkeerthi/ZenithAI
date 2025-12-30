#!/bin/bash

# StressGuardAI - Quick Start Script
# Starts both backend and frontend

set -e

echo "🚀 StressGuardAI - Quick Start"
echo "=============================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check if backend is already running
if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null ; then
    echo -e "${YELLOW}⚠️  Backend already running on port 8000${NC}"
else
    echo -e "${GREEN}Starting Backend...${NC}"
    cd backend
    source ../venv/bin/activate
    python3 app.py > ../backend.log 2>&1 &
    echo $! > ../backend.pid
    cd ..
    echo -e "${GREEN}✅ Backend started (PID: $(cat backend.pid))${NC}"
    sleep 3
fi

# Check if frontend is already running
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo -e "${YELLOW}⚠️  Frontend already running on port 3000${NC}"
else
    echo -e "${GREEN}Starting Frontend...${NC}"
    cd frontend
    npm run dev > ../frontend.log 2>&1 &
    echo $! > ../frontend.pid
    cd ..
    echo -e "${GREEN}✅ Frontend started (PID: $(cat frontend.pid))${NC}"
fi

echo ""
echo -e "${GREEN}=============================="
echo "✅ StressGuardAI is Running!"
echo "==============================${NC}"
echo ""
echo -e "📊 Backend:  ${GREEN}http://localhost:8000${NC}"
echo -e "🎨 Frontend: ${GREEN}http://localhost:3000${NC}"
echo -e "📚 API Docs: ${GREEN}http://localhost:8000/docs${NC}"
echo ""
echo -e "${YELLOW}View Logs:${NC}"
echo "  Backend:  tail -f backend.log"
echo "  Frontend: tail -f frontend.log"
echo ""
echo -e "${YELLOW}Stop Services:${NC}"
echo "  ./stop.sh"
echo ""
