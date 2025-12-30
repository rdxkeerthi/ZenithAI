# StressGuardAI - Deployment Guide

## 🚀 Local Deployment (Current Setup)

### Prerequisites
- Python 3.10+
- Node.js 18+
- Webcam
- 4GB+ RAM

### Quick Start
```bash
# 1. Start Backend
cd backend
python3 app.py

# 2. Start Frontend (new terminal)
cd frontend
npm run dev

# 3. Access Application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

## 🧪 Testing

### Run All Tests
```bash
./run_tests.sh
```

### Individual Tests
```bash
# Test face analysis
python tests/test_face_analysis.py

# Test ML model
python tests/test_model.py

# Test games
python tests/test_games.py
```

### Manual Testing Checklist
- [ ] Register new user
- [ ] Login with credentials
- [ ] Start stress analysis session
- [ ] Allow camera access
- [ ] Verify real-time stress meter updates
- [ ] Play all 4 random games
- [ ] View split-screen game + camera
- [ ] Complete game and see results
- [ ] View session history
- [ ] Download PDF report
- [ ] Download DOCX report
- [ ] Verify AI recommendations

## 🐳 Docker Deployment (Optional)

### Create Dockerfiles

**Backend Dockerfile:**
```dockerfile
FROM python:3.10-slim

WORKDIR /app

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ .
COPY ml/ ../ml/

EXPOSE 8000

CMD ["python", "app.py"]
```

**Frontend Dockerfile:**
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ .

EXPOSE 3000

CMD ["npm", "run", "dev"]
```

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  backend:
    build:
      context: .
      dockerfile: backend/Dockerfile
    ports:
      - "8000:8000"
    volumes:
      - ./ml/trained:/app/ml/trained
      - ./database:/app/database
    environment:
      - DEBUG=True

  frontend:
    build:
      context: .
      dockerfile: frontend/Dockerfile
    ports:
      - "3000:3000"
    depends_on:
      - backend
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Run with Docker
```bash
docker-compose up -d
```

## ☁️ Cloud Deployment

### AWS Deployment

**1. EC2 Setup:**
```bash
# Launch EC2 instance (t3.medium or larger)
# Install dependencies
sudo apt update
sudo apt install python3-pip nodejs npm

# Clone repository
git clone <your-repo>
cd StressGuardAI

# Setup and run
./run_local.sh
```

**2. Configure Security Groups:**
- Port 8000 (Backend API)
- Port 3000 (Frontend)
- Port 22 (SSH)

**3. Use Nginx as Reverse Proxy:**
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
    }

    location /api {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
    }
}
```

### Heroku Deployment

**1. Create Procfile:**
```
web: cd backend && python app.py
```

**2. Deploy:**
```bash
heroku create stressguard-api
git push heroku main
```

### Vercel (Frontend Only)

```bash
cd frontend
vercel deploy
```

## 🔒 Production Checklist

### Security
- [ ] Change JWT secret key
- [ ] Use HTTPS/SSL certificates
- [ ] Enable CORS only for production domain
- [ ] Hash all passwords (already implemented)
- [ ] Set secure cookie flags
- [ ] Add rate limiting
- [ ] Implement API key authentication

### Database
- [ ] Migrate from SQLite to PostgreSQL
- [ ] Set up database backups
- [ ] Configure connection pooling
- [ ] Add database indexes

### Performance
- [ ] Enable caching (Redis)
- [ ] Optimize ML model inference
- [ ] Compress frontend assets
- [ ] Use CDN for static files
- [ ] Enable gzip compression

### Monitoring
- [ ] Set up error logging (Sentry)
- [ ] Add performance monitoring
- [ ] Configure health checks
- [ ] Set up alerts

## 📊 Environment Variables

### Backend (.env)
```bash
DEBUG=False
SECRET_KEY=<generate-strong-key>
DATABASE_URL=postgresql://user:pass@host:5432/db
CORS_ORIGINS=https://yourdomain.com
```

### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

## 🔄 CI/CD Pipeline

### GitHub Actions Example
```yaml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Run tests
        run: ./run_tests.sh
      
      - name: Deploy to production
        run: |
          # Your deployment script
```

## 📈 Scaling Considerations

### Horizontal Scaling
- Load balancer (Nginx/HAProxy)
- Multiple backend instances
- Shared database
- Redis for session storage

### Vertical Scaling
- Increase server resources
- Optimize ML model
- Database query optimization

## 🆘 Troubleshooting

### Backend won't start
```bash
# Check Python version
python3 --version

# Reinstall dependencies
pip install -r backend/requirements.txt

# Check port availability
lsof -i :8000
```

### Frontend won't start
```bash
# Clear cache
rm -rf frontend/.next
rm -rf frontend/node_modules

# Reinstall
cd frontend
npm install
npm run dev
```

### Camera not working
- Check browser permissions
- Ensure HTTPS (required for camera in production)
- Test with different browsers

### ML model errors
```bash
# Retrain model
cd ml/training
python train_stress_model.py
```

## 📞 Support

For issues:
1. Check logs: `docker-compose logs -f`
2. Verify all services are running
3. Test API endpoints: http://localhost:8000/docs
4. Check browser console for frontend errors

---

**Current Status:** ✅ Ready for local deployment and testing
**Production Ready:** After security hardening and performance optimization
