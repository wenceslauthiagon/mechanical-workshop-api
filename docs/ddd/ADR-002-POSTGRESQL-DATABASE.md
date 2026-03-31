# ADR 002 - PostgreSQL como Banco de Dados Principal

**Status**: Aceito  
**Data**: 2024-03-15  
**Decisores**: Arquiteto de Dados, DBA, Tech Lead

## Contexto e Problema

O sistema de oficina mecânica precisa armazenar dados relacionais complexos:
- Clientes (pessoas físicas e jurídicas)
- Veículos (relacionados a clientes)
- Ordens de serviço (relacionadas a veículos)
- Serviços e peças (many-to-many com ordens)
- Histórico completo de transações

Precisamos escolher um banco de dados que:
- Suporte relacionamentos complexos
- Garanta consistência (ACID)
- Tenha boa performance
- Seja econômico
- Tenha tooling maduro

## Fatores de Decisão

- Suporte a transações ACID
- Performance em queries complexas (JOINs)
- Suporte a JSON (flexibilidade futura)
- Custo (managed service)
- Comunidade e ecossistema
- ORMs disponíveis (Prisma)
- Backup e recovery
- Escalabilidade
- Features avançadas (Full-text search, GIS)

## Opções Consideradas

### Opção 1: PostgreSQL 16
- Relacional puro
- ACID completo
- JSON/JSONB nativo
- Full-text search
- Extensível (PostGIS, pgcrypto)
- Open source (PostgreSQL License)

### Opção 2: MySQL 8
- Relacional puro
- ACID completo
- JSON suportado
- Open source (GPL)
- Muito popular

### Opção 3: MongoDB
- NoSQL (document-based)
- Schema flexível
- Boa performance horizontal
- Não ideal para relações complexas

### Opção 4: SQL Server
- Relacional robusto
- Features enterprise
- Licença cara
- Lock-in Microsoft

## Decisão

**Escolhido: PostgreSQL 16 (Managed - Azure Database for PostgreSQL)**

## Justificativa

### Argumentos Técnicos Positivos

1. **ACID Garantido**
   - Transações robustas
   - Isolamento configurável
   - Consistência garantida
   - Durabilidade em falhas

2. **Relacionamentos Complexos**
   - Foreign keys com cascade
   - Multiple JOINs performáticos
   - CTEs (Common Table Expressions)
   - Window functions
   
   Exemplo do nosso schema:
   ```sql
   -- Service Order tem relação com:
   service_orders
     ↓ belongs to customer
     ↓ belongs to vehicle
     ↓ has many service_order_services
     ↓ has many service_order_parts
   ```

3. **Performance Excelente**
   - Indexes B-tree, Hash, GiST, GIN
   - Query planner inteligente
   - EXPLAIN ANALYZE para otimização
   - Vacuum automático
   - Connection pooling (pgBouncer)

4. **JSON/JSONB Nativo**
   - Flexibilidade para dados semi-estruturados
   - Queries em campos JSON
   - Indexes em JSON (GIN)
   
   Exemplo:
   ```sql
   SELECT * FROM service_orders
   WHERE metadata @> '{"priority": "high"}';
   ```

5. **Features Avançadas**
   - **Full-text search**: Busca de peças/serviços
   - **Arrays**: Armazenar tags
   - **ENUM types**: Status de OS
   - **Generated columns**: Cálculos automáticos
   - **Triggers**: Auditoria automática
   - **Materialized views**: Dashboards rápidos

6. **Tooling Excelente**
   - **Prisma ORM**: Type-safe, migrations
   - **pgAdmin**: Interface gráfica
   - **psql**: CLI poderoso
   - **pg_stat_statements**: Análise de queries

7. **Managed Service (Azure)**
   - HA com failover automático
   - Backups diários (35 dias retenção)
   - Point-in-time recovery
   - SSL/TLS obrigatório
   - Patches automáticos
   - Read replicas
   - Scaling vertical fácil

8. **Open Source**
   - Licença PostgreSQL (permissiva)
   - Sem vendor lock-in no código
   - Comunidade gigante
   - Portável entre clouds

9. **Custo-Benefício**
   - Azure Database: ~$300/mês (4 vCPU, 16GB)
   - Alternativa self-hosted: ~$200/mês + trabalho operacional
   - MySQL similar: ~$280/mês
   - SQL Server: ~$1,200/mês

### Comparação com Alternativas

