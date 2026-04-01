# Documento de Entrega — Tech Challenge
## Sistema de Gestão de Oficina Mecânica

---

## 1. Identificação do Grupo

**Nome do Grupo:** [PREENCHER]  
**Turma:** [PREENCHER]

### Integrantes

| Nome Completo | RM | Contato |
|---|---|---|
| Thiago Camilo Nonato Wenceslau | rm369061 | [PREENCHER] |
| Robson | [PREENCHER] | [PREENCHER] |
| [Integrante 3] | [PREENCHER] | [PREENCHER] |

---

## 2. Repositórios GitHub Entregues

### 2.1. Repositório Principal (API)
- URL: https://github.com/wenceslauthiagon/mechanical-workshop-api
- Stack: NestJS + TypeScript + Prisma
- Principais pontos:
	- Arquitetura em camadas (Clean Architecture + DDD)
	- Gestão de clientes, veículos, serviços, peças e ordens de serviço
	- Testes automatizados (unitários e integração)
	- Pipelines CI/CD para `develop` e `main`

### 2.2. Function Serverless (Autenticação CPF)
- URL: https://github.com/wenceslauthiagon/mechanical-workshop-auth-function
- Objetivo: autenticação via CPF com emissão de JWT
- Principais pontos:
	- Azure Function (Node/TypeScript)
	- Validação de CPF
	- Integração com banco e geração de token

### 2.3. Infraestrutura Kubernetes (Terraform)
- URL: https://github.com/wenceslauthiagon/mechanical-workshop-kubernetes-infra
- Objetivo: provisionamento e configuração de infraestrutura K8s
- Principais pontos:
	- Terraform para ambiente Kubernetes
	- Estrutura de CI/CD para validação e plano

### 2.4. Infraestrutura de Banco de Dados (Terraform)
- URL: https://github.com/wenceslauthiagon/mechanical-workshop-database-infra
- Objetivo: provisionamento da infraestrutura de banco
- Principais pontos:
	- Terraform para recursos de banco gerenciado
	- Validação e automação por pipeline

---

## 3. Evidências de CI/CD

### Status das pipelines
- Branch `develop`: ✅ execução concluída com sucesso
- Branch `main`: ✅ execução concluída com sucesso

### Etapas executadas
- Lint e testes
- Build e push de imagem Docker
- Etapas de deploy (staging e production) em modo sem custo de cloud
- Etapas de Terraform (validate/plan/apply/simulação conforme workflow)

> Observação: para controle de custo, os fluxos de deploy em cloud foram configurados para execução sem provisionamento pago, mantendo a esteira completa para validação acadêmica.

---

## 4. Requisitos Arquiteturais do Desafio

### 4.1 API Gateway + Autenticação
- API Gateway: Kong
- Autenticação: Function serverless por CPF
- JWT para acesso às rotas protegidas

### 4.2 Infraestrutura e Orquestração
- Kubernetes para execução da aplicação
- Terraform para IaC (infra de cluster e banco)
- Pipelines automatizadas via GitHub Actions

### 4.3 Observabilidade
- Monitoramento e documentação em `docs/MONITORING_SETUP.md`
- Estratégia com métricas, logs e health checks

---

## 5. Documentação Técnica Entregue

Documentação principal:  
https://github.com/wenceslauthiagon/mechanical-workshop-api/tree/main/docs

### Diagramas e decisões
- Diagrama de Componentes: https://github.com/wenceslauthiagon/mechanical-workshop-api/blob/main/docs/ddd/COMPONENT_DIAGRAM.md
- Diagrama de Sequência: https://github.com/wenceslauthiagon/mechanical-workshop-api/blob/main/docs/ddd/SEQUENCE_DIAGRAM.md
- Diagrama ER: https://github.com/wenceslauthiagon/mechanical-workshop-api/blob/main/docs/ddd/ER-DIAGRAM.md
- ADR-001 (Kong): https://github.com/wenceslauthiagon/mechanical-workshop-api/blob/main/docs/ddd/ADR-001-API-GATEWAY-KONG.md
- ADR-002 (PostgreSQL): https://github.com/wenceslauthiagon/mechanical-workshop-api/blob/main/docs/ddd/ADR-002-POSTGRESQL-DATABASE.md
- RFC-001 (Cloud): https://github.com/wenceslauthiagon/mechanical-workshop-api/blob/main/docs/ddd/RFC-001-CLOUD-PLATFORM.md
- RFC-002 (Auth): https://github.com/wenceslauthiagon/mechanical-workshop-api/blob/main/docs/ddd/RFC-002-AUTHENTICATION-STRATEGY.md

---

## 6. Vídeo de Demonstração

**Plataforma:** YouTube (não listado)  
**Link:** [PREENCHER]  
**Duração:** [PREENCHER]

### Roteiro sugerido (checklist)
- [ ] Mostrar os 4 repositórios
- [ ] Mostrar autenticação por CPF na Function
- [ ] Mostrar uso do JWT na API
- [ ] Mostrar pipeline verde em `develop`
- [ ] Mostrar pipeline verde em `main`
- [ ] Mostrar documentação arquitetural

---

## 7. Colaborador obrigatório `soat-architecture`

Marcar após conferência no GitHub:

| Repositório | Status |
|---|---|
| mechanical-workshop-auth-function | [ ] Adicionado |
| mechanical-workshop-kubernetes-infra | [ ] Adicionado |
| mechanical-workshop-database-infra | [ ] Adicionado |
| mechanical-workshop-api | [ ] Adicionado |

---

## 8. Checklist Final para Entrega no Portal

- [ ] Documento revisado (sem campos `[PREENCHER]`)
- [ ] Links dos 4 repositórios válidos
- [ ] Link do vídeo válido
- [ ] Evidências de pipeline anexadas/mostradas no vídeo
- [ ] Colaborador `soat-architecture` confirmado
- [ ] PDF exportado e enviado no Portal do Aluno

---

## 9. Como Exportar para PDF

### Opção rápida (VS Code)
1. Abrir este arquivo no VS Code.
2. Usar extensão **Markdown PDF**.
3. Executar: `Markdown PDF: Export (pdf)`.

### Opção via Pandoc

```bash
pandoc docs/DELIVERY_DOCUMENT.md -o TECH_CHALLENGE_ENTREGA.pdf --pdf-engine=xelatex
```

---

**Data:** ___/___/______  
**Assinatura do grupo:** _________________________________
