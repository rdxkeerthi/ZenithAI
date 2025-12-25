# ZenithAI Deployment Guide

## Production Kubernetes Deployment

This guide covers deploying ZenithAI to a production Kubernetes cluster at scale.

---

## Architecture Overview

```
                    ┌─────────────┐
                    │   Ingress   │
                    │  (NGINX)    │
                    └──────┬──────┘
                           │
           ┌───────────────┼───────────────┐
           │               │               │
    ┌──────▼──────┐ ┌─────▼──────┐ ┌─────▼──────┐
    │   Next.js   │ │  FastAPI   │ │ Streamlit  │
    │  (Public)   │ │   (API)    │ │ (Internal) │
    └─────────────┘ └──────┬─────┘ └────────────┘
                           │
           ┌───────────────┼───────────────┐
           │               │               │
    ┌──────▼──────┐ ┌─────▼──────┐ ┌─────▼──────┐
    │  ML Worker  │ │ PostgreSQL │ │   Redis    │
    │   (GPU)     │ │(StatefulSet)│ │ (Pub/Sub)  │
    └─────────────┘ └────────────┘ └────────────┘
```

---

## Prerequisites

- Kubernetes cluster (GKE, EKS, or AKS)
- `kubectl` configured
- Docker registry access
- GPU nodes (for ML inference)

---

## 1. Build Docker Images

### FastAPI Backend

```dockerfile
# apps/api/Dockerfile
FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Build & Push**:
```bash
docker build -t gcr.io/your-project/zenith-api:latest apps/api
docker push gcr.io/your-project/zenith-api:latest
```

### Next.js Frontend

```dockerfile
# apps/web/Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
RUN npm ci --production

CMD ["npm", "start"]
```

**Build & Push**:
```bash
docker build -t gcr.io/your-project/zenith-web:latest apps/web
docker push gcr.io/your-project/zenith-web:latest
```

### ML Worker (GPU)

```dockerfile
# apps/ml-worker/Dockerfile
FROM nvidia/cuda:11.8.0-cudnn8-runtime-ubuntu22.04

RUN apt-get update && apt-get install -y python3.10 python3-pip

WORKDIR /app
COPY apps/api/requirements.txt .
RUN pip3 install --no-cache-dir -r requirements.txt

COPY apps/api/app ./app
COPY apps/ml-training/checkpoints ./checkpoints

CMD ["python3", "-m", "app.services.ml_worker"]
```

---

## 2. Kubernetes Manifests

### Namespace

```yaml
# k8s/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: zenith-ai
```

### ConfigMap

```yaml
# k8s/configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: zenith-config
  namespace: zenith-ai
data:
  DATABASE_URL: "postgresql://user:pass@postgres:5432/zenith"
  REDIS_URL: "redis://redis:6379"
  MODEL_PATH: "/app/checkpoints/best_model.ckpt"
```

### FastAPI Deployment

```yaml
# k8s/api-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: zenith-api
  namespace: zenith-ai
spec:
  replicas: 3
  selector:
    matchLabels:
      app: zenith-api
  template:
    metadata:
      labels:
        app: zenith-api
    spec:
      containers:
      - name: api
        image: gcr.io/your-project/zenith-api:latest
        ports:
        - containerPort: 8000
        envFrom:
        - configMapRef:
            name: zenith-config
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: zenith-api
  namespace: zenith-ai
spec:
  selector:
    app: zenith-api
  ports:
  - port: 8000
    targetPort: 8000
  type: ClusterIP
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: zenith-api-hpa
  namespace: zenith-ai
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: zenith-api
  minReplicas: 3
  maxReplicas: 20
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

### ML Worker (GPU)

```yaml
# k8s/ml-worker-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: zenith-ml-worker
  namespace: zenith-ai
spec:
  replicas: 2
  selector:
    matchLabels:
      app: zenith-ml-worker
  template:
    metadata:
      labels:
        app: zenith-ml-worker
    spec:
      nodeSelector:
        cloud.google.com/gke-accelerator: nvidia-tesla-t4
      containers:
      - name: ml-worker
        image: gcr.io/your-project/zenith-ml-worker:latest
        resources:
          limits:
            nvidia.com/gpu: 1
          requests:
            memory: "4Gi"
            cpu: "2000m"
        envFrom:
        - configMapRef:
            name: zenith-config
```

### PostgreSQL (StatefulSet)

```yaml
# k8s/postgres-statefulset.yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgres
  namespace: zenith-ai
spec:
  serviceName: postgres
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
      - name: postgres
        image: postgres:15
        ports:
        - containerPort: 5432
        env:
        - name: POSTGRES_DB
          value: zenith
        - name: POSTGRES_USER
          value: zenith_user
        - name: POSTGRES_PASSWORD
          valueFrom:
            secretKeyRef:
              name: postgres-secret
              key: password
        volumeMounts:
        - name: postgres-storage
          mountPath: /var/lib/postgresql/data
  volumeClaimTemplates:
  - metadata:
      name: postgres-storage
    spec:
      accessModes: ["ReadWriteOnce"]
      resources:
        requests:
          storage: 50Gi
---
apiVersion: v1
kind: Service
metadata:
  name: postgres
  namespace: zenith-ai
spec:
  selector:
    app: postgres
  ports:
  - port: 5432
  clusterIP: None
```

