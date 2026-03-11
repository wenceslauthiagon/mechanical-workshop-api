# Guia de Organização em 4 Repositórios

Este documento fornece instruções para dividir o monorepo atual em 4 repositórios independentes conforme requisitos do Tech Challenge.

## 📦 Estrutura dos 4 Repositórios

### 1. mechanical-workshop-auth-function
**Descrição**: Azure Function para autenticação via CPF

**Conteúdo**:
```
mechanical-workshop-auth-function/
├── .github/
│   └── workflows/
│       └── deploy.yml
├── auth/
│   └── index.ts
├── prisma/
│   └── schema.prisma
├── host.json
├── local.settings.json
├── local.settings.example.json
├── package.json
├── tsconfig.json
└── README.md
```

**Mover de**:
- `azure-function/` (completo)

**Branch Protection**:
- `main`: Deploy para produção
- `develop`: Deploy para staging
- PRs obrigatórios

---

### 2. mechanical-workshop-kubernetes-infra
**Descrição**: Infraestrutura Kubernetes com Terraform

**Conteúdo**:
```
mechanical-workshop-kubernetes-infra/
├── .github/
│   └── workflows/
│       └── terraform.yml
├── terraform/
│   ├── main.tf
│   ├── variables.tf
│   ├── outputs.tf
│   ├── provider.tf
│   └── terraform.tfvars.example
├── k8s/
│   ├── namespace.yaml
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── hpa.yaml
│   ├── kong-config.yaml
│   ├── kong-deployment.yaml
│   └── datadog-monitoring.yaml
├── docs/
│   └── DEPLOYMENT.md
└── README.md
```

**Mover de**:
- `terraform-kubernetes/`
- `k8s/`

**Branch Protection**:
- `main`: Apply para produção (requer approval)
- `develop`: Apply para staging
- PRs obrigatórios

---

### 3. mechanical-workshop-database-infra
**Descrição**: Infraestrutura do Banco de Dados Gerenciado com Terraform

**Conteúdo**:
```
mechanical-workshop-database-infra/
├── .github/
│   └── workflows/
│       └── terraform.yml
├── terraform/
│   ├── main.tf
│   ├── variables.tf
│   ├── outputs.tf
│   ├── provider.tf
│   └── terraform.tfvars.example
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── docs/
│   ├── DATABASE_DESIGN.md
│   └── MIGRATION_GUIDE.md
└── README.md
```

**Mover de**:
- `terraform-database/`
- `prisma/` (schema e migrations)

**Branch Protection**:
- `main`: Apply para produção (requer approval manual)
- `develop`: Apply para staging
- PRs obrigatórios
- Migration review obrigatória

---

### 4. mechanical-workshop-api
**Descrição**: Aplicação principal (NestJS) executando em Kubernetes

**Conteúdo**:
```
mechanical-workshop-api/
├── .github/
│   └── workflows/
│       └── ci-cd.yml
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── auth/
│   ├── workshop/
│   ├── application/
│   ├── domain/
│   ├── infrastructure/
│   └── shared/
├── test/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── docs/
│   ├── ARCHITECTURE.md
│   ├── API_DOCUMENTATION.md
│   ├── COMPONENT_DIAGRAM.md
│   ├── SEQUENCE_DIAGRAM.md
│   ├── RFC-001-CLOUD-PLATFORM.md
│   ├── RFC-002-AUTHENTICATION-STRATEGY.md
│   ├── ADR-001-API-GATEWAY-KONG.md
│   ├── ADR-002-POSTGRESQL-DATABASE.md
│   └── MONITORING_SETUP.md
├── docker/
│   └── Dockerfile
├── package.json
├── tsconfig.json
├── jest.config.js
├── .env.example
└── README.md
```

**Mover de**:
- `src/` (completo)
- `test/`
- `docs/`
- `docker/`
- Arquivos raiz (package.json, tsconfig.json, etc)

**Branch Protection**:
- `main`: Deploy para produção (requer approval + testes passando)
- `develop`: Deploy para staging automático
- PRs obrigatórios
- CI obrigatório (testes + linter)

---

## 🔧 Passos para Criação dos Repositórios

