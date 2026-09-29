# Terraform Infrastructure & AWS Cost Management Guide

## AWS EKS Architecture Provisioning

The `terraform/` module provisions:
- AWS VPC with CIDR `10.0.0.0/16` across 2 Availability Zones.
- 2 Public Subnets & 2 Private Subnets.
- Internet Gateway & NAT Gateway for secure outbound worker node access.
- Amazon EKS Managed Control Plane (`v1.28`).
- Amazon EKS Managed Node Group (`t3.medium` worker instances).

## Commands

```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars
terraform init
terraform validate
terraform plan
terraform apply -auto-approve
```

## Cost Awareness & Cleanup

> [!WARNING]
> AWS EKS control plane incurs a baseline charge of **$0.10/hour (~$72/month)** plus underlying EC2 `t3.medium` worker node costs.

### Low-Cost Alternative (EC2 + K3s / MicroK8s)
To reduce cloud costs for testing:
1. Provision a single EC2 instance (`t3.small` or `t3.micro`) using basic Terraform EC2 resource.
2. Install K3s via Ansible playbook: `curl -sfL https://get.k3s.io | sh -`
3. Deploy K8s manifests directly to local/EC2 K3s node.

### Safe Infrastructure Cleanup
Always teardown cloud infrastructure when finished testing:
```bash
terraform destroy -auto-approve
```
