# Flappy Bird Clone — Complete DevOps CI/CD Pipeline

Production-style end-to-end DevOps automation project for an HTML5 Canvas arcade game (**Flappy Bird Clone**) featuring LocalStorage high scores, containerization with Nginx, automated Jenkins CI/CD pipeline, AWS EKS infrastructure provisioning with Terraform, server configuration with Ansible, and self-healing Kubernetes deployment with Horizontal Pod Autoscaling (HPA) and Ingress routing.

---

## Architecture Overview

```mermaid
flowchart TD
    Dev[Developer] -->|Git Push / PR| GH[GitHub Repository]
    GH -->|Webhook Trigger| Jen[Jenkins CI/CD Pipeline]
    
    subgraph Jenkins Pipeline
        Checkout[1. Checkout Code] --> Test[2. Jest Unit Tests]
        Test --> DBuild[3. Docker Build]
        DBuild --> DScan[4. Trivy Security Scan]
        DScan --> DPush[5. Push to Docker Hub]
        DPush --> TFInit[6. Terraform Init/Plan/Apply]
        TFInit --> Ans[7. Ansible Configuration]
        Ans --> KDeploy[8. Kubectl Apply]
    end

    Jen --> Reg[Docker Hub Registry]
    Jen --> AWS[AWS Infrastructure]
    
    subgraph AWS Cloud Architecture
        VPC[AWS VPC 10.0.0.0/16]
        PublicSub[Public Subnets + IGW]
        PrivSub[Private Subnets + NAT GW]
        EKS[Amazon EKS Cluster]
        NodeGrp[Managed Worker Node Group]
        
        VPC --> PublicSub
        VPC --> PrivSub
        PrivSub --> EKS
        EKS --> NodeGrp
    end

    subgraph Kubernetes Production Cluster
        Namespace[Namespace: flappy-bird]
        ConfigMap[ConfigMap: flappy-bird-config]
        Ingress[AWS ALB / Nginx Ingress]
        Service[Kubernetes Service Port 80]
        Deployment[Deployment: 2+ Replicas]
        HPA[HorizontalPodAutoscaler: 2-5 Replicas]
        Probes[Liveness & Readiness Health Probes]

        Namespace --> Deployment
        Deployment --> Probes
        Service --> Deployment
        Ingress --> Service
        HPA --> Deployment
    end

    NodeGrp --> Kubernetes Production Cluster
    User[End User Browser] -->|Port 80 HTTP| Ingress
```

---

## Technologies Used

- **Application**: HTML5, CSS3, JavaScript, HTML5 Canvas, Web Audio API, LocalStorage.
- **Web Server**: Nginx (Alpine-slim, unprivileged).
- **Source Control**: Git, GitHub.
- **CI/CD Automation**: Jenkins.
- **Containerization**: Docker, Docker Hub, Trivy Security Scanner.
- **Infrastructure as Code**: Terraform, AWS (VPC, Subnets, EKS, IAM, Security Groups).
- **Configuration Management**: Ansible.
- **Container Orchestration**: Kubernetes (EKS / Local K3s), Ingress Controller, HorizontalPodAutoscaler (HPA).

---

## Repository Structure