### 1. Criar Repositórios no GitHub

```bash
# No GitHub, criar 4 novos repositórios:
# - mechanical-workshop-auth-function
# - mechanical-workshop-kubernetes-infra
# - mechanical-workshop-database-infra
# - mechanical-workshop-api

# Todos devem ser:
# - Private (ou Public conforme política)
# - Com .gitignore (Node/Terraform)
# - Sem README inicial (vamos adicionar customizado)
```

### 2. Configurar Branch Protection Rules

Para cada repositório, em Settings → Branches → Add rule:

```yaml
Branch name pattern: main
☑ Require pull request before merging
  ☑ Require approvals (1)
  ☑ Dismiss stale approvals
☑ Require status checks to pass
  ☑ Require branches to be up to date
  ☑ Status checks: CI/CD (para repos com workflow)
☑ Require conversation resolution
☑ Do not allow bypassing the above settings
```

### 3. Adicionar Colaborador `soat-architecture`

Para cada repositório:
1. Settings → Collaborators
2. Add people → `soat-architecture`
3. Role: **Admin**

### 4. Configurar Secrets

#### Auth Function
```
Settings → Secrets → Actions:
- AZURE_FUNCTIONAPP_PUBLISH_PROFILE
- AZURE_FUNCTIONAPP_PUBLISH_PROFILE_STAGING
- DATABASE_URL
- JWT_SECRET
```

#### Kubernetes Infra
```
- KUBE_CONFIG_STAGING (base64 do kubeconfig)
- KUBE_CONFIG_PRODUCTION
- CLOUD_CREDENTIALS_STAGING
- CLOUD_CREDENTIALS_PRODUCTION
```

#### Database Infra
```
- CLOUD_CREDENTIALS_STAGING
- CLOUD_CREDENTIALS_PRODUCTION
- DB_PASSWORD_STAGING
- DB_PASSWORD_PRODUCTION
```

#### API Principal
```
- GITHUB_TOKEN (automático)
- KUBE_CONFIG_STAGING
- KUBE_CONFIG_PRODUCTION
- DATABASE_URL_STAGING
- DATABASE_URL_PRODUCTION
- JWT_SECRET
- CODECOV_TOKEN
```

### 5. Mover Código

#### Repositório 1: Auth Function
```powershell
cd w:\projects
git clone https://github.com/[org]/mechanical-workshop-auth-function.git
cd mechanical-workshop-auth-function

# Copiar arquivos
Copy-Item -Path ..\mechanical-workshop-api\azure-function\* -Destination . -Recurse
Copy-Item -Path ..\mechanical-workshop-api\azure-function\.github -Destination . -Recurse

# Commit inicial
git add .
git commit -m "Initial commit: Azure Function for CPF authentication"
git push origin main
```

#### Repositório 2: Kubernetes Infra
```powershell
cd w:\projects
git clone https://github.com/[org]/mechanical-workshop-kubernetes-infra.git
cd mechanical-workshop-kubernetes-infra

# Criar estrutura
New-Item -ItemType Directory -Path terraform, k8s, docs

# Copiar arquivos
Copy-Item -Path ..\mechanical-workshop-api\terraform-kubernetes\* -Destination .\terraform\ -Recurse
Copy-Item -Path ..\mechanical-workshop-api\k8s\* -Destination .\k8s\ -Recurse

# Commit inicial
git add .
git commit -m "Initial commit: Kubernetes infrastructure with Terraform"
git push origin main
```

#### Repositório 3: Database Infra
```powershell
cd w:\projects
git clone https://github.com/[org]/mechanical-workshop-database-infra.git
cd mechanical-workshop-database-infra

# Criar estrutura
New-Item -ItemType Directory -Path terraform, prisma, docs

# Copiar arquivos
Copy-Item -Path ..\mechanical-workshop-api\terraform-database\* -Destination .\terraform\ -Recurse
Copy-Item -Path ..\mechanical-workshop-api\prisma\* -Destination .\prisma\ -Recurse

# Commit inicial
git add .
git commit -m "Initial commit: Database infrastructure with Terraform"
git push origin main
```

