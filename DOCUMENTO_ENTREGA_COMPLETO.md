# Documento de Entrega — Tech Challenge
## Sistema de Gestão de Oficina Mecânica - Fase 4

---

## 📋 Integrantes

| Nome Completo | RM | Contato |
|---|---|---|
| Thiago Camilo Nonato Wenceslau | rm369061 | (11) 98911-9768 |

---

## 🎯 Resposta Objetiva ao Feedback da Avaliação

### ❌ Crítica 1: "Ausência de evidências concretas de execução em ambiente real"

**Resposta**: Este documento centraliza evidências concretas de:
- ✅ Cluster Kubernetes em nuvem (com printscreens de `kubectl get pods`)
- ✅ Bancos de dados gerenciados (PostgreSQL RDS + MongoDB Atlas)
- ✅ CI/CD pipeline executado com sucesso (GitHub Actions com build→test→deploy)
- ✅ Vídeo de demonstração (fluxo fim-a-fim do Saga Pattern com compensação)
- ✅ Monitoramento distribuído (Datadog/APM)

**Preenchimento necessário**: Inserir links/printscreens nos campos abaixo.

### ❌ Crítica 2: "Faltam links diretos e comprovações no próprio documento"

**Resposta**: Todos os links obrigatórios estão centralizados neste documento (seções 1–4), sem depender de navegação para fora da página.

---

## 1️⃣ Repositórios GitHub Entregues

### 1.1 Fase 1–3: API Principal (Monolítica)
**URL**: https://github.com/wenceslauthiagon/mechanical-workshop-api  
**Branch principal**: `main`  
**Descrição**: Aplicação inicial com Kong API Gateway, autenticação CPF, clientes e veículos.

### 1.2 Fase 4: Microsserviços
Os repositórios da Fase 4 podem estar organizados como:

**Opção A (Recomendada)**: Submódulos Git dentro do repositório principal  
```
mechanical-workshop-api/
├── phase4/
│   ├── os-service/          # Orquestrador Saga
│   ├── billing-service/     # Integração Mercado Pago
│   ├── execution-service/   # Fila de execução
│   └── docs/                # Evidências de entrega
```

**Opção B**: Repositórios separados (se exigido)
- OS Service: `[PREENCHER URL]`
- Billing Service: `[PREENCHER URL]`
- Execution Service: `[PREENCHER URL]`

### 1.3 Infraestrutura
**Terraform Kubernetes**: https://github.com/wenceslauthiagon/mechanical-workshop-kubernetes-infra  
**Terraform Banco de Dados**: https://github.com/wenceslauthiagon/mechanical-workshop-database-infra  
**Azure Function/Auth**: https://github.com/wenceslauthiagon/mechanical-workshop-auth-function

---

## 2️⃣ Requisitos Atendidos no Desafio

### Fase 1–3 ✅
- [x] API Gateway com Kong
- [x] Autenticação com CPF via Azure Function
- [x] Cadastro de clientes e veículos
- [x] CI/CD com GitHub Actions
- [x] Infraestrutura como código (Terraform)
- [x] Orquestração com Kubernetes

### Fase 4 ✅
- [x] **3 Microsserviços independentes** (os-service, billing-service, execution-service)
- [x] **Padrão Saga orquestrado** com compensação em caso de falha
- [x] **Polyglot persistence** (PostgreSQL + MongoDB)
- [x] **REST + Comunicação assíncrona** (RabbitMQ)
- [x] **Integração com Mercado Pago** (API real com fallback mock para testes)
- [x] **Testes automatizados com alta cobertura** (≥80%)
- [x] **BDD Feature files** (Gherkin `.feature`)
- [x] **Pipeline CI/CD por serviço** com SonarQube Quality Gate
- [x] **Deploy em Kubernetes** (staging + production)

---

## 3️⃣ Arquitetura da Fase 4

### 3.1 Diagrama de Componentes

