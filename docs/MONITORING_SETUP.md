# Monitoramento e Observabilidade

Sistema completo de monitoramento usando **Datadog** para garantir visibilidade total sobre o funcionamento da aplicação.

## 📊 Componentes Monitorados

### 1. Métricas de Aplicação (APM)
- **Latência das APIs**: Tempo de resposta de cada endpoint
- **Taxa de erros**: Erros 4xx e 5xx por endpoint
- **Throughput**: Requisições por segundo
- **Traces distribuídos**: Rastreamento end-to-end das requisições

### 2. Infraestrutura Kubernetes
- **CPU e Memória**: Consumo por pod e namespace
- **Network I/O**: Tráfego de rede
- **Disk I/O**: Leitura e escrita em disco
- **Pod Status**: Pods running, pending, failed

### 3. Banco de Dados
- **Conexões ativas**: Número de conexões ao PostgreSQL
- **Query Performance**: Queries lentas e problemáticas
- **Lock Contention**: Locks e deadlocks
- **Replication Lag**: Atraso de replicação (se aplicável)

### 4. API Gateway (Kong)
- **Request Rate**: Taxa de requisições por rota
- **Response Time**: Tempo de resposta do gateway
- **Error Rate**: Taxa de erros no gateway
- **JWT Validation**: Métricas de autenticação

### 5. Azure Function
- **Invocations**: Número de execuções
- **Duration**: Tempo de execução
- **Success Rate**: Taxa de sucesso
- **Cold Starts**: Número de cold starts

## 🎯 Dashboards Configurados

### Dashboard 1: Overview Geral
- Volume diário de ordens de serviço
- Taxa de sucesso global
- Latência média das APIs
- Status dos pods Kubernetes

### Dashboard 2: Performance de APIs
- Latência por endpoint (p50, p95, p99)
- Taxa de erros por endpoint
- Throughput por endpoint
- Top 10 endpoints mais lentos

### Dashboard 3: Infraestrutura
- CPU e memória por pod
- Network I/O
- Disk I/O
- HPA status (scaling events)

### Dashboard 4: Ordens de Serviço (Business Metrics)
- Volume diário de OS por status
- Tempo médio de execução por status:
  - Diagnóstico
  - Execução
  - Finalização
- Taxa de conversão (orçamento → aprovação)
- SLA de atendimento

### Dashboard 5: Erros e Alertas
- Erros 5xx por serviço
- Erros de integração
- Falhas no processamento de OS
- Status de health checks

## 🔔 Alertas Configurados

### Alertas Críticos (P1)
1. **API Down**: Health check falhando por mais de 2 minutos
2. **Erro Rate Alto**: Taxa de erro > 5% por 5 minutos
3. **Latência Crítica**: p95 > 2s por 5 minutos
4. **Database Down**: Conexão com banco falhando
5. **Pod Crash Loop**: Pod reiniciando continuamente

### Alertas Importantes (P2)
1. **Alta Latência**: p95 > 1s por 10 minutos
2. **CPU Alto**: CPU > 80% por 15 minutos
3. **Memória Alta**: Memória > 85% por 15 minutos
4. **Disk Space Low**: Espaço em disco < 20%
5. **Replication Lag**: Atraso > 5 segundos

### Alertas de Warning (P3)
1. **Latência Elevada**: p95 > 500ms por 15 minutos
2. **Taxa de Erro Moderada**: Erro rate > 1% por 15 minutos
3. **Scaling Events**: HPA escalando frequentemente
4. **Cold Starts**: Azure Function com cold starts frequentes

## 📝 Logs Estruturados

### Formato de Log
```json
{
  "timestamp": "2024-03-15T10:30:45.123Z",
  "level": "info",
  "service": "mechanical-workshop-api",
  "correlationId": "uuid-v4",
  "userId": "user-id",
  "customerId": "customer-id",
  "method": "POST",
  "path": "/service-orders",
  "statusCode": 201,
  "duration": 145,
  "message": "Service order created successfully"
}
```

