# Execution Service

Responsável por:
- gerenciar fila de execução
- atualizar status durante diagnóstico e reparos
- comunicar finalização ao OS Service

## Banco

MongoDB (NoSQL).

## Endpoints

- `POST /execution/start`
- `GET /execution/:id`
- `GET /execution/order/:orderId`
- `PATCH /execution/:id/status`

## Comunicacao entre servicos

- Sincrona: REST para consulta e operacoes de execucao.
- Assincrona: RabbitMQ para consumir comando de inicio e publicar resultado.
- Regra de isolamento: este servico nao acessa banco de outros servicos.

## Evidencias do desafio

- Arquitetura: `phase4/docs/architecture.md`
- Collection Postman: `phase4/docs/Mechanical-Workshop-Phase4.postman_collection.json`
- Cobertura local: `npm --prefix phase4/execution-service run test:cov`
