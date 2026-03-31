# 🚀 Quick Start - Tech Challenge Setup

Instruções rápidas para deploy e demonstração do projeto.

## 📋 Pré-requisitos

- Node.js 20+
- Docker Desktop
- kubectl
- Terraform 1.6+
- Azure CLI (ou AWS CLI / gcloud)
- Git
- Postman ou Insomnia

## ⚡ Setup Rápido (Local)

### 1. Clone e Instale Dependências

```powershell
# Clone o repositório
git clone https://github.com/[org]/mechanical-workshop-api.git
cd mechanical-workshop-api

# Instale dependências
npm install

# Gere Prisma Client
npx prisma generate
```

### 2. Configure Variáveis de Ambiente

```powershell
# Copie o exemplo
Copy-Item .env.example .env

# Edite .env com seus valores
# DATABASE_URL, JWT_SECRET, etc.
```

### 3. Suba o Banco de Dados (Docker)

```powershell
# PostgreSQL + Redis
docker-compose -f docker-compose.dev.yml up -d

# Aguarde os containers iniciarem
Start-Sleep -Seconds 10

# Execute migrations
npx prisma migrate deploy

# (Opcional) Seed do banco
npx prisma db seed
```

### 4. Execute a Aplicação

```powershell
# Modo desenvolvimento
npm run dev

# A API estará disponível em http://localhost:3000
# Swagger: http://localhost:3000/api-docs
```

### 5. Teste a Autenticação (sem Azure Function localmente)

```powershell
# Criar um cliente de teste
$headers = @{"Content-Type"="application/json"}
$body = @{
    document = "12345678900"
    type = "PESSOA_FISICA"
    name = "João Silva"
    email = "joao@email.com"
    phone = "11999999999"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/customers" -Method POST -Headers $headers -Body $body
```

Para teste completo da autenticação com Azure Function, siga instruções em [azure-function/README.md](../azure-function/README.md)

## ☁️ Deploy na Nuvem

### 1. Configure Credenciais Azure

```powershell
# Login no Azure
az login

# Selecione a subscription
az account set --subscription "YOUR_SUBSCRIPTION_ID"
```

### 2. Provisione o Banco de Dados

```powershell
cd terraform-database

# Inicialize Terraform
terraform init

# Configure variáveis em terraform.tfvars
Copy-Item terraform.tfvars.example terraform.tfvars
# Edite terraform.tfvars

# Planeje e aplique
terraform plan
terraform apply
```

### 3. Provisione o Cluster Kubernetes

```powershell
cd ..\terraform-kubernetes

# Inicialize Terraform
terraform init

# Configure variáveis
Copy-Item terraform.tfvars.example terraform.tfvars
# Edite terraform.tfvars

# Planeje e aplique
terraform plan
terraform apply

# Configure kubectl
az aks get-credentials --resource-group workshop-rg --name workshop-cluster
```

### 4. Deploy da Aplicação

```powershell
cd ..

# Aplique manifestos Kubernetes
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/hpa.yaml
kubectl apply -f k8s/kong-deployment.yaml
kubectl apply -f k8s/kong-config.yaml
kubectl apply -f k8s/datadog-monitoring.yaml

# Verifique o deploy
kubectl get pods -n workshop
kubectl get services -n workshop
```

### 5. Deploy da Azure Function

```powershell
cd azure-function

# Instale dependências
npm install

# Build
npm run build

# Deploy (via Azure Functions Core Tools)
func azure functionapp publish mechanical-workshop-auth

# Ou via GitHub Actions (recomendado)
git push origin main
```

## 🧪 Testes

### Executar Todos os Testes

```powershell
# Testes unitários
npm run test:unit

# Testes de integração
npm run test:integration

# Testes E2E
npm run test:e2e

# Cobertura
npm run test:cov
```

### Teste Manual com Postman

1. Importe a collection: [docs/Mechanical-Workshop-API.postman_collection.json](../docs/Mechanical-Workshop-API.postman_collection.json)

2. Configure environment:
   - `base_url`: http://localhost:3000 (local) ou https://workshop-api.com (prod)
   - `auth_url`: https://mechanical-workshop-auth.azurewebsites.net/api/auth

