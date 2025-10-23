# 🔧 Mechanical Workshop API

[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)
[![Swagger](https://img.shields.io/badge/Swagger-85EA2D?style=for-the-badge&logo=swagger&logoColor=black)](https://swagger.io/)

Sistema de gestão para oficina mecânica desenvolvido com NestJS, Prisma e PostgreSQL, seguindo os princípios de **Domain-Driven Design (DDD)** e **Clean Architecture**.

## 🚀 Tecnologias

- **Backend**: NestJS 11 + TypeScript
- **Database**: PostgreSQL com Prisma ORM
- **Authentication**: JWT com bcryptjs
- **Documentation**: Swagger/OpenAPI
- **Architecture**: Clean Architecture (DDD)
- **Containerization**: Docker & Docker Compose

## 📋 Funcionalidades

### ✅ Gestão de Clientes
- CRUD completo de clientes
- Histórico de serviços por cliente
- API pública para consulta de orçamentos

### ✅ Gestão de Veículos
- CRUD de veículos
- Vinculação com clientes
- Histórico de manutenções

### ✅ Gestão de Peças
- CRUD de peças/produtos
- Controle de estoque
- Preços e fornecedores

### ✅ Gestão de Serviços
- CRUD de tipos de serviços
- Preços e descrições
- Tempo estimado de execução

### ✅ Ordens de Serviço
- CRUD completo
- Estados: PENDING, IN_PROGRESS, COMPLETED, CANCELLED
- Orçamento automático baseado em serviços e peças

### ✅ Autenticação e Autorização
- Sistema JWT completo
- Roles: ADMIN, EMPLOYEE
- Guards para proteção de rotas
- Decoradores personalizados

### ✅ Monitoramento
- Estatísticas de desempenho por serviço
- Tempo de execução e precisão de orçamentos
- Health checks

## 🏗️ Arquitetura

```
src/
├── 📁 workshop/
│   ├── 📁 1-presentation/     # Controllers e APIs REST
│   │   └── controllers/       # Endpoints HTTP
│   ├── 📁 2-application/      # Services e lógica de aplicação
│   │   └── services/          # Casos de uso
│   ├── 📁 3-domain/           # Entidades e regras de negócio
│   │   └── entities/          # Entidades do domínio
│   └── 📁 4-infrastructure/   # Repositórios e integrações
│       └── repositories/      # Implementação Prisma
├── 📁 auth/                   # Módulo de autenticação
│   ├── controllers/           # Auth controller
│   ├── services/              # Auth e User services
│   ├── guards/                # JWT guards e roles
│   └── decorators/            # Decoradores customizados
├── 📁 public/                 # API pública (sem auth)
└── 📁 shared/                 # Código compartilhado
    └── enums/                 # Enumerações
```

## � ANTES DE COMEÇAR (OBRIGATÓRIO)

**⚠️ ATENÇÃO: Sem estes passos, a aplicação NÃO irá funcionar!**

### 1. **Configure o arquivo .env (CRÍTICO)**
```bash
# Copie o arquivo de exemplo
cp .env.example .env

# Edite o .env com os valores corretos:
nano .env  # ou use seu editor preferido
```

**⚠️ IMPORTANTE:** Configure as variáveis obrigatórias:
- `DATABASE_URL` - URL de conexão do PostgreSQL
- `JWT_SECRET` - Chave JWT (mínimo 32 caracteres)
- `ADMIN_USERNAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` - Dados do usuário admin

**Veja o arquivo `.env.example` para referência dos valores necessários.**

### 2. **Verifique os pré-requisitos**
- ✅ Docker Desktop instalado e rodando
- ✅ Docker Compose disponível
- ✅ Porta 3000 livre (ou mude no docker-compose.yml)
- ✅ Porta 5433 livre (PostgreSQL)

## 🐳 Quick Start com Docker (Recomendado)

### Setup Passo a Passo

1. **Clone o repositório**
```bash
git clone https://github.com/wenceslauthiagon/mechanical-workshop-api.git
cd mechanical-workshop-api
```

2. **Configure o .env (OBRIGATÓRIO!)**
```bash
cp .env.example .env
# Edite o .env com os valores acima
```

3. **Inicie o ambiente (primeira vez)**
```bash
# Opção 1: Com Make (recomendado)
make setup

# Opção 2: Manualmente
docker-compose build --no-cache
docker-compose up -d
```

4. **Aguarde e verifique os logs**
```bash
# Ver se tudo iniciou corretamente
docker-compose logs -f

# Pressione Ctrl+C para sair dos logs
```

5. **Verifique se está funcionando**
```bash
# Teste a API
curl http://localhost:3000/health

# Ou abra no navegador:
# http://localhost:3000/health
# http://localhost:3000/api (Swagger)
```

### ✅ **Como saber se funcionou?**

Você deve ver estas mensagens nos logs:
```
✅ Banco de dados conectado!
✅ Nest.js application successfully started
✅ Mechanical Workshop API rodando em http://localhost:3000
```

E ao acessar `http://localhost:3000/health` deve retornar:
```json
{
  "status": "ok",
  "timestamp": "2025-10-11T12:00:00.000Z",
  "uptime": 3600,
  "service": "Mechanical Workshop API",
  "version": "1.0.0",
  "environment": "development"
}
```

### Comandos Docker Úteis

```bash
# Ver ajuda completa
make help

# Iniciar serviços
make up

# Ver logs
make logs

# Parar serviços  
make down

# Reiniciar
make restart

# Executar testes
make test

# Acessar shell da aplicação
make shell-app

# Backup do banco
make backup-db
```

### 🗄️ **Comandos do Banco (Prisma)**

```bash
# Gerar cliente Prisma
npm run db:generate

# Aplicar migrations (desenvolvimento)
npm run db:migrate

# Aplicar migrations (produção)
npm run db:migrate:deploy

# Resetar banco (⚠️ APAGA DADOS!)
npm run db:migrate:reset

# Sincronizar schema (desenvolvimento)
npm run db:push

# Abrir Prisma Studio (interface gráfica)
npm run db:studio
```

**Com Docker:**
```bash
# Aplicar migrations
docker-compose exec app npx prisma migrate deploy

# Abrir Prisma Studio
docker-compose exec app npx prisma studio
# Acesse: http://localhost:5555
```

## 🛠️ Instalação Local (Desenvolvimento)

### Pré-requisitos
- Node.js 18+
- PostgreSQL 13+
- npm ou yarn

### Setup Local

1. **Clone e instale dependências**
```bash
git clone <repository-url>
cd mechanical-workshop-api
npm install
```

2. **Configure ambiente**
```bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

3. **Setup do banco**
```bash
npx prisma migrate dev
npx prisma generate
npm run create-admin
```

4. **Inicie a aplicação**
```bash
npm run start:dev
```

## 🧪 Testing

### Testing Strategy

This project follows a comprehensive testing approach with three layers:

1. **Unit Tests** - Fast, isolated tests for domain logic (100% coverage target)
2. **Integration Tests** - Database and repository tests with SQLite
3. **E2E Tests** - Full application flow tests

For detailed information, see [Testing Strategy Documentation](./docs/TESTING_STRATEGY.md).

### Running Tests

```bash
# Unit tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:cov

# Integration tests
npm run test:e2e

# Run specific test file
npm test customer.service.spec.ts

# Run tests matching pattern
npm test -- --testNamePattern="Should create"
```

### With Docker

```bash
# Run all unit tests
make test

# Run with coverage
make test-cov

# Run integration tests
docker-compose exec app npm run test:e2e
```

### Coverage Requirements

| Layer | Target | Purpose |
|-------|--------|---------|
| Domain (3-domain) | 100% | Core business logic |
| Application (2-application) | 90%+ | Orchestration |
| Presentation (1-presentation) | 80%+ | Controllers |
| Infrastructure (4-infrastructure) | Integration only | External dependencies |

### Test Naming Convention

```typescript
describe('ServiceName Unit Tests', () => {
  describe('TC001 - Feature group', () => {
    it('TC001 - Should do something specific', () => {
      // Arrange
      const input = {...};
      
      // Act
      const result = service.method(input);
      
      // Assert
      expect(result).toBeDefined();
    });
  });
});
```

## 📚 API Documentation

### URLs Importantes
- **API**: http://localhost:3000
- **Swagger**: http://localhost:3000/api
- **Health Check**: http://localhost:3000/health

### Endpoints Principais

#### Autenticação
- `POST /auth/login` - Login do usuário
- `POST /auth/register` - Registro (apenas admins)

#### Clientes
- `GET /customers` - Listar clientes
- `POST /customers` - Criar cliente
- `GET /customers/:id` - Buscar cliente
- `PUT /customers/:id` - Atualizar cliente
- `DELETE /customers/:id` - Remover cliente

#### API Pública
- `GET /public/budget/:customerId/:vehicleId` - Consultar orçamento

#### Estatísticas (Protegido)
- `GET /service-stats` - Estatísticas gerais
- `GET /service-stats/by-service` - Por tipo de serviço

## 🗄️ Estrutura do Banco

### Principais Entidades
- **User**: Usuários do sistema (admin/funcionários)
- **Customer**: Clientes da oficina
- **Vehicle**: Veículos dos clientes
- **Part**: Peças e produtos
- **Service**: Tipos de serviços oferecidos
- **ServiceOrder**: Ordens de serviço
- **ServiceOrderItem**: Itens das ordens (serviços/peças)

## 🔒 Segurança

- Autenticação JWT com refresh tokens
- Senhas hasheadas com bcryptjs
- Roles e permissões granulares
- Validação de entrada com class-validator
- Rate limiting (configurável)
- Docker multi-stage builds com usuário não-root

## 🚀 Deploy

### Docker em Produção

1. **Configurar variáveis**
```bash
# Editar .env.docker com valores de produção
nano .env.docker
```

2. **Deploy**
```bash
make prod
```

### Variáveis de Ambiente

#### Desenvolvimento (.env)
```env
NODE_ENV=development
PORT=3000
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/mechanical_workshop?schema=public"
JWT_SECRET=your-dev-secret
JWT_EXPIRES_IN=7d
```

#### Produção (.env.docker)
```env
NODE_ENV=production
PORT=3000
DATABASE_URL="postgresql://postgres:postgres@postgres:5432/mechanical_workshop?schema=public"
JWT_SECRET=your-super-secret-production-key
JWT_EXPIRES_IN=7d
```

##  Monitoramento

### Health Checks
- **API**: `GET /health`
- **Database**: Verificação automática no container

### Métricas Disponíveis
- Estatísticas de execução de serviços
- Precisão de orçamentos
- Tempo médio de atendimento

## 📝 Licença

Este projeto está sob a licença MIT.
