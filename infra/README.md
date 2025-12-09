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

## Provisionamento opcional na Oracle Cloud (OCI)

O módulo OCI é condicional e está desativado por padrão. Para ativá-lo:

1. Copie `terraform.tfvars.example` para `terraform.tfvars` e preencha as variáveis OCI:

```hcl
provision_oci_cluster = true
oci_tenancy_ocid       = "<your-tenancy-ocid>"
oci_user_ocid          = "<your-user-ocid>"
oci_fingerprint        = "<your-api-key-fingerprint>"
oci_private_key_path   = "~/.oci/oci_api_key.pem" # or path inside CI secrets
oci_region             = "us-ashburn-1"
oci_compartment_ocid   = "<your-compartment-ocid>"
node_image_id          = "<image-ocid-for-region>"
```

2. No repositório GitHub, adicione os secrets necessários (se for usar CI to apply):
- `DATABASE_PASSWORD`
- `JWT_SECRET`
- `KUBECONFIG` (base64-encoded kubeconfig) — required if applying resources that need kubectl
- OCI credentials if you want the Action to run `terraform apply` (not required to keep files in repo):
	- `OCI_TENANCY_OCID`, `OCI_USER_OCID`, `OCI_FINGERPRINT`, `OCI_PRIVATE_KEY` (private key content), `OCI_REGION`, `OCI_COMPARTMENT_OCID`

3. Rodar localmente (exemplo):

```bash
cd infra
terraform init
terraform validate
terraform plan -var="database_password=workshop123" -var="jwt_secret=your-secret" -var-file="terraform.tfvars"
terraform apply -auto-approve -var-file="terraform.tfvars"
```

Observação: o provisionamento do cluster OKE pode levar alguns minutos. Revise shapes, quotas e custos antes de aplicar em produção.
