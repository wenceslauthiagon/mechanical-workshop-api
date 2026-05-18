# Azure Function - CPF Authentication

Função serverless para autenticação de clientes via CPF, gerando tokens JWT para acesso às APIs protegidas.

## 📋 Funcionalidades

- ✅ Validação de CPF (algoritmo completo)
- ✅ Consulta ao banco de dados PostgreSQL
- ✅ Validação de status do cliente (ativo/inativo)
- ✅ Verificação de tipo de cliente (Pessoa Física)
- ✅ Geração de token JWT
- ✅ Tratamento de erros robusto

## 🚀 Tecnologias

- Azure Functions v4
- TypeScript
- Prisma ORM
- jsonwebtoken
- PostgreSQL

## 📦 Instalação

```bash
npm install
```

## ⚙️ Configuração

1. Copie o arquivo de configuração:
```bash
cp local.settings.example.json local.settings.json
```

2. Configure as variáveis de ambiente em `local.settings.json`:
```json
{
  "Values": {
    "JWT_SECRET": "your-secret-key",
    "JWT_EXPIRATION": "24h",
    "DATABASE_URL": "postgresql://user:pass@host:5432/db"
  }
}
```

## 🏃 Execução Local

```bash
npm start
```

A função estará disponível em: `http://localhost:7071/api/auth`

## 📝 Uso da API

### Autenticação via CPF

**Endpoint:** `POST /api/auth`

**Request Body:**
```json
{
  "cpf": "12345678900"
}
```

**Response Success (200):**
```json
{
  "message": "Autenticação realizada com sucesso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "customer": {
    "id": "uuid",
    "name": "João Silva",
    "email": "joao@email.com",
    "document": "12345678900"
  }
}
```

**Response Error (400 - CPF Inválido):**
```json
{
  "message": "CPF inválido",
  "error": "Bad Request",
  "statusCode": 400
}
```

**Response Error (404 - Cliente não encontrado):**
```json
{
  "message": "Cliente não encontrado",
  "error": "Not Found",
  "statusCode": 404
}
```

## 🧪 Testes

```bash
npm test
```

## 📊 Estrutura do Token JWT

O token JWT gerado contém as seguintes informações:

```json
{
  "customerId": "uuid",
  "document": "12345678900",
  "type": "PESSOA_FISICA",
  "name": "João Silva",
  "email": "joao@email.com",
  "iat": 1234567890,
  "exp": 1234567890,
  "iss": "mechanical-workshop-auth",
  "sub": "uuid"
}
```

## 🔒 Segurança

- Validação completa do CPF (dígitos verificadores)
- Verificação de tipo de cliente
- Tokens com expiração configurável
- Ambiente isolado (serverless)
- Suporte a HTTPS

## 🌐 Deploy

### Azure

```bash
# Login no Azure
az login

# Criar Function App
az functionapp create --resource-group <rg> --consumption-plan-location <location> --runtime node --runtime-version 18 --functions-version 4 --name <function-name> --storage-account <storage>

# Deploy
func azure functionapp publish <function-name>
```

### Variáveis de Ambiente no Azure

```bash
az functionapp config appsettings set --name <function-name> --resource-group <rg> --settings JWT_SECRET=<secret> JWT_EXPIRATION=24h DATABASE_URL=<db-url>
```

## 📖 Documentação Adicional

- [Azure Functions Documentation](https://docs.microsoft.com/azure/azure-functions/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc7519)

## 🔗 Links Relacionados

- Repositório da Aplicação Principal
- Repositório da Infraestrutura Kubernetes
- Repositório da Infraestrutura do Banco de Dados
