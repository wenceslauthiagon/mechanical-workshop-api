# Tech Challenge - Fase 2

## Objetivo

Evolução da aplicação da Fase 1 com foco em qualidade, resiliência e escalabilidade, incorporando práticas modernas de infraestrutura como código e automação de deploy.

## Arquitetura da Solução

### Diagrama de Componentes

```
┌─────────────────────────────────────────────────────────────┐
│                     GitHub Actions CI/CD                     │
│  Build → Test → Docker Build → Push → Deploy to K8s         │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   Kubernetes Cluster                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Workshop   │  │  PostgreSQL  │  │    Redis     │      │
│  │     API      │  │   Database   │  │    Cache     │      │
│  │  (3-10 pods) │  │   (1 pod)    │  │   (1 pod)    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                               │
│  ┌──────────────────────────────────────────────────┐       │
│  │        Horizontal Pod Autoscaler (HPA)           │       │
│  │    Auto-scale: CPU 70% | Memory 80%              │       │
│  └──────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────┘
                            ↑
                     Load Balancer
                            ↑
                       Internet
```

### Fluxo de Deploy

```
Developer Push
      ↓
GitHub Triggers CI/CD
      ↓
┌─────────────────┐
│  Run Tests      │ ← PostgreSQL + Redis (Docker Services)
└─────────────────┘
      ↓
┌─────────────────┐
│  Build Docker   │ ← Multi-stage build otimizado
└─────────────────┘
      ↓
┌─────────────────┐
│  Push to GHCR   │ ← GitHub Container Registry
└─────────────────┘
      ↓
┌─────────────────┐
│  Deploy K8s     │ ← kubectl apply manifests
└─────────────────┘
      ↓
┌─────────────────┐
│  Update Image   │ ← Rolling update zero-downtime
└─────────────────┘
      ↓
┌─────────────────┐
│  Verify Health  │ ← Liveness/Readiness probes
└─────────────────┘
```

## Evolução das APIs (Fase 2)

### 1. Listagem de Ordens de Serviço com Prioridade

**Endpoint**: `GET /api/service-orders/priority`

**Ordenação**:
1. Status (prioridade):
   - Em Execução (1)
   - Aguardando Aprovação (2)
   - Em Diagnóstico (3)
   - Recebida (4)
2. Data de criação (mais antigas primeiro)

**Exclusões**: OS Finalizadas e Entregues não aparecem

**Exemplo**:
```bash
curl -X GET "http://localhost:3000/api/service-orders/priority?page=1&size=10" \
  -H "Authorization: Bearer $TOKEN"
```

### 2. Aprovação de Orçamento (Já existente)

**Endpoint**: `PUT /public/budgets/:id/approve`

Endpoint público para aprovação externa do cliente.

### 3. Notificações por Email

Implementado `EmailService` que envia notificações automáticas quando:
- Status da OS muda
- Orçamento é enviado para aprovação
- OS é finalizada/entregue

## Infraestrutura

### Docker

#### Dockerfile Otimizado (Multi-stage)

```dockerfile
# Build stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine AS production
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001
WORKDIR /app
COPY --from=build --chown=nestjs:nodejs /app/dist ./dist
COPY --from=build --chown=nestjs:nodejs /app/node_modules ./node_modules
USER nestjs
CMD ["node", "dist/main"]
```

#### Docker Compose (Desenvolvimento)

```bash
# Desenvolvimento
docker-compose -f docker-compose.dev.yml up

# Produção
docker-compose up
```

### Kubernetes

#### Estrutura de Manifestos (`/k8s`)

```
k8s/
├── namespace.yaml           # Namespace mechanical-workshop
├── configmap.yaml           # Variáveis de ambiente
├── secret.yaml              # Credenciais sensíveis
├── postgres-deployment.yaml # PostgreSQL + PVC (10Gi)
├── redis-deployment.yaml    # Redis + PVC (1Gi)
├── app-deployment.yaml      # API (3 réplicas iniciais)
└── hpa.yaml                 # Auto-scaling (3-10 pods)
```

#### Deploy Manual

```bash
# Aplicar todos os manifestos
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml
kubectl apply -f k8s/postgres-deployment.yaml
kubectl apply -f k8s/redis-deployment.yaml
kubectl apply -f k8s/app-deployment.yaml
kubectl apply -f k8s/hpa.yaml

# Verificar status
kubectl get all -n mechanical-workshop
kubectl get hpa -n mechanical-workshop
```

#### Features Kubernetes

- **Recursos**: CPU/Memory requests e limits definidos
- **Health Checks**: Liveness e readiness probes
- **Rolling Updates**: Zero-downtime deployments
- **Auto-scaling**: HPA baseado em CPU (70%) e Memory (80%)
- **Persistent Storage**: PVCs para PostgreSQL e Redis

### Terraform (IaC)

#### Estrutura (`/infra`)

```
infra/
├── provider.tf           # Configuração providers
├── variables.tf          # Variáveis configuráveis
├── main.tf               # Recursos principais
├── outputs.tf            # Outputs após deploy
├── terraform.tfvars.example  # Exemplo de valores
└── README.md             # Documentação completa
```

#### Deploy com Terraform

