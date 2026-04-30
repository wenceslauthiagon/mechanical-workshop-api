# OS Service

Responsável por:
- abertura da OS
- atualização de status
- histórico de status
- orquestração da Saga

## Saga Pattern (decisão)

Escolha: **Saga Orquestrado**.

Justificativa:
- facilita governança do fluxo transacional crítico
- centraliza regras de compensação
- simplifica troubleshooting com rastreamento único do fluxo

## Endpoints

- `POST /orders`
- `GET /orders/:id`
- `GET /orders/:id/history`
- `PATCH /orders/:id/status`

## Comunicacao entre servicos

- Sincrona: REST para consulta e operacao direta de OS.
- Assincrona: RabbitMQ para coordenacao da Saga (comandos/eventos).
- Regra de isolamento: este servico nao acessa banco de outros servicos.

## Persistencia

- padrao: repositorio em memoria
- Prisma/PostgreSQL: habilite `OS_USE_PRISMA_REPO=true` e configure `DATABASE_URL`

## Testes

- unitários via Jest
- BDD do fluxo principal em `test/bdd`
- cobertura alvo: >= 80%

## Evidencias do desafio

- Arquitetura: `phase4/docs/architecture.md`
- Collection Postman: `phase4/docs/Mechanical-Workshop-Phase4.postman_collection.json`
- Cobertura local: `npm --prefix phase4/os-service run test:cov`