3. Execute a pasta "Auth" primeiro para obter token

4. Use o token nas requisições protegidas

## 📊 Monitoramento

### Acesso ao Datadog

```
URL: https://app.datadoghq.com
Login: [configure suas credenciais]

Dashboards:
- Workshop - Overview
- Workshop - API Performance
- Workshop - Infrastructure
- Workshop - Business Metrics
```

### Logs Locais

```powershell
# Kubernetes
kubectl logs -f deployment/workshop-api -n workshop

# Azure Function
func azure functionapp logstream mechanical-workshop-auth

# Docker local
docker logs -f mechanical-workshop-api
```

## 🔍 Troubleshooting

### Problema: Pods não iniciam

```powershell
# Verifique status
kubectl describe pod <pod-name> -n workshop

# Verifique logs
kubectl logs <pod-name> -n workshop

# Verifique secrets
kubectl get secrets -n workshop
```

### Problema: Database connection failed

```powershell
# Teste conexão
kubectl exec -it <pod-name> -n workshop -- psql $DATABASE_URL

# Verifique secret
kubectl get secret workshop-secrets -n workshop -o yaml
```

### Problema: Azure Function não responde

```powershell
# Verifique logs
func azure functionapp logstream mechanical-workshop-auth

# Teste local
cd azure-function
func start
```

## 📹 Gravação do Vídeo

### Checklist antes de gravar:

- [ ] Aplicação rodando (local ou cloud)
- [ ] Postman configurado
- [ ] Dashboard Datadog aberto
- [ ] kubectl configurado
- [ ] GitHub Actions com histórico de execuções
- [ ] Roteiro impresso

### Comandos úteis para demonstração:

```powershell
# Mostrar pods
kubectl get pods -n workshop -o wide

# Mostrar serviços
kubectl get services -n workshop

# Mostrar HPA
kubectl get hpa -n workshop

# Logs em tempo real
kubectl logs -f deployment/workshop-api -n workshop --tail=50

# Scaling manual (demonstração)
kubectl scale deployment workshop-api --replicas=5 -n workshop

# Status do cluster
kubectl top nodes
kubectl top pods -n workshop
```

## 🎯 Demo Script

### 1. Autenticação (3 min)

```powershell
# Postman: POST /auth
# Body: { "cpf": "12345678900" }
# Mostrar resposta com token
```

### 2. Criar Ordem de Serviço (2 min)

```powershell
# Postman: POST /service-orders
# Headers: Authorization: Bearer <token>
# Body: { vehicleId, services: [], parts: [] }
# Mostrar resposta com orçamento calculado
```

### 3. CI/CD (3 min)

```
# Abra GitHub Actions
# Mostre workflow em execução
# Explique stages: test → build → deploy
```

### 4. Kubernetes (2 min)

```powershell
# Terminal
kubectl get all -n workshop
kubectl describe hpa workshop-api-hpa -n workshop
kubectl top pods -n workshop
```

### 5. Datadog (4 min)

```
# Navegue pelos dashboards
# Mostre métricas em tempo real
# Busque por correlation ID
# Mostre trace distribuído
```

### 6. Logs (1 min)

```powershell
# Terminal
kubectl logs deployment/workshop-api -n workshop --tail=20
# Mostre JSON estruturado
```

## 📧 Suporte

Se encontrar problemas:

1. Consulte a documentação em `docs/`
2. Verifique os logs (kubectl logs / Azure logs)
3. Revise as configurações (secrets, configmaps)
4. Consulte ADRs e RFCs para decisões arquiteturais

## 🔗 Links Rápidos

- **Swagger Local**: http://localhost:3000/api-docs
- **Swagger Prod**: https://workshop-api.com/api-docs
- **Datadog**: https://app.datadoghq.com
- **Azure Portal**: https://portal.azure.com
- **GitHub Actions**: https://github.com/[org]/[repo]/actions

---

**✅ Ambiente pronto para demonstração!**

Para entrega completa, siga: [docs/REPOSITORY_ORGANIZATION_GUIDE.md](./REPOSITORY_ORGANIZATION_GUIDE.md)
