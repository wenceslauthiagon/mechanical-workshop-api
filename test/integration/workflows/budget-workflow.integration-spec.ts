import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { AppModule } from '../../../src/app.module';
import { PrismaService } from '../../../src/prisma/prisma.service';
import request from 'supertest';
import * as bcrypt from 'bcryptjs';
import { faker } from '@faker-js/faker/locale/pt_BR';
import { generateValidCPF } from '../../utils/test-helpers';

const mockCustomer = {
  document: generateValidCPF(),
  type: 'PESSOA_FISICA' as const,
  name: faker.person.fullName(),
  email: faker.internet.email(),
  phone: `11${faker.string.numeric(9)}`,
  address: faker.location.streetAddress(),
};

const mockService = {
  name: `${faker.vehicle.type()} - ${faker.commerce.productName()}`,
  description: faker.commerce.productDescription(),
  price: faker.number.float({ min: 100, max: 500, fractionDigits: 2 }),
  estimatedMinutes: faker.number.int({ min: 60, max: 240 }),
  category: 'Manutenção Preventiva',
  isActive: true,
};

const mockPart = {
  name: `${faker.vehicle.type()} - ${faker.commerce.productName()}`,
  description: faker.commerce.productDescription(),
  partNumber: faker.string.alphanumeric(8).toUpperCase(),
  price: faker.commerce.price({ min: 50, max: 300, dec: 2 }),
  stock: faker.number.int({ min: 50, max: 100 }),
  minStock: faker.number.int({ min: 5, max: 15 }),
  supplier: faker.company.name(),
};

