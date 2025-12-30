#!/bin/bash

# StressGuardAI - Complete Test Suite

echo "=========================================="
echo "StressGuardAI - Running All Tests"
echo "=========================================="
echo ""

# Activate virtual environment
source venv/bin/activate

# Test 1: Face Analysis
echo "📋 Test 1: Face Analysis"
echo "----------------------------------------"
python tests/test_face_analysis.py
echo ""

# Test 2: ML Model
echo "📋 Test 2: ML Model"
echo "----------------------------------------"
python tests/test_model.py
echo ""

# Test 3: Games
echo "📋 Test 3: Games Integration"
echo "----------------------------------------"
python tests/test_games.py
echo ""

# Test 4: Backend API
echo "📋 Test 4: Backend API Health"
echo "----------------------------------------"
echo "Checking if backend is running..."
if curl -s http://localhost:8000/health > /dev/null; then
    echo "✅ Backend is running"
    echo ""
    echo "Testing API endpoints:"
    echo "  - GET /health"
    curl -s http://localhost:8000/health | python -m json.tool
    echo ""
else
    echo "❌ Backend is not running"
    echo "Start backend with: cd backend && python3 app.py"
    echo ""
fi

# Test 5: Frontend
echo "📋 Test 5: Frontend"
echo "----------------------------------------"
echo "Checking if frontend is running..."
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Frontend is running on http://localhost:3000"
else
    echo "❌ Frontend is not running"
    echo "Start frontend with: cd frontend && npm run dev"
fi
echo ""

# Summary
echo "=========================================="
echo "Test Suite Complete!"
echo "=========================================="
echo ""
echo "Next Steps:"
echo "1. Open http://localhost:3000 in browser"
echo "2. Register a new account"
echo "3. Start stress analysis session"
echo "4. Play games and test features"
echo ""
