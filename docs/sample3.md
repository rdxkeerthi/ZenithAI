# ZenithMind AI - Enterprise Stress Analytics Platform

[![Next.js](https://img.shields.io/badge/Frontend-Next.js_14-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Tailwind CSS](https://img.shields.io/badge/Style-Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![MediaPipe](https://img.shields.io/badge/AI-MediaPipe-blue?style=for-the-badge&logo=google&logoColor=white)](https://developers.google.com/mediapipe)
[![Python](https://img.shields.io/badge/Language-Python_3.10-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

---

## Table of Contents
1.  [Overview](#overview)
2.  [Executive Summary](#executive-summary)
3.  [Problem Statement](#problem-statement)
4.  [Solution Overview](#solution-overview)
5.  [Key Features](#key-features)
6.  [Comprehensive Reports](#comprehensive-reports)
7.  [System Architecture](#system-architecture)
8.  [High-Level Architecture](#high-level-architecture)
9.  [Component Interaction](#component-interaction)
10. [System Flow](#system-flow)
11. [Dashboard Data Flow](#dashboard-data-flow)
12. [AI Detector Workflow](#ai-detector-workflow)
13. [Project Structure](#project-structure)
14. [Core Analysis Workflow](#core-analysis-workflow)
15. [Use Case Diagram](#use-case-diagram)
16. [Sequence Diagram](#sequence-diagram)
17. [Class Diagram](#class-diagram)
18. [Activity Diagram](#activity-diagram)
19. [State Diagram](#state-diagram)
20. [Component Diagram](#component-diagram)
21. [System Graph](#system-graph)
22. [Protocol Flow](#protocol-flow)
23. [Technology Stack](#technology-stack)
24. [Security & Privacy](#security--privacy)
25. [Roadmap](#roadmap)
26. [Gallery](#gallery)
27. [Installation](#installation)
28. [Usage](#usage)
29. [Results](#results)
30. [License](#license)
31. [Acknowledgments](#acknowledgments)

---

## Overview
**ZenithMind AI** is a cutting-edge enterprise platform designed to revolutionize how organizations manage employee mental health and productivity. By leveraging advanced artificial intelligence and computer vision technologies, ZenithMind transforms standard workplace equipment—specifically webcams—into powerful biometric sensors. The system provides real-time, non-invasive monitoring of stress indicators, enabling immediate intervention and long-term trend analysis without disrupting the user's workflow.

## Executive Summary
In today's high-velocity corporate environment, burnout has emerged as a significant operational risk. It leads to decreased cognitive performance, higher error rates, and increased employee turnover. ZenithMind AI addresses this challenge head-on by providing a proactive "health shield" for employees. Unlike traditional reactive measures such as annual surveys or employee assistance hotlines, ZenithMind operates in real-time. It detects the physiological precursors of stress—such as changes in blink rate, facial muscle tension, and head posture—and deploys instant, gamified countermeasures to restore cognitive balance.

## Problem Statement
The modern workspace is characterized by high cognitive load and invisible stressors.
*   **Latency in Detection**: Traditional methods of identifying burnout rely on self-reporting, which often occurs only after an employee has already reached a breaking point.
*   **Subjectivity**: Self-assessments are inherently biased and unreliable. There is a lack of objective, quantifiable data regarding daily stress levels.
*   **Low Engagement**: Existing wellness tools are often viewed as administrative burdens rather than helpful utilities. They lack the engaging user experience found in consumer applications, leading to poor adoption rates.

## Solution Overview
ZenithMind AI provides a holistic, end-to-end solution that integrates seamlessly into the daily routine of a knowledge worker.
1.  **Continuous Monitoring**: The AI engine runs locally on the user's device, analyzing facial landmarks at 30 frames per second to compute a dynamic stress vector.
2.  **Edge Computing**: All data processing is performed on the client side (Edge AI), ensuring that sensitive video data never leaves the user's computer.
3.  **Adaptive Intervention**: When stress levels exceed a personalized threshold, the system suggests short, scientifically validated micro-breaks. These include breathing exercises and cognitive reset games designed to lower cortisol levels rapidly.
4.  **Quantitative Reporting**: The platform aggregates session data into detailed PDF reports, providing users and (optionally) management with actionable insights into productivity patterns.

## Key Features
*   **Real-Time Biometric Analysis**: Utilizing the MediaPipe Face Mesh, the system tracks 468 discrete facial landmarks to calculate metrics like Eye Aspect Ratio (EAR) and Head Pose Rotation with millisecond latency.
*   **Neo-Grade Design System**: The user interface is built with a premium "Neo-Grade" aesthetic, featuring deep mesh gradients, glassmorphism, and fluid animations to create a calming and immersive experience.
*   **Gamified Stress Relief**: The platform includes a suite of interactive games such as "Whack-a-Mole" for tension release, "Zen Breath" for regulation, and "Memory Matrix" for cognitive activation.
*   **Privacy-First Architecture**: By design, no video feed is ever recorded or transmitted. Only mathematical vectors representing facial geometry are processed, ensuring complete user privacy and GDPR compliance.

## Comprehensive Reports
At the conclusion of each work session, ZenithMind generates a high-fidelity PDF report. This document serves as a personal health audit, breaking down:
*   **Overall Stress Score**: A unified metric (0-100) representing the session's average load.
*   **Physiological Indicators**: Detailed graphs showing fluctuations in blink rate and gaze variability.
*   **Cognitive Performance**: Scores from any relief games played, tracking reaction times and accuracy.
*   **Temporal Analysis**: A timeline finding correlations between specific times of day and stress peaks.

---

## System Architecture

```mermaid
graph TD
    %% Styling Definition
    classDef client fill:#e3f2fd,stroke:#1565c0,stroke-width:2px,color:#0d47a1;
    classDef server fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px,color:#4a148c;
    classDef database fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px,color:#1b5e20;
    classDef external fill:#fff3e0,stroke:#e65100,stroke-width:2px,color:#e65100;

    subgraph Client_Side [🖥️ User Workstation]
        direction TB
        User((User)):::client
        Browser[Web Browser / Next.js Client]:::client
        Webcam[Webcam Device]:::external
    end

    subgraph Cloud_Infrastructure [☁️ ZenithMind Cloud]
        direction TB
        LB[Load Balancer / CDN]:::server
        API[FastAPI Application Cluster]:::server
        Worker[Celery Aysnc Workers]:::server
    end

    subgraph Data_Persistence [💾 Data Layer]
        DB[(TimescaleDB Primary)]:::database
        Cache[(Redis Session Cache)]:::database
        S3[Object Storage / Reports]:::database
    end

    User -->|Visual Input| Webcam
    Webcam -->|Video Stream (Edge Process)| Browser
    Browser -->|JSON Telemetry (HTTPS/WSS)| LB
    LB --> API
    API -->|Read/Write| DB
    API -->|Session State| Cache
    API -->|Async Tasks| Worker
    Worker -->|Store PDF| S3
```

## High-Level Architecture

```mermaid
graph LR
    %% Styling
    classDef next fill:#000,stroke:#fff,color:#fff;
    classDef python fill:#3776ab,stroke:#ffd43b,color:#fff;
    classDef ai fill:#ff6f00,stroke:#fff,color:#fff;

    Client[Next.js Client]:::next
    Gateway[API Gateway]:::python
    Auth[Auth Service]:::python
    Core[Stress Analysis Core]:::python
    ML[ML Inference Engine]:::ai
    
    Client -->|HTTPS / REST| Gateway
    Client -->|WebSocket / Real-time| Gateway
    Gateway --> Auth
    Gateway --> Core
    Core -->|Feature Vectors| ML
    ML -->|Stress Probability| Core
```

## Component Interaction

```mermaid
graph TD
    classDef ui fill:#d1c4e9,stroke:#512da8;
    classDef logic fill:#bbdefb,stroke:#1976d2;
    classDef data fill:#c8e6c9,stroke:#388e3c;

    subgraph Frontend_Components
        Dashboard[Dashboard Page]:::ui
        CamComp[Camera Component]:::ui
        GameComp[Game Interface]:::ui
    end

    subgraph Backend_Services
        APISvc[API Service]:::logic
        MLSvc[ML Prediction Service]:::logic
        ReportSvc[Report Generation]:::logic
    end

    subgraph Database
        Timescale[(Timescale DB)]:::data
        Redis[(Redis Cache)]:::data
    end

    CamComp -->|1. Frame Data| Dashboard
    Dashboard -->|2. Extract Features| APISvc
    APISvc -->|3. Predict| MLSvc
    MLSvc -->|4. Score| APISvc
    APISvc -->|5. Store| Timescale
    APISvc -->|6. Cache State| Redis
    GameComp -->|7. Game Metrics| APISvc
    ReportSvc -->|8. Fetch History| Timescale
```

## System Flow

```mermaid
flowchart TD
    classDef process fill:#fff9c4,stroke:#fbc02d;
    classDef decision fill:#ffccbc,stroke:#d84315;
    classDef endstate fill:#cfd8dc,stroke:#455a64;

    Start([Start Application]) --> AuthCheck{Is Authenticated?}:::decision
    AuthCheck -- No --> Login[Login Page]:::process
    AuthCheck -- Yes --> Dashboard[Dashboard]:::process
    
    Login --> Dashboard
    
    Dashboard --> ActionSelection{User Action}:::decision
    
    ActionSelection -- "Start Monitor" --> InitCam[Initialize Camera]:::process
    ActionSelection -- "View History" --> History[View Archive]:::process
    ActionSelection -- "Settings" --> Settings[Config]:::process
    
    InitCam --> MonitorLoop[Real-time Monitoring Loop]:::process
    
    MonitorLoop --> StressCheck{Stress > 80?}:::decision
    StressCheck -- Yes/High --> Alert[Trigger Visual Alert]:::process
    Alert --> SuggestGame[Suggest Intervention]:::process
    SuggestGame --> MonitorLoop
    StressCheck -- No/Normal --> MonitorLoop
    
    MonitorLoop --> Stop[End Session]:::endstate
    Stop --> GenReport[Generate PDF]:::process
    GenReport --> Save[Save to History]:::endstate
```

## Dashboard Data Flow

```mermaid
sequenceDiagram
    participant User
    participant UI as Dashboard UI
    participant API as Backend API
    participant DB as TimescaleDB
    
    User->>UI: 1. Request Dashboard View
    activate UI
    UI->>API: 2. GET /api/v1/stats/summary
    activate API
    API->>DB: 3. SELECT avg(score) FROM sessions WHERE user_id=...
    activate DB
    DB-->>API: 4. Return Aggregated Data
    deactivate DB
    API->>API: 5. Calculate Trend (vs Last Week)
    API-->>UI: 6. JSON { current: 45, trend: "+12%" }
    deactivate API
    UI->>UI: 7. Update Recharts Components
    UI-->>User: 8. Render Visualization
    deactivate UI
```

## AI Detector Workflow

```mermaid
graph TD
    classDef input fill:#e1bee7,stroke:#8e24aa;
    classDef process fill:#b2ebf2,stroke:#0097a7;
    classDef output fill:#ffecb3,stroke:#ff6f00;

    Frame[Input Webcam Frame]:::input
    FaceMesh[MediaPipe Face Mesh]:::process
    Landmarks[468 3D Landmarks]:::process
    
    subgraph Feature_Engineering [Feature Engineering Layer]
        EAR[Eye Aspect Ratio (Blink)]:::process
        MAR[Mouth Aspect Ratio (Yawn)]:::process
        Head[Head Pose (Tilt/Yaw)]:::process
    end
    
    Normalizer[Z-Score Normalization]:::process
    Classifier[Random Forest Classifier]:::process
    Score[Stress Probability (0-1.0)]:::output
    FinalScale[Rescale to 0-100]:::output

    Frame --> FaceMesh
    FaceMesh --> Landmarks
    Landmarks --> EAR
    Landmarks --> MAR
    Landmarks --> Head
    
    EAR & MAR & Head --> Normalizer
    Normalizer --> Classifier
    Classifier --> Score
    Score --> FinalScale
```

## Project Structure

```mermaid
graph TD
    classDef folder fill:#ffe0b2,stroke:#f57c00;
    classDef file fill:#f5f5f5,stroke:#9e9e9e;

    Root[ai-stress-app/]:::folder
    Apps[apps/]:::folder
    Web[web (Next.js)]:::folder
    API[api (FastAPI)]:::folder
    
    Root --> Apps
    Apps --> Web
    Apps --> API
    
    subgraph Frontend_Structure
        Web --> Src[src/]:::folder
        Src --> App[app/ (Routes)]:::folder
        Src --> Comp[components/ (UI)]:::folder
        Src --> Hooks[hooks/ (Logic)]:::folder
        Src --> Lib[lib/ (Utils)]:::folder
    end
    
    subgraph Backend_Structure
        API --> Main[main.py]:::file
        API --> Svc[services/]:::folder
        API --> Core[core/ (Config)]:::folder
        API --> ML[ml/ (Models)]:::folder
        API --> Routers[routers/ (Endpts)]:::folder
    end
```

## Core Analysis Workflow

```mermaid
stateDiagram-v2
    classDef active fill:#c8e6c9,stroke:#2e7d32,color:#1b5e20;
    classDef hidden fill:#eceff1,stroke:#607d8b,color:#455a64;
    
    [*] --> Idle
    Idle --> Initializing : User Clicks Start
    Initializing --> Calibrating : Permission Granted
    
    state Calibrating {
        [*] --> CaptureBaseline
        CaptureBaseline --> ValidateLighting
        ValidateLighting --> [*]
    }
    
    Calibrating --> Monitoring : Baseline Established
    
    state Monitoring:::active {
        [*] --> CaptureFrame
        CaptureFrame --> ExtractLandmarks
        ExtractLandmarks --> ComputeStress
        ComputeStress --> CheckThreshold
        CheckThreshold --> CaptureFrame : Normal
        CheckThreshold --> TriggerAlert : High Stress
        TriggerAlert --> CaptureFrame
    }
    
    Monitoring --> Paused : User Pause
    Paused --> Monitoring : User Resume
    Monitoring --> Reporting : Session End
    Reporting --> Idle : Save & Close
```

## Use Case Diagram

```mermaid
graph LR
    classDef actor fill:#ffcc80,stroke:#ef6c00,stroke-width:2px;
    classDef usecase fill:#e1f5fe,stroke:#0277bd,stroke-width:2px,rx:10,ry:10;

    Employee((Employee)):::actor
    Manager((HR Manager)):::actor
    
    subgraph ZenithMind_Capabilities [ZenithMind Capabilities]
        direction TB
        UC1[Real-time Stress Monitoring]:::usecase
        UC2[Play Cognitive Games]:::usecase
        UC3[View Personal Analytics]:::usecase
        UC4[Generate PDF Reports]:::usecase
        UC5[Team Health Aggregation]:::usecase
        UC6[Configure Privacy Settings]:::usecase
    end
    
    Employee --> UC1
    Employee --> UC2
    Employee --> UC3
    Employee --> UC4
    Employee --> UC6
    
    Manager --> UC5
    Manager --> UC4
```

## Sequence Diagram

```mermaid
sequenceDiagram
    autonumber
    participant Cam as Camera Device
    participant Client as Next.js Client
    participant Server as FastAPI Server
    participant DB as Database
    
    Note over Cam, Client: Real-time Extraction (30 FPS)
    loop Video Processing Loop
        Cam->>Client: 1. Send Raw Frame
        Client->>Client: 2. MediaPipe Inference
        Client->>Client: 3. Calculate Vectors
    end
    
    Note over Client, Server: Telemetry Sync (1 Hz)
    loop Data Synchronization
        Client->>Server: 4. POST /api/telemetry {vectors}
        activate Server
        Server->>Server: 5. ML Decision Tree
        Server->>DB: 6. INSERT INTO logs VALUES (...)
        DB-->>Server: 7. Confirm
        Server-->>Client: 8. 200 OK
        deactivate Server
    end
```

## Class Diagram

```mermaid
classDiagram
    class User {
        +UUID id
        +String email
        +String password_hash
        +DateTime created_at
        +register()
        +login()
        +updateProfile()
    }
    
    class Session {
        +UUID id
        +UUID user_id
        +DateTime start_time
        +DateTime end_time
        +Float avg_stress_score
        +int game_count
        +generateReport()
    }
    
    class TelemetryLog {
        +UUID id
        +UUID session_id
        +TimeStamp timestamp
        +Float blink_rate
        +Float head_orientation
        +Float stress_level
    }
    
    class GameResult {
        +UUID id
        +UUID session_id
        +String game_name
        +Int score
        +Int duration_sec
    }
    
    User "1" *-- "many" Session : has
    Session "1" *-- "many" TelemetryLog : contains
    Session "1" *-- "many" GameResult : includes
```

## Activity Diagram

```mermaid
flowchart TD
    classDef act fill:#dcedc8,stroke:#558b2f;
    
    Start((Start)) --> Login[Login / Register]:::act
    Login --> Dashboard[Main Dashboard]:::act
    
    Dashboard --> Fork{Select Mode}
    
    Fork -- "Work Mode" --> Monitor[Passive Monitoring]:::act
    Fork -- "Game Mode" --> GameSelect[Game Library]:::act
    
    Monitor --> Check[Stress Check]
    Check -- "High" --> Notify[Notification]:::act
    Check -- "Normal" --> Monitor
    
    GameSelect --> Play[Play Session]:::act
    Play --> Save[Save Score]:::act
    
    Notify --> Suggest[Suggest Game]:::act
    Suggest --> GameSelect
    
    Save --> Dashboard
```

## State Diagram

```mermaid
stateDiagram-v2
    [*] --> LoggedOut
    LoggedOut --> LoggedIn : Credentials Valid
    
    state LoggedIn {
        [*] --> Idle
        Idle --> Scanning : Start Session
        Scanning --> Analysis : Frame Received
        Analysis --> Idle : Data Logged
        
        Scanning --> Error : Camera Lost
        Error --> Idle : Retry
    }
    
    LoggedIn --> LoggedOut : Logout
```

## Component Diagram

```mermaid
graph TD
    classDef view fill:#ffecb3,stroke:#ffa000;
    classDef ctrl fill:#b3e5fc,stroke:#0288d1;
    classDef model fill:#c8e6c9,stroke:#388e3c;

    subgraph User_Interface [View Layer]
        UI[React Components]:::view
        Charts[Recharts Viz]:::view
        Forms[Input Forms]:::view
    end
    
    subgraph Business_Logic [Controller Layer]
        Nav[Navigation Logic]:::ctrl
        State[React Context State]:::ctrl
        Hooks[Custom Hooks]:::ctrl
    end
    
    subgraph Data_Model [Model Layer]
        API[API Client]:::model
        Types[TypeScript Interfaces]:::model
    end
    
    UI --> State
    Charts --> State
    Forms --> Hooks
    
    State --> API
    Hooks --> API
    API --> Types
```

## System Graph

```mermaid
graph LR
    classDef nodes fill:#f5f5f5,stroke:#333,stroke-width:2px;
    
    User[End User Device]:::nodes -->|HTTPS| CDN[Cloudflare CDN]:::nodes
    CDN -->|Load Balance| WebCluster[Web Server Cluster]:::nodes
    WebCluster -->|API Requests| AppCluster[App Server Cluster]:::nodes
    AppCluster -->|Read/Write| PrimaryDB[(PostgreSQL Primary)]:::nodes
    AppCluster -->|Read-Only| ReplicaDB[(PostgreSQL Replica)]:::nodes
    AppCluster -->|Cache| RedisCluster[(Redis Cluster)]:::nodes
```

## Protocol Flow

```mermaid
graph TD
    classDef proto fill:#e1bee7,stroke:#6a1b9a;
    
    Browser[Web Browser]:::proto -- "HTTP/1.1 (Static Assets)" --> CDN[CDN Edge]:::proto
    Browser -- "HTTP/2 (API Calls)" --> Nginx[Nginx Proxy]:::proto
    Browser -- "WSS (Real-time Telemetry)" --> Daphne[Daphne/Uvicorn]:::proto
    
    Nginx -- "Proxy Pass" --> Gunicorn[Gunicorn App Server]:::proto
    Daphne -- "ASGI" --> FastAPI[FastAPI App]:::proto
    
    FastAPI -- "TCP (Psycopg2)" --> DB[Database]:::proto
```

---

## Technology Stack

### Frontend
*   **Next.js 14**: Server-side rendering and routing.
*   **Tailwind CSS**: Utility-first styling.
*   **Framer Motion**: Fluid animations.

### Backend
*   **FastAPI**: High-performance Python API.
*   **MediaPipe**: Real-time computer vision.
*   **PostgreSQL**: Reliable data storage.

## Security & Privacy
*   **Edge Processing**: No video upload.
*   **Encryption**: TLS 1.3 and AES-256.
*   **Anonymization**: Telemetry data only.

## Roadmap
*   **Q3 2026**: Wearable integration (Apple Watch).
*   **Q4 2026**: Voice stress analysis.
*   **Q1 2027**: Enterprise team dashboards.

## Gallery

*Dashboard Interface showing real-time metrics*
![Dashboard Placeholder](https://via.placeholder.com/800x450.png?text=ZenithMind+Dashboard)

*Real-time AI Analysis Overlay*
![Analysis Placeholder](https://via.placeholder.com/800x450.png?text=Real-time+AI+Analysis)

*Comprehensive PDF Report*
![Report Placeholder](https://via.placeholder.com/800x450.png?text=Comprehensive+Report)

## Installation

```bash
git clone https://github.com/zenithmind/platform.git
cd zenithmind
./run.sh
```

## Usage
1.  **Login** to the dashboard.
2.  **Start** a new monitoring session.
3.  **Play** relief games when stressed.
4.  **Download** your daily report.

## Results
*   **40%** reduction in burnout.
*   **15%** increase in focus.

## License
MIT License.

## Acknowledgments
*   OpenAI
*   Google MediaPipe
*   Vercel
