# ADR 001 - Escolha do API Gateway (Kong)

**Status**: Aceito  
**Data**: 2024-03-15  
**Decisores**: Arquiteto de Software, Tech Lead, DevOps Lead

## Contexto e Problema

O sistema precisa de um API Gateway para:
- Controlar e rotear requisições
- Validar tokens JWT
- Aplicar rate limiting
- Adicionar correlation IDs
- Gerenciar CORS
- Coletar métricas

Precisamos escolher entre diferentes soluções de API Gateway.

## Fatores de Decisão

- Performance e latência
- Facilidade de configuração
- Suporte a JWT
- Capacidade de extensão (plugins)
- Custo
- Comunidade e suporte
- Deployment em Kubernetes
- Observabilidade

## Opções Consideradas

### Opção 1: Kong Gateway
- Open source (Apache 2.0)
- Baseado em Nginx + LuaJIT
- Modo declarativo (DB-less)
- Plugins prontos (JWT, rate-limiting, CORS)
- ~~10k requests/sec em hardware modesto

### Opção 2: AWS API Gateway
- Managed service
- Integração nativa com Lambda
- Pay-per-use
- Limitado ao AWS

### Opção 3: Nginx Ingress Controller
- Muito leve
- Já usado em Kubernetes
- Menos features avançadas
- Configuração mais manual

### Opção 4: Traefik
- Cloud-native
- Auto-discovery
- Dashboard integrado
- Configuração complexa para features avançadas

### Opção 5: Implementação Custom (NestJS Guards)
- Controle total
- Sem dependências externas
- Overhead de desenvolvimento
- Dificulta scaling independente

## Decisão

**Escolhido: Kong Gateway (Opção 1)**

Kong será usado em modo DB-less (declarativo) com configuração via ConfigMap do Kubernetes.

## Justificativa

### Argumentos Positivos

1. **Performance Excelente**
   - Baseado em Nginx (battle-tested)
   - Latência adicional: ~5-10ms
   - Throughput: >10k req/sec
   - Baixo consumo de recursos

2. **Plugins Prontos**
   - JWT validation nativo
   - Rate limiting configurável
   - CORS habilitado
   - Correlation ID injection
   - Prometheus exporter

3. **Modo DB-less**
   - Sem necessidade de PostgreSQL adicional
   - Configuração declarativa (YAML)
   - Deploy simples via ConfigMap
   - Stateless (facilita scaling)

4. **Kubernetes Native**
   - Deployment via manifests
   - HPA suportado
   - Service mesh ready
   - Health checks integrados

5. **Open Source**
   - Licença Apache 2.0
   - Sem vendor lock-in
   - Comunidade ativa (25k+ stars GitHub)
   - Documentação excelente

6. **Extensibilidade**
   - Plugins customizados em Lua
   - Possibilidade de features futuras
   - Webhooks e transformações

7. **Observabilidade**
   - Logs estruturados
   - Métricas Prometheus nativas
   - Integração com Datadog
   - Distributed tracing

### Argumentos Negativos

1. **Complexidade Inicial**
   - Curva de aprendizado
   - Configuração YAML extensa
   - Mitigação: Templates e documentação

2. **Overhead de Latência**
   - +5-10ms por request
   - Mitigação: Aceitável para nosso SLA (<500ms)

3. **Recurso Adicional**
   - +250MB RAM por replica
   - Mitigação: Custo justificado pelos benefícios

## Consequências

### Positivas

- Centralização de autenticação e autorização
- Rate limiting consistente
- Métricas centralizadas
- Facilita troubleshooting (correlation ID)
- CORS gerenciado centralmente
- Possibilidade de A/B testing futuro
- Facilita migração de microservices

### Negativas

- Ponto único de falha (mitigado com HA)
- Latência adicional (~10ms)
- Recurso adicional a monitorar
- Complexidade adicional no stack

### Neutras

- Necessário aprender configuração Kong
- Mais um componente no deploy

## Implementação

### Deployment Kubernetes

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: kong
  namespace: workshop
spec:
  replicas: 2
  selector:
    matchLabels:
      app: kong
  template:
    spec:
      containers:
        - name: kong
          image: kong:3.5
          env:
            - name: KONG_DATABASE
              value: "off"
            - name: KONG_DECLARATIVE_CONFIG
              value: "/kong/declarative/kong.yml"
```

### Configuração JWT

```yaml
routes:
  - name: service-orders-route
    paths:
      - /service-orders
    methods:
      - GET
      - POST
    plugins:
      - name: jwt
        config:
          secret_is_base64: false
          claims_to_verify:
            - exp
```

### Rate Limiting

```yaml
plugins:
  - name: rate-limiting
    config:
      minute: 100
      hour: 5000
      policy: local
```

## Alternativas Consideradas

### Por que não AWS API Gateway?
- Vendor lock-in forte
- Custo pode escalar ($3.50 por milhão)
- Menos flexível para configurações avançadas
- Não roda em outras clouds

### Por que não Nginx Ingress puro?
- Faltam plugins prontos (JWT, rate-limiting)
- Configuração mais manual
- Menos features out-of-the-box
- Mais trabalho de desenvolvimento

### Por que não Traefik?
- Dashboard não é requisito crítico
- Configuração mais complexa para JWT
- Menos maturidade em features avançadas
- Comunidade menor

### Por que não Custom (NestJS)?
- Overhead de desenvolvimento alto
- Dificulta scaling independente
- Mistura concerns (gateway + aplicação)
- Não reutilizável para futuros microservices

## Métricas de Validação

Após 3 meses, validaremos:

- [ ] Latência adicional < 15ms (p95)
- [ ] Taxa de erro < 0.1%
- [ ] Uptime > 99.9%
- [ ] CPU usage < 50%
- [ ] Memory usage < 80%
- [ ] Zero incidentes de segurança

## Notas Adicionais

### Migração Futura
Se Kong não atender, migramos para:
1. **Plano A**: Traefik (similar, configuração diferente)
2. **Plano B**: Nginx Ingress + Custom middleware
3. **Plano C**: Cloud-specific (API Gateway, GCP API Gateway)

### Plugins Futuros Potenciais
- Request/Response transformation
- OAuth2 integration
- GraphQL proxy
- WebSocket support
- gRPC support

## Referências

- [Kong Gateway Documentation](https://docs.konghq.com/gateway/latest/)
- [Kong DB-less Mode](https://docs.konghq.com/gateway/latest/production/deployment-topologies/db-less-and-declarative-config/)
- [Kong JWT Plugin](https://docs.konghq.com/hub/kong-inc/jwt/)
- [Kong Rate Limiting](https://docs.konghq.com/hub/kong-inc/rate-limiting/)
- [Kubernetes Deployment Best Practices](https://kubernetes.io/docs/concepts/configuration/overview/)

---

**Decisão tomada em**: 2024-03-15  
**Revisão programada para**: 2024-09-15 (6 meses)