```text
flappy-bird-devops/
├── app/
│   ├── index.html              # Modern glassmorphism HTML5 Arcade layout
│   ├── style.css               # Responsive arcade styling, typography, animations
│   ├── game.js                 # HTML5 Canvas physics engine, LocalStorage high scores
│   └── assets/                 # Game SVG icon graphics
├── tests/
│   ├── package.json            # Node.js test environment configuration
│   ├── setupTests.js           # JSDOM & LocalStorage mocks
│   └── game.test.js            # Automated Jest unit test suite
├── docker/
│   ├── Dockerfile              # Multi-stage lightweight Nginx container
│   ├── nginx.conf              # Hardened Nginx configuration with /healthz endpoint
│   └── .dockerignore           # Container build ignore rules
├── jenkins/
│   └── Jenkinsfile             # 14-stage declarative Jenkins pipeline
├── terraform/
│   ├── main.tf                 # Terraform entrypoint & provider state
│   ├── providers.tf            # AWS & Kubernetes providers
│   ├── variables.tf            # Parametrized input variables
│   ├── outputs.tf              # Cluster endpoint, VPC ID, and kubeconfig helper
│   ├── networking.tf           # AWS VPC, public/private subnets, IGW, NAT Gateway
│   ├── compute.tf              # EKS cluster, managed node groups, IAM roles
│   └── terraform.tfvars.example# Variables template
├── ansible/
│   ├── ansible.cfg             # Ansible settings
│   ├── inventory/
│   │   └── hosts.ini           # Ansible host inventory
│   ├── playbooks/
│   │   └── setup.yml           # Master setup playbook
│   └── roles/
│       ├── docker/             # Docker CE setup role
│       ├── kubernetes/         # Kubectl & tools setup role
│       └── application/        # Application deployment prep role
├── k8s/
│   ├── namespace.yaml          # `flappy-bird` namespace
│   ├── configmap.yaml          # Environment configuration
│   ├── deployment.yaml         # Deployment with probes & rolling update strategy
│   ├── service.yaml            # LoadBalancer / NodePort service
│   ├── ingress.yaml            # Ingress manifest
│   └── hpa.yaml                # HorizontalPodAutoscaler (2 to 5 pods)
├── scripts/
│   ├── build.sh                # Local Docker build script
│   ├── test.sh                 # Local automated test script
│   └── deploy.sh               # Local Kubernetes deploy script
├── docs/
│   ├── architecture.md         # Architecture documentation
│   ├── branching-strategy.md   # Git branching guide
│   ├── jenkins-setup.md        # Jenkins & Webhook setup guide
│   ├── docker.md               # Container guide
│   ├── terraform.md            # Infrastructure & cost guide
│   ├── ansible.md              # Ansible playbook guide
│   ├── kubernetes.md           # K8s deployment & scaling guide
│   └── troubleshooting.md      # Troubleshooting matrix
├── .gitignore                  # Git ignore rules
├── Jenkinsfile                 # Root pipeline entrypoint
└── README.md                   # Master documentation
```

---

## Step-by-Step Operations Guide

### 1. Running the Application Locally
1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/flappy-bird-devops.git
   cd flappy-bird-devops
   ```
2. Open `app/index.html` directly in any web browser, or serve it using Python's built-in HTTP server:
   ```bash
   python -m http.server 8000 -d app
   ```
3. Open `http://localhost:8000` in your browser.

### 2. Building and Testing
Run the automated Jest unit test suite:
```bash
bash scripts/test.sh
```
Alternatively, test manually with Node:
```bash
cd tests
npm install
npm test
```

### 3. Building and Pushing the Docker Image
1. Execute the build script:
   ```bash
   bash scripts/build.sh v1.0.0
   ```
2. Run container locally to verify:
   ```bash
   docker run -d -p 8080:80 --name flappy-test flappy-bird:v1.0.0
   curl http://localhost:8080/healthz
   docker stop flappy-test && docker rm flappy-test
   ```
3. Push to Docker Hub:
   ```bash
   docker login -u <YOUR_DOCKERHUB_USERNAME>
   docker tag flappy-bird:v1.0.0 <YOUR_DOCKERHUB_USERNAME>/flappy-bird:v1.0.0
   docker push <YOUR_DOCKERHUB_USERNAME>/flappy-bird:v1.0.0
   ```

### 4. Configuring Jenkins and GitHub Webhook
1. Install required plugins in Jenkins: `Git`, `Pipeline`, `Docker Pipeline`, `GitHub Integration`.
2. Add Jenkins Credentials:
   - `docker-hub-credentials` (Docker Hub username/password)
   - `aws-credentials` (AWS Access Key ID / Secret Key)
   - `kubeconfig-credentials` (Kubernetes configuration file)