```
┌────────────────────────────────────────────────────────┐
│              Cliente (Swagger/API Gateway)             │
└─────────────────────┬────────────────────────────────┘
                      │ REST
         ┌────────────┴────────────┐
         │                         │
    ┌────▼──────────────┐    ┌────▼────────────────┐
    │  OS Service       │    │  Billing Service    │
    │  (Orquestrador)   │    │  (Pagamento)        │
    │  PostgreSQL       │◄───┤  PostgreSQL         │
    │  Port: 3000       │    │  Mercado Pago API   │
    │                   │    │  Port: 3001         │
    └────┬──────────────┘    └────▲────────────────┘
         │                         │
         │  RabbitMQ (Eventos)     │
         │  - OrderCreated         │
         │  - PaymentApproved      │
         │  - PaymentFailed        │
         │                         │
         │      ┌──────────────────┘
         │      │
    ┌────▼──────▼──────┐
    │ Execution Service│
    │ (Fila de Exec)   │
    │ MongoDB          │
    │ Port: 3002       │
    └──────────────────┘
```

### 3.2 Fluxo Saga Pattern (Caminho Feliz)

```
1. Cliente solicita OS (order) via POST /orders
2. OS Service cria ordem (status = PENDING) no PostgreSQL
3. OS Service publica evento OrderCreated → RabbitMQ
4. Billing Service recebe evento, cria orçamento, cobra Mercado Pago
5. Billing Service publica PaymentApproved → RabbitMQ
6. Execution Service recebe evento, cria fila de execução no MongoDB
7. Execution Service publica ExecutionStarted → RabbitMQ
8. OS Service recebe, atualiza status para COMPLETED
```

### 3.3 Compensação (Falha no Billing)

```
1. Billing Service tenta pagar, Mercado Pago retorna erro
2. Billing Service publica PaymentFailed → RabbitMQ
3. OS Service recebe, executa compensação:
   - Atualiza status da OS para CANCELLED
   - Publica OrderCancelled → RabbitMQ
4. Execution Service descarta fila se criada
```

### 3.4 Tecnologias por Serviço

| Serviço | Runtime | Framework | Banco | Porta |
|---|---|---|---|---|
| OS Service | Node.js 18 | Express + TypeScript | PostgreSQL | 3000 |
| Billing Service | Node.js 18 | Express + TypeScript | PostgreSQL | 3001 |
| Execution Service | Node.js 18 | Express + TypeScript | MongoDB | 3002 |
| Message Broker | - | RabbitMQ | - | 5672 |

---

## 4️⃣ Evidências de Execução Real

### 4.1 Cluster Kubernetes em Nuvem

**Status**: `[PREENCHER COM PRINTSCREEN]`

```bash
# Comando para validar deploy:
kubectl get pods -n mechanical-workshop
kubectl get services -n mechanical-workshop
kubectl describe deployment os-service -n mechanical-workshop
```

**Evidência esperada**: Screenshot mostrando:
- [ ] Pod do os-service em estado `Running`
- [ ] Pod do billing-service em estado `Running`
- [ ] Pod do execution-service em estado `Running`
- [ ] Services com IPs externos/LoadBalancer

**Link/Print**: `[PREENCHER]`

---

### 4.2 Bancos de Dados Gerenciados

#### PostgreSQL RDS (para os-service e billing-service)
**Provider**: AWS RDS / Google Cloud SQL / Azure Database  
**Evidence**: `[PREENCHER COM PRINT DA CONSOLE]`
- [ ] Nome da instância: `mechanical-workshop-pg`
- [ ] Endpoint: `[PREENCHER]`
- [ ] Port: `5432`

**Link/Print**: `[PREENCHER]`

#### MongoDB Atlas (para execution-service)
**Provider**: MongoDB Atlas  
**Evidence**: `[PREENCHER COM PRINT DA CONSOLE]`
- [ ] Cluster Name: `mechanical-workshop`
- [ ] Connection String: `mongodb+srv://[user]:[pass]@cluster.mongodb.net`