| Feature | PostgreSQL | MySQL | MongoDB | SQL Server |
|---------|------------|-------|---------|------------|
| ACID | ✅ Full | ✅ Full | ⚠️ Limitado | ✅ Full |
| JOINs | ✅ Excelente | ✅ Bom | ❌ N/A | ✅ Excelente |
| JSON | ✅ JSONB | ⚠️ Limitado | ✅ Nativo | ✅ Bom |
| Full-text | ✅ Nativo | ✅ Nativo | ✅ Nativo | ✅ Nativo |
| Extensibilidade | ✅ Plugins | ⚠️ Limitado | ⚠️ Limitado | ⚠️ Proprietário |
| Custo Managed | $300/mês | $280/mês | $250/mês | $1,200/mês |
| Prisma Support | ✅ Excelente | ✅ Bom | ✅ Bom | ✅ Bom |
| Comunidade | 🌟🌟🌟🌟🌟 | 🌟🌟🌟🌟 | 🌟🌟🌟🌟 | 🌟🌟🌟 |

## Modelo Relacional Justificado

> 📊 **Diagrama ER completo (Mermaid)**: [ER-DIAGRAM.md](./ER-DIAGRAM.md)

### Schema Principal

```sql
-- Clientes (físicos e jurídicos)
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document VARCHAR(14) UNIQUE NOT NULL, -- CPF ou CNPJ
  type VARCHAR(20) NOT NULL, -- PESSOA_FISICA | PESSOA_JURIDICA
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  address_street VARCHAR(255),
  address_city VARCHAR(100),
  address_state VARCHAR(2),
  address_zip_code VARCHAR(9),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_customers_document ON customers(document);
CREATE INDEX idx_customers_type ON customers(type);

-- Veículos (many-to-one com customer)
CREATE TABLE vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  license_plate VARCHAR(8) UNIQUE NOT NULL,
  brand VARCHAR(50) NOT NULL,
  model VARCHAR(100) NOT NULL,
  year INTEGER NOT NULL,
  color VARCHAR(30),
  chassis VARCHAR(17),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_vehicles_customer ON vehicles(customer_id);
CREATE INDEX idx_vehicles_plate ON vehicles(license_plate);

-- Serviços (catálogo)
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  estimated_time_minutes INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Peças (catálogo)
CREATE TABLE parts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_parts_stock ON parts(stock_quantity);

-- Ordens de Serviço
CREATE TYPE service_order_status AS ENUM (
  'PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'
);

CREATE TABLE service_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id),
  vehicle_id UUID NOT NULL REFERENCES vehicles(id),
  status service_order_status NOT NULL DEFAULT 'PENDING',
  total_budget DECIMAL(10,2),
  estimated_time_minutes INTEGER,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_so_customer ON service_orders(customer_id);
CREATE INDEX idx_so_vehicle ON service_orders(vehicle_id);
CREATE INDEX idx_so_status ON service_orders(status);
CREATE INDEX idx_so_created ON service_orders(created_at DESC);

-- Many-to-many: Service Orders <-> Services
CREATE TABLE service_order_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_order_id UUID NOT NULL REFERENCES service_orders(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_sos_order ON service_order_services(service_order_id);

-- Many-to-many: Service Orders <-> Parts
CREATE TABLE service_order_parts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_order_id UUID NOT NULL REFERENCES service_orders(id) ON DELETE CASCADE,
  part_id UUID NOT NULL REFERENCES parts(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_sop_order ON service_order_parts(service_order_id);
```

### Justificativa dos Relacionamentos

1. **Customer → Vehicle** (one-to-many)
   - Cliente pode ter múltiplos veículos
   - Veículo pertence a um único cliente
   - ON DELETE CASCADE: Remove veículos se cliente deletado

2. **Vehicle → Service Order** (one-to-many)
   - Veículo pode ter múltiplas OS
   - OS pertence a um veículo específico
   - Histórico completo por veículo

3. **Service Order → Services** (many-to-many)
   - OS pode ter múltiplos serviços
   - Serviço pode estar em múltiplas OS
   - Tabela intermediária armazena quantidade e preço

4. **Service Order → Parts** (many-to-many)
   - OS pode usar múltiplas peças
   - Peça pode ser usada em múltiplas OS
   - Controle de estoque na tabela principal

### Queries Comuns Otimizadas

