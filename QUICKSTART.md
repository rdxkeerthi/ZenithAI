# StressGuardAI - Quick Start Guide

## 🚀 Start the Application

### Option 1: Use Start Script (Recommended)
```bash
./start.sh
```

This will:
- Start backend on port 8000
- Start frontend on port 3000
- Run both in background
- Create log files

### Option 2: Manual Start

**Terminal 1 - Backend:**
```bash
cd backend
source ../venv/bin/activate
python3 app.py
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

## 🛑 Stop the Application

```bash
./stop.sh
```

## 📊 Access the Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs

## 📝 View Logs

```bash
# Backend logs
tail -f backend.log

# Frontend logs
tail -f frontend.log
```

## ✅ Verify Everything is Running

```bash
# Check backend
curl http://localhost:8000/health

# Check frontend
curl http://localhost:3000
```

## 🧪 Run Tests

```bash
./run_tests.sh
```

## 📖 Usage Flow

1. **Open** http://localhost:3000
2. **Register** a new account
3. **Login** with your credentials
4. **Start Analysis** - Begin stress monitoring
5. **Allow Camera** - Grant camera permissions
6. **Play Games** - Complete 4 random games
7. **View Report** - See AI recommendations
8. **Download** - Get PDF or DOCX report

## 🎮 Features

- Real-time stress analysis
- 8 stress-relief games
- AI-powered recommendations
- PDF/DOCX reports
- Historical data tracking

## 🔧 Troubleshooting

### Port Already in Use
```bash
# Kill processes on ports
./stop.sh
```

### Frontend Won't Start
```bash
cd frontend
rm -rf .next node_modules
npm install
npm run dev
```

### Backend Won't Start
```bash
cd backend
source ../venv/bin/activate
pip install -r requirements.txt
python3 app.py
```

### ML Model Not Found
```bash
cd ml/training
source ../../venv/bin/activate
python train_stress_model.py
```

## 📁 Important Files

- `start.sh` - Start all services
- `stop.sh` - Stop all services
- `run_tests.sh` - Run test suite
- `DEPLOYMENT.md` - Deployment guide
- `FINAL_SUMMARY.md` - Complete summary

## 🎯 Next Steps

1. Test all features
2. Review AI recommendations
3. Play all games
4. Download reports
5. Check deployment guide for production

---

**Status:** ✅ Ready to use
**Services:** Backend + Frontend + ML
**Documentation:** Complete
