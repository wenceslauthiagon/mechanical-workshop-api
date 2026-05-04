# Fase 4 - Arquitetura de Microsserviços (Saga Orquestrado)

Este diretório contém a **implementação da Fase 4** com 3 microsserviços independentes, bancos próprios, mensageria e Saga Pattern.

## Microsserviços

- `os-service` (PostgreSQL)
- `billing-service` (PostgreSQL + integração Mercado Pago)
- `execution-service` (MongoDB)

## Decisão de Saga

Foi adotado **Saga Orquestrado** com o `os-service` como coordenador do fluxo:

1. Abrir OS
2. Gerar orçamento
3. Aprovar orçamento (ação do cliente)
4. Processar pagamento (Mercado Pago)
5. Enviar para execução
6. Finalizar OS

Compensações em falha:

- falha no pagamento => OS cancelada
- falha na execução => pagamento marcado para estorno + OS cancelada

## Mensageria

- RabbitMQ (exchange `workshop.events`, tipo topic)
- Comandos e eventos por roteamento:
  - `command.billing.generate`
  - `command.billing.approve`
  - `event.billing.budget_generated`
  - `event.billing.budget_generation_failed`
  - `event.billing.payment_confirmed`
  - `command.execution.start`
  - `event.execution.started`
  - `event.execution.completed`
  - etc.

## Como rodar local

1. Suba infraestrutura local:

Antes, copie as variaveis do compose:

```bash
cp phase4/.env.example phase4/.env
```

No PowerShell:

```powershell
Copy-Item phase4/.env.example phase4/.env
```

```bash
docker compose -f phase4/docker-compose.yml up -d
```

2. Em cada serviço (`os-service`, `billing-service`, `execution-service`):

```bash
npm install
npm run dev
```

## Como comprovar execução em ambiente real

Para evidência operacional da entrega, os itens abaixo devem constar no material final:

1. **Deploy em Kubernetes real**
  - pipeline executando build, testes, quality gate e deploy
  - imagem publicada em registry
  - rollout do deployment concluído com sucesso

2. **Bancos gerenciados**
  - PostgreSQL gerenciado para `os-service` e `billing-service`
  - MongoDB gerenciado para `execution-service`
  - segredos e strings de conexão configurados fora do código

3. **Evidências centralizadas**
  - links diretos dos repositórios
  - links diretos das execuções de CI/CD
  - link do vídeo
  - prints/links de cluster, bancos e monitoramento

O documento central para essa comprovação é `phase4/docs/ENTREGA_FASE4.md`.

## Entregáveis cobertos

- 3 serviços independentes
- SQL + NoSQL
- REST + mensageria
- Saga com compensação
- testes unitários em cada serviço
- fluxo BDD (no `os-service`)
- pipeline CI/CD por serviço
- Dockerfile + manifestos Kubernetes por serviço
- integração com Mercado Pago via cliente dedicado com fallback local para desenvolvimento

## Documentacao e evidencias

- Arquitetura geral da fase: `phase4/docs/architecture.md`
- Matriz de conformidade e checklist administrativo: `phase4/docs/ENTREGA_FASE4.md`
- Collection Postman atualizada (3 servicos): `phase4/docs/Mechanical-Workshop-Phase4.postman_collection.json`
- Evidencia de cobertura por servico: execute `npm --prefix phase4 run test:cov` e use os relatorios em `phase4/*/coverage/`

## CI/CD por microsserviço (executável no GitHub Actions)

Os workflows válidos estão na raiz do repositório em `.github/workflows`:

- `.github/workflows/phase4-os-service-cicd.yml`
- `.github/workflows/phase4-billing-service-cicd.yml`
- `.github/workflows/phase4-execution-service-cicd.yml`

Cada pipeline executa:

1. build
2. testes com cobertura
3. quality gate (SonarQube)
4. build/push de imagem no GHCR
5. deploy em Kubernetes

## Checklist rápido de validação local

1. Subir infraestrutura: `docker compose -f phase4/docker-compose.yml up -d`
2. Rodar cobertura: `npm --prefix phase4 run test:cov`
3. Subir serviços em dev:
  - `npm --prefix phase4/os-service run dev`
  - `npm --prefix phase4/billing-service run dev`
  - `npm --prefix phase4/execution-service run dev`

## Repositórios por serviço

Cada microsserviço deve ser mantido em repositório próprio para entrega final conforme requisito da fase.
