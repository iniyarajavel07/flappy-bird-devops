# Main Terraform Configuration for Flappy Bird Infrastructure

data "aws_caller_identity" "current" {}

# Fetch authentication token for EKS cluster
data "aws_eks_cluster_auth" "main" {
  name = aws_eks_cluster.main.name
}

# Configure Kubernetes provider to communicate directly with EKS
provider "kubernetes" {
  host                   = aws_eks_cluster.main.endpoint
  cluster_ca_certificate = base64decode(aws_eks_cluster.main.certificate_authority[0].data)
  token                  = data.aws_eks_cluster_auth.main.token
}
