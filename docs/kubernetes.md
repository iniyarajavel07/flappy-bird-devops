# Kubernetes Deployment & Operations Guide

## Features & Resilience Architecture

1. **Zero-Downtime Rolling Updates**:
   - `maxSurge: 1`
   - `maxUnavailable: 0`
   - Ensures new pods are healthy before terminating old pods.

2. **Self-Healing Pods**:
   - Liveness Probe (`/healthz` every 10s) restarts unresponsive containers.
   - Readiness Probe (`/healthz` every 5s) prevents unready pods from receiving web traffic.

3. **Horizontal Pod Autoscaling (HPA)**:
   - Target CPU threshold: 70%.
   - Minimum Replicas: 2
   - Maximum Replicas: 5

## Deployment & Verification Commands

```bash
# Apply Manifests
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/ingress.yaml
kubectl apply -f k8s/hpa.yaml

# Check Rollout Status
kubectl rollout status deployment/flappy-bird-deployment -n flappy-bird

# View Deployment History
kubectl rollout history deployment/flappy-bird-deployment -n flappy-bird

# Undo Rollback to Previous Version
kubectl rollout undo deployment/flappy-bird-deployment -n flappy-bird
```
