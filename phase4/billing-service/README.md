# Billing Service

Responsável por:
- geração de orçamento
- aprovação e pagamento
- integração com Mercado Pago

## Endpoints

- `POST /billing/budget`
- `POST /billing/payment/approve`

## Integração Mercado Pago

A integração está encapsulada no client `src/infra/mercadopago.client.ts`.

- Com `MP_ACCESS_TOKEN` configurado, o serviço chama a API do Mercado Pago (`/v1/payments`).
- Sem token (ambiente local/teste), usa fallback mock aprovado para manter execução offline.

Variáveis:

- `MP_ACCESS_TOKEN`: token da API do Mercado Pago
- `MP_PAYER_EMAIL`: e-mail do pagador (opcional; default `buyer@example.com`)