### Redis

```yaml
# k8s/redis-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: redis
  namespace: zenith-ai
spec:
  replicas: 1
  selector:
    matchLabels:
      app: redis
  template:
    metadata:
      labels:
        app: redis
    spec:
      containers:
      - name: redis
        image: redis:7-alpine
        ports:
        - containerPort: 6379
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
---
apiVersion: v1
kind: Service
metadata:
  name: redis
  namespace: zenith-ai
spec:
  selector:
    app: redis
  ports:
  - port: 6379
  type: ClusterIP
```

### Ingress

```yaml
# k8s/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: zenith-ingress
  namespace: zenith-ai
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  tls:
  - hosts:
    - api.zenith-ai.com
    - app.zenith-ai.com
    secretName: zenith-tls
  rules:
  - host: api.zenith-ai.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: zenith-api
            port:
              number: 8000
  - host: app.zenith-ai.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: zenith-web
            port:
              number: 3000
```

---

## 3. Deploy

```bash
# Create namespace
kubectl apply -f k8s/namespace.yaml

# Create secrets
kubectl create secret generic postgres-secret \
  --from-literal=password=YOUR_SECURE_PASSWORD \
  -n zenith-ai

# Apply configurations
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/postgres-statefulset.yaml
kubectl apply -f k8s/redis-deployment.yaml
kubectl apply -f k8s/api-deployment.yaml
kubectl apply -f k8s/ml-worker-deployment.yaml
kubectl apply -f k8s/web-deployment.yaml
kubectl apply -f k8s/ingress.yaml

# Verify
kubectl get pods -n zenith-ai
kubectl get svc -n zenith-ai
```

---

## 4. Monitoring

### Prometheus + Grafana

```yaml
# k8s/monitoring.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: prometheus-config
  namespace: zenith-ai
data:
  prometheus.yml: |
    global:
      scrape_interval: 15s
    scrape_configs:
    - job_name: 'zenith-api'
      kubernetes_sd_configs:
      - role: pod
        namespaces:
          names:
          - zenith-ai
      relabel_configs:
      - source_labels: [__meta_kubernetes_pod_label_app]
        action: keep
        regex: zenith-api
```

**Metrics to Track**:
- Request latency (p50, p95, p99)
- WebSocket connection count
- ML inference time
- GPU utilization
- Error rate

---

## 5. Scaling Strategy

### Horizontal Pod Autoscaling

**API**: Scale based on CPU (70% threshold)
**ML Worker**: Scale based on queue depth (Redis)

### Vertical Scaling

**Database**: Increase storage as data grows
**Redis**: Increase memory for larger session buffers

---

## 6. Security

### Network Policies

```yaml
# k8s/network-policy.yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: api-network-policy
  namespace: zenith-ai
spec:
  podSelector:
    matchLabels:
      app: zenith-api
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: zenith-web
    ports:
    - protocol: TCP
      port: 8000
  egress:
  - to:
    - podSelector:
        matchLabels:
          app: postgres
    ports:
    - protocol: TCP
      port: 5432
```

### Secrets Management

Use **Google Secret Manager**, **AWS Secrets Manager**, or **HashiCorp Vault** for production secrets.

---

## 7. Backup & Disaster Recovery

### Database Backups

```bash
# Daily backup cron job
kubectl create cronjob postgres-backup \
  --image=postgres:15 \
  --schedule="0 2 * * *" \
  --namespace=zenith-ai \
  -- pg_dump -h postgres -U zenith_user zenith > /backups/$(date +%Y%m%d).sql
```

### Model Checkpoints

Store in **Google Cloud Storage** or **S3** with versioning enabled.

---

## 8. Cost Optimization

- **Spot Instances**: Use for ML workers (interruptible)
- **Autoscaling**: Scale down during off-hours
- **GPU Sharing**: Use NVIDIA MPS for multi-tenant GPU
- **CDN**: Serve static assets via CloudFlare/CloudFront

---

## Estimated Costs (GCP)

| Component | Instance Type | Count | Monthly Cost |
|-----------|--------------|-------|--------------|
| API Pods | n1-standard-2 | 3-20 | $150-$1000 |
| ML Workers | n1-standard-4 + T4 GPU | 2-10 | $600-$3000 |
| PostgreSQL | n1-standard-4 + 50GB SSD | 1 | $200 |
| Redis | n1-standard-1 | 1 | $50 |
| Load Balancer | - | 1 | $20 |
| **Total** | | | **$1020-$4270/month** |

*Scales with user load. 10k concurrent users ≈ $3000-$4000/month.*
