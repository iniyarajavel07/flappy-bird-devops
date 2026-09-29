# Jenkins CI/CD Setup & Webhook Guide

## Prerequisites & Required Jenkins Plugins

Ensure Jenkins master node has the following plugins installed:
- Git Plugin
- Pipeline Plugin
- Docker Pipeline Plugin
- Credentials Binding Plugin
- Workspace Cleanup Plugin
- GitHub Integration Plugin

## Required Jenkins Credentials

Store credentials in Jenkins via **Manage Jenkins -> Credentials**:

1. **Docker Hub Credentials**:
   - Kind: `Username with password`
   - ID: `docker-hub-credentials`
   - Username: Your Docker Hub username
   - Password: Your Docker Hub Personal Access Token (PAT)

2. **AWS Credentials**:
   - Kind: `Username with password` or `Secret text`
   - ID: `aws-credentials`
   - Username / ID: `AWS_ACCESS_KEY_ID`
   - Password / Secret: `AWS_SECRET_ACCESS_KEY`

3. **Kubeconfig Credentials**:
   - Kind: `Secret file`
   - ID: `kubeconfig-credentials`
   - File: Your active `~/.kube/config` file

## GitHub Webhook Integration Setup

1. In GitHub Repository -> Settings -> Webhooks -> Add webhook.
2. Payload URL: `http://<YOUR_JENKINS_SERVER_IP>:8080/github-webhook/`
3. Content type: `application/json`
4. Secret: (Optional secret token configured in Jenkins)
5. Event triggers: Select "Just the push event" and "Pull requests".
6. Click **Add Webhook**.
