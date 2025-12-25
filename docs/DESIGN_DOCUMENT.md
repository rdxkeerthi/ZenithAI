# ZenithAI: Enterprise Stress Detection Platform - Design Document

## 1. System Architecture

ZenithAI follows a **Microservices-based, Event-Driven Architecture** designed for high scalability (10k+ users), privacy, and real-time inference.

### High-Level Architecture (Mermaid)

```mermaid
graph TD
    subgraph Client [Client Side - Browser]
        UI[Next.js App]
        MP[MediaPipe Worker]
        WSC[WebSocket Client]
        UI -->|Camera Feed| MP
        MP -->|Feature Vectors| WSC
    end

    subgraph Cloud [Enterprise Cloud - Kubernetes]
        LB[Load Balancer]
        
        subgraph API_Layer [API Gateway]
            API[FastAPI Core Service]
            Auth[Auth Service / SSO]
        end
        
        subgraph AI_Layer [AI Intelligence Layer]
            MLE[ML Engine - PyTorch/Triton]
            RAG[AI Assistant - RAG Service]
        end
        
        subgraph Data_Layer [Data & State]
            Redis[Redis Cluster - Pub/Sub]
            DB[(PostgreSQL - TimescaleDB)]
            VecDB[(Vector DB - Qdrant)]
        end
    end

    WSC -->|WSS Secure| LB
    LB --> API
    
    API -->|Stress Features| Redis
    Redis -->|Queue| MLE
    MLE -->|Inference Result| Redis
    Redis -->|Result Update| API
    API -->|Real-time Score| WSC
    
    API -->|User Data| DB
    RAG -->|Context/Docs| VecDB
```

---

## 2. AI/ML Pipeline

The core of ZenithAI is a hybrid edge-cloud pipeline. Sensitive video data is processed **locally** to preserve privacy. Only numerical feature vectors are transmitted.

### Pipeline Flow

1.  **Input**: Webcam Video Stream.
2.  **Edge Processing (Client-Side)**:
    *   **Face Mesh**: 468 landmarks (MediaPipe).
    *   **Feature Extraction**: Eye Aspect Ratio (EAR), Head Pose (Yaw/Pitch/Roll), Blink Rate.
3.  **Transmission**: JSON payload of features sent via WebSocket (5Hz - 10Hz).
4.  **Cloud Preprocessing**:
    *   Normalization (Z-score based on user baseline).
    *   Windowing (Sliding window of 30-60 frames).
5.  **Inference (Server-Side)**:
    *   **Model**: LSTM + Attention Mechanism.
    *   **Input**: `(Batch, Time_Steps, Features)`.
    *   **Output**: Stress Level (0.0 - 1.0), Class (Low, Medium, High).
6.  **Post-Processing**:
    *   Smoothing (Exponential Moving Average).
    *   Contextual Analysis (Feedback loop to AI Assistant).

### ML Diagram

```mermaid
sequenceDiagram
    participant Cam as Camera
    participant MP as MediaPipe (Edge)
    participant API as API Gateway
    participant LSTM as LSTM Model
    participant DB as Database

    Cam->>MP: Raw Video Frames
    Note over Cam,MP: NO Video leaves device
    MP->>MP: Extract Landmarks & AUs
    MP->>API: Send Feature Vector (JSON)
    API->>LSTM: Forward Sequence Window
    LSTM->>LSTM: Temporal Analysis (RNN)
    LSTM->>API: Stress Score + Confidence
    API->>DB: Log Anonymized Metric
    API->>MP: Return Stress State
```

---

## 3. Database Schema

We use **PostgreSQL** with a Time-Series focus (conceptually compatible with TimescaleDB) for storing stress trends, and a relational structure for users and organizations.

### Entity Relationship Diagram

