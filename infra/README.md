# Infraestrutura como Código com Terraform

## Pré-requisitos

- Terraform >= 1.0
- kubectl configurado
- Cluster Kubernetes (local com Docker Desktop/Minikube ou cloud)

## Configuração

1. Copie o arquivo de exemplo de variáveis:
```bash
cp terraform.tfvars.example terraform.tfvars
```

2. Edite `terraform.tfvars` com suas configurações:
```hcl
database_password = "sua-senha-segura"
jwt_secret        = "seu-jwt-secret-seguro"
kubeconfig_path   = "~/.kube/config"
kube_context      = "seu-contexto-k8s"
```

## Uso

### Inicializar Terraform
```bash
terraform init
```

### Validar configuração
```bash
terraform validate
```

### Planejar mudanças
```bash
terraform plan
```

### Aplicar infraestrutura
```bash
terraform apply
```

### Destruir infraestrutura
```bash
terraform destroy
```

## Recursos Criados

- **Namespace**: mechanical-workshop
- **ConfigMap**: workshop-config (variáveis de ambiente)
- **Secret**: workshop-secrets (credenciais sensíveis)
- **PostgreSQL**: Deployment + Service + PVC (10Gi)
- **Redis**: Deployment + Service + PVC (1Gi)
- **API**: Deployment (3 réplicas) + Service (LoadBalancer) + HPA

## Variáveis Principais

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `kubeconfig_path` | Caminho do kubeconfig | `~/.kube/config` |
| `kube_context` | Contexto Kubernetes | `docker-desktop` |
| `namespace` | Namespace K8s | `mechanical-workshop` |
| `app_replicas` | Réplicas da API | `3` |
| `database_password` | Senha do PostgreSQL | (obrigatório) |
| `jwt_secret` | Chave JWT | (obrigatório) |

## Outputs

Após aplicar, você verá:
- Nome do namespace
- Nome dos serviços
- Comando para verificar endpoint externo
