# Ansible Server Configuration Management Guide

## Ansible Roles & Responsibilities

1. `docker`: Installs Docker CE, configures daemon JSON, and enables service.
2. `kubernetes`: Installs `kubectl`, `helm`, and configures cluster authentication binaries.
3. `application`: Creates target deployment directory `/opt/flappy-bird` and validates environment variables.

## Dynamic Inventory Integration

Update `ansible/inventory/hosts.ini` using Terraform outputs:
```bash
[k8s_nodes]
node1 ansible_host=<WORKER_NODE_PUBLIC_IP> ansible_user=ec2-user
```

## Running Playbooks

```bash
cd ansible
ansible-playbook -i inventory/hosts.ini playbooks/setup.yml --syntax-check
ansible-playbook -i inventory/hosts.ini playbooks/setup.yml
```
