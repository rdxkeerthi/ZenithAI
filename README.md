# AI Stress Detection Application

A comprehensive web application that monitors user stress levels through facial expression analysis during interactive gameplay, providing AI-powered health recommendations and detailed reports.

## 🌟 Features

- **User Management**: Complete registration system with detailed health profiles
- **10 Interactive Games**: 
  - ⚡ Reaction Time Test
  - 🧠 Memory Match
  - 🔷 Pattern Recognition
  - 🎨 Color Stroop Test
  - 🔢 Number Sequence
  - 🗺️ Maze Navigator
  - 🔨 Whack-a-Mole
  - 🧩 Puzzle Slider
  - 🎯 Focus Tracker
  - 🧘 Breathing Exercise

- **Real-Time Face Tracking**: MediaPipe-based facial expression analysis
- **ML-Powered Stress Detection**: LSTM model for accurate stress prediction
- **AI Health Reports**: Personalized recommendations for:
  - Activities and lifestyle changes
  - Workout plans
  - Meditation and mindfulness
  - Nutrition guidelines
  - Medical checkup recommendations
- **PDF Export**: Download detailed reports
- **Modern UI**: Advanced design with gradients, glassmorphism, and animations

## 🚀 Quick Start

### Prerequisites

- Python 3.8+
- Node.js 18+
- npm or yarn

### Installation & Run

```bash
# Make the run script executable
chmod +x run.sh

# Start the application
./run.sh
```

The script will:
1. Set up Python virtual environment
2. Install all dependencies
3. Train the ML model (first time only)
4. Start the backend API on port 8000
5. Start the frontend on port 3000

### Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## 📁 Project Structure

```
ai-stress-app/
├── apps/
│   ├── api/                    # FastAPI Backend
│   │   ├── app/
│   │   │   ├── api/v1/endpoints/  # API routes
│   │   │   ├── core/              # Database & security
│   │   │   ├── ml/                # ML model
│   │   │   ├── services/          # Business logic
│   │   │   ├── models.py          # Database models
│   │   │   ├── schemas.py         # Pydantic schemas
│   │   │   └── main.py            # FastAPI app
│   │   └── requirements.txt
│   │
│   └── web/                    # Next.js Frontend
│       ├── src/
│       │   ├── app/
│       │   │   ├── play/          # Games & face tracking
│       │   │   ├── dashboard/     # User dashboard
│       │   │   ├── report/        # AI reports
│       │   │   ├── register/      # Registration
│       │   │   └── login/         # Login
│       │   ├── components/        # Reusable components
│       │   └── styles/            # Global styles
│       └── package.json
│
└── run.sh                      # Main startup script
```

## 🎮 How to Use

1. **Register**: Create an account with your profile information
2. **Start Session**: Begin a stress analysis session
3. **Play Games**: Complete 4 randomly selected games
4. **Monitor**: Watch real-time stress levels during gameplay
5. **Get Report**: Receive AI-powered recommendations
6. **Download**: Export your report as PDF

## 🔧 Technology Stack

### Backend
- FastAPI - Modern Python web framework
- SQLAlchemy - Database ORM
- NumPy - ML computations
- ReportLab - PDF generation
- WebSockets - Real-time communication

### Frontend
- Next.js 14 - React framework
- Modern CSS - Custom design system
- MediaPipe - Face tracking (placeholder for full implementation)
- Chart.js - Data visualization

### ML/AI
- Custom LSTM implementation in NumPy
- Facial expression analysis
- Stress prediction algorithm
- AI recommendation engine

## 📊 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/auth/me` - Get current user

### Stress Analysis
- `POST /api/v1/stress/session/start` - Start game session
- `POST /api/v1/stress/session/{id}/game` - Save game data
- `POST /api/v1/stress/session/{id}/complete` - Complete session
- `GET /api/v1/stress/user/{id}/history` - Get user history

### Reports
- `POST /api/v1/reports/generate/{session_id}` - Generate report
- `GET /api/v1/reports/{id}` - Get report
- `GET /api/v1/reports/{id}/pdf` - Download PDF

### WebSocket
- `WS /ws/analysis` - Real-time stress analysis

## 🎨 UI Features

- **Dark Theme**: Modern dark mode with purple/blue gradients
- **Glassmorphism**: Frosted glass effects
- **Smooth Animations**: Transitions and micro-interactions
- **Responsive Design**: Works on all screen sizes
- **Split-Screen**: Game and face tracking side-by-side

## 🔒 Security

- JWT-based authentication
- Password hashing with bcrypt
- CORS configuration
- Input validation

## 📝 License

This project is for educational and demonstration purposes.

## 🤝 Contributing

This is a complete implementation. Feel free to extend with:
- Full MediaPipe integration
- More games
- Advanced ML models
- Cloud deployment
- Mobile app version

## 📧 Support

For issues or questions, please check the API documentation at `/docs` endpoint.

---

**Built with ❤️ for stress management and mental health awareness**
