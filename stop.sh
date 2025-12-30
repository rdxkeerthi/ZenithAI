#!/bin/bash

# StressGuardAI - Stop Script
# Stops both backend and frontend

echo "🛑 Stopping StressGuardAI..."
echo "=============================="

# Kill backend
if [ -f backend.pid ]; then
    PID=$(cat backend.pid)
    if kill -0 $PID 2>/dev/null; then
        kill $PID
        echo "✅ Backend stopped (PID: $PID)"
    fi
    rm backend.pid
fi

# Kill frontend  
if [ -f frontend.pid ]; then
    PID=$(cat frontend.pid)
    if kill -0 $PID 2>/dev/null; then
        kill $PID
        echo "✅ Frontend stopped (PID: $PID)"
    fi
    rm frontend.pid
fi

# Kill any remaining processes on ports
lsof -ti:8000 | xargs kill -9 2>/dev/null && echo "✅ Cleaned up port 8000" || true
lsof -ti:3000 | xargs kill -9 2>/dev/null && echo "✅ Cleaned up port 3000" || true

echo ""
echo "✅ All services stopped"
