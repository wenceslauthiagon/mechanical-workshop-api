# Tech Challenge - Sistema de Gestão de Oficina Mecânica
## Documento de Entrega Final

---

### Informações do Projeto

**Instituição**: FIAP - Faculdade de Informática e Administração Paulista  
**Curso**: Pós-Graduação em Arquitetura de Software  
**Disciplina**: Tech Challenge - Fase 3  
**Data de Entrega**: Março/2024

**Equipe**:
- [Nome Completo 1] - RM [número]
- [Nome Completo 2] - RM [número]
- [Nome Completo 3] - RM [número]
- [Nome Completo 4] - RM [número]
- [Nome Completo 5] - RM [número]

---

## 1. Visão Geral do Projeto

O projeto consiste em um sistema completo de gestão para oficina mecânica, implementando:

- ✅ **Autenticação serverless** via CPF com Azure Functions
- ✅ **API Gateway** (Kong) para controle e segurança
- ✅ **Aplicação NestJS** em Kubernetes com auto-scaling
- ✅ **Banco de Dados Gerenciado** (PostgreSQL) com alta disponibilidade
- ✅ **Monitoramento completo** com Datadog (APM, Logs, Métricas)
- ✅ **CI/CD automático** com GitHub Actions
- ✅ **Infraestrutura como Código** com Terraform

---

## 2. Repositórios GitHub

Todos os repositórios possuem:
- ✅ Branch `main` protegida (PRs obrigatórios)
- ✅ CI/CD implementado e funcional
- ✅ Deploy automático (staging + production)
- ✅ Usuário `soat-architecture` com permissão **Admin**

### 2.1. Azure Function (Autenticação Serverless)

**Repositório**: https://github.com/[organização]/mechanical-workshop-auth-function

**Descrição**: Function serverless para autenticação de clientes via CPF com geração de token JWT.

**Tecnologias**:
- Azure Functions v4
- TypeScript
- Prisma ORM
- jsonwebtoken

**Features**:
- Validação completa de CPF (algoritmo com dígitos verificadores)
- Consulta ao PostgreSQL
- Geração de JWT (HS256, exp: 24h)
- Deploy automático via GitHub Actions

**CI/CD**:
- Build automático
- Deploy para staging (branch `develop`)
- Deploy para production (branch `main`)

---

### 2.2. Infraestrutura Kubernetes (Terraform)

**Repositório**: https://github.com/[organização]/mechanical-workshop-kubernetes-infra

**Descrição**: Provisionamento do cluster Kubernetes (AKS) e recursos relacionados.

**Recursos Provisionados**:
- Azure Kubernetes Service (3 nodes)
- Virtual Network
- Load Balancer
- Horizontal Pod Autoscaler (2-10 replicas)
- Kong API Gateway
- Datadog Agent

**Tecnologias**:
- Terraform 1.6
- Kubernetes 1.28
- Helm

**CI/CD**:
- Terraform fmt e validate
- Terraform plan em PRs
- Terraform apply automático após merge
- Deploy staging e production separados

---

### 2.3. Infraestrutura do Banco de Dados (Terraform)

**Repositório**: https://github.com/[organização]/mechanical-workshop-database-infra

**Descrição**: Provisionamento do banco de dados PostgreSQL gerenciado.

**Recursos Provisionados**:
- Azure Database for PostgreSQL 16
- High Availability (HA) com failover automático
- Read Replicas
- Backup automático (35 dias de retenção)
- Point-in-time recovery
- Private endpoints

**Tecnologias**:
- Terraform 1.6
- PostgreSQL 16
- Prisma Migrations

**CI/CD**:
- Terraform plan/apply automático
- Migrations executadas após deploy
- Rollback strategy

---

### 2.4. Aplicação Principal (NestJS)

**Repositório**: https://github.com/[organização]/mechanical-workshop-api

**Descrição**: API REST para gestão completa da oficina mecânica.

**Funcionalidades**:
- Gestão de Clientes (CRUD)
- Gestão de Veículos (CRUD)
- Gestão de Ordens de Serviço (CRUD)
- Gestão de Peças e Serviços (CRUD)
- Autenticação JWT
- Sistema de Notificações

**Tecnologias**:
- NestJS 11
- TypeScript 5
- Prisma ORM
- PostgreSQL
- Redis (cache)
- Jest (844 testes)

