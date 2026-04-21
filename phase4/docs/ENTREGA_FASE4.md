# Fase 4 - Documentação Entregável

## Participantes

- Thiago Camilo Nonato Wenceslau — RA rm369061

## Repositórios

- OS Service: https://github.com/wenceslauthiagon/mechanical-workshop-api/tree/main/phase4/os-service
- Billing Service: https://github.com/wenceslauthiagon/mechanical-workshop-api/tree/main/phase4/billing-service
- Execution Service: https://github.com/wenceslauthiagon/mechanical-workshop-api/tree/main/phase4/execution-service
- Infraestrutura Kubernetes/Terraform: https://github.com/wenceslauthiagon/mechanical-workshop-kubernetes-infra
- Azure Function/Auth: https://github.com/wenceslauthiagon/mechanical-workshop-auth-function

## Vídeo de Demonstração

- Pendente: inserir link YouTube/Vimeo (até 15 min)

## Resposta objetiva ao feedback da avaliação

### Ponto 1: evidências concretas de execução em ambiente real

Para eliminar ambiguidade sobre execução prática, anexar neste documento:

- URL do cluster em nuvem (ou dashboard do provedor)
- URL/print do rollout de deploy bem-sucedido
- URL/print de `kubectl get pods` com serviços em execução
- URL/print das instâncias de banco gerenciado (PostgreSQL e MongoDB)
- URL/print de segredos/variáveis configuradas fora do código

### Ponto 2: centralização das evidências em um único documento

Todos os links obrigatórios devem estar nesta página, sem depender de navegação externa:

- Repositórios dos microsserviços
- Repositórios de infra e autenticação
- Link do vídeo
- Links das runs de CI/CD
- Evidências de deploy, bancos e monitoramento

### Matriz de comprovação (preencher antes da entrega/revisão)

| Item avaliado | Evidência direta (URL/print) | Status |
|---|---|---|
| Deploy em nuvem (Kubernetes real) | pendente (cluster cloud com acesso público) | Em aberto |
| Banco PostgreSQL gerenciado | pendente (evidência do provedor cloud) | Em aberto |
| Banco MongoDB gerenciado | pendente (evidência do provedor cloud) | Em aberto |
| Pipeline CI/CD com deploy | https://github.com/wenceslauthiagon/mechanical-workshop-api/actions | Parcial (deploy cloud em modo simulação) |
| Monitoramento/rastreamento distribuído | Datadog Agent ativo no cluster local + docs/MONITORING_SETUP.md | Parcial (dashboard cloud requer API key válida) |
| Vídeo com fluxo fim a fim + compensação | pendente (link público/não listado) | Em aberto |

### Evidências demonstradas no vídeo

- Fluxo completo da OS passando por `os-service`, `billing-service` e `execution-service`
- Execução do Saga Pattern com caminho feliz e compensação em falha
- Execução dos testes automatizados e cobertura por serviço
- Execução do pipeline CI/CD com build, testes, quality gate e deploy
- Deploy em Kubernetes e validação pós-deploy
- Monitoramento, health checks e rastreamento do fluxo distribuído

## Arquitetura

### Diagrama

```
┌─────────────────────────────────────────────────────┐
│                   Cliente/API Gateway               │
└────────┬────────────────────────────────────────────┘
         │
    ┌────┴────────────────────────────────────┐
    │                                         │
┌───▼────────┐                    ┌──────────▼──────┐
│ OS Service │──────REST────────►│Billing Service  │
│ PostgreSQL │                    │ PostgreSQL      │
└───▲────────┘                    └──────────▲──────┘
    │                                    │
    │          ┌──────────────────────────┘
    │          │ RabbitMQ (events)
    │          │
    │     ┌────▼─────────┐
    │     │Execution Svc │
    │     │ MongoDB      │
    │     └──────────────┘
    │
    └── Compensação em falha
```

### Tecnologias

- **OS Service**: Node.js + Express + PostgreSQL
- **Billing Service**: Node.js + Express + PostgreSQL + Mercado Pago (API real com fallback local)
- **Execution Service**: Node.js + Express + MongoDB

### Padrões

- **Saga**: Orquestrado (central no OS Service)
- **Comunicação**: REST + Eventos (RabbitMQ)
- **Banco de dados**: Separado por serviço (polyglot persistence)

## Saga Pattern - Orquestrado

### Fluxo

```
1. Cliente abre OS
   ↓
2. OS Service emite: command.billing.generate
   ↓
3. Billing Service cria orçamento
   → emite: event.billing.payment_confirmed ou event.billing.payment_failed
   ↓
4. Se confirmado:
   - OS Service emite: command.execution.start
   - Execution Service inicia fila
   → emite: event.execution.completed ou event.execution.failed
   ↓
5. Se sucesso: OS finalizada
   Se falha: compensação (refund + cancel)
```