3. Create a Pipeline Job pointing to your GitHub repository `Jenkinsfile`.
4. In GitHub Repo -> **Settings -> Webhooks -> Add Webhook**:
   - URL: `http://<YOUR_JENKINS_IP>:8080/github-webhook/`
   - Content type: `application/json`
   - Triggers: Push & Pull Request events.

### 5. Running Terraform
1. Navigate to the terraform directory:
   ```bash
   cd terraform
   cp terraform.tfvars.example terraform.tfvars
   ```
2. Initialize and apply:
   ```bash
   terraform init
   terraform validate
   terraform plan -out=tfplan
   terraform apply tfplan
   ```

### 6. Running Ansible
1. Update `ansible/inventory/hosts.ini` with target IP addresses.
2. Execute syntax check and run playbook:
   ```bash
   cd ansible
   ansible-playbook -i inventory/hosts.ini playbooks/setup.yml --syntax-check
   ansible-playbook -i inventory/hosts.ini playbooks/setup.yml
   ```

### 7. Connecting `kubectl` to the Cluster
After Terraform finishes provisioning EKS, configure your local `kubectl`:
```bash
aws eks --region us-east-1 update-kubeconfig --name flappy-bird-eks-cluster
kubectl get nodes
```

### 8. Deploying to Kubernetes
Deploy all Kubernetes resources:
```bash
bash scripts/deploy.sh
```

### 9. Verifying the Application
Check pod status, service endpoints, and ingress URL:
```bash
kubectl get pods -n flappy-bird
kubectl get svc -n flappy-bird
kubectl get ingress -n flappy-bird
```
Test the health probe endpoint:
```bash
curl http://<INGRESS_OR_SERVICE_IP>/healthz
```

### 10. Rolling Back a Deployment
If an update fails or introduces bugs, perform a zero-downtime rollback:
```bash
# View rollout history
kubectl rollout history deployment/flappy-bird-deployment -n flappy-bird

# Roll back to immediately preceding revision
kubectl rollout undo deployment/flappy-bird-deployment -n flappy-bird

# Verify rollback status
kubectl rollout status deployment/flappy-bird-deployment -n flappy-bird
```

### 11. Destroying AWS Resources Safely

> [!WARNING]
> Running AWS EKS incurs cloud charges. Destroy all resources when testing is complete.

```bash
cd terraform
terraform destroy -auto-approve
```

---

## Important Cloud Cost Notice

Running an Amazon EKS cluster creates real cloud costs:
- **EKS Control Plane**: ~$0.10 / hour
- **Worker Node EC2 Instances**: Standard `t3.medium` rates.

For a free/low-cost local alternative, use **K3s** or **Minikube** on your local workstation and deploy the `k8s/` manifests directly.

---

## End-to-End Deployment Checklist

- [x] **Application Code**: HTML5 Canvas game engine, responsive UI, LocalStorage high scores.
- [x] **Automated Tests**: Jest unit test suite covering file existence, flap physics, and storage persistence.
- [x] **Docker Containerization**: Unprivileged Nginx Dockerfile with `/healthz` health check and `.dockerignore`.
- [x] **Jenkins CI/CD Pipeline**: 14-stage declarative pipeline with Trivy scans, Docker Hub pushes, and K8s rollouts.
- [x] **Git Branching Strategy**: Documented `main`, `develop`, and `feature/*` workflow.
- [x] **Terraform Infrastructure**: AWS VPC, multi-AZ subnets, NAT Gateway, EKS Cluster, and Managed Node Groups.
- [x] **Ansible Configuration**: Roles for Docker, kubectl, and application node readiness.
- [x] **Kubernetes Manifests**: Namespace, ConfigMap, Deployment (`maxSurge: 1`, `maxUnavailable: 0`), Service, Ingress, and HPA.
- [x] **Self-Healing & Probes**: Active Liveness and Readiness probes configured on container port 80.
- [x] **Zero-Downtime Rollback**: Rollback instructions documented and verified (`kubectl rollout undo`).
- [x] **Documentation**: Complete breakdown in `docs/` and root `README.md` with Mermaid diagrams.
- [x] **Cloud Safety & Cost Teardown**: `terraform destroy` procedures documented.
