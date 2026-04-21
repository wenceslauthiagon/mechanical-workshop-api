# Fase 4 - Arquitetura de Microsserviços (Saga Orquestrado)

Este diretório contém a **implementação da Fase 4** com 3 microsserviços independentes, bancos próprios, mensageria e Saga Pattern.

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

## Como comprovar execução em ambiente real

Para evidência operacional da entrega, os itens abaixo devem constar no material final:

1. **Deploy em Kubernetes real**
  - pipeline executando build, testes, quality gate e deploy
  - imagem publicada em registry
  - rollout do deployment concluído com sucesso

2. **Bancos gerenciados**
  - PostgreSQL gerenciado para `os-service` e `billing-service`
  - MongoDB gerenciado para `execution-service`
  - segredos e strings de conexão configurados fora do código

3. **Evidências centralizadas**
  - links diretos dos repositórios
  - links diretos das execuções de CI/CD
  - link do vídeo
  - prints/links de cluster, bancos e monitoramento

O documento central para essa comprovação é `phase4/docs/ENTREGA_FASE4.md`.

## Entregáveis cobertos

- 3 serviços independentes
- SQL + NoSQL
- REST + mensageria
- Saga com compensação
- testes unitários em cada serviço
- fluxo BDD (no `os-service`)
- pipeline CI/CD por serviço
- Dockerfile + manifestos Kubernetes por serviço
- integração com Mercado Pago via cliente dedicado com fallback local para desenvolvimento

## Repositórios por serviço

Cada microsserviço deve ser mantido em repositório próprio para entrega final conforme requisito da fase.