### Compensação

- Pagamento falha → OS cancelada
- Execução falha → refund request + OS cancelada

## Justificativa da Divisão

1. **OS Service**: coordena todo o fluxo, mantém histórico
2. **Billing Service**: isolado para escalar pagamentos/Mercado Pago
3. **Execution Service**: NoSQL para fila rápida e histórico de etapas

## Testes

- Cobertura mínima: 80%
- BDD implementado no OS Service (`test/bdd/os-saga.feature`)
- Unitários em todos

### Evidências objetivas de cobertura

- Execução validada com `npm run test:cov` em `phase4/`
- Última validação local registrada: `npm run test:cov` com exit code `0` (2026-04-16)
- Billing Service: `97.39%` statements / `88.37%` branches / `85.71%` functions / `98.18%` lines
- Execution Service: `95.45%` statements / `86.95%` branches / `89.28%` functions / `96.38%` lines
- OS Service: `98.27%` statements / `85.71%` branches / `94.28%` functions / `100%` lines

### Arquivos que comprovam qualidade

- Workflows CI/CD por serviço com etapa de SonarQube
- Testes unitários e de integração por serviço
- Cenário BDD em `phase4/os-service/test/bdd/os-saga.feature`

## CI/CD

- GitHub Actions por serviço
- Build → Test → SonarQube → Deploy K8s
- Branch main protegida (PR + testes obrigatórios)

### Evidências diretas de pipeline

- OS Service workflow: `phase4/os-service/.github/workflows/ci-cd.yml`
- Billing Service workflow: `phase4/billing-service/.github/workflows/ci-cd.yml`
- Execution Service workflow: `phase4/execution-service/.github/workflows/ci-cd.yml`
- Links das execuções no GitHub Actions:
   - OS Service: https://github.com/wenceslauthiagon/mechanical-workshop-api/actions/workflows/ci-cd.yml
   - Billing Service: https://github.com/wenceslauthiagon/mechanical-workshop-api/actions/workflows/ci-cd.yml
   - Execution Service: https://github.com/wenceslauthiagon/mechanical-workshop-api/actions/workflows/ci-cd.yml

## Execução em ambiente real

### Deploy em nuvem / Kubernetes

- Cluster alvo: Kubernetes em nuvem (preencher nome do cluster/provedor)
- Registry de imagens: GHCR (`ghcr.io/...`)
- Deploy automatizado via GitHub Actions com `kubectl apply` e `kubectl set image`
- Manifestos por serviço em `phase4/*/k8s/deployment.yaml`
- Preencher com evidências diretas:
   - URL do cluster ou dashboard
   - print ou link do rollout bem-sucedido
   - print ou link do `kubectl get pods` / health checks

### Bancos de dados gerenciados

- SQL gerenciado: PostgreSQL para `os-service` e `billing-service`
- NoSQL gerenciado: MongoDB para `execution-service`
- Nenhum serviço acessa o banco de outro serviço
- Preencher com evidências diretas:
   - provedor usado
   - link/print da instância PostgreSQL gerenciada
   - link/print da instância MongoDB gerenciada
   - variáveis de conexão/segredos configurados no ambiente

## Observabilidade e monitoramento

- Health checks implementados nos serviços
- Mensageria rastreável via eventos da saga
- Observabilidade herdada da Fase 3 deve ser demonstrada com links/prints no material final
- Preencher com evidências diretas:
   - dashboard ou ferramenta de monitoramento utilizada
   - print/link de logs, métricas e rastreamento distribuído

## Mapa de validação dos requisitos

- 3 microsserviços independentes: `os-service`, `billing-service`, `execution-service`
- Banco SQL: PostgreSQL
- Banco NoSQL: MongoDB
- Comunicação síncrona: endpoints REST
- Comunicação assíncrona: RabbitMQ
- Saga Pattern: orquestrado pelo `os-service`
- Rollback/compensação: cancelamento da OS e reembolso no billing
- Testes unitários: presentes nos 3 serviços
- BDD: presente no `os-service`
- Cobertura mínima de 80%: atingida nos 3 serviços
- Qualidade no CI: SonarQube configurado nos 3 workflows
- Dockerfile e manifestos Kubernetes: presentes nos 3 serviços
- Collection Postman: `phase4/docs/Mechanical-Workshop-Phase4.postman_collection.json`

## Pendências para anexar antes da entrega/revisão

- Inserir links públicos reais dos repositórios
- Inserir link final do vídeo
- Inserir links/prints das execuções de pipeline
- Inserir links/prints do deploy em cluster real
- Inserir links/prints dos bancos gerenciados
- Inserir links/prints de monitoramento e rastreamento

---

**Data**: 2026-04-16