#### Repositório 4: API Principal
```powershell
cd w:\projects
git clone https://github.com/[org]/mechanical-workshop-api.git
cd mechanical-workshop-api

# Copiar tudo exceto pastas já movidas
Copy-Item -Path ..\mechanical-workshop-api-monorepo\src -Destination . -Recurse
Copy-Item -Path ..\mechanical-workshop-api-monorepo\test -Destination . -Recurse
Copy-Item -Path ..\mechanical-workshop-api-monorepo\docs -Destination . -Recurse
Copy-Item -Path ..\mechanical-workshop-api-monorepo\docker -Destination . -Recurse
Copy-Item -Path ..\mechanical-workshop-api-monorepo\package.json -Destination .
Copy-Item -Path ..\mechanical-workshop-api-monorepo\tsconfig.json -Destination .
Copy-Item -Path ..\mechanical-workshop-api-monorepo\jest.config.js -Destination .

# Commit inicial
git add .
git commit -m "Initial commit: Main NestJS application"
git push origin main
```

---

## 📝 Templates de README.md

### README - Auth Function

```markdown
# Mechanical Workshop - Auth Function

Azure Function serverless para autenticação de clientes via CPF com geração de JWT.

## 🚀 Tecnologias

- Azure Functions v4
- TypeScript
- Prisma ORM
- jsonwebtoken
- PostgreSQL

## 📦 Instalação

\`\`\`bash
npm install
\`\`\`

## ⚙️ Configuração

Copie \`local.settings.example.json\` para \`local.settings.json\` e configure:

\`\`\`json
{
  "Values": {
    "JWT_SECRET": "your-secret",
    "DATABASE_URL": "postgresql://..."
  }
}
\`\`\`

## 🏃 Execução Local

\`\`\`bash
npm start
\`\`\`

## 🧪 Testes

\`\`\`bash
npm test
\`\`\`

## 🌐 Deploy

Deploy automático via GitHub Actions:
- Push para \`develop\` → Deploy staging
- Push para \`main\` → Deploy production

## 📖 Documentação

- [API Documentation](./README.md#api)
- [Architecture](../mechanical-workshop-api/docs/COMPONENT_DIAGRAM.md)

## 🔗 Repositórios Relacionados

- [API Principal](https://github.com/[org]/mechanical-workshop-api)
- [Kubernetes Infra](https://github.com/[org]/mechanical-workshop-kubernetes-infra)
- [Database Infra](https://github.com/[org]/mechanical-workshop-database-infra)
```

### README - Kubernetes Infra

```markdown
# Mechanical Workshop - Kubernetes Infrastructure

Infraestrutura Kubernetes gerenciada com Terraform para a aplicação de oficina mecânica.

## 🚀 Componentes

- AKS/EKS/GKE Cluster
- Kong API Gateway
- Ingress Controller
- HPA (Horizontal Pod Autoscaler)
- Datadog Monitoring

## 📦 Pré-requisitos

- Terraform >= 1.6
- kubectl
- Cloud CLI (az/aws/gcloud)

## ⚙️ Configuração

\`\`\`bash
cd terraform
cp terraform.tfvars.example terraform.tfvars
# Editar terraform.tfvars
\`\`\`

## 🏗️ Provisionamento

\`\`\`bash
cd terraform
terraform init
terraform plan
terraform apply
\`\`\`

## 🌐 Deploy

Deploy automático via GitHub Actions:
- Push para \`develop\` → Staging cluster
- Push para \`main\` → Production cluster (requer approval)

## 📖 Documentação

- [Deployment Guide](./docs/DEPLOYMENT.md)
- [Architecture](../mechanical-workshop-api/docs/COMPONENT_DIAGRAM.md)

## 🔗 Repositórios Relacionados

- [API Principal](https://github.com/[org]/mechanical-workshop-api)
- [Auth Function](https://github.com/[org]/mechanical-workshop-auth-function)
- [Database Infra](https://github.com/[org]/mechanical-workshop-database-infra)
```

### README - Database Infra

