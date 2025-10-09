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

## 🐳 Quick Start com Docker (Recomendado)

### Pré-requisitos
- Docker
- Docker Compose
- Make (opcional, mas recomendado)

### Setup Rápido

1. **Clone o repositório**
```bash
git clone <repository-url>
cd mechanical-workshop-api
```

2. **Inicie todo o ambiente**
```bash
# Com Make (recomendado)
make setup

# Ou manualmente
docker-compose build
docker-compose up -d
```

3. **Verifique se está funcionando**
```bash
# Com Make
make health

# Ou manualmente
curl http://localhost:3000/health
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

## 🧪 Testes

```bash
# Local
npm run test
npm run test:cov
npm run test:e2e

# Docker
make test
make test-cov
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

## 🔧 Troubleshooting

### Problemas Comuns

1. **Porta 3000 em uso**
```bash
# Alterar porta no docker-compose.yml
ports:
  - "3001:3000"  # Host:Container
```

2. **Banco não conecta**
```bash
# Verificar logs
make logs-db
make logs-app

# Resetar ambiente
make clean
make setup
```

3. **Container não inicia**
```bash
# Rebuild completo
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

## 📊 Monitoramento

### Health Checks
- **API**: `GET /health`
- **Database**: Verificação automática no container

### Métricas Disponíveis
- Estatísticas de execução de serviços
- Precisão de orçamentos
- Tempo médio de atendimento

## 📝 Licença

Este projeto está sob a licença MIT.
