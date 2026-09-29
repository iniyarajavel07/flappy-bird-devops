# Jenkins CI/CD Setup & Windows Pipeline Guide

This document provides a step-by-step guide for configuring and running the **Jenkins CI/CD Pipeline** on Windows for the Flappy Bird DevOps project.

---

## 1. Jenkins Installation & Environment
- **Installation**: Jenkins LTS installed as a native Windows Service.
- **Port**: Configured on port `8081` (to avoid conflict with the Flappy Bird Docker container running on port `8080`).
- **Jenkins URL**: `http://localhost:8081`
- **Windows Service Name**: `jenkins` (Status: `RUNNING`).

---

## 2. Required Jenkins Plugins
Ensure the following plugins are installed via **Manage Jenkins -> Plugins**:
1. **Pipeline** (built-in pipeline workflow engine)
2. **Git Plugin** (for checking out GitHub repositories)
3. **GitHub Integration Plugin** (for webhooks and build triggers)
4. **Credentials Binding Plugin** (for binding secrets safely into environment variables)
5. **NodeJS Plugin** (Optional, if Node.js/npm is managed via Jenkins Global Tool Configuration)

---

## 3. Required Jenkins Credentials (For Future Stages)
Create these credentials via **Manage Jenkins -> Credentials**:

| Credential ID | Kind | Purpose |
| :--- | :--- | :--- |
| `docker-hub-credentials` | Username with password | Authenticating and pushing images to Docker Hub |
| `aws-credentials` | Username with password / Secret text | AWS access keys for Terraform provisioning |
| `kubeconfig-credentials` | Secret file | Kubeconfig file for `kubectl` cluster access |

---

## 4. Pipeline Creation in Jenkins Dashboard

1. Navigate to `http://localhost:8081` and click **New Item**.
2. Enter Item Name: `flappy-bird-pipeline`.
3. Select **Pipeline** and click **OK**.
4. Scroll down to the **Pipeline** section:
   - **Definition**: Select `Pipeline script from SCM`.
   - **SCM**: Select `Git`.
   - **Repository URL**: `https://github.com/iniyarajavel07/flappy-bird-devops.git`
   - **Branch Specifier**: `*/main`
   - **Script Path**: `Jenkinsfile`
5. Click **Save**.

---

## 5. Pipeline Stages & Windows Compatibility

The pipeline ([Jenkinsfile](file:///C:/Users/revat/.gemini/antigravity/scratch/flappy-bird-devops/Jenkinsfile)) is designed with cross-platform support using `isUnix()` checks so it executes natively on Windows agents (`bat` / `powershell`) as well as Linux runners (`sh`).

### Active Validation Stages (Executed Locally):
- **Stage 1 — Checkout**: Clones source code from `main` branch.
- **Stage 2 — Project Validation**: Uses native `fileExists` checks to verify `app/index.html`, `app/game.js`, `docker/Dockerfile`, `k8s/deployment.yaml`, and `tests/package.json`.
- **Stage 3 — Automated Tests**: Runs `npm install` and `npm test` inside the `tests/` directory.
- **Stage 4 — Docker Build**: Compiles Docker image tagged `flappy-bird:jenkins-build`.
- **Stage 5 — Docker Image Verification**: Inspects image metadata (`docker image inspect flappy-bird:jenkins-build`).
- **Stage 6 — Security Scan**: Checks for Trivy scanner and performs vulnerability scan if available.

### Stage-Gated Deployment Stages (Pending Credentials/Cluster):
- **Stage 7 — Docker Hub Push**: Enabled by setting `ENABLE_DOCKER_PUSH = 'true'` after adding `docker-hub-credentials`.
- **Stage 8 — Terraform Provisioning**: Enabled by setting `ENABLE_TERRAFORM = 'true'` after adding `aws-credentials`.
- **Stage 9 — Ansible Server Setup**: Enabled by setting `ENABLE_ANSIBLE = 'true'` after target servers are provisioned.
- **Stage 10 — Kubernetes Deployment**: Enabled by setting `ENABLE_KUBERNETES = 'true'` after adding `kubeconfig-credentials`.

---

## 6. Windows-Specific Agent Requirements
- **Node.js & npm**: Node.js must be installed on the Windows host and available in the system `%PATH%` (or configured via NodeJS plugin).
- **Docker Desktop / Engine**: Docker must be running on Windows so `docker build` and `docker image inspect` commands can execute.

---

## 7. Troubleshooting Common Pipeline Issues

| Symptom | Cause | Solution |
| :--- | :--- | :--- |
| `npm : The term 'npm' is not recognized` | Node.js not in Windows PATH | Add Node.js install directory (e.g., `C:\Program Files\nodejs`) to System Environment Variables. |
| `docker : The term 'docker' is not recognized` | Docker Desktop not running or not in PATH | Start Docker Desktop on Windows. |
| `nosafe / system cannot find file specified` | Shell mismatch in Jenkins | The pipeline uses `isUnix()` checks and `bat` steps for Windows compatibility. |