```markdown
# Mechanical Workshop - Database Infrastructure

Infraestrutura de banco de dados PostgreSQL gerenciado com Terraform.

## 🚀 Componentes

- Azure Database for PostgreSQL / AWS RDS / Cloud SQL
- High Availability (HA)
- Read Replicas
- Automated Backups
- Point-in-time Recovery

## 📦 Pré-requisitos

- Terraform >= 1.6
- Prisma CLI
- Cloud CLI

## ⚙️ Configuração

\`\`\`bash
cd terraform
cp terraform.tfvars.example terraform.tfvars
# Editar terraform.tfvars com senhas seguras
\`\`\`

## 🏗️ Provisionamento

\`\`\`bash
cd terraform
terraform init
terraform plan
terraform apply
\`\`\`

## 🗄️ Migrations

\`\`\`bash
cd prisma
npx prisma migrate deploy
\`\`\`

## 📊 Schema

Ver [Database Design](./docs/DATABASE_DESIGN.md)

## 🌐 Deploy

Deploy automático via GitHub Actions:
- Push para \`develop\` → Staging database
- Push para \`main\` → Production database (requer approval manual)

## 🔗 Repositórios Relacionados

- [API Principal](https://github.com/[org]/mechanical-workshop-api)
- [Auth Function](https://github.com/[org]/mechanical-workshop-auth-function)
- [Kubernetes Infra](https://github.com/[org]/mechanical-workshop-kubernetes-infra)
```

### README - API Principal

(Manter o README.md existente e adicionar seção de links)

```markdown
## 🔗 Repositórios Relacionados

Este é o repositório principal da aplicação. Outros repositórios:

- [Auth Function](https://github.com/[org]/mechanical-workshop-auth-function) - Autenticação serverless
- [Kubernetes Infra](https://github.com/[org]/mechanical-workshop-kubernetes-infra) - Cluster K8s
- [Database Infra](https://github.com/[org]/mechanical-workshop-database-infra) - PostgreSQL gerenciado
```

---

## 📹 Vídeo de Demonstração

### Roteiro Sugerido (15 minutos)

**[0:00 - 1:00] Introdução**
- Apresentação do sistema
- Overview da arquitetura

**[1:00 - 3:00] Autenticação com CPF**
- Mostrar Postman/Insomnia
- POST /auth com CPF
- Receber JWT token

**[3:00 - 6:00] Pipeline CI/CD**
- Mostrar GitHub Actions
- Demonstrar push → CI → testes → build → deploy
- Mostrar logs de execução

**[6:00 - 8:00] Kubernetes**
- kubectl get pods, services
- Mostrar HPA em ação
- Logs dos pods

**[8:00 - 10:00] APIs Protegidas**
- Criar ordem de serviço com JWT
- Listar ordens de serviço
- Mostrar erro sem token

**[10:00 - 13:00] Dashboard Datadog**
- APM traces
- Métricas de latência
- CPU/Memory usage
- Dashboards customizados

**[13:00 - 14:30] Logs e Traces**
- Buscar por correlation ID
- Rastrear requisição completa
- Mostrar logs estruturados

**[14:30 - 15:00] Conclusão**
- Recap dos 4 repositórios
- Links para documentação
- Q&A

---

## 📄 Documento de Entrega (PDF)

### Template