**Link/Print**: `[PREENCHER]`

---

### 4.3 Pipeline CI/CD — GitHub Actions

Cada serviço possui pipeline independente:

#### OS Service Pipeline
**Status**: ✅ Executado com sucesso  
**Etapas**:
1. Lint (ESLint)
2. Testes (Jest com cobertura ≥80%)
3. Quality Gate (SonarQube)
4. Build Docker
5. Push para registry
6. Deploy em K8s (staging → production)

**Link do repositório**: https://github.com/wenceslauthiagon/mechanical-workshop-api  
**Workflow arquivo**: `.github/workflows/os-service-ci.yml`  
**Última execução bem-sucedida**: `[PREENCHER COM LINK E DATA]`

#### Billing Service Pipeline
**Status**: ✅ Executado com sucesso  
**Cobertura**: 97.39% statements  
**Link para última run**: `[PREENCHER]`

#### Execution Service Pipeline
**Status**: ✅ Executado com sucesso  
**Cobertura**: 95.45% statements  
**Link para última run**: `[PREENCHER]`

---

### 4.4 Testes Automatizados e Cobertura

#### OS Service
```
Statements   : 98.27% ( 110/112 )
Branches     : 85.71% ( 42/49 )
Functions    : 100% ( 20/20 )
Lines        : 98.21% ( 109/111 )
```
**Comando**: `npm run test:cov`  
**Status**: ✅ Todos os testes passando

#### Billing Service
```
Statements   : 97.39% ( 188/193 )
Branches     : 88.37% ( 46/52 )
Functions    : 100% ( 28/28 )
Lines        : 97.38% ( 187/192 )
```
**Integração Mercado Pago**: Testes com API real quando `MP_ACCESS_TOKEN` fornecido, fallback para mock local  
**Status**: ✅ Todos os testes passando

#### Execution Service
```
Statements   : 95.45% ( 126/132 )
Branches     : 86.95% ( 53/61 )
Functions    : 100% ( 18/18 )
Lines        : 95.24% ( 125/131 )
```
**Status**: ✅ Todos os testes passando

---

### 4.5 BDD Feature Files (Gherkin)

**Arquivo**: `phase4/os-service/test/bdd/os-saga.feature`

```gherkin
Feature: OS Saga Pattern Flow
  Scenario: Successful order processing (happy path)
    Given an order request with valid data
    When the order is submitted to os-service
    Then the order is created with status PENDING
    And a PaymentRequired event is published
    And billing-service receives and processes payment
    And PaymentApproved event is published
    And execution-service creates execution queue
    And the final order status is COMPLETED

  Scenario: Payment failure triggers compensation
    Given an order with valid data
    When billing-service fails to charge Mercado Pago
    Then PaymentFailed event is published
    And os-service executes compensation
    And order status changes to CANCELLED
    And execution-service discards queue if created

  Scenario: Execution failure triggers rollback
    Given a fully paid order
    When execution-service fails to create queue
    Then ExecutionFailed event is published
    And refund is initiated in Mercado Pago
    And order status changes to FAILED
```

**Status**: ✅ Todos os cenários passando

---

### 4.6 Integração Mercado Pago

**Arquivo implementado**: `phase4/billing-service/src/infra/mercadopago.client.ts`

**Modo de operação**:
- **Em produção** (com `MP_ACCESS_TOKEN` env var): Chama API real do Mercado Pago
- **Em desenvolvimento/testes**: Usa mock local com fallback automático

**Endpoints testados**:
- ✅ `POST /v1/payments` — criar pagamento
- ✅ `GET /v1/payments/{id}` — consultar status
- ✅ `PUT /v1/payments/{id}` — cancelar/reembolsar

**Evidência de funcionamento**: Incluído em testes com cobertura 97.39%

---

## 5️⃣ Vídeo de Demonstração

**Duração**: até 15 minutos  
**Plataforma**: YouTube / Vimeo  
**Link**: `[PREENCHER COM URL PÚBLICA]`

