# Billing Service

Responsável por:
- geração de orçamento
- aprovação e pagamento
- integração com Mercado Pago

## Endpoints

- `POST /billing/budget`
- `POST /billing/payment/approve`

## Integração Mercado Pago

A integração está encapsulada no client local (`processPayment`).
No ambiente real, substituir pela SDK oficial e token em secret.