```sql
-- 1. Buscar todas OS de um cliente (com veículo)
SELECT 
  so.*,
  v.license_plate,
  v.brand,
  v.model
FROM service_orders so
INNER JOIN vehicles v ON v.id = so.vehicle_id
WHERE so.customer_id = $1
ORDER BY so.created_at DESC;

-- 2. Calcular orçamento total de uma OS
SELECT 
  so.id,
  COALESCE(SUM(sos.quantity * sos.price), 0) + 
  COALESCE(SUM(sop.quantity * sop.price), 0) AS total_budget
FROM service_orders so
LEFT JOIN service_order_services sos ON sos.service_order_id = so.id
LEFT JOIN service_order_parts sop ON sop.service_order_id = so.id
WHERE so.id = $1
GROUP BY so.id;

-- 3. Relatório de peças mais usadas
SELECT 
  p.name,
  COUNT(sop.id) AS usage_count,
  SUM(sop.quantity) AS total_quantity
FROM parts p
INNER JOIN service_order_parts sop ON sop.part_id = p.id
WHERE sop.created_at >= NOW() - INTERVAL '30 days'
GROUP BY p.id, p.name
ORDER BY usage_count DESC
LIMIT 10;
```

## Consequências

### Positivas

- **Integridade garantida**: Foreign keys previnem inconsistências
- **Queries complexas**: JOINs múltiplos performáticos
- **Transações seguras**: ACID para operações críticas
- **Auditoria fácil**: Triggers para histórico
- **Análises SQL**: Relatórios com queries nativas
- **Backup confiável**: Point-in-time recovery
- **Escalabilidade vertical**: Aumentar recursos facilmente
- **Read replicas**: Queries de leitura distribuídas

### Negativas

- **Custo**: $300/mês (vs SQLite grátis)
  - Mitigação: Justificado por HA e managed service
- **Latência de rede**: ~5-10ms
  - Mitigação: Connection pooling, cache (Redis)
- **Schema rígido**: Mudanças requerem migrations
  - Mitigação: Prisma migrations automatizadas
- **Scaling horizontal complexo**: Sharding não trivial
  - Mitigação: Não necessário neste momento (< 1M registros)

### Neutras

- Necessário aprender SQL avançado
- Monitoramento de performance (slow queries)
- Tuning de indexes

## Alternativas Rejeitadas

### Por que não MongoDB?
- Relacionamentos são primeira-classe no nosso domínio
- JOINs seriam simulados no código (complexidade)
- Queries agregadas menos performáticas
- Perda de ACID em transações multi-documento
- Menos suporte do Prisma

### Por que não MySQL?
- PostgreSQL tem features superiores (JSONB, Arrays, Full-text)
- Comunidade PostgreSQL mais ativa em inovação
- Melhor suporte a concurrency (MVCC)
- MySQL 8 bom, mas PostgreSQL excelente

### Por que não SQL Server?
- Custo 4x maior ($1,200 vs $300)
- Lock-in Microsoft desnecessário
- Features avançadas não são requisitos
- PostgreSQL atende 100% das necessidades

## Plano de Escalabilidade

### Fase 1: Current (< 100k OS/mês)
- Single instance (4 vCPU, 16GB)
- Caching com Redis
- Connection pooling

### Fase 2: Growth (100k - 500k OS/mês)
- Vertical scaling (8 vCPU, 32GB)
- 2 read replicas
- Query optimization

### Fase 3: Scale (> 500k OS/mês)
- Horizontal partitioning (por região)
- Sharding strategy
- Considerar CockroachDB (PostgreSQL compatible + distributed)

## Métricas de Validação

Após 3 meses:
- [ ] Query p95 < 100ms
- [ ] Uptime > 99.9%
- [ ] Storage growth < 10GB/mês
- [ ] Slow queries < 1% do total
- [ ] Connection pool efficiency > 80%

## Referências

- [PostgreSQL Documentation](https://www.postgresql.org/docs/16/)
- [Azure Database for PostgreSQL](https://learn.microsoft.com/azure/postgresql/)
- [Prisma with PostgreSQL](https://www.prisma.io/docs/concepts/database-connectors/postgresql)
- [PostgreSQL Performance Tuning](https://wiki.postgresql.org/wiki/Performance_Optimization)
- [Database Reliability Engineering](https://www.oreilly.com/library/view/database-reliability-engineering/9781491925935/)

---

**Decisão tomada em**: 2024-03-15  
**Revisão programada para**: 2024-09-15 (6 meses)
