# Architecture Documentation — Flappy Bird DevOps Pipeline

## System Overview

The Flappy Bird DevOps project implements an automated, production-style continuous integration and deployment architecture designed for high availability, zero-downtime updates, horizontal scaling, and cloud cost transparency.

## End-to-End Pipeline Flow

```
+----------------+      +-------------------+      +----------------------+
|  Developer     | ---> |  GitHub Repo      | ---> |  Jenkins Webhook     |
| (Feature Dev)  |      | (Branch/PR)       |      | (Automated Trigger)  |
+----------------+      +-------------------+      +----------------------+
                                                               |
                                                               v
+----------------+      +-------------------+      +----------------------+
|  Docker Hub    | <--- |  Docker Build     | <--- |  Jenkins CI Server   |
| (Container Reg)|      |  & Security Scan  |      | (Unit Test Execution)|
+----------------+      +-------------------+      +----------------------+
        |
        v
+----------------+      +-------------------+      +----------------------+
|  Terraform     | ---> |  AWS Cloud        | ---> |  Ansible             |
| (IaC Provision)|      | (VPC, EKS Cluster)|      | (Server Provisioning)|
+----------------+      +-------------------+      +----------------------+
                                                               |
                                                               v
+----------------+      +-------------------+      +----------------------+
| End User       | <--- | Ingress / ALB     | <--- | Kubernetes Cluster   |
| (Browser App)  |      | (Port 80 Routing) |      | (Deployment + HPA)   |
+----------------+      +-------------------+      +----------------------+
```

## Component Breakdown

1. **Application Layer (`app/`)**: Pure HTML5 Canvas arcade game with LocalStorage high score persistence and responsive CSS styling.
2. **Containerization Layer (`docker/`)**: Unprivileged Nginx base container serving static assets on port 80 with `/healthz` health monitoring.
3. **Continuous Integration (`jenkins/`)**: Declarative 14-stage pipeline running tests, Trivy image scans, Docker pushes, Terraform plans, and Kubernetes rollouts.
4. **Infrastructure as Code (`terraform/`)**: AWS VPC, multi-AZ public/private subnets, Internet Gateway, NAT Gateway, EKS Cluster, and Managed Node Groups.
5. **Configuration Management (`ansible/`)**: Idempotent Ansible playbooks setting up Docker runtime, kubectl tools, and node readiness.
6. **Container Orchestration (`k8s/`)**: Kubernetes Namespace, ConfigMap, Deployment with rolling updates (`maxSurge: 1`, `maxUnavailable: 0`), Service, Ingress, and HorizontalPodAutoscaler (`min: 2`, `max: 5`).
