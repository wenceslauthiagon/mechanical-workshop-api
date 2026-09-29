# Documento de Entrega - Tech Challenge (Fase 4)
## Sistema de Gestao de Oficina Mecanica - Microsservicos e Saga

## Integrantes
| Nome Completo | RM | Contato |
|---|---|---|
| Thiago Camilo Nonato Wenceslau | rm369061 | (11) 98911-9768 |

## 1. Repositorios GitHub Entregues (Fase 4)

### 1.1 OS Service
URL: https://github.com/wenceslauthiagon/mechanical-workshop-os-service

### 1.2 Billing Service
URL: https://github.com/wenceslauthiagon/mechanical-workshop-billing-service

### 1.3 Execution Service
URL: https://github.com/wenceslauthiagon/mechanical-workshop-execution-service

### 1.4 Infraestrutura Kubernetes (Terraform)
URL: https://github.com/wenceslauthiagon/mechanical-workshop-kubernetes-infra

### 1.5 Infraestrutura de Banco de Dados (Terraform)
URL: https://github.com/wenceslauthiagon/mechanical-workshop-database-infra

## 2. Requisitos Atendidos no Desafio (Fase 4)
- Arquitetura com 3 microsservicos independentes
- Saga orquestrado com compensacao
- Comunicacao REST + mensageria (RabbitMQ)
- Persistencia SQL + NoSQL
- Testes unitarios e de integracao por servico
- BDD no fluxo principal do OS Service
- CI/CD por microsservico com GitHub Actions
- Dockerfiles e manifests Kubernetes por servico
- Infraestrutura como codigo com Terraform
- Documentacao tecnica da arquitetura e da entrega

## 3. Arquitetura da Solucao (Fase 4)

### 3.1 Microsservicos
- os-service
- billing-service
- execution-service

### 3.2 Bancos por servico
- os-service: PostgreSQL
- billing-service: PostgreSQL
- execution-service: MongoDB

### 3.3 Mensageria
- RabbitMQ (exchange workshop.events)
- Principais comandos/eventos:
  - command.billing.generate
  - event.billing.budget_generated
  - event.billing.payment_confirmed
  - command.execution.start
  - event.execution.completed

### 3.4 Saga (orquestrado)
Fluxo principal:
1. Abrir OS
2. Gerar orcamento
3. Aprovar orcamento
4. Processar pagamento (Mercado Pago)
5. Iniciar execucao
6. Finalizar OS

Compensacoes:
- Falha no pagamento: OS cancelada
- Falha na execucao: comando de reembolso + OS cancelada

## 4. Como Testar Localmente a Fase 4

### Pre-requisitos
- Docker e Docker Compose
- Node.js 20+
- npm

### Passo a passo

### 4.1 Subir infraestrutura local
```bash
cp phase4/.env.example phase4/.env
docker compose -f phase4/docker-compose.yml up -d
```

No PowerShell:
```powershell
Copy-Item phase4/.env.example phase4/.env
docker compose -f phase4/docker-compose.yml up -d
```

### 4.2 Subir os servicos em dev
```bash
npm --prefix phase4/os-service install
npm --prefix phase4/billing-service install
npm --prefix phase4/execution-service install

npm --prefix phase4/os-service run dev
npm --prefix phase4/billing-service run dev
npm --prefix phase4/execution-service run dev
```

### 4.3 Validar health endpoints
- OS Service: http://localhost:3001/health
- Billing Service: http://localhost:3002/health
- Execution Service: http://localhost:3003/health

### 4.4 Rodar testes com cobertura
```bash
npm --prefix phase4 run test:cov
```

## 5. Evidencias de CI/CD
- Branch develop: execucao concluida com sucesso
- Branch main: execucao concluida com sucesso

Etapas executadas:
1. Build
2. Testes com cobertura
3. Quality gate (SonarQube)
4. Build e push de imagem
5. Deploy (staging/prod)
6. Etapas de Terraform

Observacao:
- Para evitar custo de nuvem em ambiente academico, os workflows podem usar modo de simulacao de deploy em alguns cenarios, mantendo a esteira completa para validacao.

## 6. Documentacao Tecnica
Documentacao principal:
- https://github.com/wenceslauthiagon/mechanical-workshop-api/tree/main/phase4/docs

Links principais:
- Arquitetura Fase 4: https://github.com/wenceslauthiagon/mechanical-workshop-api/blob/main/phase4/docs/architecture.md
- Documento de entrega Fase 4: https://github.com/wenceslauthiagon/mechanical-workshop-api/blob/main/phase4/docs/ENTREGA_FASE4.md
- Collection Postman Fase 4: https://github.com/wenceslauthiagon/mechanical-workshop-api/blob/main/phase4/docs/Mechanical-Workshop-Phase4.postman_collection.json

## 7. Video de Demonstracao
Plataforma: YouTube (nao listado)
Link: [PREENCHER]
Duracao: [PREENCHER]

Conteudo sugerido:
1. Visao dos repositorios da Fase 4
2. Execucao de pipeline em develop
3. Execucao de pipeline em main
4. Fluxo Saga ponta a ponta
5. Documentacao tecnica e evidencias

## 8. Colaborador Obrigatorio
Usuario solicitado: soat-architecture

| Repositorio | Status |
|---|---|
| mechanical-workshop-os-service | [ ] Confirmar |
| mechanical-workshop-billing-service | [ ] Confirmar |
| mechanical-workshop-execution-service | [ ] Confirmar |
| mechanical-workshop-kubernetes-infra | [ ] Confirmar |
| mechanical-workshop-database-infra | [ ] Confirmar |

## 9. Checklist Final de Entrega
- [ ] Campos pendentes preenchidos
- [ ] Link do video preenchido
- [ ] Evidencias de pipeline anexadas
- [ ] soat-architecture confirmado em todos os repositorios obrigatorios
- [ ] PDF gerado e enviado no Portal do Aluno

## 10. Observacoes Finais
Este documento consolida a entrega da Fase 4 com foco em microsservicos, Saga, qualidade de software e operacao em ambiente orquestrado. Ajustes de links, evidencias e dados administrativos devem ser preenchidos antes da submissao final.
