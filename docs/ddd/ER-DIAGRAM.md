# Diagrama ER — Mechanical Workshop

Diagrama Entity-Relationship completo do banco de dados PostgreSQL da aplicação.

## Diagrama Principal

```mermaid
erDiagram
    Customer {
        uuid   id           PK
        string document     UK "CPF ou CNPJ"
        string type            "PESSOA_FISICA | PESSOA_JURIDICA"
        string name
        string email        UK
        string phone
        string address
        string additionalInfo
        datetime createdAt
        datetime updatedAt
    }

    Vehicle {
        uuid   id           PK
        string licensePlate UK
        uuid   customerId   FK
        string brand
        string model
        int    year
        string color
        datetime createdAt
        datetime updatedAt
    }

    ServiceOrder {
        uuid     id                     PK
        string   orderNumber            UK
        uuid     customerId             FK
        uuid     vehicleId              FK
        uuid     mechanicId             FK "nullable"
        string   status                    "RECEIVED|IN_DIAGNOSIS|AWAITING_APPROVAL|IN_EXECUTION|FINISHED|DELIVERED"
        string   description
        float    totalServicePrice
        float    totalPartsPrice
        float    totalPrice
        float    estimatedTimeHours
        datetime estimatedCompletionDate
        datetime startedAt              "nullable"
        datetime completedAt            "nullable"
        datetime deliveredAt            "nullable"
        datetime approvedAt             "nullable"
        datetime createdAt
        datetime updatedAt
    }

    Service {
        uuid    id               PK
        string  name
        string  description      "nullable"
        float   price
        int     estimatedMinutes
        string  category
        boolean isActive
        datetime createdAt
        datetime updatedAt
    }

    Part {
        uuid    id          PK
        string  name
        string  description "nullable"
        string  partNumber  UK "nullable"
        float   price
        int     stock
        int     minStock
        string  supplier    "nullable"
        boolean isActive
        datetime createdAt
        datetime updatedAt
    }

    ServiceOrderItem {
        uuid  id             PK
        uuid  serviceOrderId FK
        uuid  serviceId      FK
        int   quantity
        float price
        float totalPrice
        datetime createdAt
    }

    ServiceOrderPart {
        uuid  id             PK
        uuid  serviceOrderId FK
        uuid  partId         FK
        int   quantity
        float price
        float totalPrice
        datetime createdAt
    }

    ServiceOrderStatusHistory {
        uuid     id             PK
        uuid     serviceOrderId FK
        string   status
        string   notes          "nullable"
        string   changedBy      "nullable"
        datetime createdAt
    }

    Mechanic {
        uuid    id              PK
        string  name
        string  email           UK
        string  phone           "nullable"
        string  specialties        "JSON array"
        boolean isActive
        boolean isAvailable
        int     experienceYears
        datetime createdAt
        datetime updatedAt
    }

    User {
        uuid    id           PK
        string  username     UK
        string  email        UK
        string  passwordHash
        string  role            "ADMIN | EMPLOYEE | CLIENT"
        boolean isActive
        datetime createdAt
        datetime updatedAt
    }

    Budget {
        uuid     id             PK
        uuid     serviceOrderId FK
        uuid     customerId     FK
        float    subtotal
        float    taxes
        float    discount
        float    total
        datetime validUntil
        string   status            "RASCUNHO|ENVIADO|APROVADO|REJEITADO"
        datetime sentAt         "nullable"
        datetime approvedAt     "nullable"
        datetime rejectedAt     "nullable"
        datetime createdAt
        datetime updatedAt
    }

    BudgetItem {
        uuid   id          PK
        uuid   budgetId    FK
        string type           "SERVICE | PART"
        uuid   serviceId   FK "nullable"
        uuid   partId      FK "nullable"
        string description
        int    quantity
        float  unitPrice
        float  total
        datetime createdAt
    }

    %% Relacionamentos
    Customer        ||--o{ Vehicle                   : "possui"
    Customer        ||--o{ ServiceOrder              : "solicita"
    Vehicle         ||--o{ ServiceOrder              : "tem"
    Mechanic        ||--o{ ServiceOrder              : "executa (nullable)"
    ServiceOrder    ||--o{ ServiceOrderItem          : "contém serviços"
    ServiceOrder    ||--o{ ServiceOrderPart          : "utiliza peças"
    ServiceOrder    ||--o{ ServiceOrderStatusHistory : "historico status"
    ServiceOrder    ||--o{ Budget                    : "gera orçamento"
    Service         ||--o{ ServiceOrderItem          : "referenciado em"
    Part            ||--o{ ServiceOrderPart          : "referenciada em"
    Budget          ||--o{ BudgetItem                : "tem itens"
```

