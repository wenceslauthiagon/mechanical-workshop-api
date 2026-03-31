# Diagrama de Componentes - Sistema de Oficina Mecânica

## Visão Geral da Arquitetura em Nuvem

```mermaid
graph TB
    subgraph "Usuários"
        CLIENT[Cliente Mobile/Web]
        EMPLOYEE[Funcionário]
    end

    subgraph "Internet"
        DNS[DNS/Route53]
    end

    subgraph "API Gateway Layer"
        KONG[Kong API Gateway<br/>Load Balancer]
        WAF[Web Application Firewall]
    end

    subgraph "Azure Serverless"
        AUTHFN[Azure Function<br/>CPF Authentication<br/>JWT Generation]
    end

    subgraph "Kubernetes Cluster - AKS/EKS/GKE"
        subgraph "Ingress"
            INGRESS[Nginx Ingress Controller]
        end

        subgraph "Application Pods"
            APP1[Workshop API Pod 1<br/>NestJS + TypeScript]
            APP2[Workshop API Pod 2<br/>NestJS + TypeScript]
            APP3[Workshop API Pod 3<br/>NestJS + TypeScript]
            HPA[Horizontal Pod Autoscaler<br/>Min: 2, Max: 10]
        end

        subgraph "Monitoring"
            DD_AGENT[Datadog Agent<br/>DaemonSet]
            PROM[Prometheus]
        end
    end

    subgraph "Managed Database - Azure/AWS/GCP"
        POSTGRES[(PostgreSQL 16<br/>Managed Database<br/>HA + Read Replicas)]
        REDIS[(Redis 7<br/>Managed Cache)]
    end

    subgraph "Monitoring & Observability"
        DATADOG[Datadog Platform<br/>APM + Logs + Metrics]
        DASHBOARD[Custom Dashboards]
        ALERTS[Alert Manager]
    end

    subgraph "CI/CD Pipeline"
        GITHUB[GitHub]
        ACTIONS[GitHub Actions]
        GHCR[GitHub Container Registry]
    end

    subgraph "Infrastructure as Code"
        TF_K8S[Terraform<br/>Kubernetes Cluster]
        TF_DB[Terraform<br/>Managed Database]
    end

    CLIENT --> DNS
    EMPLOYEE --> DNS
    DNS --> WAF
    WAF --> KONG
    
    KONG -->|/auth| AUTHFN
    KONG -->|/api/*| INGRESS
    
    AUTHFN --> POSTGRES
    
    INGRESS --> APP1
    INGRESS --> APP2
    INGRESS --> APP3
    
    HPA -.->|scales| APP1
    HPA -.->|scales| APP2
    HPA -.->|scales| APP3
    
    APP1 --> POSTGRES
    APP2 --> POSTGRES
    APP3 --> POSTGRES
    
    APP1 --> REDIS
    APP2 --> REDIS
    APP3 --> REDIS
    
    DD_AGENT -.->|metrics/logs| APP1
    DD_AGENT -.->|metrics/logs| APP2
    DD_AGENT -.->|metrics/logs| APP3
    DD_AGENT --> DATADOG
    
    DATADOG --> DASHBOARD
    DATADOG --> ALERTS
    
    GITHUB --> ACTIONS
    ACTIONS -->|build/push| GHCR
    ACTIONS -->|deploy| INGRESS
    
    TF_K8S -.->|provisions| INGRESS
    TF_DB -.->|provisions| POSTGRES

    style KONG fill:#f9f,stroke:#333,stroke-width:4px
    style AUTHFN fill:#bbf,stroke:#333,stroke-width:2px
    style POSTGRES fill:#9f9,stroke:#333,stroke-width:2px
    style DATADOG fill:#ff9,stroke:#333,stroke-width:2px
    style APP1 fill:#9ff,stroke:#333,stroke-width:2px
    style APP2 fill:#9ff,stroke:#333,stroke-width:2px
    style APP3 fill:#9ff,stroke:#333,stroke-width:2px
```

## Detalhamento dos Componentes

### 1. Camada de Entrada
- **DNS**: Gerenciamento de domínios e roteamento
- **WAF**: Proteção contra ataques web (SQL Injection, XSS, etc)
- **Kong API Gateway**: 
  - Rate limiting (100 req/min por IP)
  - JWT validation
  - Request/Response transformation
  - Correlation ID injection
  - CORS handling

### 2. Autenticação Serverless
- **Azure Function**:
  - Trigger HTTP POST
  - Validação de CPF (algoritmo completo)
  - Consulta PostgreSQL
  - Geração JWT (HS256)
  - Cold start: ~200ms
  - Warm: ~50ms

