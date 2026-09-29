# Docker Containerization & Registry Guide

## Container Security & Optimization

The Flappy Bird Dockerfile is optimized for lightweight production deployment:
- **Base Image**: `nginx:alpine-slim` for minimum attack surface.
- **Unprivileged Execution**: Runs under non-root `nginx` user (`USER nginx`).
- **Health Check**: Configured with built-in `HEALTHCHECK` pinging `http://localhost:80/healthz`.

## Local Docker Operations

### 1. Build Image
```bash
docker build -f docker/Dockerfile -t flappy-bird:latest .
```

### 2. Run Container Locally
```bash
docker run -d -p 8080:80 --name flappy-bird-app flappy-bird:latest
```
Access game in browser: `http://localhost:8080`

### 3. Verify Health Check
```bash
docker inspect --format='{{json .State.Health}}' flappy-bird-app
```

### 4. Authenticate & Push to Docker Hub
```bash
docker login -u <YOUR_DOCKERHUB_USERNAME>
docker tag flappy-bird:latest <YOUR_DOCKERHUB_USERNAME>/flappy-bird:v1.0.0
docker push <YOUR_DOCKERHUB_USERNAME>/flappy-bird:v1.0.0
```