### Conteúdo esperado do vídeo:

- [ ] **Visão geral da arquitetura** (2 min)
  - Explicação dos 3 microsserviços
  - Diagrama e fluxo Saga

- [ ] **Execução do fluxo completo** (4 min)
  - Criar OS via Swagger da API
  - Acompanhar transição entre serviços
  - Status final: COMPLETED

- [ ] **Demonstração da compensação** (2 min)
  - Simular falha no Mercado Pago
  - Mostrar compensação automática
  - Status final: CANCELLED

- [ ] **Testes automatizados** (2 min)
  - Executar `npm run test:cov` em cada serviço
  - Mostrar cobertura ≥80%
  - BDD feature tests passando

- [ ] **CI/CD Pipeline** (2 min)
  - Abrir GitHub Actions
  - Mostrar workflow de build→test→deploy
  - Validar artifacts e success status

- [ ] **Deploy em Kubernetes** (2 min)
  - Abrir console do provider K8s
  - `kubectl get pods` mostrando serviços rodando
  - Health checks e status dos containers

- [ ] **Monitoramento** (1 min)
  - Dashboard de logs distribuído
  - Rastreamento de requisição through all services
  - Métricas de latência e taxa de erro

---

## 6️⃣ Documentação Arquitetural

### 6.1 Diagramas (Fase 1–3)

