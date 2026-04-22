# Fase 4 - Documento de Conformidade Técnica

## Participante

- Thiago Camilo Nonato Wenceslau - RA rm369061

## Escopo desta revisão

Este documento foi consolidado para validar a implementacao tecnica da Fase 4 e registrar conformidade com os requisitos obrigatorios de microsservicos, Saga, testes, CI/CD e Kubernetes.

## Repositorios e modulos entregues

- OS Service: https://github.com/wenceslauthiagon/mechanical-workshop-api/tree/main/phase4/os-service
- Billing Service: https://github.com/wenceslauthiagon/mechanical-workshop-api/tree/main/phase4/billing-service
- Execution Service: https://github.com/wenceslauthiagon/mechanical-workshop-api/tree/main/phase4/execution-service
- Infra Kubernetes/Terraform: https://github.com/wenceslauthiagon/mechanical-workshop-kubernetes-infra
- Infra Banco/Terraform: https://github.com/wenceslauthiagon/mechanical-workshop-database-infra

## Arquitetura adotada

- 3 microsservicos: `os-service`, `billing-service`, `execution-service`
- SQL: PostgreSQL (`os-service` e `billing-service`)
- NoSQL: MongoDB (`execution-service`)
- Comunicacao sincrona: REST
- Comunicacao assincrona: RabbitMQ (`workshop.events`)
- Padrao transacional: Saga Orquestrado com coordenacao no `os-service`

## Fluxo Saga e compensacao

Fluxo principal:

1. `os-service` abre OS
2. publica `command.billing.generate`
3. `billing-service` processa orcamento/pagamento
4. em sucesso publica `event.billing.payment_confirmed`
5. `os-service` publica `command.execution.start`
6. `execution-service` conclui e publica `event.execution.completed`
7. `os-service` finaliza a OS

Compensacao:

- Falha no pagamento: `event.billing.payment_failed` -> OS `CANCELLED`
- Falha na execucao: `event.execution.failed` -> `command.billing.refund` + OS `CANCELLED`

## Testes, BDD e cobertura

- Testes unitarios nos 3 servicos
- Testes de integracao nos 3 servicos
- BDD implementado no `os-service`:
  - `phase4/os-service/test/bdd/os-saga.feature`
  - `phase4/os-service/test/bdd/os-saga.spec.ts`
- Threshold de cobertura definido em 80% (Jest) por servico
- Script agregado da fase:
  - `npm --prefix phase4 run test:cov`

## CI/CD por microsservico (GitHub Actions)

Workflows executaveis na raiz do repositorio:

- `.github/workflows/phase4-os-service-cicd.yml`
- `.github/workflows/phase4-billing-service-cicd.yml`
- `.github/workflows/phase4-execution-service-cicd.yml`

Cada pipeline executa:

1. build
2. testes com cobertura
3. SonarQube scan + quality gate
4. build/push da imagem no GHCR
5. deploy no Kubernetes

## Kubernetes e containers

- Dockerfile por servico:
  - `phase4/os-service/Dockerfile`
  - `phase4/billing-service/Dockerfile`
  - `phase4/execution-service/Dockerfile`
- Manifestos Kubernetes por servico:
  - `phase4/os-service/k8s/deployment.yaml`
  - `phase4/billing-service/k8s/deployment.yaml`
  - `phase4/execution-service/k8s/deployment.yaml`

## Evidencias de observabilidade

Observabilidade aplicada com base da Fase 3:

- health endpoints em cada servico (`/health`)
- rastreio de chamadas via logs e eventos RabbitMQ
- monitoramento no cluster (Datadog Agent)

Comandos usados para validacao operacional:

- `kubectl get pods -n mechanical-workshop -o wide`
- `kubectl get daemonset -n mechanical-workshop`
- `kubectl logs -n mechanical-workshop deployment/kong --tail=40`
- `kubectl logs -n mechanical-workshop deployment/workshop-api --tail=40`

## Matriz de conformidade dos requisitos

| Requisito | Status | Evidencia |
|---|---|---|
| 3 microsservicos independentes | Atendido | `phase4/os-service`, `phase4/billing-service`, `phase4/execution-service` |
| SQL + NoSQL | Atendido | PostgreSQL e MongoDB separados por servico |
| REST + mensageria | Atendido | Endpoints HTTP + RabbitMQ |
| Saga com compensacao | Atendido | Eventos/commands implementados no fluxo de OS |
| Testes unitarios | Atendido | Suites de teste por servico |
| BDD em fluxo completo | Atendido | `os-saga.feature` |
| Cobertura minima 80% | Atendido por configuracao e execucao local | `jest.config.js` + `test:cov` |
| Qualidade no CI (Sonar) | Atendido | Sonar scan e quality gate nos 3 workflows |
| CI/CD independente por servico | Atendido | 3 workflows raiz de phase4 |
| Dockerfile e K8s manifests | Atendido | Arquivos por servico |

## Pontos em aberto para fechamento administrativo

1. Validar e anexar links das ultimas runs de cada workflow no GitHub Actions.
2. Confirmar politicas de branch protection (`main` com PR obrigatorio) em todos os repositorios finais da entrega.
3. Se a banca exigir repositorios fisicamente separados por servico, publicar os 3 servicos como repositorios dedicados e atualizar os links desta secao.

---

Data de consolidacao: 2026-04-22
