# WorkTrack Pro — Employee Task Management System on Kubernetes

> A production-grade microservices application deployed on Kubernetes demonstrating real-world DevOps practices.

![Kubernetes](https://img.shields.io/badge/Kubernetes-326CE5?style=for-the-badge&logo=kubernetes&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

---

## Architecture

```
                    ┌─────────────────────────────────────┐
                    │         Kubernetes Cluster           │
                    │          (Namespace: worktrack)      │
                    │                                      │
  Browser ──────►  │  [Frontend - React/Nginx]            │
  port 30080        │       │                              │
                    │       ▼                              │
                    │  [Backend - Node.js API] ×2 replicas│
                    │       │              │               │
                    │       ▼              ▼               │
                    │  [PostgreSQL]    [Redis Cache]       │
                    │   + PVC Storage                      │
                    └─────────────────────────────────────┘
```

## Services

| Service | Technology | Role | K8s Service Type |
|---------|-----------|------|-----------------|
| **frontend** | React + Vite + Nginx | Dashboard UI | NodePort (30080) |
| **backend** | Node.js + Express | REST API | ClusterIP |
| **postgres** | PostgreSQL 15 | Primary Database | ClusterIP |
| **redis** | Redis 7 | API Cache | ClusterIP |

## Features

- 📊 **Dashboard** — Real-time task statistics with progress tracking
- ✅ **Task Management** — Full CRUD with status, priority, and assignee filtering
- 👥 **Employee View** — Team overview with per-person task completion stats
- ⚡ **Redis Caching** — API responses cached for performance
- 🔄 **Auto-scaling** — HPA scales backend 2→5 pods based on CPU load

---

## Kubernetes Concepts Demonstrated

| Concept | File | Purpose |
|---------|------|---------|
| **Namespace** | `namespace.yaml` | Isolate all app resources |
| **Deployment** | `*-deployment.yaml` | Manage pod lifecycle & replicas |
| **ConfigMap** | `configmap.yaml` | Non-sensitive configuration |
| **Secret** | `secret.yaml` | Encrypted DB credentials |
| **PersistentVolumeClaim** | `postgres-pvc.yaml` | Persistent DB storage |
| **ClusterIP Service** | `services.yaml` | Internal pod communication |
| **NodePort Service** | `services.yaml` | External browser access |
| **HPA** | `hpa.yaml` | Horizontal auto-scaling |
| **Liveness Probe** | `backend-deployment.yaml` | Auto-restart unhealthy pods |
| **Readiness Probe** | `backend-deployment.yaml` | Traffic routing control |
| **Resource Limits** | All deployments | CPU & Memory constraints |

---

## Project Structure

```
worktrack-pro/
├── frontend/               # React + Vite application
│   ├── src/
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── components/
│   │       ├── Dashboard.jsx
│   │       ├── TaskList.jsx
│   │       └── EmployeeList.jsx
│   ├── Dockerfile
│   └── nginx.conf
│
├── backend/                # Node.js REST API
│   ├── src/
│   │   ├── index.js
│   │   ├── db.js
│   │   └── routes/
│   │       ├── tasks.js
│   │       └── employees.js
│   └── Dockerfile
│
└── k8s/                    # Kubernetes manifests
    ├── namespace.yaml
    ├── configmap.yaml
    ├── secret.yaml
    ├── postgres-pvc.yaml
    ├── postgres-deployment.yaml
    ├── redis-deployment.yaml
    ├── backend-deployment.yaml
    ├── frontend-deployment.yaml
    ├── services.yaml
    └── hpa.yaml
```

---

## How to Deploy

### Prerequisites
- Docker Desktop with Kubernetes enabled
- `kubectl` configured

### Step 1 — Build Docker Images

```bash
docker build -t worktrack-backend:latest  ./backend
docker build -t worktrack-frontend:latest ./frontend
```

### Step 2 — Deploy to Kubernetes

```bash
# Apply all manifests
kubectl apply -f k8s/

# Check everything is running
kubectl get all -n worktrack
```

### Step 3 — Access the App

```bash
kubectl port-forward -n worktrack service/frontend-service 3000:80
```

Open → **http://localhost:3000**

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check (used by K8s probes) |
| GET | `/api/stats` | Dashboard statistics |
| GET | `/api/tasks` | List all tasks (filter by status/priority) |
| POST | `/api/tasks` | Create new task |
| PUT | `/api/tasks/:id` | Update task |
| DELETE | `/api/tasks/:id` | Delete task |
| GET | `/api/employees` | List employees with task counts |

---

## Tech Stack

- **Frontend**: React 18, Vite, CSS3 (Dark Theme)
- **Backend**: Node.js, Express, pg (PostgreSQL client), Redis client
- **Database**: PostgreSQL 15
- **Cache**: Redis 7
- **Container**: Docker, Nginx
- **Orchestration**: Kubernetes
- **Registry**: Local Docker (imagePullPolicy: Never)