### 3. Cluster Kubernetes
- **Managed Kubernetes**: AKS (Azure), EKS (AWS) ou GKE (Google)
- **Namespace**: `workshop` (isolamento lógico)
- **Ingress**: Nginx para roteamento interno
- **HPA**: Escala baseado em CPU (70%) e Memória (80%)
- **Resources**:
  - Request: 250m CPU, 512Mi RAM
  - Limit: 500m CPU, 1Gi RAM

### 4. Aplicação (NestJS)
- **Clean Architecture** (4 camadas)
- **Domain-Driven Design**
- **SOLID Principles**
- **844 testes automatizados**
- **Swagger/OpenAPI**
- **Health checks**: `/health`

### 5. Banco de Dados Gerenciado
- **PostgreSQL 16**:
  - HA (High Availability) com failover automático
  - Read replicas para leitura
  - Backup diário com retenção de 30 dias
  - Point-in-time recovery
  - SSL/TLS obrigatório
- **Redis 7**:
  - Cache de sessões
  - Cache de queries frequentes
  - TTL configurável

### 6. Monitoramento (Datadog)
- **APM**: Traces distribuídos
- **Logs**: Agregação e parsing
- **Metrics**: Custom + System
- **Dashboards**: 5 dashboards principais
- **Alerts**: 13 alertas configurados
- **SLA**: 99.9% uptime

### 7. CI/CD
- **GitHub Actions**:
  - Build automático
  - Testes (unit + integration + e2e)
  - Security scan (Trivy)
  - Docker build & push
  - Deploy Kubernetes
  - Rollback automático

### 8. Infrastructure as Code
- **Terraform**:
  - Cluster Kubernetes
  - Managed PostgreSQL
  - Redis
  - Networking (VPC, Subnets, Security Groups)
  - IAM/RBAC

## Fluxos de Dados

### Fluxo de Autenticação
```
Cliente -> Kong -> Azure Function -> PostgreSQL -> JWT -> Cliente
```

### Fluxo de Requisição Protegida
```
Cliente -> Kong (JWT validation) -> Ingress -> API Pod -> PostgreSQL -> Response
```

### Fluxo de Monitoramento
```
API Pod -> Datadog Agent -> Datadog Platform -> Dashboard/Alerts
```

## Escalabilidade

### Horizontal Pod Autoscaler
- **Min Replicas**: 2
- **Max Replicas**: 10
- **Métricas**:
  - CPU > 70% → Scale up
  - Memory > 80% → Scale up
  - CPU < 30% (5 min) → Scale down

### Database Scaling
- **Vertical**: Aumentar CPU/RAM da instância
- **Horizontal**: Read replicas para queries de leitura
- **Connection Pooling**: Prisma (max 10 conexões por pod)

## Alta Disponibilidade

### Application Layer
- Múltiplos pods (min 2)
- Health checks (liveness + readiness)
- Graceful shutdown (30s)
- Zero-downtime deployments (rolling update)

### Database Layer
- HA nativo do managed database
- Failover automático (< 30s)
- Backups diários
- Point-in-time recovery

### Network Layer
- Load balancer com health checks
- Multi-AZ deployment
- DDoS protection

## Segurança

### Network
- VPC isolada
- Security Groups restritivos
- TLS/SSL obrigatório
- Private subnets para database

### Application
- JWT authentication
- Role-based access control (RBAC)
- Input validation (class-validator)
- SQL injection prevention (Prisma)
- Rate limiting (Kong)

### Secrets Management
- Kubernetes Secrets
- Azure Key Vault / AWS Secrets Manager
- Rotação automática de credentials
- Encryption at rest

## Custos Estimados (Mensal)

| Componente | Recurso | Custo (USD) |
|------------|---------|-------------|
| Kubernetes | 3 nodes (2 vCPU, 4GB) | $150 |
| PostgreSQL | Managed DB (4 vCPU, 16GB) | $300 |
| Redis | Managed Cache (2GB) | $50 |
| Azure Function | 1M executions | $0.20 |
| Load Balancer | Standard | $25 |
| Datadog | Pro plan (10 hosts) | $150 |
| Bandwidth | 1TB egress | $90 |
| **Total** | | **~$765** |

## Próximos Passos

1. ✅ Implementar API Gateway (Kong)
2. ✅ Configurar Azure Function
3. ✅ Setup Datadog
4. ✅ CI/CD completo
5. 🔄 Multi-region deployment
6. 🔄 Disaster recovery plan
7. 🔄 Performance testing (load tests)
