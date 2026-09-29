output "vpc_id" {
  description = "The ID of the AWS VPC"
  value       = aws_vpc.main.id
}

output "cluster_name" {
  description = "The name of the provisioned EKS cluster"
  value       = aws_eks_cluster.main.name
}

output "cluster_endpoint" {
  description = "The API endpoint for the EKS cluster control plane"
  value       = aws_eks_cluster.main.endpoint
}

output "cluster_certificate_authority" {
  description = "The base64 encoded certificate data required to communicate with the cluster"
  value       = aws_eks_cluster.main.certificate_authority[0].data
  sensitive   = true
}

output "node_group_name" {
  description = "The name of the EKS Managed Node Group"
  value       = aws_eks_node_group.main.node_group_name
}

output "kubeconfig_configure_command" {
  description = "AWS CLI command to update local kubeconfig for cluster access"
  value       = "aws eks --region ${var.aws_region} update-kubeconfig --name ${aws_eks_cluster.main.name}"
}
