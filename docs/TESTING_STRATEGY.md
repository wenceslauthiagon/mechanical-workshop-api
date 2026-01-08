# Testing Strategy

## Overview

This document outlines the testing strategy for the Mechanical Workshop API project, following industry best practices and professional standards.

## Test Pyramid

```
           /\
          /  \
         / E2E\
        /______\
       /        \
      /Integration\
     /______________\
    /                \
   /   Unit Tests     \
  /____________________\
```

### 1. Unit Tests (Base)
- **Location**: `test/workshop/`
- **Purpose**: Test individual units of code in isolation
- **Coverage Target**: 100% for domain layer
- **Run Command**: `npm test`

**What to test:**
- Domain Services (`3-domain/domain-services/`)
- Domain Entities (`3-domain/entities/`)
- Value Objects (`3-domain/value-objects/`)
- Specifications (`3-domain/specifications/`)
- Policies (`3-domain/policies/`)
- Aggregates (`3-domain/aggregates/`)
- Application Services (`2-application/services/`)
- Controllers (`1-presentation/controllers/`)

**What NOT to test:**
- DTOs (data structures only)
- Interfaces (no logic)
- Configuration files
- Infrastructure wrappers (test with integration tests)

### 2. Integration Tests (Middle)
- **Location**: `test/integration/`
- **Purpose**: Test interaction between components and external dependencies
- **Database**: SQLite in-memory
- **Run Command**: `npm run test:e2e`

**What to test:**
- Repository implementations (`4-infrastructure/repositories/`)
- Database operations and queries
- Data persistence and retrieval
- Transaction handling
- Provider implementations (email, SMS, etc.)

**Example:**
```typescript
describe('Customer Repository Integration Tests', () => {
  let repository: CustomerRepository;
  let prisma: PrismaService;

  beforeAll(async () => {
    // Setup test module with real dependencies
    const module = await Test.createTestingModule({
      providers: [PrismaService, CustomerRepository],
    }).compile();
    
    repository = module.get(CustomerRepository);
    prisma = module.get(PrismaService);
  });

  it('TC001 - Should create and retrieve customer', async () => {
    const customer = await repository.create({...});
    const found = await repository.findById(customer.id);
    
    expect(found).toBeDefined();
    expect(found.id).toBe(customer.id);
  });
});
```

### 3. End-to-End Tests (Top)
- **Location**: `test/integration/` (HTTP tests)
- **Purpose**: Test complete user flows through HTTP API
- **Scope**: Full application with real database
- **Run Command**: `npm run test:e2e`

**What to test:**
- Complete business flows (create order → approve → complete)
- API endpoints integration
- Authentication and authorization
- Error handling and validation
- Business rule enforcement

## Test Patterns

### Naming Convention

```typescript
describe('ComponentName TypeOfTest', () => {
  describe('TC001 - Functional group description', () => {
    it('TC001 - Should do something specific', () => {
      // Test implementation
    });
    
    it('TC002 - Should handle error case', () => {
      // Test implementation
    });
  });
});
```

### Test Structure (AAA Pattern)

```typescript
it('TC001 - Should create customer successfully', () => {
  // Arrange
  const customerData = {
    name: 'John Doe',
    email: 'john@example.com',
    // ...
  };

  // Act
  const result = service.create(customerData);

  // Assert
  expect(result).toBeDefined();
  expect(result.name).toBe('John Doe');
});
```

### Test Data

- Use `@faker-js/faker/locale/pt_BR` for generating realistic test data
- Use valid Brazilian documents:
  - **CPF**: `52998224725`, `44451959007`, `11144477735`
  - **CNPJ**: `11222333000181`, `11444777000161`, `06990590000123`

### Mocking Strategy

**Unit Tests:**
```typescript
const mockRepository = {
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};
```

**Integration Tests:**
- Use real implementations
- Use test database (SQLite)
- Clean database between tests

## Coverage Requirements

### Domain Layer (3-domain)
- **Target**: 100% line coverage
- **Why**: Core business logic must be fully tested
- **Files**:
  - Value Objects: 100%
  - Entities: 100%
  - Domain Services: 100%
  - Aggregates: 100%
  - Specifications: 100%
  - Policies: 100% lines (branches may vary due to defensive code)

### Application Layer (2-application)
- **Target**: 90%+ coverage
- **Focus**: Business orchestration and error handling

### Presentation Layer (1-presentation)
- **Target**: 80%+ coverage
- **Focus**: Request validation and response mapping

### Infrastructure Layer (4-infrastructure)
- **Testing**: Integration tests only
- **Why**: These are wrappers around external dependencies
- **Excluded from unit test coverage**

## Configuration

### jest.config.js
```javascript
module.exports = {
  coveragePathIgnorePatterns: [
    '<rootDir>/src/workshop/1-presentation/dtos/',
    '<rootDir>/src/workshop/1-presentation/responses/',
    '<rootDir>/src/shared/config/',
    '<rootDir>/src/shared/constants/',
    '<rootDir>/src/workshop/4-infrastructure/',  // Integration tests only
  ],
};
```

### jest-e2e.json
```json
{
  "testRegex": ".integration-spec.ts$",
  "testTimeout": 30000
}
```

## Best Practices

### 1. Test Independence
- Each test Should be independent
- Clean database state between test suites
- Use `beforeAll`, `beforeEach`, `afterAll`, `afterEach` appropriately

### 2. Test Readability
- Clear test names describing behavior
- Consistent naming (TC001, TC002, etc.)
- Self-documenting tests
- No unnecessary comments

### 3. Test Maintainability
- DRY principle (Don't Repeat Yourself)
- Extract common setup to helper functions
- Use factories for test data
- Keep tests simple and focused

### 4. Test Performance
- Run unit tests frequently (fast)
- Run integration tests before commit
- Run E2E tests in CI/CD pipeline

## Continuous Integration

### Pre-commit
```bash
npm run test         # Unit tests
npm run lint         # Linting
npm run format       # Code formatting
```

### CI Pipeline
```bash
npm run test:cov     # Unit tests with coverage
npm run test:e2e     # Integration tests
```

### Coverage Reports
- Coverage reports generated in `coverage/` directory
- View with: `open coverage/index.html`
- Minimum thresholds enforced in CI

## Running Tests

```bash
# Run all unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:cov

# Run integration tests
npm run test:e2e

# Run specific test file
npm test customer.service.spec.ts

# Run tests matching pattern
npm test -- --testNamePattern="Should create"
```

## Debugging Tests

```bash
# Debug with VS Code
npm run test:debug

# Debug specific test
npm test -- --testNamePattern="TC001" --runInBand
```

## References

- [Jest Documentation](https://jestjs.io/)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
- [NestJS Testing](https://docs.nestjs.com/fundamentals/testing)
- [Clean Architecture Testing](https://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html)
