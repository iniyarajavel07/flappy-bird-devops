#!/usr/bin/env bash
set -e

# Configuration
IMAGE_NAME="flappy-bird"
TAG="${1:-latest}"

echo "=========================================="
echo " Building Docker Image: ${IMAGE_NAME}:${TAG}"
echo "=========================================="

# Ensure script is executed from project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

docker build -f docker/Dockerfile -t "${IMAGE_NAME}:${TAG}" -t "${IMAGE_NAME}:latest" .

echo "✅ Docker build complete: ${IMAGE_NAME}:${TAG}"
