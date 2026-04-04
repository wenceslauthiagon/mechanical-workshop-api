# Migração SQLite → PostgreSQL Local

## ⚠️ Problema Resolvido
- **Antes**: SQLite local + PostgreSQL CI/CD = tipos inconsistentes (`number` vs `Prisma.Decimal`)
- **Depois**: PostgreSQL 16 em todos os ambientes = tipos consistentes

## 🚀 Passos para Migração

### 1. Iniciar PostgreSQL via Docker
```bash
docker-compose -f docker-compose.dev.yml up -d postgres
```

### 2. Verificar que PostgreSQL está rodando
```bash
docker-compose -f docker-compose.dev.yml ps
```

### 3. Regenerar Prisma Client para PostgreSQL
```bash
npm run db:generate
```

### 4. Executar Migrations
```bash
npm run db:migrate:deploy
```

### 5. (Opcional) Popular banco com dados de teste
```bash
npm run db:seed
```

### 6. Rodar testes
```bash
npm test
```

## 📋 Arquivo .env.development atualizado
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/mechanical_workshop?schema=public"
JWT_SECRET="REPLACE_WITH_JWT_SECRET"
PORT=3000

POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=mechanical_workshop
```

## 🔧 Docker Compose atualizado
- **Imagem**: `postgres:16-alpine` (antes era 15)
- **Porta**: `5432:5432` (antes era 5433:5432)
- **Database**: `mechanical_workshop`

## ✅ Benefícios
1. **Tipos consistentes**: `Prisma.Decimal` em todos os lugares
2. **Testes confiáveis**: Se passa local, passa no CI/CD
3. **SQL idêntico**: Mesmos comandos em dev e produção
4. **Sem surpresas**: Nenhum falso positivo nos testes

## 🗑️ Limpeza (opcional)
Após confirmar que tudo funciona, pode remover:
- `dev.db` (banco SQLite antigo)
- `prisma/schema.sqlite.prisma` (se não for usar mais)
