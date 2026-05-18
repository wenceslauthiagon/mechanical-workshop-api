# Arquitetura Fase 4

## Visão Geral

- **OS Service**: abre/gerencia ordem e orquestra a Saga
- **Billing Service**: orçamento + pagamento
- **Execution Service**: execução da ordem de serviço
- **RabbitMQ**: backbone de eventos

## Bancos

- OS Service: PostgreSQL
- Billing Service: PostgreSQL
- Execution Service: MongoDB

## Estratégia de comunicação

- REST para consultas e comandos diretos necessários
- Eventos assíncronos para integração desacoplada entre serviços

## Saga (Orquestrado)

1. `OPENED` -> `command.billing.generate`
2. `event.billing.budget_generated` -> OS em `BUDGET_PENDING`
3. cliente aprova orçamento -> `command.billing.approve`
4. billing processa pagamento -> `event.billing.payment_confirmed` ou `event.billing.payment_failed`
5. confirmado -> `command.execution.start`
6. `event.execution.started` -> OS em `IN_EXECUTION`
7. `event.execution.completed` -> OS finalizada

## Compensação

- `event.billing.payment_failed` => OS `CANCELLED`
- `event.execution.failed` => emitir `command.billing.refund` e OS `CANCELLED`