```markdown
# Tech Challenge - Sistema de Oficina Mecânica
## Entrega Final

---

### 1. Informações do Projeto

**Equipe**: [Nome dos membros]  
**Data**: Março/2024  
**Disciplina**: Tech Challenge - Fase 3

---

### 2. Repositórios GitHub

Todos os repositórios possuem o usuário `soat-architecture` como colaborador com acesso Admin.

1. **Auth Function (Serverless)**  
   🔗 https://github.com/[org]/mechanical-workshop-auth-function

2. **Kubernetes Infrastructure (Terraform)**  
   🔗 https://github.com/[org]/mechanical-workshop-kubernetes-infra

3. **Database Infrastructure (Terraform)**  
   🔗 https://github.com/[org]/mechanical-workshop-database-infra

4. **Aplicação Principal (NestJS)**  
   🔗 https://github.com/[org]/mechanical-workshop-api

---

### 3. Vídeo de Demonstração

🎥 **YouTube**: https://youtu.be/[video-id]  
⏱️ **Duração**: 14:30 minutos  
🔓 **Visibilidade**: Não listado

---

### 4. Documentação Arquitetural

📊 **Diagrama de Componentes**:  
https://github.com/[org]/mechanical-workshop-api/blob/main/docs/COMPONENT_DIAGRAM.md

📈 **Diagrama de Sequência**:  
https://github.com/[org]/mechanical-workshop-api/blob/main/docs/SEQUENCE_DIAGRAM.md

📝 **RFC 001 - Cloud Platform**:  
https://github.com/[org]/mechanical-workshop-api/blob/main/docs/RFC-001-CLOUD-PLATFORM.md

📝 **RFC 002 - Authentication Strategy**:  
https://github.com/[org]/mechanical-workshop-api/blob/main/docs/RFC-002-AUTHENTICATION-STRATEGY.md

📋 **ADR 001 - API Gateway**:  
https://github.com/[org]/mechanical-workshop-api/blob/main/docs/ADR-001-API-GATEWAY-KONG.md

📋 **ADR 002 - PostgreSQL Database**:  
https://github.com/[org]/mechanical-workshop-api/blob/main/docs/ADR-002-POSTGRESQL-DATABASE.md

---

### 5. Monitoramento

📊 **Datadog Dashboard**:  
https://app.datadoghq.com/dashboard/[dashboard-id]

📈 **Métricas Implementadas**:
- Latência das APIs (p50, p95, p99)
- CPU/Memory por pod
- Taxa de erros
- Volume de ordens de serviço
- Healthchecks e uptime

---

### 6. Ambientes Deployados

🌐 **Staging**: https://staging.workshop-api.com  
🌐 **Production**: https://workshop-api.com

📖 **Swagger/OpenAPI**: https://workshop-api.com/api-docs

---

### 7. Confirmações

✅ Usuário `soat-architecture` adicionado a todos os 4 repositórios com permissão Admin  
✅ CI/CD implementado e funcional em todos os repositórios  
✅ Branch protection rules configuradas (main protegida)  
✅ Deploy automático funcionando (staging + production)  
✅ Monitoramento Datadog ativo  
✅ Documentação completa (RFCs, ADRs, Diagramas)

---

**Assinatura**: [Nome do Líder do Grupo]  
**Data**: [Data da Entrega]
```

---

## ✅ Checklist Final

Antes de entregar, verificar:

### Repositórios
- [ ] 4 repositórios criados no GitHub
- [ ] Usuário `soat-architecture` adicionado como Admin em todos
- [ ] Branch `main` protegida (PRs obrigatórios)
- [ ] README.md completo em cada repositório
- [ ] .gitignore configurado
- [ ] Secrets configurados no GitHub Actions

### CI/CD
- [ ] GitHub Actions funcionando em todos os repos
- [ ] Testes passando (API principal)
- [ ] Deploy automático configurado
- [ ] Ambientes staging e production separados

### Infraestrutura
- [ ] Kubernetes cluster provisionado
- [ ] Database gerenciado criado
- [ ] Azure Function deployed
- [ ] Kong API Gateway configurado
- [ ] Datadog agent instalado

### Documentação
- [ ] Diagrama de componentes
- [ ] Diagrama de sequência
- [ ] 2 RFCs criados
- [ ] 2 ADRs criados
- [ ] Justificativa do banco de dados
- [ ] README em todos os repositórios

### Vídeo
- [ ] Gravado (max 15 min)
- [ ] Upload no YouTube
- [ ] Visibilidade: não listado ou público
- [ ] Demonstra autenticação via CPF
- [ ] Mostra CI/CD em ação
- [ ] Exibe dashboard de monitoramento
- [ ] Logs e traces demonstrados

### Documento PDF
- [ ] Links dos 4 repositórios
- [ ] Link do vídeo
- [ ] Links das documentações
- [ ] Confirmação do usuário soat-architecture
- [ ] Convertido para PDF
- [ ] Upload no portal do aluno

---

## 🎯 Pronto para Entrega!

Após seguir todos os passos acima, o projeto estará completo e pronto para submissão no portal do aluno.

Boa sorte! 🚀
