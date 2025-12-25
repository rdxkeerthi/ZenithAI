# 🧠 ZenithAI - AI-Powered Stress Analysis System

<div align="center">

![ZenithAI](https://img.shields.io/badge/ZenithAI-v7.0-blue?style=for-the-badge)
![Python](https://img.shields.io/badge/Python-3.10+-green?style=for-the-badge&logo=python)
![Next.js](https://img.shields.io/badge/Next.js-16.1-black?style=for-the-badge&logo=next.js)
![Docker](https://img.shields.io/badge/Docker-Ready-blue?style=for-the-badge&logo=docker)
![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)

**Real-time AI-powered stress detection and comprehensive mental health analysis**

[Quick Start](#-quick-start) • [Features](#-key-features) • [Architecture](#-system-architecture) • [Documentation](#-documentation)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Executive Summary](#-executive-summary)
- [Problem Statement](#-problem-statement)
- [Solution Overview](#-solution-overview)
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Technology Stack](#-technology-stack)
- [Installation & Setup](#-installation--setup)
- [Usage Instructions](#-usage-instructions)
- [Results / Output](#-results--output)
- [License](#-license)

---

## 🎯 Overview

**ZenithAI** is a cutting-edge, AI-powered stress analysis platform that combines real-time facial recognition, interactive cognitive assessments, and machine learning to provide comprehensive mental health insights. The system delivers medical-grade reports with personalized recommendations for stress management, lifestyle optimization, and mental wellness.

### What Makes ZenithAI Unique?

- 🎥 **Real-time Facial Analysis**: 30+ biometric markers tracked via webcam
- 🎮 **Cognitive Assessment**: 8 interactive games measuring mental performance
- 🤖 **AI-Powered Insights**: Deep learning model for stress prediction
- 📊 **Comprehensive Reports**: 8-section medical-grade analysis
- 📥 **Multi-Format Export**: PDF, DOCX, and JSON downloads
- 🐳 **Cross-Platform**: Docker deployment for any OS

---

## 📊 Executive Summary

### Mission
To democratize mental health assessment through accessible, AI-driven technology that provides actionable insights for stress management and overall wellbeing.

### Vision
A world where everyone has access to real-time mental health monitoring and personalized wellness recommendations, reducing the burden of stress-related disorders.

### Impact
- **30+ Biometric Markers**: Comprehensive physiological analysis
- **8 Interactive Games**: Cognitive function assessment
- **12 Time Management Techniques**: Productivity optimization
- **Medical-Grade Reports**: Professional-level recommendations
- **Zero Installation**: Docker-based deployment

---

## ❗ Problem Statement

### The Global Stress Crisis

**Statistics**:
- 77% of people experience stress affecting physical health
- 73% experience stress impacting mental health
- $300B+ annual cost to US economy from workplace stress
- 1 in 5 adults experience mental illness annually

### Current Challenges

1. **Limited Access**: Mental health professionals are expensive and scarce
2. **Delayed Detection**: Stress often goes unnoticed until severe
3. **Lack of Personalization**: Generic advice doesn't address individual needs
4. **No Real-Time Monitoring**: Traditional assessments are point-in-time only
5. **Complex Setup**: Existing tools require extensive configuration

### Gap in Market

- **No comprehensive solution** combining real-time monitoring + cognitive assessment + AI analysis
- **Expensive tools** require clinical settings and trained professionals
- **Limited actionability** - most tools diagnose but don't provide detailed recommendations

---

## 💡 Solution Overview

ZenithAI addresses these challenges through:

### 1. **Accessible Technology**
- Web-based platform accessible from any device
- No specialized hardware required (just a webcam)
- Docker deployment eliminates setup complexity

### 2. **Real-Time Analysis**
- Continuous facial landmark tracking (468 points)
- WebSocket-based live stress monitoring
- Immediate feedback during assessment

### 3. **Comprehensive Assessment**
- **Biometric**: 30+ facial metrics (blink rate, tension, asymmetry)
- **Cognitive**: 8 interactive games testing memory, reaction, focus
- **Lifestyle**: 20+ questions about work, sleep, exercise, diet

### 4. **AI-Powered Insights**
- LSTM neural network for stress prediction
- Heuristic analysis for immediate results
- Confidence scoring for reliability

### 5. **Actionable Recommendations**
- **Medical**: Medications, specialists, immediate actions
- **Meditation**: 5 techniques with specific timing
- **Exercise**: Age-appropriate 6-day workout plans
- **Lifestyle**: Work, sleep, nutrition, phone management
- **Productivity**: 12 time management strategies

---

## ✨ Key Features

### 🎥 Real-Time Facial Analysis
- **468 Facial Landmarks** tracked via MediaPipe
- **30+ Biometric Metrics**:
  - Eye: Blink rate, openness, asymmetry, pupil dilation
  - Gaze: Direction, stability, focus score
  - Tension: Brow, jaw, lip, cheek, nose, forehead
  - Emotions: Smile, frown, surprise, disgust, fear, anger
  - Fatigue: Yawn detection, head drooping, attention score

### 🎮 Interactive Cognitive Games
1. **Memory Match**: Pattern recognition and recall
2. **Typing Speed**: Reaction time and accuracy
3. **Maze Navigator**: Spatial reasoning
4. **Color Match**: Visual processing speed
5. **Word Builder**: Verbal fluency
6. **Number Sequence**: Working memory
7. **Rhythm Clicker**: Timing and coordination
8. **Shape Sorter**: Categorization skills

### 📊 Comprehensive 8-Section Report

#### 1. Executive Summary
- Risk level scoring (0-20 scale)
- Average stress percentage
- Cognitive performance metrics
- AI confidence level

#### 2. Physiological Analysis
- Detailed biometric breakdown
- Stress indicators with thresholds
- Trend analysis

#### 3. Lifestyle & Work Assessment
- Work hours analysis
- Sleep quality evaluation
- Caffeine/exercise tracking
- Screen time monitoring

#### 4. Medical Recommendations
- **Priority Levels**: URGENT, HIGH, MODERATE
- **Medications**: SSRIs, Benzodiazepines, Natural supplements
- **Specialists**: Psychiatrist, Psychologist, Sleep specialist
- **Immediate Actions**: Emergency contacts, monitoring plans

#### 5. Meditation & Mindfulness
- **Techniques**: Box Breathing, Progressive Relaxation, Body Scan, Loving-Kindness, Mindful Walking
- **Schedules**: Duration and frequency based on stress level
- **Apps**: Headspace, Calm, Insight Timer, Ten Percent Happier

#### 6. Personalized Workout Plan
- Age-appropriate exercises
- 6-day weekly schedule
- Intensity levels (Light/Moderate/High)
- Cardio, Strength, Yoga, HIIT options

#### 7. Lifestyle Management
- **Work**: Pomodoro technique, time-blocking, delegation
- **Sleep**: 7-9h target, consistent schedule, sleep hygiene
- **Nutrition**: Reduce caffeine, omega-3 foods, hydration
- **Phone & Screen**: 20-20-20 rule, app limits, "Do Not Disturb"

#### 8. Time & Productivity Management
- 🎯 Pomodoro Technique
- 📅 Time Blocking
- ✅ Priority Matrix
- 🚫 Single-Tasking
- 📧 Email Batching
- 🎧 Deep Work Sessions
- ⏰ Eat the Frog
- 📝 Weekly Review
- 🔄 Automation
- 💬 Communication Boundaries
- 🎯 2-Minute Rule
- 📊 Time Tracking

### 📥 Multi-Format Export
- **PDF**: Professional medical report with formatting
- **DOCX**: Editable Word document
- **JSON**: Raw data for further analysis

---

## 🏗️ System Architecture

### High-Level Architecture

\`\`\`mermaid
graph TB
    subgraph "Client Layer"
        A[Web Browser] --> B[Next.js Frontend]
        B --> C[React Components]
        C --> D[MediaPipe Face Tracking]
        C --> E[Interactive Games]
    end
    
    subgraph "Communication Layer"
        F[WebSocket Connection]
        G[REST API]
    end
    
    subgraph "Server Layer"
        H[FastAPI Backend]
        H --> I[WebSocket Handler]
        H --> J[Report Generator]
        H --> K[AI Inference Service]
    end
    
    subgraph "AI/ML Layer"
        K --> L[LSTM Model]
        K --> M[Heuristic Analyzer]
    end
    
    subgraph "Data Layer"
        N[User Data]
        O[Metrics History]
        P[Game Scores]
    end
    
    B -->|Real-time metrics| F
    F --> I
    B -->|Generate report| G
    G --> J
    I --> K
    J --> N
    J --> O
    J --> P
    
    style A fill:#e1f5ff
    style B fill:#b3e5fc
    style H fill:#ffccbc
    style K fill:#c5e1a5
    style J fill:#fff9c4
\`\`\`

### Component Interaction Diagram

\`\`\`mermaid
graph LR
    subgraph "Frontend Components"
        A[UserDataForm] --> B[CameraAnalysis]
        B --> C[GameSelector]
        C --> D[ComprehensiveReport]
    end
    
    subgraph "Backend Services"
        E[StressWebSocket] --> F[InferenceService]
        G[ReportService] --> H[ReportGenerator]
    end
    
    subgraph "External Libraries"
        I[MediaPipe]
        J[ReportLab]
        K[python-docx]
    end
    
    B --> I
    B -->|Metrics| E
    E --> F
    D -->|Request| G
    G --> J
    G --> K
    
    style A fill:#e8f5e9
    style B fill:#fff3e0
    style C fill:#f3e5f5
    style D fill:#e0f2f1
    style E fill:#fce4ec
    style F fill:#e3f2fd
\`\`\`

### System Flow Diagram

\`\`\`mermaid
flowchart TD
    Start([User Opens App]) --> A[Fill User Data Form]
    A --> B{Data Valid?}
    B -->|No| A
    B -->|Yes| C[Initialize Camera]
    C --> D[10s Baseline Recording]
    D --> E[Select 4 Random Games]
    E --> F[Play Game 1]
    F --> G[Play Game 2]
    G --> H[Play Game 3]
    H --> I[Play Game 4]
    I --> J[Calculate Final Metrics]
    J --> K[Generate AI Prediction]
    K --> L[Create Comprehensive Report]
    L --> M{Download Format?}
    M -->|PDF| N[Generate PDF]
    M -->|DOCX| O[Generate DOCX]
    M -->|JSON| P[Export JSON]
    N --> Q([Report Downloaded])
    O --> Q
    P --> Q
    
    style Start fill:#4caf50
    style Q fill:#4caf50
    style C fill:#ff9800
    style L fill:#2196f3
\`\`\`

### Dashboard Data Flow

\`\`\`mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant WS as WebSocket
    participant AI as AI Service
    participant DB as Data Store
    
    U->>F: Open Dashboard
    F->>WS: Connect WebSocket
    WS-->>F: Connection Established
    
    loop Every Second
        F->>F: Capture Face Metrics
        F->>WS: Send Metrics
        WS->>AI: Process Metrics
        AI->>AI: Run Inference
        AI-->>WS: Stress Prediction
        WS-->>F: Update Dashboard
        F->>DB: Store Metrics
    end
    
    U->>F: End Session
    F->>WS: Disconnect
    F->>DB: Save Final Data
\`\`\`

### AI Detector Workflow

\`\`\`mermaid
flowchart LR
    A[Face Metrics Input] --> B{Model Available?}
    B -->|Yes| C[LSTM Model]
    B -->|No| D[Heuristic Analyzer]
    
    C --> E[Feature Extraction]
    E --> F[Temporal Analysis]
    F --> G[Stress Prediction]
    
    D --> H[Rule-Based Scoring]
    H --> I[Weighted Calculation]
    I --> G
    
    G --> J[Confidence Score]
    J --> K[Risk Level Classification]
    K --> L{Risk Level}
    L -->|LOW| M[Green Alert]
    L -->|MEDIUM| N[Yellow Alert]
    L -->|HIGH| O[Orange Alert]
    L -->|CRITICAL| P[Red Alert]
    
    style C fill:#4caf50
    style D fill:#ff9800
    style G fill:#2196f3
    style P fill:#f44336
\`\`\`

### Project Folder Structure

\`\`\`mermaid
graph TD
    A[ai-stress/] --> B[apps/]
    A --> C[docs/]
    A --> D[.gitignore]
    A --> E[docker-compose.yml]
    A --> F[DOCKER.md]
    A --> G[README.md]
    
    B --> H[api/]
    B --> I[web/]
    
    H --> J[app/]
    H --> K[models/]
    H --> L[Dockerfile]
    H --> M[requirements.txt]
    
    J --> N[api/v1/endpoints/]
    J --> O[ml/]
    J --> P[services/]
    
    N --> Q[stress.py]
    N --> R[reports.py]
    
    O --> S[model.py]
    
    P --> T[inference_service.py]
    P --> U[report_service.py]
    
    I --> V[src/app/]
    I --> W[Dockerfile]
    I --> X[package.json]
    
    V --> Y[play/]
    
    Y --> Z[page.tsx]
    Y --> AA[games.tsx]
    Y --> AB[report.tsx]
    Y --> AC[faceTracking.ts]
    
    style A fill:#e3f2fd
    style B fill:#fff3e0
    style H fill:#f3e5f5
    style I fill:#e8f5e9
\`\`\`

### Core Analysis Workflow

\`\`\`mermaid
stateDiagram-v2
    [*] --> UserDataCollection
    UserDataCollection --> CameraInitialization
    CameraInitialization --> BaselineRecording
    BaselineRecording --> GameSelection
    GameSelection --> GamePlay
    GamePlay --> GamePlay: Next Game
    GamePlay --> MetricsAggregation: All Games Complete
    MetricsAggregation --> AIAnalysis
    AIAnalysis --> ReportGeneration
    ReportGeneration --> ReportDisplay
    ReportDisplay --> DownloadReport: User Request
    DownloadReport --> [*]
    
    note right of BaselineRecording
        10 seconds
        No interaction
        Capture baseline stress
    end note
    
    note right of GamePlay
        4 random games
        Track performance
        Monitor stress changes
    end note
    
    note right of AIAnalysis
        LSTM or Heuristic
        Confidence scoring
        Risk classification
    end note
\`\`\`

### Use Case Diagram

\`\`\`mermaid
graph TB
    subgraph "ZenithAI System"
        UC1[Complete Stress Assessment]
        UC2[View Real-time Metrics]
        UC3[Play Cognitive Games]
        UC4[Generate Report]
        UC5[Download Report]
        UC6[Get Recommendations]
    end
    
    subgraph "Actors"
        User((User))
        AI((AI System))
        Doctor((Healthcare Provider))
    end
    
    User --> UC1
    User --> UC2
    User --> UC3
    User --> UC4
    User --> UC5
    
    UC1 --> AI
    UC2 --> AI
    UC4 --> AI
    UC4 --> UC6
    UC6 --> Doctor
    
    style User fill:#4caf50
    style AI fill:#2196f3
    style Doctor fill:#ff9800
\`\`\`

### Sequence Diagram: Attack Detection Flow

\`\`\`mermaid
sequenceDiagram
    participant U as User
    participant C as Camera
    participant MP as MediaPipe
    participant FE as Frontend
    participant WS as WebSocket
    participant AI as AI Service
    participant RP as Report Service
    
    U->>C: Grant Camera Permission
    C->>MP: Initialize Face Detector
    MP-->>FE: Ready
    
    loop Baseline (10s)
        C->>MP: Capture Frame
        MP->>MP: Detect 468 Landmarks
        MP->>FE: Face Metrics
        FE->>FE: Calculate 30+ Features
        FE->>WS: Send Metrics
        WS->>AI: Analyze
        AI-->>WS: Stress Score
        WS-->>FE: Update UI
    end
    
    FE->>FE: Store Baseline
    
    loop Each Game (4x)
        U->>FE: Play Game
        C->>MP: Continue Tracking
        MP->>FE: Metrics During Game
        FE->>WS: Send Metrics
        WS->>AI: Analyze
        AI-->>WS: Stress Score
        FE->>FE: Record Game Score
    end
    
    FE->>AI: Request Final Analysis
    AI->>AI: Aggregate All Data
    AI-->>FE: Comprehensive Results
    
    U->>FE: Request Report
    FE->>RP: Generate Report
    RP->>RP: Create 8 Sections
    RP-->>FE: Report Data
    FE-->>U: Display Report
    
    U->>FE: Download PDF
    FE->>RP: Generate PDF
    RP-->>FE: PDF File
    FE-->>U: Download
\`\`\`

### Class Diagram

\`\`\`mermaid
classDiagram
    class UserData {
        +string name
        +int age
        +string occupation
        +int hoursWorked
        +int sleepHours
        +string sleepQuality
        +int caffeineIntake
        +string exerciseFrequency
        +string anxietyLevel
        +int screenTime
        +int breaksTaken
    }
    
    class FaceMetrics {
        +float blinkRate
        +float eyeOpenness
        +float eyeAsymmetry
        +float pupilDilation
        +float gazeDirectionX
        +float gazeDirectionY
        +float browTension
        +float jawTension
        +float headStability
        +calculateStressScore()
    }
    
    class GameScore {
        +string gameType
        +int score
        +int duration
        +int attempts
        +calculatePerformance()
    }
    
    class StressAnalysis {
        +float avgStress
        +float peakStress
        +string riskLevel
        +int riskScore
        +float confidence
        +classifyRisk()
        +generatePrediction()
    }
    
    class Report {
        +UserData userData
        +FaceMetrics[] metricsHistory
        +GameScore[] gameScores
        +StressAnalysis analysis
        +Recommendations recommendations
        +generatePDF()
        +generateDOCX()
        +exportJSON()
    }
    
    class Recommendations {
        +Medical medical
        +Meditation meditation
        +Workout workout
        +Lifestyle lifestyle
        +generatePersonalized()
    }
    
    class InferenceService {
        +LSTMModel model
        +bool useModel
        +predict(metrics)
        +heuristicAnalysis(metrics)
    }
    
    UserData "1" --> "1" Report
    FaceMetrics "many" --> "1" Report
    GameScore "many" --> "1" Report
    StressAnalysis "1" --> "1" Report
    Recommendations "1" --> "1" Report
    InferenceService ..> StressAnalysis : creates
    Report ..> Recommendations : generates
\`\`\`

### Activity Diagram

\`\`\`mermaid
flowchart TD
    Start([Start Assessment]) --> A{User Logged In?}
    A -->|No| B[Create Account]
    A -->|Yes| C[Fill User Data]
    B --> C
    
    C --> D{Data Complete?}
    D -->|No| C
    D -->|Yes| E[Request Camera Access]
    
    E --> F{Permission Granted?}
    F -->|No| G[Show Error]
    F -->|Yes| H[Initialize MediaPipe]
    G --> End([End])
    
    H --> I[Start Baseline Recording]
    I --> J{10 Seconds Elapsed?}
    J -->|No| K[Capture Metrics]
    K --> L[Send to AI]
    L --> J
    J -->|Yes| M[Store Baseline]
    
    M --> N[Select 4 Random Games]
    N --> O[Load Game 1]
    O --> P[Play Game]
    P --> Q[Record Score]
    Q --> R{More Games?}
    R -->|Yes| S[Load Next Game]
    S --> P
    R -->|No| T[Aggregate All Data]
    
    T --> U[Run AI Analysis]
    U --> V[Calculate Risk Score]
    V --> W[Generate Recommendations]
    W --> X[Create Report]
    X --> Y[Display Report]
    
    Y --> Z{Download Request?}
    Z -->|PDF| AA[Generate PDF]
    Z -->|DOCX| AB[Generate DOCX]
    Z -->|JSON| AC[Export JSON]
    Z -->|No| AD{New Assessment?}
    
    AA --> AD
    AB --> AD
    AC --> AD
    
    AD -->|Yes| C
    AD -->|No| End
    
    style Start fill:#4caf50
    style End fill:#f44336
    style U fill:#2196f3
    style X fill:#ff9800
\`\`\`

### State Diagram (State Machine)

\`\`\`mermaid
stateDiagram-v2
    [*] --> Idle
    
    Idle --> DataCollection: Start Assessment
    DataCollection --> DataValidation: Submit Form
    DataValidation --> DataCollection: Invalid Data
    DataValidation --> CameraSetup: Valid Data
    
    CameraSetup --> CameraError: Permission Denied
    CameraError --> [*]
    CameraSetup --> Baseline: Camera Ready
    
    Baseline --> BaselineComplete: 10s Elapsed
    BaselineComplete --> GameSelection
    
    GameSelection --> GameActive: Game Loaded
    GameActive --> GameComplete: Game Finished
    GameComplete --> GameSelection: More Games
    GameComplete --> Analysis: All Games Done
    
    Analysis --> Processing: Aggregate Data
    Processing --> AIInference: Data Ready
    AIInference --> ReportGeneration: Prediction Complete
    
    ReportGeneration --> ReportReady: Report Created
    ReportReady --> Downloading: Download Request
    ReportReady --> Idle: New Assessment
    
    Downloading --> ReportReady: Download Complete
    
    note right of Baseline
        Continuous metric collection
        No user interaction
        WebSocket active
    end note
    
    note right of GameActive
        User plays game
        Metrics still tracked
        Performance recorded
    end note
    
    note right of AIInference
        LSTM or Heuristic
        Confidence calculation
        Risk classification
    end note
\`\`\`

### Component Diagram

\`\`\`mermaid
graph TB
    subgraph "Presentation Layer"
        A[Next.js App]
        B[React Components]
        C[Framer Motion]
    end
    
    subgraph "Business Logic Layer"
        D[Face Tracking Service]
        E[Game Engine]
        F[Report Generator]
        G[WebSocket Client]
    end
    
    subgraph "API Layer"
        H[FastAPI Server]
        I[WebSocket Handler]
        J[REST Endpoints]
    end
    
    subgraph "Service Layer"
        K[Inference Service]
        L[Report Service]
        M[Model Manager]
    end
    
    subgraph "Data Layer"
        N[User Repository]
        O[Metrics Repository]
        P[Report Repository]
    end
    
    subgraph "External Services"
        Q[MediaPipe]
        R[PyTorch]
        S[ReportLab]
        T[python-docx]
    end
    
    A --> B
    B --> C
    B --> D
    B --> E
    B --> F
    B --> G
    
    D --> Q
    G --> I
    F --> J
    
    I --> K
    J --> L
    K --> M
    M --> R
    L --> S
    L --> T
    
    K --> O
    L --> N
    L --> O
    L --> P
    
    style A fill:#e3f2fd
    style H fill:#fff3e0
    style K fill:#f3e5f5
    style N fill:#e8f5e9
\`\`\`

### System Graph Diagram

\`\`\`mermaid
graph TD
    subgraph "User Interface"
        UI[Web Dashboard]
    end
    
    subgraph "Frontend Services"
        FS1[Camera Service]
        FS2[Game Service]
        FS3[Report Service]
        FS4[WebSocket Service]
    end
    
    subgraph "Backend API"
        BE1[Stress Endpoint]
        BE2[Report Endpoint]
        BE3[Health Endpoint]
    end
    
    subgraph "Core Services"
        CS1[Inference Engine]
        CS2[Report Generator]
        CS3[Model Loader]
    end
    
    subgraph "ML Models"
        ML1[LSTM Model]
        ML2[Heuristic Analyzer]
    end
    
    subgraph "Data Storage"
        DS1[Metrics Store]
        DS2[User Store]
        DS3[Report Store]
    end
    
    UI --> FS1
    UI --> FS2
    UI --> FS3
    UI --> FS4
    
    FS1 --> BE1
    FS4 --> BE1
    FS3 --> BE2
    
    BE1 --> CS1
    BE2 --> CS2
    
    CS1 --> CS3
    CS3 --> ML1
    CS3 --> ML2
    
    CS1 --> DS1
    CS2 --> DS2
    CS2 --> DS3
    
    style UI fill:#4caf50
    style BE1 fill:#2196f3
    style CS1 fill:#ff9800
    style ML1 fill:#9c27b0
\`\`\`

### Protocol Flow Graph

\`\`\`mermaid
sequenceDiagram
    autonumber
    participant Browser
    participant Frontend
    participant WebSocket
    participant Backend
    participant AI
    participant Database
    
    Browser->>Frontend: Load Application
    Frontend->>Frontend: Initialize React
    Frontend->>Browser: Request Camera Permission
    Browser-->>Frontend: Permission Granted
    
    Frontend->>WebSocket: ws://localhost:8000/api/v1/stress/ws
    WebSocket-->>Frontend: Connection Established
    
    loop Every 1 Second
        Frontend->>Frontend: Capture Face (MediaPipe)
        Frontend->>Frontend: Calculate 30+ Metrics
        Frontend->>WebSocket: Send JSON Metrics
        WebSocket->>Backend: Forward Metrics
        Backend->>AI: Process Metrics
        AI->>AI: Run Inference (LSTM/Heuristic)
        AI-->>Backend: Stress Prediction + Confidence
        Backend-->>WebSocket: Send Prediction
        WebSocket-->>Frontend: Update UI
        Frontend->>Database: Store Metrics (Local)
    end
    
    Frontend->>Backend: POST /api/v1/reports/generate-pdf
    Backend->>Database: Fetch User Data
    Backend->>Database: Fetch Metrics History
    Backend->>Backend: Generate PDF (ReportLab)
    Backend-->>Frontend: Return PDF Blob
    Frontend->>Browser: Download PDF
    
    Frontend->>WebSocket: Close Connection
    WebSocket-->>Frontend: Connection Closed
\`\`\`

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 16.1.1 (React 19)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Face Tracking**: MediaPipe Tasks Vision
- **Camera**: react-webcam
- **Icons**: Lucide React

### Backend
- **Framework**: FastAPI 0.109.2
- **Language**: Python 3.10+
- **Server**: Uvicorn (ASGI)
- **WebSocket**: websockets 12.0
- **Validation**: Pydantic 2.6.1

### AI/ML
- **Deep Learning**: PyTorch 2.0+
- **Model**: LSTM (Long Short-Term Memory)
- **Face Detection**: MediaPipe 0.10.9
- **Data Processing**: NumPy, Pandas

### Report Generation
- **PDF**: ReportLab 4.0.7
- **DOCX**: python-docx 1.1.0
- **Templates**: Jinja2 3.1.2

### DevOps
- **Containerization**: Docker
- **Orchestration**: Docker Compose
- **CI/CD**: GitHub Actions (optional)

---

## 🚀 Installation & Setup

### Prerequisites

- **Docker** (Recommended): [Install Docker](https://docs.docker.com/get-docker/)
- **OR Manual Setup**:
  - Python 3.10+
  - Node.js 18+
  - npm or yarn

### Option 1: Docker Deployment (Recommended)

**One-command deployment**:

\`\`\`bash
# Clone repository
git clone https://github.com/yourusername/ai-stress.git
cd ai-stress

# Deploy with Docker
./docker-deploy.sh
\`\`\`

**Manual Docker commands**:

\`\`\`bash
# Build images
docker-compose build

# Start containers
docker-compose up -d

# View logs
docker-compose logs -f

# Stop containers
docker-compose down
\`\`\`

### Option 2: Local Development

**Backend Setup**:

\`\`\`bash
cd apps/api

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\\Scripts\\activate

# Install dependencies
pip install -r requirements.txt

# Run server
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
\`\`\`

**Frontend Setup**:

\`\`\`bash
cd apps/web

# Install dependencies
npm install

# Run development server
npm run dev
\`\`\`

### Environment Variables

Create `.env` file in root:

\`\`\`env
# Backend
PYTHONUNBUFFERED=1
API_HOST=0.0.0.0
API_PORT=8000

# Frontend
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:8000
\`\`\`

---

## 📖 Usage Instructions

### 1. Access the Application

Open your browser and navigate to:
- **Frontend**: http://localhost:3000
- **Play Page**: http://localhost:3000/play
- **API Docs**: http://localhost:8000/docs

### 2. Complete Assessment

#### Step 1: User Data Collection
Fill out the comprehensive questionnaire (20+ questions):
- Personal info (name, age, occupation)
- Work details (hours, shift type, breaks)
- Sleep patterns (duration, quality)
- Lifestyle (exercise, caffeine, screen time)
- Mental health (anxiety level, stress factors)

#### Step 2: Camera Analysis
- Grant camera permission
- Position face in frame
- Wait 10 seconds for baseline recording
- System tracks 468 facial landmarks
- Calculates 30+ biometric metrics

#### Step 3: Cognitive Games
Play 4 randomly selected games:
1. **Memory Match**: Find matching pairs
2. **Typing Speed**: Type words quickly
3. **Maze Navigator**: Solve maze puzzle
4. **Color Match**: Match colors fast
5. **Word Builder**: Create words from letters
6. **Number Sequence**: Remember number patterns
7. **Rhythm Clicker**: Click targets in rhythm
8. **Shape Sorter**: Sort shapes by category

#### Step 4: View Report
Comprehensive 8-section analysis:
- Executive summary with risk scoring
- Physiological analysis
- Medical recommendations
- Meditation techniques
- Workout plans
- Lifestyle management
- Phone/screen management
- Time & productivity tips

#### Step 5: Download Report
Choose format:
- **PDF**: Professional medical report
- **DOCX**: Editable Word document
- **JSON**: Raw data export

### 3. Real-Time Monitoring

During the entire assessment:
- Live stress meter updates every second
- WebSocket connection shows "AI Connected"
- Facial metrics continuously tracked
- Immediate feedback on stress levels

### 4. Restart Assessment

Click "New Analysis" to:
- Clear previous data
- Start fresh assessment
- Generate new report

---

## 📊 Results / Output

### Sample Report Sections

#### Executive Summary
\`\`\`
Risk Level: MODERATE
Risk Score: 7/20
Average Stress: 45.3%
Peak Stress: 68%
Cognitive Performance: 82%
AI Confidence: 87%
\`\`\`

#### Medical Recommendations
\`\`\`
Priority: HIGH

Immediate Actions:
- Schedule consultation with mental health professional within 2 weeks
- Begin stress management program
- Monitor symptoms and maintain daily stress log

Medications to Discuss:
- Natural supplements: Magnesium (400mg), Vitamin B-Complex, Omega-3 (1000mg)
- Herbal remedies: Chamomile tea, Valerian root
- Consider CBD oil (consult doctor first)

Specialist Consultations:
- Clinical Psychologist
- Occupational Health Physician
\`\`\`

#### Meditation Program
\`\`\`
Techniques:
1. Box Breathing (4-4-4-4): 5 min, 4x daily
2. Progressive Muscle Relaxation: 20 min before bed
3. Body Scan Meditation: 15 min during lunch
4. Loving-Kindness (Metta): 10 min morning

Duration: 30-45 minutes total daily
Frequency: Multiple sessions throughout day
Apps: Headspace, Calm, Insight Timer
\`\`\`

#### Workout Plan
\`\`\`
Weekly Schedule:
- Monday: Cardio (30 min) + Stretching (10 min)
- Tuesday: Strength Training (45 min)
- Wednesday: Yoga/Pilates (45 min)
- Thursday: Cardio (30 min) + Core (15 min)
- Friday: Active Recovery - Walking/Swimming (30 min)
- Weekend: Outdoor Activity/Favorite Sport (60 min)

Intensity: Moderate to High
\`\`\`

#### Phone & Screen Management
\`\`\`
Current Screen Time: 12 hours/day

Recommendations:
- CRITICAL: Reduce to max 8 hours
- Enable "Do Not Disturb" during work focus
- Use 20-20-20 rule: Every 20 min, look 20 feet away for 20 sec
- Remove social media apps from phone
- Turn off non-essential notifications
- No phone 1 hour before bed
- Use grayscale mode to reduce addiction
- Set app time limits: Social media max 30 min/day
\`\`\`

### Export Formats

**PDF Output**:
- Professional formatting
- Color-coded risk levels
- Tables and charts
- Page numbers and headers
- Medical-grade appearance

**DOCX Output**:
- Editable sections
- Formatted headings
- Bulleted lists
- Tables for data
- Can be customized

**JSON Output**:
\`\`\`json
{
  "userData": {
    "name": "John Doe",
    "age": 35,
    "occupation": "Software Engineer",
    "hoursWorked": 12,
    "sleepHours": 5.5
  },
  "analysis": {
    "avgStress": 0.453,
    "riskLevel": "MODERATE",
    "riskScore": 7,
    "aiConfidence": 0.87
  },
  "recommendations": {
    "medical": {...},
    "meditation": {...},
    "workout": {...}
  }
}
\`\`\`

---

## 📄 License

This project is licensed under the **MIT License**.

\`\`\`
MIT License

Copyright (c) 2025 ZenithAI

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
\`\`\`

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (\`git checkout -b feature/AmazingFeature\`)
3. Commit your changes (\`git commit -m 'Add some AmazingFeature'\`)
4. Push to the branch (\`git push origin feature/AmazingFeature\`)
5. Open a Pull Request

---

## 📞 Support

For issues, questions, or suggestions:

- **GitHub Issues**: [Create an issue](https://github.com/yourusername/ai-stress/issues)
- **Email**: support@zenithai.com
- **Documentation**: [Full Docs](./docs/)

---

## 🙏 Acknowledgments

- **MediaPipe** for facial landmark detection
- **PyTorch** for deep learning framework
- **Next.js** team for the amazing React framework
- **FastAPI** for the high-performance backend
- **Open Source Community** for various libraries

---

<div align="center">

**Made with ❤️ by the ZenithAI Team**

[⬆ Back to Top](#-zenithaiAI-powered-stress-analysis-system)

</div>