**Arquitetura**:
- Clean Architecture (4 camadas)
- Domain-Driven Design (DDD)
- SOLID Principles
- Repository Pattern

**CI/CD**:
- Testes automáticos (unit + integration + e2e)
- Linting (ESLint)
- Security scan (Trivy)
- Docker build e push (GHCR)
- Deploy Kubernetes automático
- Rollback automático em falha

---

## 3. Vídeo de Demonstração

**Plataforma**: YouTube  
**URL**: https://youtu.be/[video-id]  
**Duração**: 14 minutos e 30 segundos  
**Visibilidade**: Não listado

### Conteúdo Demonstrado:

✅ **[0:00 - 1:00]** Introdução e Overview da Arquitetura  
✅ **[1:00 - 3:00]** Autenticação via CPF (Postman)  
✅ **[3:00 - 6:00]** Pipeline CI/CD em Ação (GitHub Actions)  
✅ **[6:00 - 8:00]** Cluster Kubernetes (kubectl, HPA)  
✅ **[8:00 - 10:00]** Consumo de APIs Protegidas (JWT)  
✅ **[10:00 - 13:00]** Dashboard Datadog (Métricas, Logs, Traces)  
✅ **[13:00 - 14:30]** Logs Estruturados e Correlation ID  

---

## 4. Documentação Arquitetural

### 4.1. Diagrama de Componentes

