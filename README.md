# Cats vs Dogs - Voting App (Kubernetes Beginner Project)

> **No Docker image building needed!**
> All images are ready-made from Docker Hub. Just apply and run.

---

## How does this project work?

```
User votes (Cat or Dog)
        |
  [voting-app]  →  stores vote in  →  [Redis]
                                          |
                                      [Worker]  →  saves to  →  [PostgreSQL]
                                                                      |
                                                           [result-app]  →  shows results
```

---

## 5 Components

| # | Component | Technology | What it does |
|---|-----------|-----------|--------------|
| 1 | **voting-app** | Python | Frontend where you vote Cats or Dogs |
| 2 | **redis** | Redis | Temporarily holds votes in memory (fast) |
| 3 | **worker** | .NET | Moves votes from Redis to PostgreSQL |
| 4 | **postgres** | PostgreSQL | Permanently stores all votes |
| 5 | **result-app** | Node.js | Shows the live vote results |

---

## Project Files

```
vote-app k8s/
|
├── voting-app-pod.yaml      ← Pod: Python voting frontend
├── voting-service.yaml      ← Service: opens it on port 30004
|
├── redis-pod.yaml           ← Pod: Redis in-memory database
├── redis-service.yaml       ← Service: internal only (ClusterIP)
|
├── postgres-pod.yaml        ← Pod: PostgreSQL permanent database
├── postgres-service.yaml    ← Service: internal only (ClusterIP)
|
├── worker-pod.yaml          ← Pod: background worker (no service needed)
|
├── result-app-pod.yaml      ← Pod: Node.js results frontend
└── result-service.yaml      ← Service: opens it on port 30005
```

---

## Key Concepts Explained

### What is a Pod?
A Pod is the smallest unit in Kubernetes.
It wraps one or more containers and runs them.

```yaml
kind: Pod
metadata:
  name: voting-app-pod
  labels:
    app: voting-app      # Give it a label so a Service can find it
```

### What is a Service?
A Service connects Pods to each other (or to the outside world).
Pods get new IPs every time they restart — Services give a stable name.

```yaml
kind: Service
spec:
  selector:
    app: voting-app      # Find the Pod with this label
```

### Two Service Types used here

| Type | Who can access it | Used for |
|------|------------------|----------|
| **ClusterIP** | Only inside the cluster | Redis, PostgreSQL |
| **NodePort** | Your browser (outside) | Voting App, Result App |

### How do Pods talk to each other?
They use the **Service name** as the hostname.

```
voting-app  →  connects to  →  "redis-service"   (Redis Service name)
worker      →  connects to  →  "db"              (Postgres Service name)
```

---

## How to Run

### Step 1 — Make sure Kubernetes is running
```bash
kubectl get nodes
```
You should see a node with status `Ready`.

### Step 2 — Deploy everything
```bash
kubectl apply -f .
```
This reads all `.yaml` files and creates Pods and Services.

### Step 3 — Check if Pods are running
```bash
kubectl get pods
```
Wait until all show `Running`:
```
NAME               READY   STATUS
voting-app-pod     1/1     Running
redis-pod          1/1     Running
postgres-pod       1/1     Running
worker-pod         1/1     Running
result-app-pod     1/1     Running
```

### Step 4 — Check Services
```bash
kubectl get services
```

### Step 5 — Open in browser

| App | URL |
|-----|-----|
| Vote | http://localhost:30004 |
| Results | http://localhost:30005 |

> **Using Minikube?** Run `minikube ip` first, then use that IP instead of `localhost`.

---

## Useful Commands

```bash
# See all pods
kubectl get pods

# See details of a pod (useful for debugging)
kubectl describe pod voting-app-pod

# See logs of a pod
kubectl logs voting-app-pod

# See all services
kubectl get services

# Delete everything
kubectl delete -f .
```

---

## Troubleshooting

**Pod is stuck in `Pending`?**
```bash
kubectl describe pod <pod-name>
# Look at the Events section at the bottom
```

**Pod is in `CrashLoopBackOff`?**
```bash
kubectl logs <pod-name>
# Read the error message
```

---

## What to Learn Next

```
Pod  →  Deployment  →  ReplicaSet  →  ConfigMap  →  Secret  →  Namespace
```

- **Deployment** — auto-restarts a Pod if it crashes
- **ReplicaSet** — run multiple copies of a Pod
- **ConfigMap** — store environment variables separately