---

## Descrição dos Relacionamentos

### `Customer` → `Vehicle` (1:N)
- Um cliente pode ter **múltiplos veículos**
- Um veículo pertence a **um único cliente**
- `ON DELETE CASCADE`: remover veículos ao remover cliente

### `Customer` → `ServiceOrder` (1:N)
- Um cliente pode ter **múltiplas ordens de serviço** abertas ao longo do tempo
- Permite rastrear histórico completo por cliente

### `Vehicle` → `ServiceOrder` (1:N)
- Um veículo pode ter **múltiplas OS** ao longo do tempo
- Permite rastrear histórico de manutenção por veículo

### `Mechanic` → `ServiceOrder` (1:N, opcional)
- Um mecânico pode estar responsável por **múltiplas OS**
- A relação é **nullable** (OS pode estar sem mecânico atribuído ainda)

### `ServiceOrder` → `ServiceOrderItem` (1:N) — tabela de junção com `Service`
- Uma OS pode ter **múltiplos serviços**
- Um serviço pode aparecer em **múltiplas OS**
- A tabela intermediária armazena `quantity`, `price` e `totalPrice` **no momento da OS** (histórico imutável)

### `ServiceOrder` → `ServiceOrderPart` (1:N) — tabela de junção com `Part`
- Uma OS pode utilizar **múltiplas peças**
- Uma peça pode ser usada em **múltiplas OS**
- Quantidade e preço armazenados na OS (snapshot)

### `ServiceOrder` → `ServiceOrderStatusHistory` (1:N)
- Auditoria completa de todas as transições de status
- Registra quem fez a mudança (`changedBy`) e notas opcionais

### `ServiceOrder` → `Budget` (1:N)
- Uma OS pode gerar **múltiplos orçamentos** (rascunhos, revisões)
- Orçamento tem ciclo de vida próprio (RASCUNHO → ENVIADO → APROVADO/REJEITADO)

### `Budget` → `BudgetItem` (1:N)
- Um orçamento é composto de **múltiplos itens**
- Cada item pode referenciar um `Service` ou uma `Part`

---

## Índices Estratégicos

| Tabela | Campo(s) | Justificativa |
|---|---|---|
| `customers` | `document` | Busca por CPF/CNPJ (autenticação) |
| `customers` | `email` | Unique constraint |
| `vehicles` | `licensePlate` | Busca por placa |
| `vehicles` | `customerId` | JOIN frequente |
| `service_orders` | `customerId` | Listar OS por cliente |
| `service_orders` | `vehicleId` | Listar OS por veículo |
| `service_orders` | `status` | Filtros de status (dashboard) |
| `service_orders` | `createdAt DESC` | Paginação cronológica |
| `service_orders` | `mechanicId` | Listar OS por mecânico |
| `service_order_items` | `serviceOrderId` | Cascade delete + JOIN |
| `service_order_parts` | `serviceOrderId` | Cascade delete + JOIN |
| `parts` | `partNumber` | Busca por código de peça |
| `mechanics` | `email` | Unique constraint |
| `users` | `username`, `email` | Autenticação interna |

---

## Decisão de Design

Para detalhes sobre a escolha do PostgreSQL, estratégias de escalabilidade e comparação com alternativas, consulte:

- [ADR-002: PostgreSQL como Banco Principal](./ADR-002-POSTGRESQL-DATABASE.md)
