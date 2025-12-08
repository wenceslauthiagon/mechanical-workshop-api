# Pet Management API

API RESTful para gerenciamento de pets (cães e gatos) construída com **Clean Architecture**, **TypeScript** e princípios **SOLID**.

## 🏗️ Arquitetura

O projeto segue os princípios da **Clean Architecture** com separação clara de responsabilidades:

```
src/
├── domain/              # Camada de Domínio
│   ├── entities/        # Entidades do negócio
│   └── repositories/    # Interfaces dos repositórios (Port Out)
├── application/         # Camada de Aplicação
│   └── use-cases/       # Casos de uso (Port In)
├── infrastructure/      # Camada de Infraestrutura
│   ├── api/            # Controllers, Routes, DTOs (Adapters)
│   └── database/       # Implementação dos repositórios (Adapters)
└── shared/             # Código compartilhado
    ├── constants/      # Constantes e enums
    ├── errors/         # Exceções customizadas
    └── services/       # Serviços compartilhados (ex: ErrorHandler)
```

### Princípios Aplicados

- ✅ **Clean Code**: Código limpo, legível e bem organizado
- ✅ **Clean Architecture**: Separação de camadas e dependências
- ✅ **SOLID**: Todos os 5 princípios aplicados
- ✅ **Ports & Adapters**: Inversão de dependências
- ✅ **TypeScript strict mode**: Sem uso de `any`
- ✅ **Dependency Injection**: Injeção de dependências manual
- ✅ **Error Handling Service**: Tratamento centralizado de erros
- ✅ **Constants**: Sem valores hardcoded, uso de constantes

## 🚀 Tecnologias

- **Node.js** + **TypeScript**
- **Express** - Framework web
- **Prisma ORM** - ORM para PostgreSQL
- **PostgreSQL** - Banco de dados
- **Zod** - Validação de schemas
- **Jest** - Testes unitários

## 📋 Funcionalidades

### Gerenciamento de Pets
- Cadastro de pets (cães e gatos)
- Atualização de informações
- Listagem por proprietário
- Exclusão de pets

### Controle de Vacinas
- Registro de vacinas aplicadas
- Agendamento de próximas doses
- Histórico completo de vacinação
- Alertas de vacinas atrasadas

### Gestão de Medicações
- Registro de medicações
- Controle de dosagem e frequência
- Medicações ativas
- Histórico de tratamentos

### Consultas Veterinárias
- Registro de visitas ao veterinário
- Histórico médico completo
- Diagnósticos e tratamentos
- Resultados de exames

## 🔧 Instalação

### Pré-requisitos

- Node.js 18+ 
- PostgreSQL 14+
- npm ou yarn

### Passos

1. **Clone o repositório**
```bash
git clone <repository-url>
cd pet-management-api
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**

Crie um arquivo `.env` na raiz do projeto:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/pet_management?schema=public"
PORT=3000
NODE_ENV=development
```

4. **Execute as migrations do banco**
```bash
npm run prisma:migrate
```

5. **Gere o Prisma Client**
```bash
npm run prisma:generate
```

6. **Inicie o servidor**
```bash
npm run dev
```

O servidor estará disponível em `http://localhost:3000`

## 📚 API Endpoints

### Owners (Proprietários)

```http
POST   /api/owners           # Criar proprietário
GET    /api/owners/:id       # Buscar por ID
```

### Pets

```http
POST   /api/pets                  # Cadastrar pet
GET    /api/pets/:id              # Buscar por ID
GET    /api/pets/owner/:ownerId  # Listar pets do proprietário
PUT    /api/pets/:id              # Atualizar pet
DELETE /api/pets/:id              # Deletar pet
```

### Vacinas

```http
POST   /api/vaccines              # Registrar vacina
GET    /api/vaccines/pet/:petId   # Listar vacinas do pet
PUT    /api/vaccines/:id          # Atualizar vacina
```

### Medicações

```http
POST   /api/medications                   # Agendar medicação
GET    /api/medications/pet/:petId        # Listar medicações do pet
GET    /api/medications/pet/:petId/active # Listar medicações ativas
```

### Consultas Veterinárias

```http
POST   /api/veterinary-visits              # Registrar consulta
GET    /api/veterinary-visits/pet/:petId   # Listar consultas do pet
```

## 📝 Exemplos de Request

### Criar Proprietário

```json
POST /api/owners
{
  "name": "João Silva",
  "email": "joao@example.com",
  "phone": "+5511999999999",
  "address": "Rua Exemplo, 123"
}
```

### Cadastrar Pet

