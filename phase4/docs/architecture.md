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

1. `OS_CREATED` -> comando para billing gerar orçamento
2. billing retorna `BUDGET_CREATED`
3. aprovação de pagamento -> `PAYMENT_CONFIRMED` ou `PAYMENT_FAILED`
4. confirmado -> comando para execução iniciar
5. `EXECUTION_COMPLETED` -> OS finalizada

## Compensação

- `PAYMENT_FAILED` => OS `CANCELLED`
- `EXECUTION_FAILED` => emitir `REFUND_REQUESTED` e OS `CANCELLED`
