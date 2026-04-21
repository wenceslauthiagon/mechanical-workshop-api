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
- `PATCH /orders/:id/status`

## Testes

- unitários via Jest
- BDD do fluxo principal em `test/bdd`
- cobertura alvo: >= 80%
