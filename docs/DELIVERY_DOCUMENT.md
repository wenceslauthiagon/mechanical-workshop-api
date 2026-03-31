# Documento de Entrega — Tech Challenge Fase 5
## Sistema de Gestão de Oficina Mecânica

---

## 1. Identificação do Grupo

**Nome do Grupo:** [INSIRA O NOME DO GRUPO]

**Turma:** [INSIRA A TURMA]

**Participantes:**

| Nome Completo | RM | Discord |
|---|---|---|
| Thiago Camilo Nonato Wenceslau | rm369061 | [Discord do Thiago] |
| Robson | [RM] | [Discord do Robson] |
| [Nome 3] | [RM] | [Discord#3] |

> ⚠️ **Preencha os campos entre colchetes antes de gerar o PDF.**

---

## 2. Repositórios GitHub (4 Repositórios)

### 2.1. Lambda / Function Serverless

**Repositório**: https://github.com/[org]/mechanical-workshop-auth-function

**Propósito**: Azure Function para autenticação via CPF e geração de JWT

**Conteúdo**:
- Azure Function v4 (TypeScript)
- Validação completa de CPF (dígitos verificadores)
- Consulta ao PostgreSQL via Prisma
- Geração de JWT (HS256, 24h)
- CI/CD com GitHub Actions (deploy automático)

---

### 2.2. Infraestrutura Kubernetes (Terraform)

**Repositório**: https://github.com/[org]/mechanical-workshop-kubernetes-infra

**Propósito**: Provisionamento do cluster AKS e manifestos K8s

**Conteúdo**:
- Terraform para Azure Kubernetes Service (AKS)
- Manifestos K8s: deployment, HPA, Kong, Datadog
- CI/CD: terraform plan em PRs, terraform apply no merge

---

### 2.3. Infraestrutura do Banco de Dados (Terraform)

**Repositório**: https://github.com/[org]/mechanical-workshop-database-infra

**Propósito**: Provisionamento do PostgreSQL gerenciado (Azure)

**Conteúdo**:
- Terraform para Azure Database for PostgreSQL 16
- Alta Disponibilidade (Zone Redundant)
- Azure Key Vault para secrets
- CI/CD: terraform apply + prisma migrate deploy automático

---

### 2.4. Aplicação Principal (NestJS)

**Repositório**: https://github.com/[org]/mechanical-workshop-api

**Propósito**: API REST para gestão completa da oficina mecânica

**Conteúdo**:
- NestJS 11 + TypeScript 5
- Clean Architecture + DDD
- 844 testes (unit + integration + e2e) com > 80% cobertura
- CI/CD completo: lint → test → security scan → docker build → deploy K8s

---

## 3. Vídeo de Demonstração

**Plataforma**: YouTube  
**URL**: https://youtu.be/[VIDEO-ID]  
**Duração**: [XX min XX seg]  
**Visibilidade**: Não listado

**Conteúdo demonstrado**:
- [ ] Autenticação com CPF (Azure Function + JWT)
- [ ] Execução da pipeline CI/CD (GitHub Actions)
- [ ] Deploy automatizado (Kubernetes)
- [ ] Consumo de APIs protegidas (com/sem token)
- [ ] Dashboard de monitoramento (Datadog) ao vivo
- [ ] Logs estruturados e traces (correlation ID)

---

## 4. Documentação Arquitetural

**Repositório de referência**: https://github.com/[org]/mechanical-workshop-api/tree/main/docs

| Documento | Link |
|---|---|
| Diagrama de Componentes | [COMPONENT_DIAGRAM.md](https://github.com/[org]/mechanical-workshop-api/blob/main/docs/ddd/COMPONENT_DIAGRAM.md) |
| Diagrama de Sequência | [SEQUENCE_DIAGRAM.md](https://github.com/[org]/mechanical-workshop-api/blob/main/docs/ddd/SEQUENCE_DIAGRAM.md) |
| Diagrama ER | [ER-DIAGRAM.md](https://github.com/[org]/mechanical-workshop-api/blob/main/docs/ddd/ER-DIAGRAM.md) |
| RFC-001: Escolha da Nuvem | [RFC-001-CLOUD-PLATFORM.md](https://github.com/[org]/mechanical-workshop-api/blob/main/docs/ddd/RFC-001-CLOUD-PLATFORM.md) |
| RFC-002: Estratégia de Auth | [RFC-002-AUTHENTICATION-STRATEGY.md](https://github.com/[org]/mechanical-workshop-api/blob/main/docs/ddd/RFC-002-AUTHENTICATION-STRATEGY.md) |
| ADR-001: API Gateway Kong | [ADR-001-API-GATEWAY-KONG.md](https://github.com/[org]/mechanical-workshop-api/blob/main/docs/ddd/ADR-001-API-GATEWAY-KONG.md) |
| ADR-002: PostgreSQL | [ADR-002-POSTGRESQL-DATABASE.md](https://github.com/[org]/mechanical-workshop-api/blob/main/docs/ddd/ADR-002-POSTGRESQL-DATABASE.md) |
| Postman Collection | [Mechanical-Workshop-API.postman_collection.json](https://github.com/[org]/mechanical-workshop-api/blob/main/docs/Mechanical-Workshop-API.postman_collection.json) |

---

## 5. Confirmação do Colaborador `soat-architecture`

O usuário **`soat-architecture`** foi adicionado como **Admin** nos seguintes repositórios:

| Repositório | Status |
|---|---|
| mechanical-workshop-auth-function | [ ] Adicionado |
| mechanical-workshop-kubernetes-infra | [ ] Adicionado |
| mechanical-workshop-database-infra | [ ] Adicionado |
| mechanical-workshop-api | [ ] Adicionado |

> ⚠️ **Marque os checkboxes e delete esta nota após confirmar a adição.**

---

## 6. Relatório de Vulnerabilidades

- Arquivo: [`docs/VULNERABILITY_REPORT_SUMMARY.md`](https://github.com/[org]/mechanical-workshop-api/blob/main/docs/VULNERABILITY_REPORT_SUMMARY.md)

---

## 7. Checklist Final

Antes de entregar, confirme:

- [ ] 4 repositórios criados e públicos (ou com soat-architecture como colaborador)
- [ ] `soat-architecture` adicionado em todos os 4 repos
- [ ] Branch `main` protegida em todos os repos
- [ ] CI/CD funcionando (pelo menos 1 execução verde em cada repo)
- [ ] Vídeo gravado e publicado (YouTube/Vimeo)
- [ ] Link do vídeo preenchido acima
- [ ] Este PDF gerado e enviado no Portal do Aluno

---

## Como Gerar o PDF

```bash
# Com pandoc instalado:
pandoc docs/DELIVERY_DOCUMENT.md -o DELIVERY_DOCUMENT.pdf --pdf-engine=xelatex

# Alternativa: abrir no GitHub e usar Print to PDF do navegador
```

---

**Data de entrega**: ___/___/______

**Assinatura**: _________________________________
