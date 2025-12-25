# 🎥 ZenithAI - Quick Start Guide

## ✅ What's Working Now

### 1. **Live Camera Demo** (NEW!)
- **URL**: http://localhost:3000/live-demo
- **Features**:
  - ✅ Real webcam access
  - ✅ MediaPipe facial landmark detection (468 points)
  - ✅ Real-time stress analysis
  - ✅ Blink rate detection
  - ✅ Eye openness tracking
  - ✅ Visual stress meter
  - ✅ Live feature display

### 2. **Breathing Game**
- **URL**: http://localhost:3000/games/breathing
- **Features**:
  - ✅ Interactive breathing circle
  - ✅ 4-4-4-4 box breathing pattern
  - ✅ Score tracking
  - ✅ Smooth animations
  - ✅ Completion celebration

### 3. **AI Assistant**
- **API**: http://localhost:8000/api/v1/assistant/recommend
- **Features**:
  - ✅ 6 evidence-based interventions
  - ✅ Context-aware recommendations
  - ✅ Personalized messages

---

## 🚀 How to Run

```bash
# Make sure you're in the project root
cd /home/sec/mini_project/ai-stress

# Run the startup script
./start.sh
```

**Wait for**:
- ✅ Backend: http://localhost:8000
- ✅ Frontend: http://localhost:3000

---

## 📱 How to Use

### Step 1: Try the Live Demo

1. Open http://localhost:3000
2. Click **"🎥 Try Live Demo"**
3. **Allow camera access** when prompted
4. Watch the AI analyze your stress in real-time!

**What you'll see**:
- Green dots on your face (facial landmarks)
- Stress level (LOW/MEDIUM/HIGH)
- Blink rate counter
- Eye openness percentage
- Real-time stress meter

### Step 2: Play the Breathing Game

1. From homepage, click **"🎮 Play Games"**
2. Click **"Resonance Breathing"**
3. Click **"Start Session"**
4. Follow the circle:
   - **Blue** = Breathe In (4 seconds)
   - **Purple** = Hold (4 seconds)
   - **Green** = Breathe Out (4 seconds)
   - **Gray** = Rest (4 seconds)
5. Complete 5 cycles to finish!

### Step 3: Get AI Recommendations

```bash
# Test the AI Assistant
curl -X POST http://localhost:8000/api/v1/assistant/recommend \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "demo",
    "stress_level": 0.75,
    "context": {"blink_rate": 8, "session_duration": 45}
  }'
```

**You'll get**:
- Personalized intervention (e.g., Box Breathing)
- Step-by-step instructions
- Estimated duration
- Confidence score

---

## 🎯 Key Features

### Privacy-First
- ✅ Camera processing happens **in your browser**
- ✅ Only numerical features sent to server
- ✅ **No video recording or storage**

### Real-Time Analysis
- ✅ Face detection: 468 landmarks
- ✅ Blink detection: Eye Aspect Ratio (EAR)
- ✅ Stress calculation: Multi-factor heuristic
- ✅ Update rate: ~30 FPS

### AI-Powered
- ✅ MediaPipe (Google) for face detection
- ✅ LSTM neural network (ready for training)
- ✅ RAG-based recommendations

---

## 🔧 Troubleshooting

### Camera Not Working?
1. **Check browser permissions**: Allow camera access
2. **Use Chrome/Edge**: Best MediaPipe support
3. **Check lighting**: Ensure your face is well-lit
4. **Refresh page**: Sometimes helps with initialization

### "AI Model Loading" Forever?
1. **Check internet**: MediaPipe downloads from CDN
2. **Wait 10-15 seconds**: First load takes time
3. **Check console**: Press F12 to see errors

### Backend Not Starting?
```bash
# Install dependencies manually
cd apps/api
python3 -m venv venv
source venv/bin/activate
pip install fastapi uvicorn pydantic websockets numpy pandas scikit-learn torch mediapipe
python3 -m uvicorn main:app --reload --port 8000
```

---

## 📊 What the AI Detects

### Stress Indicators
1. **Low Blink Rate** (<10/min) → Eye strain/stress
2. **Low Eye Openness** (<25%) → Fatigue
3. **Brow Furrowing** → Concentration/stress
4. **Jaw Tension** → Physical stress

### Stress Levels
- **LOW** (0-33%): Relaxed, calm
- **MEDIUM** (33-66%): Moderate stress
- **HIGH** (66-100%): Elevated stress

---

## 🎮 Game + Camera Analysis (Coming Soon)

The breathing game will soon integrate with the camera to:
- Detect your actual breathing rhythm
- Adjust game speed to match your breath
- Provide real-time feedback
- Track stress reduction during gameplay

---

## 📚 Next Steps

### To Train the LSTM Model:
```bash
cd apps/ml-training
python train/train_lstm.py
```

### To Deploy to Production:
See `docs/DEPLOYMENT.md` for Kubernetes setup

---

## 🎉 You're All Set!

**Try it now**: http://localhost:3000/live-demo

**Questions?** Check the full documentation in `/docs/`