### Correlação de Requisições
Todas as requisições possuem um `X-Correlation-ID` que permite rastrear a jornada completa:
1. Gateway Kong (geração do correlation ID)
2. API Principal
3. Banco de Dados
4. Azure Function (quando aplicável)

### Queries Úteis no Datadog

**Erro Rate por Endpoint:**
```
sum:trace.http.request.errors{env:production,service:mechanical-workshop-api} by {resource_name}.as_rate()
```

**Latência p95:**
```
p95:trace.http.request.duration{env:production,service:mechanical-workshop-api} by {resource_name}
```

**Ordens de Serviço por Status:**
```
sum:custom.service_orders.count{env:production} by {status}
```

**CPU por Pod:**
```
avg:kubernetes.cpu.usage{cluster_name:mechanical-workshop-prod,namespace:workshop} by {pod_name}
```

## 🚀 Configuração

### 1. Instalar Datadog Agent no Kubernetes

```bash
# Criar namespace
kubectl create namespace workshop

# Criar secret com API key
kubectl create secret generic datadog-secret \
  --from-literal=api-key=<DD_API_KEY> \
  -n workshop

# Aplicar configuração
kubectl apply -f k8s/datadog-monitoring.yaml
```

### 2. Instrumentar a Aplicação

Adicionar no `package.json`:
```json
{
  "dependencies": {
    "dd-trace": "^4.0.0"
  }
}
```

Adicionar no início do `main.ts`:
```typescript
import tracer from 'dd-trace';

tracer.init({
  hostname: process.env.DD_AGENT_HOST || 'localhost',
  port: 8126,
  service: 'mechanical-workshop-api',
  env: process.env.NODE_ENV || 'production',
  logInjection: true,
});
```

### 3. Configurar Custom Metrics

```typescript
import { StatsD } from 'hot-shots';

const dogstatsd = new StatsD({
  host: process.env.DD_AGENT_HOST,
  port: 8125,
});

// Incrementar contador
dogstatsd.increment('service_orders.created', 1, ['status:pending']);

// Registrar timing
dogstatsd.timing('service_orders.processing_time', duration, ['status:completed']);

// Gauge
dogstatsd.gauge('service_orders.queue_size', queueSize);
```

### 4. Adicionar Tags Customizadas

```typescript
import { tracer } from 'dd-trace';

const span = tracer.scope().active();
span?.setTag('customer.id', customerId);
span?.setTag('service_order.id', serviceOrderId);
span?.setTag('vehicle.type', vehicleType);
```

## 📈 Métricas de Negócio

### KPIs Monitorados
1. **Volume de OS**: Total de ordens de serviço criadas
2. **Tempo Médio de Atendimento**: Por status da OS
3. **Taxa de Conversão**: Orçamento → Aprovação
4. **Customer Satisfaction**: Baseado em feedback (futuro)
5. **Revenue**: Valor total de OS finalizadas

### SLIs/SLOs Definidos
- **Availability**: 99.9% uptime
- **Latency**: p95 < 500ms
- **Error Rate**: < 0.1%
- **Time to First Response**: < 2 horas

## 🔗 Links Úteis

- [Datadog Documentation](https://docs.datadoghq.com/)
- [APM Best Practices](https://docs.datadoghq.com/tracing/guide/best_practices/)
- [Custom Metrics](https://docs.datadoghq.com/metrics/custom_metrics/)
- [Kubernetes Monitoring](https://docs.datadoghq.com/integrations/kubernetes/)

## 📞 Contatos para Alertas

**Críticos (P1):**
- Slack: #incidents-critical
- PagerDuty: On-call team
- Email: oncall@workshop.com

**Importantes (P2):**
- Slack: #alerts-important
- Email: team@workshop.com

**Warnings (P3):**
- Slack: #monitoring-warnings
