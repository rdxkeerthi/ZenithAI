#!/bin/bash

echo "🐳 ZenithAI - Docker Deployment"
echo "================================"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed!"
    echo "Please install Docker from: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed!"
    echo "Please install Docker Compose from: https://docs.docker.com/compose/install/"
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"
echo ""

# Stop any existing containers
echo "🛑 Stopping existing containers..."
docker-compose down

# Build and start containers
echo "🔨 Building Docker images..."
docker-compose build

echo "🚀 Starting containers..."
docker-compose up -d

echo ""
echo "✅ ZenithAI is now running!"
echo "================================"
echo "🎥 Frontend:  http://localhost:3000"
echo "📚 API Docs:  http://localhost:8000/docs"
echo "🎮 Play:      http://localhost:3000/play"
echo "================================"
echo ""
echo "To view logs: docker-compose logs -f"
echo "To stop:      docker-compose down"
