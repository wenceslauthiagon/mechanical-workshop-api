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
