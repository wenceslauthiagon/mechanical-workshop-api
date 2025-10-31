import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';
import request from 'supertest';
import * as bcrypt from 'bcryptjs';
import { faker } from '@faker-js/faker/locale/pt_BR';
import { generateValidCPF } from '../utils/test-helpers';

describe('Public Budget Integration Tests', () => {
  let app: INestApplication;
  let prisma: PrismaClient;
  let authToken: string;
  let customerId: string;
  let vehicleId: string;
  let serviceOrderId: string;
  let budgetId: string;
  let sentBudgetId: string;

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

    customerId = customerResponse.body.id;

    const vehicle = {
      licensePlate: `${faker.string.alpha({ length: 3, casing: 'upper' })}-${faker.string.numeric(4)}`,
      brand: faker.vehicle.manufacturer(),
      model: (faker.vehicle.model() || 'Model').padEnd(2, 'X'),
      year: faker.number.int({ min: 2015, max: 2024 }),
      color: faker.color.human(),
      customerId: customerId,
    };

    const vehicleResponse = await request(app.getHttpServer())
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${authToken}`)
      .send(vehicle);

    vehicleId = vehicleResponse.body.id;

    const serviceOrder = {
      customerId: customerId,
      vehicleId: vehicleId,
      description: faker.lorem.sentence(),
    };

    const osResponse = await request(app.getHttpServer())
      .post('/api/service-orders')
      .set('Authorization', `Bearer ${authToken}`)
      .send(serviceOrder);

    serviceOrderId = osResponse.body.id;

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

    const budgetResponse = await request(app.getHttpServer())
      .post('/budgets')
      .set('Authorization', `Bearer ${authToken}`)
      .send(budget);

    budgetId = budgetResponse.body.id;

    const sendResponse = await request(app.getHttpServer())
      .put(`/budgets/${budgetId}/send`)
      .set('Authorization', `Bearer ${authToken}`);

    sentBudgetId = sendResponse.body.id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('public budget access', () => {
    it('TC0001 - Should view public budget without authentication', async () => {
      const response = await request(app.getHttpServer()).get(
        `/public/budgets/${sentBudgetId}`,
      );

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', sentBudgetId);
      expect(response.body.status).toBe('ENVIADO');
      expect(response.body).toHaveProperty('customerId');
      expect(response.body).toHaveProperty('serviceOrderId');
    });

    it('TC0002 - Should get budget status', async () => {
      const response = await request(app.getHttpServer()).get(
        `/public/budgets/${sentBudgetId}/status`,
      );

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('canApprove');
      expect(response.body).toHaveProperty('canReject');
      expect(response.body.canApprove).toBe(true);
      expect(response.body.canReject).toBe(true);
    });

    it('TC0003 - Should not access non-existent budget', async () => {
      const fakeId = faker.string.uuid();
      const response = await request(app.getHttpServer()).get(
        `/public/budgets/${fakeId}`,
      );

      expect(response.status).toBe(404);
    });

    it('TC0004 - Should not access draft budget via public API', async () => {
      const draftBudget = {
        serviceOrderId: serviceOrderId,
        customerId: customerId,
        validDays: 7,
        items: [
          {
            id: faker.string.uuid(),
            type: 'SERVICE',
            description: 'Alinhamento',
            quantity: 1,
            unitPrice: 80.0,
            total: 80.0,
          },
        ],
      };

      const createResponse = await request(app.getHttpServer())
        .post('/budgets')
        .set('Authorization', `Bearer ${authToken}`)
        .send(draftBudget);

      const draftId = createResponse.body.id;

      const response = await request(app.getHttpServer()).get(
        `/public/budgets/${draftId}`,
      );

      expect(response.status).toBe(404);
    });
  });

  describe('public budget approval flow', () => {
    let approvalBudgetId: string;
    let approvalServiceOrderId: string;

    beforeAll(async () => {
      const serviceOrder = {
        customerId: customerId,
        vehicleId: vehicleId,
        description: faker.lorem.sentence(),
      };

      const osResponse = await request(app.getHttpServer())
        .post('/api/service-orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send(serviceOrder);

      approvalServiceOrderId = osResponse.body.id;

      const budget = {
        serviceOrderId: approvalServiceOrderId,
        customerId: customerId,
        validDays: 7,
        items: [
          {
            id: faker.string.uuid(),
            type: 'SERVICE',
            description: 'Balanceamento',
            quantity: 4,
            unitPrice: 25.0,
            total: 100.0,
          },
        ],
      };

      const budgetResponse = await request(app.getHttpServer())
        .post('/budgets')
        .set('Authorization', `Bearer ${authToken}`)
        .send(budget);

      const sendResponse = await request(app.getHttpServer())
        .put(`/budgets/${budgetResponse.body.id}/send`)
        .set('Authorization', `Bearer ${authToken}`);

      approvalBudgetId = sendResponse.body.id;
    });

    it('TC0001 - Should approve budget via public API', async () => {
      const response = await request(app.getHttpServer()).put(
        `/public/budgets/${approvalBudgetId}/approve`,
      );

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('budget');
      expect(response.body).toHaveProperty('message');
      expect(response.body.budget.status).toBe('APROVADO');
      expect(response.body.budget.id).toBe(approvalBudgetId);
    });

    it('TC0002 - Should verify service order status changed to EM_EXECUCAO after approval', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/service-orders/${approvalServiceOrderId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('EM_EXECUCAO');
    });

    it('TC0003 - Should not approve already approved budget', async () => {
      const response = await request(app.getHttpServer()).put(
        `/public/budgets/${approvalBudgetId}/approve`,
      );

      expect([400, 500]).toContain(response.status);
    });

    it('TC0004 - Should verify status after approval', async () => {
      const response = await request(app.getHttpServer()).get(
        `/public/budgets/${approvalBudgetId}/status`,
      );

      expect(response.status).toBe(200);
      expect(response.body.canApprove).toBe(false);
      expect(response.body.canReject).toBe(false);
    });
  });

  describe('public budget rejection flow', () => {
    let rejectionBudgetId: string;
    let rejectionServiceOrderId: string;

    beforeAll(async () => {
      const serviceOrder = {
        customerId: customerId,
        vehicleId: vehicleId,
        description: faker.lorem.sentence(),
      };

      const osResponse = await request(app.getHttpServer())
        .post('/api/service-orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send(serviceOrder);

      rejectionServiceOrderId = osResponse.body.id;

      const budget = {
        serviceOrderId: rejectionServiceOrderId,
        customerId: customerId,
        validDays: 7,
        items: [
          {
            id: faker.string.uuid(),
            type: 'SERVICE',
            description: 'Revisão completa',
            quantity: 1,
            unitPrice: 500.0,
            total: 500.0,
          },
        ],
      };

      const budgetResponse = await request(app.getHttpServer())
        .post('/budgets')
        .set('Authorization', `Bearer ${authToken}`)
        .send(budget);

      const sendResponse = await request(app.getHttpServer())
        .put(`/budgets/${budgetResponse.body.id}/send`)
        .set('Authorization', `Bearer ${authToken}`);

      rejectionBudgetId = sendResponse.body.id;
    });

    it('TC0001 - Should reject budget via public API', async () => {
      const response = await request(app.getHttpServer()).put(
        `/public/budgets/${rejectionBudgetId}/reject`,
      );

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('budget');
      expect(response.body).toHaveProperty('message');
      expect(response.body.budget.status).toBe('REJEITADO');
      expect(response.body.budget.id).toBe(rejectionBudgetId);
    });

    it('TC0002 - Should verify service order remains in same status after rejection', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/service-orders/${rejectionServiceOrderId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('RECEBIDA');
    });

    it('TC0003 - Should not reject already rejected budget', async () => {
      const response = await request(app.getHttpServer()).put(
        `/public/budgets/${rejectionBudgetId}/reject`,
      );

      expect([400, 500]).toContain(response.status);
    });

    it('TC0004 - Should verify status after rejection', async () => {
      const response = await request(app.getHttpServer()).get(
        `/public/budgets/${rejectionBudgetId}/status`,
      );

      expect(response.status).toBe(200);
      expect(response.body.canApprove).toBe(false);
      expect(response.body.canReject).toBe(false);
    });
  });

  describe('public budget validation rules', () => {
    it('TC0001 - Should not approve budget with invalid ID format', async () => {
      const response = await request(app.getHttpServer()).put(
        '/public/budgets/invalid-id/approve',
      );

      expect([400, 404, 500]).toContain(response.status);
    });

    it('TC0002 - Should not reject budget with invalid ID format', async () => {
      const response = await request(app.getHttpServer()).put(
        '/public/budgets/invalid-id/reject',
      );

      expect([400, 404, 500]).toContain(response.status);
    });

    it('TC0003 - Should access sent budget and verify status fields', async () => {
      const response = await request(app.getHttpServer()).get(
        `/public/budgets/${sentBudgetId}/status`,
      );

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('validUntil');
      expect(response.body).toHaveProperty('isExpired');
      expect(response.body).toHaveProperty('canApprove');
      expect(response.body).toHaveProperty('canReject');
    });
  });
});
