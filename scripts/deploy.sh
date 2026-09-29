#!/usr/bin/env bash
set -e

echo "=========================================="
echo " Deploying Flappy Bird to Kubernetes"
echo "=========================================="

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

echo "Applying Namespace..."
kubectl apply -f k8s/namespace.yaml

echo "Applying ConfigMap..."
kubectl apply -f k8s/configmap.yaml

echo "Applying Deployment..."
kubectl apply -f k8s/deployment.yaml

echo "Applying Service..."
kubectl apply -f k8s/service.yaml

echo "Applying Ingress..."
kubectl apply -f k8s/ingress.yaml

echo "Applying HorizontalPodAutoscaler..."
kubectl apply -f k8s/hpa.yaml

echo "Waiting for rollout completion..."
kubectl rollout status deployment/flappy-bird-deployment -n flappy-bird --timeout=120s

echo "✅ Deployment completed successfully!"
kubectl get pods,svc,ingress -n flappy-bird
