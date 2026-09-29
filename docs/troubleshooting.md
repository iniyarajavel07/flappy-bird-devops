# Troubleshooting Matrix — Flappy Bird DevOps Pipeline

| Issue / Error | Root Cause | Resolution |
| :--- | :--- | :--- |
| **Jenkins Build Fails at Test Stage** | Missing Node.js / Jest dependencies | Ensure agent has `node` and `npm` installed. Run `npm install` inside `tests/`. |
| **Docker Push Denied (403 Forbidden)** | Invalid Docker Hub credentials in Jenkins | Re-verify Jenkins Credential ID `docker-hub-credentials` matches Docker Hub PAT. |
| **Terraform Apply AWS AccessDenied** | Missing or expired IAM permissions | Ensure Jenkins AWS IAM credentials have `AdministratorAccess` or EKS/VPC permissions. |
| **Pods Stuck in `ImagePullBackOff`** | Incorrect image tag or private registry auth | Verify image name in `k8s/deployment.yaml` exists on Docker Hub and is public. |
| **Pods Stuck in `CrashLoopBackOff`** | Failing health check `/healthz` | Check pod logs (`kubectl logs -n flappy-bird <pod-name>`) and verify Nginx configuration. |
| **Ingress Address is Blank** | Ingress Controller not installed in cluster | Install Nginx Ingress Controller (`ingress-nginx`) or AWS ALB Controller via Helm. |
| **HPA Target `<unknown>/70%`** | Kubernetes Metrics Server not running | Install Metrics Server: `kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml` |