describe('Budget Workflow Integration Tests', () => {
  let app: INestApplication;
  let prisma: PrismaClient;
  let authToken: string;
  let customerId: string;
  let vehicleId: string;
  let serviceOrderId: string;
  let budgetId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
    prisma = app.get<PrismaService>(PrismaService);

    await prisma.$executeRaw`PRAGMA foreign_keys = OFF;`;
    await prisma.budgetItem.deleteMany();
    await prisma.budget.deleteMany();
    await prisma.serviceOrderItem.deleteMany();
    await prisma.serviceOrder.deleteMany();
    await prisma.vehicle.deleteMany();
    await prisma.part.deleteMany();
    await prisma.service.deleteMany();
    await prisma.mechanic.deleteMany();
    await prisma.customer.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$executeRaw`PRAGMA foreign_keys = ON;`;

    const hashedPassword = await bcrypt.hash('admin123', 10);
    await prisma.user.upsert({
      where: { email: 'admin@test.com' },
      update: {},
      create: {
        username: 'admin',
        passwordHash: hashedPassword,
        email: 'admin@test.com',
        role: 'ADMIN',
      },
    });

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        username: 'admin',
        password: 'admin123',
      });

    authToken = loginResponse.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('complete budget workflow from creation to customer approval', () => {
    it('TC0001 - Should create customer for budget', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/customers')
        .set('Authorization', `Bearer ${authToken}`)
        .send(mockCustomer);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      customerId = response.body.id;
    });

    it('TC0002 - Should create vehicle for customer', async () => {
      const vehicle = {
        licensePlate: `${faker.string.alpha({ length: 3, casing: 'upper' })}-${faker.string.numeric(4)}`,
        brand: faker.vehicle.manufacturer(),
        model: (faker.vehicle.model() || 'Model').padEnd(2, 'X'),
        year: faker.number.int({ min: 2015, max: 2024 }),
        color: faker.color.human(),
        customerId: customerId,
      };

      const response = await request(app.getHttpServer())
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${authToken}`)
        .send(vehicle);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      vehicleId = response.body.id;
    });

    it('TC0003 - Should create service for budget', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/services')
        .set('Authorization', `Bearer ${authToken}`)
        .send(mockService);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
    });

    it('TC0004 - Should create part for budget', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/parts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(mockPart);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
    });

    it('TC0005 - Should create service order', async () => {
      const serviceOrder = {
        customerId: customerId,
        vehicleId: vehicleId,
        description: faker.lorem.sentence(),
      };

      const response = await request(app.getHttpServer())
        .post('/api/service-orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send(serviceOrder);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      serviceOrderId = response.body.id;
    });

    it('TC0006 - Should create budget for service order', async () => {
      const budget = {
        serviceOrderId: serviceOrderId,
        customerId: customerId,
        validDays: 7,
        items: [
          {
            id: faker.string.uuid(),
            type: 'SERVICE',
            description: 'Troca de óleo',
            quantity: 1,
            unitPrice: 150.0,
            total: 150.0,
          },
          {
            id: faker.string.uuid(),
            type: 'PART',
            description: 'Filtro de óleo',
            quantity: 1,
            unitPrice: 45.0,
            total: 45.0,
          },
        ],
      };

      const response = await request(app.getHttpServer())
        .post('/budgets')
        .set('Authorization', `Bearer ${authToken}`)
        .send(budget);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.status).toBe('RASCUNHO');
      expect(response.body.serviceOrderId).toBe(serviceOrderId);
      budgetId = response.body.id;
    });

    it('TC0007 - Should get budget details with all items', async () => {
      const response = await request(app.getHttpServer())
        .get(`/budgets/${budgetId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(budgetId);
    });

    it('TC0008 - Should send budget to customer', async () => {
      const response = await request(app.getHttpServer())
        .put(`/budgets/${budgetId}/send`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('ENVIADO');
    });

    it('TC0009 - Should approve budget via public API', async () => {
      const response = await request(app.getHttpServer()).put(
        `/public/budgets/${budgetId}/approve`,
      );

      expect(response.status).toBe(200);
      expect(response.body.budget.status).toBe('APROVADO');
      expect(response.body).toHaveProperty('message');
    });

    it('TC0010 - Should verify service order status changed after budget approval', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/service-orders/${serviceOrderId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('EM_EXECUCAO');
    });

    it('TC0011 - Should access budget via public API', async () => {
      const response = await request(app.getHttpServer()).get(
        `/public/budgets/${budgetId}`,
      );

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(budgetId);
      expect(response.body.status).toBe('APROVADO');
    });
  });

  describe('budget rejection workflow', () => {
    let rejectionCustomerId: string;
    let rejectionVehicleId: string;
    let rejectionServiceOrderId: string;
    let rejectionBudgetId: string;

    it('TC0001 - Should create resources and budget for rejection flow', async () => {
      const customer = {
        document: generateValidCPF(),
        type: 'PESSOA_FISICA' as const,
        name: faker.person.fullName(),
        email: faker.internet.email(),
        phone: `11${faker.string.numeric(9)}`,
        address: faker.location.streetAddress(),
      };

      const customerResponse = await request(app.getHttpServer())
        .post('/api/customers')
        .set('Authorization', `Bearer ${authToken}`)
        .send(customer);

      rejectionCustomerId = customerResponse.body.id;

      const vehicle = {
        licensePlate: `${faker.string.alpha({ length: 3, casing: 'upper' })}-${faker.string.numeric(4)}`,
        brand: faker.vehicle.manufacturer(),
        model: (faker.vehicle.model() || 'Model').padEnd(2, 'X'),
        year: 2020,
        color: faker.color.human(),
        customerId: rejectionCustomerId,
      };

      const vehicleResponse = await request(app.getHttpServer())
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${authToken}`)
        .send(vehicle);

      rejectionVehicleId = vehicleResponse.body.id;

      const serviceOrder = {
        customerId: rejectionCustomerId,
        vehicleId: rejectionVehicleId,
        description: faker.lorem.sentence(),
      };

      const osResponse = await request(app.getHttpServer())
        .post('/api/service-orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send(serviceOrder);

      rejectionServiceOrderId = osResponse.body.id;

      const budget = {
        serviceOrderId: rejectionServiceOrderId,
        customerId: rejectionCustomerId,
        validDays: 7,
        items: [
          {
            id: faker.string.uuid(),
            type: 'SERVICE',
            description: mockService.name,
            quantity: 1,
            unitPrice: mockService.price,
            total: mockService.price,
          },
        ],
      };

      const budgetResponse = await request(app.getHttpServer())
        .post('/budgets')
        .set('Authorization', `Bearer ${authToken}`)
        .send(budget);

      rejectionBudgetId = budgetResponse.body.id;

      const sendResponse = await request(app.getHttpServer())
        .put(`/budgets/${rejectionBudgetId}/send`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(customerResponse.status).toBe(201);
      expect(vehicleResponse.status).toBe(201);
      expect(osResponse.status).toBe(201);
      expect(budgetResponse.status).toBe(201);
      expect(sendResponse.status).toBe(200);
    });

    it('TC0002 - Should reject budget via public API', async () => {
      const response = await request(app.getHttpServer()).put(
        `/public/budgets/${rejectionBudgetId}/reject`,
      );

      expect(response.status).toBe(200);
      expect(response.body.budget.status).toBe('REJEITADO');
      expect(response.body).toHaveProperty('message');
    });

    it('TC0003 - Should verify service order remains in same status after budget rejection', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/service-orders/${rejectionServiceOrderId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('RECEBIDA');
    });
  });

  describe('validate budget business rules', () => {
    it('TC0001 - Should not approve already approved budget', async () => {
      const response = await request(app.getHttpServer()).put(
        `/public/budgets/${budgetId}/approve`,
      );

      expect([400, 500]).toContain(response.status);
    });

    it('TC0002 - Should not send budget that was already sent', async () => {
      const response = await request(app.getHttpServer())
        .put(`/budgets/${budgetId}/send`)
        .set('Authorization', `Bearer ${authToken}`);

      expect([400, 500]).toContain(response.status);
    });
  });
});