```mermaid
erDiagram
    ORGANIZATION ||--|{ USER : employs
    USER ||--|{ SESSION : has
    SESSION ||--|{ STRESS_READING : contains
    USER ||--|{ GAME_SCORE : achieves
    
    ORGANIZATION {
        uuid id PK
        string name
        string domain
        json settings
    }
    
    USER {
        uuid id PK
        uuid org_id FK
        string email
        string full_name
        string role "employee | hr | admin"
        float baseline_stress
        timestamp created_at
    }
    
    SESSION {
        uuid id PK
        uuid user_id FK
        timestamp start_time
        timestamp end_time
        float avg_stress
    }
    
    STRESS_READING {
        uuid session_id FK
        timestamp timestamp
        float stress_level
        float confidence
        json signals "blink_rate, head_pose..."
    }
```

---

## 4. Tech Stack Justification

| Layer | Technology | Justification |
| :--- | :--- | :--- |
| **Frontend** | **Next.js 14 + React** | SSR for performance, huge ecosystem, enterprise standard. |
| **UI** | **Tailwind + Framer Motion** | "Google-level" polish requires rapid styling and fluid animations. |
| **Backend** | **FastAPI (Python)** | High-performance async support (Starlette), native integration with PyTorch/ML libraries. |
| **ML Inference** | **PyTorch + MediaPipe** | MediaPipe is SOTA for lightweight vision. PyTorch is best for dynamic LSTM/RNN models. |
| **Database** | **PostgreSQL** | Rock-solid reliability, JSON support, time-series capable. |
| **Real-time** | **WebSockets** | Mandatory for streaming stress data with low latency (<200ms). |
| **Infrastructure** | **Docker + Kubernetes** | Scalability for 10k+ concurrent users. Autoscaling ML pods. |

---

## 5. Security & Ethics Framework

### Privacy-First Architecture ("Zero Video Storage")
*   **Principle**: Raw video data **never** touches our servers.
*   **Implementation**: MediaPipe runs in the browser via WebAssembly (WASM).
*   **Data Minimization**: Only numerical coordinates and calculated metrics (e.g., "blink rate") are transmitted.

### Enterprise Security
*   **Encryption**: TLS 1.3 for all data in transit (WebSockets/HTTPS). AES-256 for data at rest.
*   **Authentication**: OAuth2 / OIDC compliant (Google/Microsoft SSO integration ready).
*   **Role-Based Access Control (RBAC)**:
    *   `Employee`: See own data only.
    *   `HR_Admin`: See aggregated, anonymized trends (no individual data).
    *   `Sys_Admin`: Infrastructure management.

### AI Ethics
*   **Bias Mitigation**: Model trained on diverse datasets (WESAD, FER2013) to ensure fairness across ethnicities/genders.
*   **Explainability**: SHAP values provided for high-stress alerts (e.g., "Alert triggered by sustained brow furrowing + low blink rate").
*   **No Diagnosis**: The AI Assistant explicitly states it provides "wellness guidance" and is not a medical device.

---

## 6. Scalable SaaS Deployment Strategy

1.  **Containerization**: All services (API, Worker, Frontend) are Dockerized.
2.  **Orchestration**: Kubernetes (EKS/GKE).
3.  **Horizontal Pod Autoscaling (HPA)**:
    *   frontend: CPU-based scaling.
    *   ml-worker: GPU/Queue-depth based scaling.
4.  **CDN**: Cloudflare/AWS CloudFront for static assets (Next.js build).
5.  **Multi-Tenancy**: Row-level security in Postgres where `org_id` isolates data.

## 7. Future Roadmap

*   **Q1**: MVP Launch (Webcam Stress Detection + Dashboard).
*   **Q2**: Games Module + Advanced RAG Assistant.
*   **Q3**: Enterprise Integrations (Slack/Teams Bots, HRMS).
*   **Q4**: Wearable Integration (Apple Watch/Fitbit Heart Rate fusion).
*   **Future**: Brain-Computer Interface (BCI) readiness (EEG data ingestion).
