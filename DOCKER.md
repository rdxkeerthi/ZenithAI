# 🐳 ZenithAI - Docker Deployment Guide

## Quick Start (One Command!)

```bash
./docker-deploy.sh
```

That's it! The application will be running at:
- **Frontend**: http://localhost:3000
- **API**: http://localhost:8000
- **Play**: http://localhost:3000/play

---

## Prerequisites

### Install Docker

**Windows/Mac**:
1. Download Docker Desktop: https://www.docker.com/products/docker-desktop
2. Install and start Docker Desktop
3. Verify: `docker --version`

**Linux (Ubuntu/Debian)**:
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt-get install docker-compose

# Add user to docker group (no sudo needed)
sudo usermod -aG docker $USER
newgrp docker
```

---

## Deployment Methods

### Method 1: Automated Script (Recommended)
```bash
./docker-deploy.sh
```

### Method 2: Manual Docker Compose
```bash
# Build images
docker-compose build

# Start containers
docker-compose up -d

# View logs
docker-compose logs -f

# Stop containers
docker-compose down
```

### Method 3: Individual Containers
```bash
# Build backend
cd apps/api
docker build -t zenith-api .

# Build frontend
cd apps/web
docker build -t zenith-web .

# Run backend
docker run -d -p 8000:8000 --name zenith-api zenith-api

# Run frontend
docker run -d -p 3000:3000 --name zenith-web zenith-web
```

---

## Useful Commands

### View Logs
```bash
# All services
docker-compose logs -f

# Backend only
docker-compose logs -f api

# Frontend only
docker-compose logs -f web
```

### Restart Services
```bash
# Restart all
docker-compose restart

# Restart backend
docker-compose restart api

# Restart frontend
docker-compose restart web
```

### Stop & Remove
```bash
# Stop containers
docker-compose stop

# Remove containers
docker-compose down

# Remove containers + volumes
docker-compose down -v

# Remove everything (including images)
docker-compose down --rmi all -v
```

### Access Container Shell
```bash
# Backend shell
docker exec -it zenith-api /bin/bash

# Frontend shell
docker exec -it zenith-web /bin/sh
```

---

## Troubleshooting

### Port Already in Use
```bash
# Find process using port 3000
lsof -i :3000
# or
netstat -ano | findstr :3000  # Windows

# Kill the process
kill -9 <PID>
```

### Container Won't Start
```bash
# Check logs
docker-compose logs api
docker-compose logs web

# Rebuild from scratch
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Permission Denied (Linux)
```bash
# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Or run with sudo
sudo docker-compose up -d
```

---

## Production Deployment

### Environment Variables
Create `.env` file:
```env
# Backend
PYTHONUNBUFFERED=1
API_HOST=0.0.0.0
API_PORT=8000

# Frontend
NODE_ENV=production
NEXT_PUBLIC_API_URL=http://your-domain.com:8000
```

### Use in docker-compose:
```yaml
services:
  api:
    env_file: .env
  web:
    env_file: .env
```

### SSL/HTTPS (with Nginx)
```bash
# Add nginx service to docker-compose.yml
nginx:
  image: nginx:alpine
  ports:
    - "80:80"
    - "443:443"
  volumes:
    - ./nginx.conf:/etc/nginx/nginx.conf
    - ./ssl:/etc/nginx/ssl
```

---

## System Requirements

**Minimum**:
- 4GB RAM
- 2 CPU cores
- 5GB disk space
- Docker 20.10+
- Docker Compose 1.29+

**Recommended**:
- 8GB RAM
- 4 CPU cores
- 10GB disk space

---

## Features Included

✅ **Backend API** (FastAPI + PyTorch)
- Real-time WebSocket stress analysis
- AI model inference
- PDF/DOCX report generation

✅ **Frontend** (Next.js 16)
- Camera-based face tracking
- 8 interactive games
- Comprehensive reports

✅ **Auto-restart** on failure
✅ **Volume persistence** for models
✅ **Network isolation** for security
✅ **Health checks** (coming soon)

---

## Next Steps

1. **Start the app**: `./docker-deploy.sh`
2. **Open browser**: http://localhost:3000/play
3. **Complete analysis**: Fill form → Play games → View report
4. **Download report**: PDF, DOCX, or JSON

---

**Need help?** Check logs with `docker-compose logs -f`
