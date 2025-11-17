# 🔧 Mechanical Workshop API

[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![Kubernetes](https://img.shields.io/badge/Kubernetes-326CE5?style=for-the-badge&logo=kubernetes&logoColor=white)](https://kubernetes.io/)
[![Terraform](https://img.shields.io/badge/Terraform-7B42BC?style=for-the-badge&logo=terraform&logoColor=white)](https://www.terraform.io/)
[![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)

Sistema de gestão para oficina mecânica desenvolvido com **NestJS**, **Prisma** e **PostgreSQL**, seguindo os princípios de **Clean Architecture**, **Domain-Driven Design (DDD)** e **Infrastructure as Code (IaC)**.

## 📋 Sobre o Projeto

Este projeto foi desenvolvido como parte do **Tech Challenge - Fase 2**, implementando uma solução completa e profissional para gestão de oficina mecânica com:

- ✅ **Clean Architecture** com 4 camadas bem definidas
- ✅ **Clean Code** com boas práticas e padrões
- ✅ **844 testes automatizados** (unit + integration + e2e)
- ✅ **Containerização** com Docker e Docker Compose
- ✅ **Orquestração** com Kubernetes (7 manifestos)
- ✅ **Infrastructure as Code** com Terraform
- ✅ **CI/CD** completo com GitHub Actions
- ✅ **Horizontal Pod Autoscaler** configurado
- ✅ **Sistema de notificações** por email

---

## 🚀 Tecnologias

### Core
- **Backend**: NestJS 11 + TypeScript 5
- **Database**: PostgreSQL 16 com Prisma ORM
- **Cache**: Redis 7
- **Authentication**: JWT com bcryptjs
- **Documentation**: Swagger/OpenAPI

### Architecture & Patterns
- **Architecture**: Clean Architecture (4 layers)
- **Design**: Domain-Driven Design (DDD)
- **Testing**: Jest (844 tests - unit + integration + e2e)
- **Code Quality**: ESLint + Prettier

### Infrastructure
- **Containerization**: Docker + Docker Compose
- **Orchestration**: Kubernetes (Kind for CI/CD)
- **IaC**: Terraform 1.6
- **CI/CD**: GitHub Actions
- **Registry**: GitHub Container Registry (GHCR)

## 📋 Funcionalidades

### ✅ Gestão de Clientes
- CRUD completo de clientes
- Histórico de serviços por cliente
- API pública para consulta de orçamentos

### ✅ Gestão de Veículos
- CRUD de veículos
- Vinculação com clientes
- Histórico de manutenções

### ✅ Gestão de Peças
- CRUD de peças/produtos
- Controle de estoque
- Preços e fornecedores

### ✅ Gestão de Serviços
- CRUD de tipos de serviços
- Preços e descrições
- Tempo estimado de execução

### ✅ Ordens de Serviço
- CRUD completo
- Estados: PENDING, IN_PROGRESS, COMPLETED, CANCELLED
- Orçamento automático baseado em serviços e peças

### ✅ Autenticação e Autorização
- Sistema JWT completo
- Roles: ADMIN, EMPLOYEE
- Guards para proteção de rotas
- Decoradores personalizados

### ✅ Monitoramento
- Estatísticas de desempenho por serviço
- Tempo de execução e precisão de orçamentos
- Health checks

### ✅ Notificações (Fase 2)
- Sistema de notificação por email
- Templates HTML personalizados
- Notificações de status de OS

### ✅ Listagem Avançada (Fase 2)
- Ordenação prioritária de OS:
  - Em Execução > Aguardando Aprovação > Diagnóstico > Recebida
- Filtro de OS finalizadas/entregues
- Paginação em todas as entidades (base 0)

---

## 🏗️ Arquitetura da Solução

### Clean Architecture - 4 Camadas

```
┌─────────────────────────────────────────────────────┐
│              1-PRESENTATION (Controllers)            │
│  ┌───────────────────────────────────────────────┐  │
│  │        2-APPLICATION (Use Cases/Services)     │  │
│  │  ┌─────────────────────────────────────────┐ │  │
│  │  │        3-DOMAIN (Entities/Rules)        │ │  │
│  │  │  ┌────────────────────────────────────┐ │ │  │
│  │  │  │  4-INFRASTRUCTURE (Repositories)   │ │ │  │
│  │  │  └────────────────────────────────────┘ │ │  │
│  │  └─────────────────────────────────────────┘ │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

#### Detalhamento das Camadas

**1-Presentation (Interface Adapters)**
- Controllers REST
- DTOs de entrada/saída
- Validações com class-validator
- Documentação Swagger

**2-Application (Use Cases)**
- Services com lógica de orquestração
- Casos de uso da aplicação
- Coordenação entre domain e infrastructure

**3-Domain (Entities + Business Rules)**
- Entidades de negócio
- Value Objects
- Domain Services
- Specifications e Policies
- Repository Interfaces (Ports)

**4-Infrastructure (Frameworks & Drivers)**
- Implementação de repositórios (Prisma)
- Integrações externas (Email, etc)
- Configurações de framework

### Estrutura de Diretórios

```
src/
├── 📁 workshop/
│   ├── 📁 1-presentation/     # Controllers e APIs REST
│   │   └── controllers/       # Endpoints HTTP
│   ├── 📁 2-application/      # Services e lógica de aplicação
│   │   └── services/          # Casos de uso
│   ├── 📁 3-domain/           # Entidades e regras de negócio
│   │   └── entities/          # Entidades do domínio
│   └── 📁 4-infrastructure/   # Repositórios e integrações
│       └── repositories/      # Implementação Prisma
├── 📁 auth/                   # Módulo de autenticação
│   ├── controllers/           # Auth controller
│   ├── services/              # Auth e User services
│   ├── guards/                # JWT guards e roles
│   └── decorators/            # Decoradores customizados
├── 📁 public/                 # API pública (sem auth)
└── 📁 shared/                 # Código compartilhado
    └── enums/                 # Enumerações
```

---

## ☸️ Kubernetes & Orquestração

### Manifestos Kubernetes (`/k8s`)

A aplicação possui **7 manifestos** para deploy completo em Kubernetes:

#### 1. `namespace.yaml`
```yaml
namespace: mechanical-workshop  # Isolamento de recursos
```

#### 2. `configmap.yaml`
Configurações não-sensíveis:
- NODE_ENV, PORT
- DATABASE_HOST, DATABASE_PORT
- REDIS_HOST, REDIS_PORT
- JWT_EXPIRATION

#### 3. `secret.yaml`
Dados sensíveis (base64):
- DATABASE_PASSWORD
- JWT_SECRET
- DATABASE_URL completa

#### 4. `postgres-deployment.yaml`
- **Image**: postgres:16-alpine
- **Storage**: PVC de 1Gi
- **Resources**: 250m CPU, 512Mi RAM
- **Health checks**: pg_isready

#### 5. `redis-deployment.yaml`
- **Image**: redis:7-alpine
- **Resources**: 100m CPU, 128Mi RAM
- **Health checks**: redis-cli ping

#### 6. `app-deployment.yaml`
- **Image**: ghcr.io/creative-ia/mechanical-workshop-api
- **Replicas**: 3 pods
- **Resources**: 
  - Requests: 200m CPU, 256Mi RAM
  - Limits: 500m CPU, 512Mi RAM
- **Health checks**: /health endpoint
- **imagePullPolicy**: IfNotPresent (para Kind)

#### 7. `hpa.yaml` (Horizontal Pod Autoscaler)
```yaml
minReplicas: 3
maxReplicas: 10
metrics:
  - CPU: 70% utilization
  - Memory: 80% utilization
behavior:
  scaleUp: +100% or +2 pods (max)
  scaleDown: -50% (gradual)
```

### Deploy no Kubernetes

```bash
# Deploy sequencial (ordem importa!)
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml
kubectl apply -f k8s/postgres-deployment.yaml
kubectl apply -f k8s/redis-deployment.yaml
kubectl apply -f k8s/app-deployment.yaml
kubectl apply -f k8s/hpa.yaml

# Verificar deployments
kubectl get all -n mechanical-workshop

# Ver logs da aplicação
kubectl logs -n mechanical-workshop -l app=workshop-api --tail=100
```

---

## 🏗️ Infrastructure as Code (Terraform)

### Estrutura Terraform (`/infra`)

```
infra/
├── provider.tf      # Configuração de providers (kubernetes, helm)
├── variables.tf     # 12 variáveis configuráveis
├── main.tf          # Recursos principais
├── outputs.tf       # Outputs após deploy
└── README.md        # Documentação completa
```

### Recursos Provisionados

O Terraform cria **toda a infraestrutura**:

1. **Namespace** (mechanical-workshop)
2. **ConfigMap** com variáveis de ambiente
3. **Secrets** para dados sensíveis
4. **PersistentVolumeClaims** (PostgreSQL + Redis)
5. **Deployments**:
   - PostgreSQL (1 replica)
   - Redis (1 replica)
   - Workshop API (3 replicas configuráveis)
6. **Services**:
   - postgres-service (ClusterIP)
   - redis-service (ClusterIP)
   - workshop-api-service (NodePort)
7. **HorizontalPodAutoscaler** (HPA)

### Variáveis Configuráveis

```hcl
# Cluster
kubeconfig_path      # ~/.kube/config
kube_context         # kind-workshop-terraform

# App
app_name            # workshop-api
app_replicas        # 3
app_image           # ghcr.io/creative-ia/...

# Database
database_name       # workshop_db
database_user       # workshop
database_password   # (sensitive)

# Secrets
jwt_secret          # (sensitive)

# Storage
postgres_storage    # 10Gi
redis_storage       # 1Gi
```

### Como Usar Terraform

```bash
cd infra/

# Inicializar
terraform init

# Validar
terraform validate

# Ver mudanças
terraform plan \
  -var="database_password=mypass" \
  -var="jwt_secret=mysecret"

# Aplicar
terraform apply \
  -var="database_password=mypass" \
  -var="jwt_secret=mysecret" \
  -auto-approve

# Ver outputs
terraform output

# Destruir (⚠️ remove tudo!)
terraform destroy
```

### Características Especiais

✅ **wait_for_rollout = false** - Não trava esperando pods ficarem ready  
✅ **Timeouts configurados** (5min para create/update)  
✅ **Service tipo NodePort** (compatível com Kind)  
✅ **HPA com select_policy** configurado corretamente  

---

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow

O pipeline automatizado executa **5 jobs** em sequência:

```
┌─────────────────────────────────────────────────────────┐
│  Push to main/develop                                    │
└──────────────────┬──────────────────────────────────────┘
                   │
         ┌─────────┴─────────┐
         │  GitHub Actions    │
         └─────────┬──────────┘
                   │
    ┌──────────────┼──────────────┐
    │              │              │
    ▼              ▼              ▼
┌────────┐   ┌─────────┐    ┌──────────┐
│ Lint & │   │ Build & │    │ Deploy   │
│ Test   │──▶│ Push    │──▶ │ K8s      │
│        │   │ Docker  │    │          │
│844 tests   │ GHCR    │    │ Kind     │
└────────┘   └─────────┘    └────┬─────┘
                                  │
                    ┌─────────────┴─────────────┐
                    │                           │
                    ▼                           ▼
              ┌───────────┐             ┌─────────────┐
              │ Deploy    │             │   Notify    │
              │ Terraform │             │ Deployment  │
              │ (Kind)    │             │             │
              └───────────┘             └─────────────┘
```

### Jobs Detalhados

#### 1. **Lint and Test** (~1m 43s)
- ✅ Setup PostgreSQL 16 + Redis 7
- ✅ ESLint validation
- ✅ **844 automated tests**
- ✅ Coverage report (Codecov)

#### 2. **Build and Push** (~50s)
- ✅ Docker multi-stage build
- ✅ Login GHCR
- ✅ Tag: `latest` (main) ou `branch-sha`
- ✅ Push to ghcr.io/creative-ia/mechanical-workshop-api

#### 3. **Deploy to Kubernetes** (~2m 27s)
- ✅ Create Kind cluster (`workshop`)
- ✅ Pull Docker image from GHCR
- ✅ Load image into Kind
- ✅ Sequential deploy (namespace → config → secrets → postgres → redis → app → hpa)
- ✅ Health check validation

#### 4. **Deploy with Terraform** (~1m 10s)
- ✅ Create dedicated Kind cluster (`workshop-terraform`)
- ✅ terraform init + validate
- ✅ terraform plan
- ✅ terraform apply (automated)
- ✅ Verify deployment

**Triggered when**: Push to main AND commit message contains `[terraform]`

#### 5. **Notify Deployment** (~3s)
- ✅ Success/Failure notification
- ✅ Can integrate with Slack, Discord, etc.

### Tempo Total

**~6m 25s** do push ao deploy completo! ⚡

### Configuração do Pipeline

Arquivo: `.github/workflows/ci-cd.yml`

```yaml
on:
  push:
    branches: [main, develop, 'feature/**']
  pull_request:
    branches: [main, develop]

jobs:
  lint-and-test: ...
  build-and-push: ...
  deploy-to-kubernetes: ...
  deploy-with-terraform: ...
  notify: ...
```

---

## � ANTES DE COMEÇAR (OBRIGATÓRIO)

**⚠️ ATENÇÃO: Sem estes passos, a aplicação NÃO irá funcionar!**

### 1. **Configure o arquivo .env (CRÍTICO)**
```bash
# Copie o arquivo de exemplo
cp .env.example .env

# Edite o .env com os valores corretos:
nano .env  # ou use seu editor preferido
```

**⚠️ IMPORTANTE:** Configure as variáveis obrigatórias:
- `DATABASE_URL` - URL de conexão do PostgreSQL
- `JWT_SECRET` - Chave JWT (mínimo 32 caracteres)
- `ADMIN_USERNAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` - Dados do usuário admin

**Veja o arquivo `.env.example` para referência dos valores necessários.**

### 2. **Verifique os pré-requisitos**
- ✅ Docker Desktop instalado e rodando
- ✅ Docker Compose disponível
- ✅ Porta 3000 livre (ou mude no docker-compose.yml)
- ✅ Porta 5433 livre (PostgreSQL)

## 🐳 Quick Start com Docker (Recomendado)

### Setup Passo a Passo

1. **Clone o repositório**
```bash
git clone https://github.com/wenceslauthiagon/mechanical-workshop-api.git
cd mechanical-workshop-api
```

2. **Configure o .env (OBRIGATÓRIO!)**
```bash
cp .env.example .env
# Edite o .env com os valores acima
```

3. **Inicie o ambiente (primeira vez)**
```bash
# Opção 1: Com Make (recomendado)
make setup

# Opção 2: Manualmente
docker-compose build --no-cache
docker-compose up -d
```

4. **Aguarde e verifique os logs**
```bash
# Ver se tudo iniciou corretamente
docker-compose logs -f

# Pressione Ctrl+C para sair dos logs
```

5. **Verifique se está funcionando**
```bash
# Teste a API
curl http://localhost:3000/health

# Ou abra no navegador:
# http://localhost:3000/health
# http://localhost:3000/api (Swagger)
```

### ✅ **Como saber se funcionou?**

Você deve ver estas mensagens nos logs:
```
✅ Banco de dados conectado!
✅ Nest.js application successfully started
✅ Mechanical Workshop API rodando em http://localhost:3000
```

E ao acessar `http://localhost:3000/health` deve retornar:
```json
{
  "status": "ok",
  "timestamp": "2025-10-11T12:00:00.000Z",
  "uptime": 3600,
  "service": "Mechanical Workshop API",
  "version": "1.0.0",
  "environment": "development"
}
```

### Comandos Docker Úteis

```bash
# Ver ajuda completa
make help

# Iniciar serviços
make up

# Ver logs
make logs

# Parar serviços  
make down

# Reiniciar
make restart

# Executar testes
make test

# Acessar shell da aplicação
make shell-app

# Backup do banco
make backup-db
```

### 🗄️ **Comandos do Banco (Prisma)**

```bash
# Gerar cliente Prisma
npm run db:generate

# Aplicar migrations (desenvolvimento)
npm run db:migrate

# Aplicar migrations (produção)
npm run db:migrate:deploy

# Resetar banco (⚠️ APAGA DADOS!)
npm run db:migrate:reset

# Sincronizar schema (desenvolvimento)
npm run db:push

# Abrir Prisma Studio (interface gráfica)
npm run db:studio
```

**Com Docker:**
```bash
# Aplicar migrations
docker-compose exec app npx prisma migrate deploy

# Abrir Prisma Studio
docker-compose exec app npx prisma studio
# Acesse: http://localhost:5555
```

## 🛠️ Instalação Local (Desenvolvimento)

### Pré-requisitos
- Node.js 18+
- PostgreSQL 13+
- npm ou yarn

### Setup Local

1. **Clone e instale dependências**
```bash
git clone <repository-url>
cd mechanical-workshop-api
npm install
```

2. **Configure ambiente**
```bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

3. **Setup do banco**
```bash
npx prisma migrate dev
npx prisma generate
npm run create-admin
```

4. **Inicie a aplicação**
```bash
npm run start:dev
```

## 🧪 Testing

### Testing Strategy

This project follows a comprehensive testing approach with three layers:

1. **Unit Tests** - Fast, isolated tests for domain logic (100% coverage target)
2. **Integration Tests** - Database and repository tests with SQLite
3. **E2E Tests** - Full application flow tests

For detailed information, see [Testing Strategy Documentation](./docs/TESTING_STRATEGY.md).

### Running Tests

```bash
# Unit tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:cov

# Integration tests
npm run test:e2e

# Run specific test file
npm test customer.service.spec.ts

# Run tests matching pattern
npm test -- --testNamePattern="Should create"
```

### With Docker

```bash
# Run all unit tests
make test

# Run with coverage
make test-cov

# Run integration tests
docker-compose exec app npm run test:e2e
```

### Coverage Requirements

| Layer | Target | Purpose |
|-------|--------|---------|
| Domain (3-domain) | 100% | Core business logic |
| Application (2-application) | 90%+ | Orchestration |
| Presentation (1-presentation) | 80%+ | Controllers |
| Infrastructure (4-infrastructure) | Integration only | External dependencies |

### Test Naming Convention

```typescript
describe('ServiceName Unit Tests', () => {
  describe('TC001 - Feature group', () => {
    it('TC001 - Should do something specific', () => {
      // Arrange
      const input = {...};
      
      // Act
      const result = service.method(input);
      
      // Assert
      expect(result).toBeDefined();
    });
  });
});
```

## 📚 API Documentation

### URLs Importantes
- **API**: http://localhost:3000
- **Swagger**: http://localhost:3000/api
- **Health Check**: http://localhost:3000/health

### Endpoints Principais

#### Autenticação
- `POST /auth/login` - Login do usuário
- `POST /auth/register` - Registro (apenas admins)

#### Clientes
- `GET /customers` - Listar clientes
- `POST /customers` - Criar cliente
- `GET /customers/:id` - Buscar cliente
- `PUT /customers/:id` - Atualizar cliente
- `DELETE /customers/:id` - Remover cliente

#### API Pública
- `GET /public/budget/:customerId/:vehicleId` - Consultar orçamento

#### Estatísticas (Protegido)
- `GET /service-stats` - Estatísticas gerais
- `GET /service-stats/by-service` - Por tipo de serviço

## 🗄️ Estrutura do Banco

### Principais Entidades
- **User**: Usuários do sistema (admin/funcionários)
- **Customer**: Clientes da oficina
- **Vehicle**: Veículos dos clientes
- **Part**: Peças e produtos
- **Service**: Tipos de serviços oferecidos
- **ServiceOrder**: Ordens de serviço
- **ServiceOrderItem**: Itens das ordens (serviços/peças)

## 🔒 Segurança

- Autenticação JWT com refresh tokens
- Senhas hasheadas com bcryptjs
- Roles e permissões granulares
- Validação de entrada com class-validator
- Rate limiting (configurável)
- Docker multi-stage builds com usuário não-root

## 🚀 Deploy

### Docker em Produção

1. **Configurar variáveis**
```bash
# Editar .env.docker com valores de produção
nano .env.docker
```

2. **Deploy**
```bash
make prod
```

### Variáveis de Ambiente

#### Desenvolvimento (.env)
```env
NODE_ENV=development
PORT=3000
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/mechanical_workshop?schema=public"
JWT_SECRET=your-dev-secret
JWT_EXPIRES_IN=7d
```

#### Produção (.env.docker)
```env
NODE_ENV=production
PORT=3000
DATABASE_URL="postgresql://postgres:postgres@postgres:5432/mechanical_workshop?schema=public"
JWT_SECRET=your-super-secret-production-key
JWT_EXPIRES_IN=7d
```

##  Monitoramento

### Health Checks
- **API**: `GET /health`
- **Database**: Verificação automática no container

### Métricas Disponíveis
- Estatísticas de execução de serviços
- Precisão de orçamentos
- Tempo médio de atendimento

---

## 📚 Documentação da API

### URLs Importantes

- **API Base**: `http://localhost:3000`
- **Swagger UI**: `http://localhost:3000/api`
- **Swagger JSON**: `http://localhost:3000/api-json`
- **Health Check**: `http://localhost:3000/health`

### Swagger/OpenAPI

A documentação interativa completa está disponível em `/api`:

```bash
# Abra no navegador
open http://localhost:3000/api
```

Todas as APIs estão documentadas com:
- ✅ Descrições detalhadas
- ✅ Exemplos de request/response
- ✅ Schemas de DTOs
- ✅ Códigos de status HTTP
- ✅ Autenticação JWT (quando necessário)

### Collection Postman

**📦 [Download da Collection Postman](./docs/Mechanical-Workshop-API.postman_collection.json)**

A collection inclui:
- ✅ Todos os endpoints
- ✅ Variáveis de ambiente pré-configuradas
- ✅ Autenticação automática (JWT)
- ✅ Exemplos de requests
- ✅ Tests automatizados

#### Como Importar

1. Abra o Postman
2. Click em **Import**
3. Selecione o arquivo `Mechanical-Workshop-API.postman_collection.json`
4. Configure o environment:
   ```
   baseUrl: http://localhost:3000
   ```

### Principais Endpoints

#### 🔐 Autenticação

```http
POST /auth/login
Content-Type: application/json

{
  "email": "admin@workshop.com",
  "password": "Admin@123"
}

Response: {
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { "id": "...", "email": "...", "role": "ADMIN" }
}
```

```http
POST /auth/register
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass@123",
  "role": "EMPLOYEE"
}
```

#### 👥 Clientes

```http
GET /customers?page=0&limit=10
Authorization: Bearer {token}

POST /customers
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "João Silva",
  "email": "joao@email.com",
  "phone": "+55 11 98765-4321",
  "address": "Rua Example, 123"
}
```

#### 🚗 Veículos

```http
GET /vehicles?page=0&limit=10
Authorization: Bearer {token}

POST /vehicles
Authorization: Bearer {token}
Content-Type: application/json

{
  "customerId": "uuid-here",
  "make": "Toyota",
  "model": "Corolla",
  "year": 2023,
  "licensePlate": "ABC-1234",
  "color": "Prata"
}
```

#### 📋 Ordens de Serviço

```http
GET /service-orders?page=0&limit=10
Authorization: Bearer {token}

GET /service-orders/priority
Authorization: Bearer {token}
# Retorna OS ordenadas: Em Execução > Aguardando Aprovação > Diagnóstico > Recebida

POST /service-orders
Authorization: Bearer {token}
Content-Type: application/json

{
  "customerId": "uuid",
  "vehicleId": "uuid",
  "description": "Revisão completa",
  "serviceItems": [
    { "serviceId": "uuid", "quantity": 1 },
    { "partId": "uuid", "quantity": 2 }
  ]
}
```

#### 💰 Orçamentos

```http
POST /budgets
Authorization: Bearer {token}
Content-Type: application/json

{
  "serviceOrderId": "uuid",
  "items": [...],
  "subtotal": 1500.00,
  "taxes": 150.00,
  "total": 1650.00
}

PATCH /budgets/:id/approve
Authorization: Bearer {token}
# Aprova orçamento

GET /public/budget/:customerId/:vehicleId
# API Pública - Consulta sem autenticação
```

#### 📊 Estatísticas

```http
GET /service-stats
Authorization: Bearer {token}
# Estatísticas gerais

GET /service-stats/by-service
Authorization: Bearer {token}
# Estatísticas por tipo de serviço

GET /service-stats/:id
Authorization: Bearer {token}
# Estatísticas de um serviço específico
```

### Autenticação nas Requisições

Após o login, adicione o header em todas as requisições protegidas:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Códigos de Status HTTP

| Código | Significado |
|--------|-------------|
| 200 | ✅ Success |
| 201 | ✅ Created |
| 400 | ❌ Bad Request (validação) |
| 401 | ❌ Unauthorized (sem token ou inválido) |
| 403 | ❌ Forbidden (sem permissão) |
| 404 | ❌ Not Found |
| 409 | ❌ Conflict (duplicação) |
| 500 | ❌ Internal Server Error |

---

## 🎯 Tech Challenge - Fase 2 (Resumo)

### ✅ Requisitos Implementados

#### 1. **Clean Code & Best Practices**
- ✅ Constantes para mensagens de erro
- ✅ Nomenclatura descritiva e consistente
- ✅ Extração de métodos complexos
- ✅ Comentários apenas onde necessário
- ✅ Princípios SOLID aplicados
- ✅ DRY (Don't Repeat Yourself)
- ✅ ESLint + Prettier configurados

#### 2. **Clean Architecture (4 Camadas)**
- ✅ **1-Presentation** - Controllers, DTOs, Guards
- ✅ **2-Application** - Services (business logic)
- ✅ **3-Domain** - Entities, Interfaces, Value Objects
- ✅ **4-Infrastructure** - Repositories (Prisma)
- ✅ Dependências apontam para dentro
- ✅ Domain independente de frameworks
- ✅ Testabilidade facilitada

#### 3. **Testes Automatizados (844 tests)**
- ✅ **Unit Tests**: 100% de cobertura em services
- ✅ **Integration Tests**: Validação de fluxos completos
- ✅ **E2E Tests**: Simulação de cenários reais
- ✅ Coverage: auth, workshop, shared modules
- ✅ Jest configurado com setup específico
- ✅ Tests executados no CI/CD

#### 4. **APIs REST**
- ✅ 35+ endpoints documentados
- ✅ Autenticação JWT (Bearer Token)
- ✅ RBAC (ADMIN, EMPLOYEE, MECHANIC)
- ✅ Validação com class-validator
- ✅ Pagination (0-based)
- ✅ Error handling centralizado
- ✅ Swagger/OpenAPI completo

#### 5. **Docker & Containerização**
- ✅ Multi-stage build otimizado
- ✅ Imagens Alpine (tamanho reduzido)
- ✅ Non-root user (segurança)
- ✅ Health checks configurados
- ✅ Docker Compose para orquestração local
- ✅ GHCR (GitHub Container Registry)
- ✅ Imagem pública disponível

#### 6. **Kubernetes (7 Manifests)**
- ✅ **Namespace**: `workshop-api`
- ✅ **ConfigMap**: Variáveis de ambiente
- ✅ **Secret**: Credenciais sensíveis (base64)
- ✅ **PostgreSQL**: StatefulSet + PersistentVolume (10Gi)
- ✅ **Redis**: Deployment + Service
- ✅ **API**: Deployment (3 replicas) + Service (NodePort 30080)
- ✅ **HPA**: Auto-scaling (3-10 pods, CPU 70%, Memory 80%)
- ✅ Resource limits configurados
- ✅ Probes (liveness, readiness) implementados

#### 7. **Infrastructure as Code (Terraform)**
- ✅ Provisionamento completo da stack
- ✅ 12 variáveis configuráveis
- ✅ PostgreSQL + Redis + API
- ✅ HPA com métricas de CPU/Memory
- ✅ Services (NodePort) configurados
- ✅ Secrets gerenciados
- ✅ Kind cluster compatível
- ✅ Documentação completa em `infra/README.md`

#### 8. **CI/CD Pipeline (GitHub Actions)**
- ✅ **5 Jobs automatizados**:
  1. `lint-and-test`: ESLint + 844 tests (~4min)
  2. `build-and-push`: Docker build + push GHCR (~1min)
  3. `deploy-to-kubernetes`: Kind cluster + kubectl apply (~1min)
  4. `deploy-with-terraform`: Terraform apply (~3min) [opcional]
  5. `notify`: Notificação de sucesso/falha
- ✅ Execução: ~6min 25s (completo)
- ✅ Dual Kind clusters (isolamento)
- ✅ Docker authentication GHCR
- ✅ Image tagging inteligente (`latest` + `{branch}-{sha}`)
- ✅ Trigger Terraform com `[terraform]` no commit

#### 9. **Funcionalidades Extras (Fase 2)**
- ✅ **Priorização de OS**: Endpoint `/service-orders/priority`
- ✅ **Notificações por Email**: EmailService + templates HTML
- ✅ **Paginação**: `?page=0&limit=10` em todos os recursos
- ✅ **Estatísticas**: Execução e precisão de orçamentos
- ✅ **API Pública**: Consulta de orçamentos sem autenticação

### 📊 Métricas do Projeto

| Métrica | Valor |
|---------|-------|
| **Testes** | 844 passing |
| **Cobertura** | ~95% |
| **Endpoints** | 35+ |
| **Manifests K8s** | 7 arquivos |
| **Terraform Resources** | 10+ recursos |
| **CI/CD Jobs** | 5 jobs |
| **Pipeline Time** | ~6min 25s |
| **Docker Layers** | 12 layers (multi-stage) |
| **Replicas Default** | 3 |
| **HPA Max Pods** | 10 |
| **Modules** | auth, workshop, shared |

### 🎓 Conceitos Aplicados

- **Domain-Driven Design (DDD)**: Separação clara de domínios
- **Hexagonal Architecture**: Ports & Adapters pattern
- **SOLID Principles**: Todos os 5 princípios
- **Repository Pattern**: Abstração de persistência
- **Dependency Injection**: NestJS DI container
- **JWT Authentication**: Stateless auth
- **RBAC**: Role-Based Access Control
- **12-Factor App**: Configuração por environment
- **Container Orchestration**: Kubernetes + HPA
- **Infrastructure as Code**: Terraform
- **GitOps**: Deployments via Git
- **Continuous Integration**: Automated testing
- **Continuous Deployment**: Automated deployments

### 🚀 Próximos Passos (Fase 3?)

- [ ] Implementar GraphQL API
- [ ] Adicionar Redis para caching
- [ ] Implementar Event Sourcing
- [ ] Adicionar Observability (Prometheus + Grafana)
- [ ] Implementar Circuit Breaker
- [ ] Adicionar Rate Limiting
- [ ] Implementar WebSockets para notificações real-time
- [ ] Adicionar Elasticsearch para busca avançada
- [ ] Implementar CQRS pattern
- [ ] Adicionar Service Mesh (Istio)

---

## 📝 Licença

Este projeto está sob a licença MIT.
