# Fase 4 - Arquitetura de Microsserviços (Saga Orquestrado)

Este diretório contém o **starter kit completo da Fase 4** para separar a solução em 3 microsserviços independentes, com bancos próprios, mensageria e Saga Pattern.

## Microsserviços

- `os-service` (PostgreSQL)
- `billing-service` (PostgreSQL + integração Mercado Pago)
- `execution-service` (MongoDB)

## Decisão de Saga

Foi adotado **Saga Orquestrado** com o `os-service` como coordenador do fluxo:

1. Abrir OS
2. Gerar orçamento
3. Aprovar e processar pagamento (Mercado Pago)
4. Enviar para execução
5. Finalizar OS

Compensações em falha:

- falha no pagamento => OS cancelada
- falha na execução => pagamento marcado para estorno + OS cancelada

## Mensageria

- RabbitMQ (exchange `workshop.events`, tipo topic)
- Comandos e eventos por roteamento:
  - `command.billing.generate`
  - `event.billing.payment_confirmed`
  - `command.execution.start`
  - `event.execution.completed`
  - etc.

## Como rodar local

1. Suba infraestrutura local:

```bash
docker compose -f phase4/docker-compose.yml up -d
```

2. Em cada serviço (`os-service`, `billing-service`, `execution-service`):

```bash
npm install
npm run dev
```

## Entregáveis cobertos

- 3 serviços independentes
- SQL + NoSQL
- REST + mensageria
- Saga com compensação
- testes unitários em cada serviço
- fluxo BDD (no `os-service`)
- pipeline CI/CD por serviço
- Dockerfile + manifestos Kubernetes por serviço

## Próximo passo recomendado

Separar cada pasta de serviço em repositório próprio (um repo por microsserviço), mantendo os mesmos arquivos base daqui.
