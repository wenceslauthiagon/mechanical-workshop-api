# Fase 4 - Documentação Entregável

## Participantes

- Preencher com Nome e Matrícula do aluno

## Repositórios

- OS Service: ../../phase4/os-service
- Billing Service: ../../phase4/billing-service
- Execution Service: ../../phase4/execution-service

## Vídeo de Demonstração

Preencher com link YouTube/Vimeo (até 15 min)

## Arquitetura

### Diagrama

```
┌─────────────────────────────────────────────────────┐
│                   Cliente/API Gateway               │
└────────┬────────────────────────────────────────────┘
         │
    ┌────┴────────────────────────────────────┐
    │                                         │
┌───▼────────┐                    ┌──────────▼──────┐
│ OS Service │──────REST────────►│Billing Service  │
│ PostgreSQL │                    │ PostgreSQL      │
└───▲────────┘                    └──────────▲──────┘
    │                                    │
    │          ┌──────────────────────────┘
    │          │ RabbitMQ (events)
    │          │
    │     ┌────▼─────────┐
    │     │Execution Svc │
    │     │ MongoDB      │
    │     └──────────────┘
    │
    └── Compensação em falha
```

### Tecnologias

- **OS Service**: Node.js + Express + PostgreSQL
- **Billing Service**: Node.js + Express + PostgreSQL + Mercado Pago (mock)
- **Execution Service**: Node.js + Express + MongoDB

### Padrões

- **Saga**: Orquestrado (central no OS Service)
- **Comunicação**: REST + Eventos (RabbitMQ)
- **Banco de dados**: Separado por serviço (polyglot persistence)

## Saga Pattern - Orquestrado

### Fluxo

```
1. Cliente abre OS
   ↓
2. OS Service emite: command.billing.generate
   ↓
3. Billing Service cria orçamento
   → emite: event.billing.payment_confirmed ou event.billing.payment_failed
   ↓
4. Se confirmado:
   - OS Service emite: command.execution.start
   - Execution Service inicia fila
   → emite: event.execution.completed ou event.execution.failed
   ↓
5. Se sucesso: OS finalizada
   Se falha: compensação (refund + cancel)
```

### Compensação

- Pagamento falha → OS cancelada
- Execução falha → refund request + OS cancelada

## Justificativa da Divisão

1. **OS Service**: coordena todo o fluxo, mantém histórico
2. **Billing Service**: isolado para escalar pagamentos/Mercado Pago
3. **Execution Service**: NoSQL para fila rápida e histórico de etapas

## Testes

- Cobertura mínima: 80%
- BDD implementado no OS Service (`test/bdd/os-saga.feature`)
- Unitários em todos

## CI/CD

- GitHub Actions por serviço
- Build → Test → SonarQube → Deploy K8s
- Branch main protegida (PR + testes obrigatórios)

---

**Data**: 2026-04-07
