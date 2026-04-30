# Billing Service

Responsável por:
- geração de orçamento
- aprovação e pagamento
- integração com Mercado Pago

## Endpoints

- `POST /billing/budget`
- `POST /billing/payment/approve`
- `GET /billing/order/:orderId`

## Comunicacao entre servicos

- Sincrona: REST para operacoes de orcamento/pagamento.
- Assincrona: RabbitMQ para eventos de pagamento e compensacao.
- Regra de isolamento: este servico nao acessa banco de outros servicos.

## Integração Mercado Pago

A integração está encapsulada no client `src/infra/mercadopago.client.ts`.

- Com `MP_ACCESS_TOKEN` configurado, o serviço chama a API do Mercado Pago (`/v1/payments`).
- Sem token (ambiente local/teste), usa fallback mock aprovado para manter execução offline.

Variáveis:

- `MP_ACCESS_TOKEN`: token da API do Mercado Pago
- `MP_PAYER_EMAIL`: e-mail do pagador (opcional; default `buyer@example.com`)

## Evidencias do desafio

- Arquitetura: `phase4/docs/architecture.md`
- Collection Postman: `phase4/docs/Mechanical-Workshop-Phase4.postman_collection.json`
- Cobertura local: `npm --prefix phase4/billing-service run test:cov`