```json
POST /api/pets
{
  "name": "Rex",
  "type": "DOG",
  "breed": "Golden Retriever",
  "gender": "MALE",
  "birthDate": "2020-05-15T00:00:00.000Z",
  "weight": 25.5,
  "color": "Dourado",
  "microchipNumber": "123456789",
  "ownerId": "uuid-do-proprietario"
}
```

### Registrar Vacina

```json
POST /api/vaccines
{
  "petId": "uuid-do-pet",
  "name": "V10",
  "description": "Vacina polivalente",
  "scheduledDate": "2024-01-15T10:00:00.000Z",
  "applicationDate": "2024-01-15T10:30:00.000Z",
  "nextDoseDate": "2024-02-15T10:00:00.000Z",
  "veterinarianName": "Dr. Carlos",
  "clinicName": "Clínica VetLife",
  "status": "APPLIED"
}
```

### Agendar Medicação

```json
POST /api/medications
{
  "petId": "uuid-do-pet",
  "name": "Antibiótico X",
  "type": "comprimido",
  "dosage": "500mg",
  "frequency": "TWICE_DAILY",
  "startDate": "2024-01-10T00:00:00.000Z",
  "endDate": "2024-01-20T00:00:00.000Z",
  "prescribedBy": "Dr. Carlos",
  "reason": "Infecção bacteriana",
  "instructions": "Administrar com alimento",
  "status": "ACTIVE"
}
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
<<<<<<< HEAD
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
=======
# Executar todos os testes
npm test

# Executar com watch mode
npm run test:watch

# Coverage
npm run test -- --coverage
>>>>>>> origin/develop
```

## 📦 Scripts Disponíveis

```bash
npm run dev           # Desenvolvimento com hot reload
npm run build         # Build para produção
npm start            # Iniciar servidor de produção
npm test             # Executar testes
npm run lint         # Verificar código
npm run format       # Formatar código
npm run prisma:migrate    # Executar migrations
npm run prisma:generate   # Gerar Prisma Client
npm run prisma:studio     # Abrir Prisma Studio
```

## 🗄️ Modelo de Dados

### Entidades Principais

- **Owner**: Proprietário do pet
- **Pet**: Informações do animal
- **Vaccine**: Registro de vacinas
- **Medication**: Controle de medicamentos
- **MedicationDose**: Doses administradas
- **VeterinaryVisit**: Consultas veterinárias

### Relacionamentos

- Um Owner pode ter vários Pets
- Um Pet pode ter várias Vaccines, Medications e VeterinaryVisits
- Uma Medication pode ter várias MedicationDoses

## 🎯 Próximos Passos

Para integração com app Android:

1. **Autenticação**: Implementar JWT/OAuth
2. **Websockets**: Notificações em tempo real
3. **Upload de imagens**: Fotos dos pets
4. **Agendamentos**: Sistema de lembretes push
5. **Relatórios**: Gráficos e estatísticas
6. **Exportação**: PDF dos históricos médicos

## Phase 2 (Tech Challenge) Deliverables

- Dockerfile: docker/Dockerfile
- docker-compose: docker/docker-compose.yml
- Kubernetes manifests: k8s/*.yaml
- Terraform scaffold: infra/*.tf
- CI/CD workflow: .github/workflows/ci-cd.yml
- Unit test example: src/__tests__/health.test.ts

Follow the repository structure and update secrets and image references before deploying to a cloud provider.

## 🏗️ Padrões de Código

### Error Handling

O projeto utiliza um serviço centralizado de tratamento de erros (`ErrorHandlerService`) que:

- Normaliza todos os erros para um formato consistente
- Trata erros específicos do Prisma (constraint violations, not found, etc)
- Usa constantes para mensagens de erro (sem hardcoded strings)
- Mapeia erros de domínio para status HTTP apropriados
- Registra logs estruturados

Exemplo de uso:
```typescript
const errorHandlerService = new ErrorHandlerService();
const errorDetails = errorHandlerService.handleError(error);
// { message, statusCode, timestamp, error }
```

### Constants

Todas as mensagens e valores fixos estão em arquivos de constantes:

- `ERROR_MESSAGES`: Mensagens de erro
- `SUCCESS_MESSAGES`: Mensagens de sucesso
- `HTTP_STATUS`: Códigos HTTP

Isso facilita:
- Manutenção e alterações
- Internacionalização (i18n) futura
- Consistência das mensagens
- Testes mais robustos

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou pull requests.

## 📄 Licença

MIT

---

Desenvolvido com ❤️ seguindo as melhores práticas de Clean Code e Clean Architecture
