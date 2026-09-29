variable "aws_region" {
  type        = string
  description = "AWS region for infrastructure deployment"
  default     = "us-east-1"
}

variable "environment" {
  type        = string
  description = "Deployment environment name (e.g., dev, staging, production)"
  default     = "production"
}

variable "cluster_name" {
  type        = string
  description = "Name of the EKS Kubernetes cluster"
  default     = "flappy-bird-eks-cluster"
}

variable "vpc_cidr" {
  type        = string
  description = "CIDR block for the AWS Virtual Private Cloud"
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidrs" {
  type        = list(string)
  description = "CIDR blocks for public subnets"
  default     = ["10.0.1.0/24", "10.0.2.0/24"]
}

variable "private_subnet_cidrs" {
  type        = list(string)
  description = "CIDR blocks for private subnets"
  default     = ["10.0.101.0/24", "10.0.102.0/24"]
}

variable "node_instance_types" {
  type        = list(string)
  description = "EC2 instance type for EKS worker nodes"
  default     = ["t3.medium"]
}

variable "desired_node_count" {
  type        = number
  description = "Desired number of worker nodes in EKS node group"
  default     = 2
}

variable "min_node_count" {
  type        = number
  description = "Minimum number of worker nodes in EKS node group"
  default     = 2
}

variable "max_node_count" {
  type        = number
  description = "Maximum number of worker nodes in EKS node group"
  default     = 5
}