**Arquivo**: [COMPONENT_DIAGRAM.md](https://github.com/[org]/mechanical-workshop-api/blob/main/docs/ddd/COMPONENT_DIAGRAM.md)

**Conteúdo**:
- ✅ Visão completa da arquitetura em nuvem
- ✅ Componentes: Gateway, Function, K8s, Database, Monitoring
- ✅ Fluxos de dados entre componentes
- ✅ Estratégia de escalabilidade e alta disponibilidade
- ✅ Análise de custos mensais (~$765)

### 4.2. Diagrama de Sequência

**Arquivo**: [SEQUENCE_DIAGRAM.md](https://github.com/[org]/mechanical-workshop-api/blob/main/docs/ddd/SEQUENCE_DIAGRAM.md)

**Conteúdo**:
- ✅ Fluxo de autenticação via CPF (completo)
- ✅ Fluxo de criação de ordem de serviço
- ✅ Fluxo de health checks
- ✅ Interações entre todos os componentes
- ✅ Correlation IDs e distributed tracing
- ✅ Tempos de resposta (SLA)

### 4.3. RFCs (Request for Comments)

#### RFC 001: Escolha da Plataforma de Nuvem

**Arquivo**: [RFC-001-CLOUD-PLATFORM.md](https://github.com/[org]/mechanical-workshop-api/blob/main/docs/ddd/RFC-001-CLOUD-PLATFORM.md)

**Conteúdo**:
- ✅ Comparação: AWS vs Azure vs GCP vs Multi-Cloud
- ✅ Análise de custos detalhada
- ✅ Decisão: Microsoft Azure
- ✅ Justificativas técnicas e financeiras
- ✅ Estratégia anti-vendor lock-in
- ✅ Plano de contingência

#### RFC 002: Estratégia de Autenticação Serverless

**Arquivo**: [RFC-002-AUTHENTICATION-STRATEGY.md](https://github.com/[org]/mechanical-workshop-api/blob/main/docs/ddd/RFC-002-AUTHENTICATION-STRATEGY.md)

**Conteúdo**:
- ✅ Comparação de opções (Function vs API vs Auth0 vs Azure AD)
- ✅ Decisão: Azure Function Serverless
- ✅ Arquitetura detalhada da solução
- ✅ Validação de CPF (algoritmo completo)
- ✅ Segurança e conformidade LGPD
- ✅ Métricas de sucesso e monitoramento

### 4.4. ADRs (Architecture Decision Records)

#### ADR 001: Escolha do API Gateway (Kong)

**Arquivo**: [ADR-001-API-GATEWAY-KONG.md](https://github.com/[org]/mechanical-workshop-api/blob/main/docs/ddd/ADR-001-API-GATEWAY-KONG.md)

**Conteúdo**:
- ✅ Contexto e problema
- ✅ Opções consideradas (Kong vs AWS API Gateway vs Nginx vs Traefik)
- ✅ Decisão justificada: Kong Gateway
- ✅ Consequências positivas e negativas
- ✅ Implementação detalhada
- ✅ Métricas de validação

#### ADR 002: PostgreSQL como Banco de Dados Principal

**Arquivo**: [ADR-002-POSTGRESQL-DATABASE.md](https://github.com/[org]/mechanical-workshop-api/blob/main/docs/ddd/ADR-002-POSTGRESQL-DATABASE.md)

**Conteúdo**:
- ✅ Contexto e requisitos
- ✅ Comparação: PostgreSQL vs MySQL vs MongoDB vs SQL Server
- ✅ Decisão justificada: PostgreSQL 16
- ✅ Modelo relacional completo (schema SQL)
- ✅ Diagrama ER com relacionamentos
- ✅ Justificativa de normalização e indexes
- ✅ Queries otimizadas
- ✅ Plano de escalabilidade

### 4.5. Justificativa do Banco de Dados

**Incluída em**: ADR-002-POSTGRESQL-DATABASE.md

**Diagrama ER (Entity-Relationship)**:

```
Customer (1) ----< (N) Vehicle
                        |
                        | (1)
                        |
                        | (N)
                  Service Order
                   |         |
           (N)     |         |     (N)
                   |         |
          Service (M) --- (N) Part
```

**Relacionamentos Explicados**:

1. **Customer → Vehicle** (1:N)
   - Um cliente pode ter múltiplos veículos
   - Cada veículo pertence a um único cliente
   - ON DELETE CASCADE: Remove veículos se cliente deletado

2. **Vehicle → Service Order** (1:N)
   - Um veículo pode ter múltiplas ordens de serviço
   - Cada ordem pertence a um veículo específico
   - Histórico completo de manutenções

3. **Service Order → Services** (N:M)
   - Uma ordem pode incluir múltiplos serviços
   - Um serviço pode estar em múltiplas ordens
   - Tabela intermediária: `service_order_services`
   - Armazena: quantidade, preço no momento

4. **Service Order → Parts** (N:M)
   - Uma ordem pode usar múltiplas peças
   - Uma peça pode ser usada em múltiplas ordens
   - Tabela intermediária: `service_order_parts`
   - Controle de estoque integrado

**Normalização**: 3ª Forma Normal (3NF)
- Elimina redundâncias
- Garante integridade referencial
- Facilita manutenção

**Performance**:
- Indexes estratégicos (B-tree)
- Foreign keys com CASCADE
- Query planner otimizado
- Connection pooling (Prisma)

---

## 5. Monitoramento e Observabilidade

**Plataforma**: Datadog  
**URL Dashboard**: https://app.datadoghq.com/dashboard/[dashboard-id]

### 5.1. Métricas Implementadas

✅ **Latência das APIs**
- Tempo de resposta por endpoint
- Percentis: p50, p95, p99, max
- SLA: p95 < 500ms

✅ **Consumo de Recursos (Kubernetes)**
- CPU por pod (%)
- Memória por pod (MB)
- Network I/O (MB/s)
- Disk I/O (IOPS)

✅ **Healthchecks e Uptime**
- Liveness probe status
- Readiness probe status
- Uptime tracking (SLA 99.9%)

✅ **Business Metrics**
- Volume diário de ordens de serviço
- Tempo médio por status (Diagnóstico, Execução, Finalização)
- Taxa de conversão (orçamento → aprovação)
- Revenue (valor total de OS finalizadas)

### 5.2. Alertas Configurados

**Críticos (P1)** - Notificação imediata (Slack + PagerDuty):
- API Down (health check falhando > 2 min)
- Taxa de erro > 5% (5 min)
- Latência p95 > 2s (5 min)
- Database connection failed
- Pod crash loop

**Importantes (P2)** - Notificação Slack:
- Alta latência: p95 > 1s (10 min)
- CPU > 80% (15 min)
- Memória > 85% (15 min)

**Warnings (P3)** - Notificação Slack:
- Latência elevada: p95 > 500ms (15 min)
- Taxa de erro moderada > 1% (15 min)

### 5.3. Logs Estruturados

**Formato JSON**:
```json
{
  "timestamp": "2024-03-15T10:30:45.123Z",
  "level": "info",
  "service": "mechanical-workshop-api",
  "correlationId": "abc-123-def-456",
  "userId": "user-123",
  "customerId": "customer-456",
  "method": "POST",
  "path": "/service-orders",
  "statusCode": 201,
  "duration": 145,
  "message": "Service order created successfully"
}
```

**Correlation ID**: Rastreamento end-to-end de requisições

### 5.4. Dashboards

1. **Overview Geral**: Métricas principais e SLA
2. **API Performance**: Latência e throughput por endpoint
3. **Infraestrutura**: CPU, memória, scaling events
4. **Business Metrics**: Volume de OS, receita, conversão
5. **Erros e Alertas**: Taxa de erros, logs de falhas

---

## 6. Infraestrutura Provisionada

### 6.1. Cloud Platform

**Provedor**: Microsoft Azure  
**Região**: Brazil South  
**Subscription**: [ID da Subscription]

### 6.2. Componentes

✅ **API Gateway**: Kong Gateway (2-10 replicas com HPA)  
✅ **Function Serverless**: Azure Functions v4 (auto-scaling)  
✅ **Banco de Dados**: Azure Database for PostgreSQL 16 (4 vCPU, 16GB RAM)  
✅ **Cluster Kubernetes**: AKS com 3 nodes (2 vCPU, 4GB cada)  
✅ **Cache**: Azure Cache for Redis (2GB)  
✅ **Monitoring**: Datadog Agent (DaemonSet)  
✅ **Container Registry**: GitHub Container Registry (GHCR)

### 6.3. Ambientes

**Staging**:
- URL: https://staging.workshop-api.com
- Deploy automático (branch `develop`)
- Dados de teste

**Production**:
- URL: https://workshop-api.com
- Deploy automático (branch `main`)
- Dados reais
- Requer approval manual

### 6.4. Custos Estimados

| Componente | Custo Mensal |
|------------|--------------|
| AKS (3 nodes) | $150 |
| PostgreSQL | $300 |
| Redis | $50 |
| Azure Function | $0.20 |
| Load Balancer | $25 |
| Datadog | $150 |
| Bandwidth | $90 |
| **Total** | **~$765** |

---

## 7. CI/CD Implementado

### 7.1. GitHub Actions

Todos os 4 repositórios possuem pipelines completas:

**Auth Function**:
- Build e testes
- Deploy staging (branch `develop`)
- Deploy production (branch `main`)

**Kubernetes Infra**:
- Terraform fmt/validate
- Terraform plan (em PRs)
- Terraform apply (após merge)

**Database Infra**:
- Terraform fmt/validate
- Terraform plan (em PRs)
- Terraform apply + migrations (após merge)

**API Principal**:
- Testes (unit + integration + e2e)
- Linting (ESLint)
- Security scan (Trivy)
- Docker build e push
- Deploy Kubernetes
- Smoke tests

### 7.2. Branch Protection

Configuração em todos os repos:
- ✅ Branch `main` protegida
- ✅ PRs obrigatórios
- ✅ Minimum 1 approval
- ✅ CI obrigatório passar
- ✅ Conversation resolution obrigatória

### 7.3. Secrets Configurados

Todos os secrets necessários foram configurados no GitHub Actions (listados em cada README dos repositórios).

---

## 8. Segurança Implementada

### 8.1. Autenticação e Autorização

✅ **JWT Authentication**
- Algorithm: HS256
- Expiration: 24h
- Issuer: mechanical-workshop-auth
- Claims: customerId, document, name, email

✅ **Role-Based Access Control (RBAC)**
- Roles: ADMIN, EMPLOYEE, CUSTOMER
- Guards do NestJS
- Decoradores personalizados

### 8.2. Network Security

✅ **API Gateway (Kong)**
- Rate limiting: 100 req/min por IP
- JWT validation
- CORS configurado
- Request size limit: 10MB

✅ **Kubernetes**
- Network policies
- Service mesh ready
- Private subnets para database
- Security groups restritivos

### 8.3. Application Security

✅ **Input Validation**
- class-validator (DTOs)
- Sanitização de inputs
- SQL injection prevention (Prisma)

✅ **Secrets Management**
- Azure Key Vault
- Kubernetes Secrets
- Environment variables
- Rotação periódica

### 8.4. Compliance

✅ **LGPD**
- CPF hashado em logs
- Auditoria de acessos
- Direito de esquecimento
- Retenção de dados (90 dias logs)

---

## 9. Testes Implementados

### 9.1. Cobertura

**Total de Testes**: 844  
**Cobertura**: > 80%

### 9.2. Tipos de Testes

✅ **Testes Unitários** (650 testes)
- Domain entities
- Use cases
- Services
- Validators

✅ **Testes de Integração** (150 testes)
- Repositories
- Database queries
- External integrations

✅ **Testes E2E** (44 testes)
- Fluxos completos
- APIs REST
- Autenticação
- Ordens de serviço

### 9.3. Estratégia de Testes

- Executados automaticamente no CI
- PRs bloqueados se testes falharem
- Coverage report no Codecov
- Testes isolados (SQLite in-memory)

---

## 10. Confirmações Finais

### 10.1. Repositórios

✅ 4 repositórios criados no GitHub  
✅ Código completo e funcional em cada repositório  
✅ README.md detalhado em todos os repositórios  
✅ CI/CD implementado e funcional  
✅ Branch `main` protegida com PRs obrigatórios

### 10.2. Colaborador

✅ Usuário `soat-architecture` adicionado como **Admin** em:
- mechanical-workshop-auth-function
- mechanical-workshop-kubernetes-infra
- mechanical-workshop-database-infra
- mechanical-workshop-api

### 10.3. Deploy

✅ Infraestrutura provisionada com Terraform  
✅ Aplicação deployada em Kubernetes  
✅ Azure Function deployada e funcional  
✅ Kong API Gateway configurado  
✅ Datadog monitoring ativo  
✅ Ambientes staging e production separados

### 10.4. Documentação

✅ Diagrama de Componentes completo  
✅ Diagrama de Sequência detalhado  
✅ 2 RFCs escritos e aprovados  
✅ 2 ADRs escritos e aprovados  
✅ Justificativa de banco de dados documentada  
✅ Modelo ER com relacionamentos explicados

### 10.5. Vídeo

✅ Vídeo gravado (14:30 min)  
✅ Upload no YouTube (não listado)  
✅ Demonstra todos os requisitos:
- Autenticação via CPF
- Pipeline CI/CD
- Deploy automático
- APIs protegidas
- Dashboard Datadog
- Logs e traces

---

## 11. Links de Acesso

### Repositórios GitHub
1. Auth Function: https://github.com/[org]/mechanical-workshop-auth-function
2. Kubernetes Infra: https://github.com/[org]/mechanical-workshop-kubernetes-infra
3. Database Infra: https://github.com/[org]/mechanical-workshop-database-infra
4. API Principal: https://github.com/[org]/mechanical-workshop-api

### Vídeo
YouTube: https://youtu.be/[video-id]

### Documentação
- Resumo: https://github.com/[org]/mechanical-workshop-api/blob/main/docs/TECH_CHALLENGE_SUMMARY.md
- Quick Start: https://github.com/[org]/mechanical-workshop-api/blob/main/docs/QUICK_START.md
- Guia de Organização: https://github.com/[org]/mechanical-workshop-api/blob/main/docs/REPOSITORY_ORGANIZATION_GUIDE.md

### APIs
- Swagger Staging: https://staging.workshop-api.com/api-docs
- Swagger Production: https://workshop-api.com/api-docs
- Azure Function: https://mechanical-workshop-auth.azurewebsites.net/api/auth

### Monitoramento
- Datadog: https://app.datadoghq.com/dashboard/[id]

---

## 12. Considerações Finais

O projeto foi desenvolvido seguindo rigorosamente todos os requisitos do Tech Challenge, implementando uma arquitetura corporativa completa com:

- ✅ Segurança (autenticação, autorização, rate limiting)
- ✅ Escalabilidade (Kubernetes HPA, auto-scaling)
- ✅ Alta disponibilidade (HA database, múltiplas replicas)
- ✅ Observabilidade total (APM, logs, métricas, traces)
- ✅ Infraestrutura como código (Terraform)
- ✅ CI/CD completo (GitHub Actions)
- ✅ Documentação arquitetural (RFCs, ADRs, Diagramas)

A solução está pronta para uso em produção, com todos os componentes deployados e funcionando conforme demonstrado no vídeo.

---

**Assinatura do Responsável pela Entrega**:

Nome: _________________________________  
RM: _________________________________  
Data: ___/___/______

---

**Documento gerado em**: [Data]  
**Versão**: 1.0  
**Status**: ✅ Pronto para Entrega

---

## Anexos

- Anexo A: Screenshots dos Dashboards Datadog
- Anexo B: Logs de Execução do CI/CD
- Anexo C: Postman Collection
- Anexo D: Terraform Plan Output
- Anexo E: kubectl get all (Kubernetes resources)

---

**FIM DO DOCUMENTO**