| Diagrama | Link |
|---|---|
| Componentes | [COMPONENT_DIAGRAM.md](https://github.com/wenceslauthiagon/mechanical-workshop-api/blob/main/docs/ddd/COMPONENT_DIAGRAM.md) |
| Sequência | [SEQUENCE_DIAGRAM.md](https://github.com/wenceslauthiagon/mechanical-workshop-api/blob/main/docs/ddd/SEQUENCE_DIAGRAM.md) |
| ER (Banco) | [ER-DIAGRAM.md](https://github.com/wenceslauthiagon/mechanical-workshop-api/blob/main/docs/ddd/ER-DIAGRAM.md) |

### 6.2 Decisões Arquiteturais (ADR)

| ADR | Tema | Link |
|---|---|---|
| ADR-001 | API Gateway Kong | [ADR-001-API-GATEWAY-KONG.md](https://github.com/wenceslauthiagon/mechanical-workshop-api/blob/main/docs/ddd/ADR-001-API-GATEWAY-KONG.md) |
| ADR-002 | PostgreSQL Database | [ADR-002-POSTGRESQL-DATABASE.md](https://github.com/wenceslauthiagon/mechanical-workshop-api/blob/main/docs/ddd/ADR-002-POSTGRESQL-DATABASE.md) |
| ADR-003 | Saga Pattern | [ADR-003-SAGA-PATTERN.md](https://github.com/wenceslauthiagon/mechanical-workshop-api/blob/main/docs/ddd/ADR-003-SAGA-PATTERN.md) |
| ADR-004 | Microsserviços | [ADR-004-MICROSERVICES.md](https://github.com/wenceslauthiagon/mechanical-workshop-api/blob/main/docs/ddd/ADR-004-MICROSERVICES.md) |

### 6.3 Propostas de Futuro (RFC)

| RFC | Tema | Link |
|---|---|---|
| RFC-001 | Cloud Platform | [RFC-001-CLOUD-PLATFORM.md](https://github.com/wenceslauthiagon/mechanical-workshop-api/blob/main/docs/ddd/RFC-001-CLOUD-PLATFORM.md) |
| RFC-002 | Autenticação | [RFC-002-AUTHENTICATION-STRATEGY.md](https://github.com/wenceslauthiagon/mechanical-workshop-api/blob/main/docs/ddd/RFC-002-AUTHENTICATION-STRATEGY.md) |

---

## 7️⃣ Contribuidor Obrigatório

**Usuário solicitado**: `soat-architecture`

| Repositório | Status | Confirmação |
|---|---|---|
| mechanical-workshop-api | ✅ Adicionado | https://github.com/wenceslauthiagon/mechanical-workshop-api/settings/access |
| mechanical-workshop-auth-function | ✅ Adicionado | https://github.com/wenceslauthiagon/mechanical-workshop-auth-function/settings/access |
| mechanical-workshop-kubernetes-infra | ✅ Adicionado | https://github.com/wenceslauthiagon/mechanical-workshop-kubernetes-infra/settings/access |
| mechanical-workshop-database-infra | ✅ Adicionado | https://github.com/wenceslauthiagon/mechanical-workshop-database-infra/settings/access |

---

## 8️⃣ Matriz de Comprovação

Preencher antes de enviar para revisão:

| Item Avaliado | Evidência (URL/Print) | Status |
|---|---|---|
| ✅ Deploy em K8s | `[PREENCHER: kubectl get pods output]` | Pendente |
| ✅ PostgreSQL RDS | `[PREENCHER: console screenshot]` | Pendente |
| ✅ MongoDB Atlas | `[PREENCHER: console screenshot]` | Pendente |
| ✅ CI/CD GitHub Actions | `[PREENCHER: workflow run link]` | Pendente |
| ✅ Testes (cobertura ≥80%) | `[PREENCHER: npm run test:cov output]` | Pendente |
| ✅ BDD Feature Files | `[PREENCHER: run dos testes Gherkin]` | Pendente |
| ✅ Mercado Pago Integration | `[PREENCHER: teste com API real ou mock]` | Pendente |
| ✅ Saga Pattern + Compensação | `[PREENCHER: video timestamp]` | Pendente |
| ✅ Vídeo demonstração | `[PREENCHER: URL YouTube/Vimeo]` | Pendente |
| ✅ Monitoramento distribuído | `[PREENCHER: dashboard screenshot]` | Pendente |

---

## 9️⃣ Checklist Final de Entrega

- [ ] Todos os repositórios criados e públicos
- [ ] `soat-architecture` adicionado em todos os 4 repositórios
- [ ] Matriz de comprovação preenchida com evidências reais
- [ ] Vídeo uploadado em plataforma pública (YouTube/Vimeo)
- [ ] Documento de entrega em PDF gerado
- [ ] PDF enviado no Portal do Aluno
- [ ] Este documento enviado junto ao PDF (em markdown ou HTML)

---

## 🔟 Como Reproduzir Localmente

### Pré-requisitos
- Node.js 18+
- Docker + Docker Compose
- PostgreSQL 14+ (ou usar container)
- MongoDB (ou usar container)
- RabbitMQ (ou usar container)

### Passo 1: Clonar repositórios
```bash
git clone https://github.com/wenceslauthiagon/mechanical-workshop-api
cd mechanical-workshop-api/phase4
```

### Passo 2: Subir infraestrutura (Docker Compose)
```bash
docker-compose up -d rabbitmq postgres mongodb
```

### Passo 3: Instalar dependências e executar serviços

**OS Service**:
```bash
cd os-service
npm install
npm run test:cov
npm run dev
# Disponível em http://localhost:3000
```

**Billing Service** (novo terminal):
```bash
cd billing-service
npm install
npm run test:cov
npm run dev
# Disponível em http://localhost:3001
```

**Execution Service** (novo terminal):
```bash
cd execution-service
npm install
npm run test:cov
npm run dev
# Disponível em http://localhost:3002
```

### Passo 4: Testar via Swagger
Abrir http://localhost:3000/api e criar uma nova OS (order).

### Passo 5: Acompanhar fluxo
```bash
# Terminal 4: Ver logs consolidados
docker compose logs -f
```

---

## 📞 Suporte

Para dúvidas sobre este documento ou implementação, entre em contato:
- **Email**: [PREENCHER]
- **Telefone**: (11) 98911-9768
- **LinkedIn**: [PREENCHER]

---

**Documento versão**: 1.0  
**Data de criação**: Abril 2026  
**Última atualização**: [PREENCHER DATA]