```bash
cd infra

# Copiar e configurar variáveis
cp terraform.tfvars.example terraform.tfvars
nano terraform.tfvars

# Inicializar
terraform init

# Planejar
terraform plan

# Aplicar
terraform apply

# Destruir (cuidado!)
terraform destroy
```

#### Recursos Provisionados

- Namespace Kubernetes
- ConfigMaps e Secrets
- Deployments (PostgreSQL, Redis, API)
- Services (ClusterIP e LoadBalancer)
- PersistentVolumeClaims
- HorizontalPodAutoscaler

### CI/CD (GitHub Actions)

#### Pipeline (`.github/workflows/ci-cd.yml`)

**Jobs**:

1. **lint-and-test**
   - Executa linter
   - Roda testes unitários
   - Gera coverage report
   - Usa PostgreSQL e Redis como services

2. **build-and-push**
   - Build da imagem Docker
   - Push para GitHub Container Registry
   - Caching para builds mais rápidos

3. **deploy-to-kubernetes**
   - Aplica manifestos K8s
   - Rolling update da aplicação
   - Verifica health checks

4. **deploy-with-terraform** (opcional)
   - Executa quando commit contém `[terraform]`
   - Terraform plan e apply automático

#### Secrets Necessários

Configure no GitHub → Settings → Secrets:

```
KUBECONFIG          # Base64 do kubeconfig
DATABASE_PASSWORD   # Senha do PostgreSQL
JWT_SECRET          # Chave JWT
```

#### Triggers

- Push para `main` ou `develop`: Build e deploy
- Pull requests: Apenas lint e test
- Commit com `[terraform]`: Deploy com Terraform

## Execução Local

### Desenvolvimento

```bash
# Com Docker Compose
docker-compose -f docker-compose.dev.yml up

# Sem Docker
npm install
npx prisma generate
npx prisma migrate dev
npm run start:dev
```

### Deploy em Kubernetes Local

```bash
# Com Docker Desktop Kubernetes
kubectl apply -f k8s/

# Ou com Terraform
cd infra
terraform init
terraform apply

# Acessar aplicação
kubectl port-forward svc/workshop-api-service 3000:80 -n mechanical-workshop
```

## Testes

### Testes Automatizados

```bash
# Unit tests
npm test

# Coverage
npm run test:cov

# E2E tests
npm run test:e2e
```

### Simulação de Carga (HPA)

```bash
# Instalar hey
go install github.com/rakyll/hey@latest

# Gerar carga
hey -z 5m -c 50 -q 10 http://localhost:3000/api/service-orders/priority

# Observar auto-scaling
watch kubectl get hpa -n mechanical-workshop
watch kubectl get pods -n mechanical-workshop
```

## Monitoramento

### Health Checks

```bash
# Health check da API
curl http://localhost:3000/health

# Status dos pods
kubectl get pods -n mechanical-workshop

# Logs em tempo real
kubectl logs -f deployment/workshop-api -n mechanical-workshop

# Métricas do HPA
kubectl describe hpa workshop-api-hpa -n mechanical-workshop
```

### Métricas Disponíveis

- CPU e Memory utilization (via HPA)
- Pod count (min: 3, max: 10)
- Request count e latency (via logs)
- Database connections (PostgreSQL)

## Boas Práticas Implementadas

### Clean Code

- Nomes claros e descritivos
- Funções pequenas e focadas
- Comentários apenas quando necessário
- Código autoexplicativo

### Clean Architecture

- Separação em camadas (Presentation, Application, Domain, Infrastructure)
- Inversão de dependências
- Domain-Driven Design (DDD)
- Repository pattern

### DevOps

- Infrastructure as Code (Terraform)
- GitOps com CI/CD
- Containerização com Docker
- Orquestração com Kubernetes
- Auto-scaling horizontal

### Segurança

- Secrets separados dos manifests
- Non-root user no Docker
- Resource limits definidos
- Network policies (pode ser expandido)

## Troubleshooting

### Problema: Pod não inicia

```bash
# Ver logs detalhados
kubectl describe pod <pod-name> -n mechanical-workshop
kubectl logs <pod-name> -n mechanical-workshop --previous

# Verificar recursos
kubectl top pods -n mechanical-workshop
```

### Problema: Database connection refused

```bash
# Verificar se PostgreSQL está rodando
kubectl get pods -n mechanical-workshop | grep postgres

# Testar conexão
kubectl exec -it <api-pod> -n mechanical-workshop -- nc -zv postgres-service 5432
```

### Problema: HPA não escalona

```bash
# Verificar metrics-server
kubectl get apiservice v1beta1.metrics.k8s.io -o yaml

# Instalar se necessário
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
```

## Links Úteis

- **API Swagger**: http://localhost:3000/api
- **Collection Postman**: [Link para collection]
- **Vídeo Demonstrativo**: [Link para YouTube/Vimeo]
- **Repositório**: https://github.com/Creative-IA/mechanical-workshop-api

## Conclusão

Esta fase implementou com sucesso:

✅ Clean Code e Clean Architecture mantidos
✅ Endpoints evoluídos conforme requisitos
✅ Infraestrutura totalmente containerizada
✅ Orquestração Kubernetes com auto-scaling
✅ Infrastructure as Code com Terraform
✅ CI/CD completo com GitHub Actions
✅ Documentação completa e atualizada

A aplicação está pronta para produção com alta disponibilidade, escalabilidade automática e deploy automatizado.
