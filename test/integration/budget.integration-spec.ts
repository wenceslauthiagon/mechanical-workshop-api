import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';
import request from 'supertest';
import * as bcrypt from 'bcryptjs';
import { faker } from '@faker-js/faker/locale/pt_BR';
import { generateValidCPF } from '../utils/test-helpers';

describe('Budget Integration Tests', () => {
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

    const customerResponse = await request(app.getHttpServer())
      .post('/api/customers')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        document: generateValidCPF(),
        type: 'PESSOA_FISICA',
        name: faker.person.fullName(),
        email: faker.internet.email(),
        phone: `11${faker.string.numeric(9)}`,
        address: faker.location.streetAddress(),
      });

    customerId = customerResponse.body.id;

    const vehicleResponse = await request(app.getHttpServer())
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        licensePlate: `${faker.string.alpha({ length: 3, casing: 'upper' })}-${faker.string.numeric(4)}`,
        customerId: customerId,
        brand: faker.vehicle.manufacturer(),
        model: faker.vehicle.model() || 'Test Model',
        year: faker.number.int({ min: 2000, max: 2024 }),
        color: faker.color.human(),
      });

    vehicleId = vehicleResponse.body.id;

    const serviceOrderResponse = await request(app.getHttpServer())
      .post('/api/service-orders')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        customerId: customerId,
        vehicleId: vehicleId,
        description: faker.lorem.sentence(),
      });

    if (serviceOrderResponse.status !== 201) {
      console.log('Service Order creation failed:', serviceOrderResponse.body);
    }

    serviceOrderId = serviceOrderResponse.body.id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('create budget flow', () => {
    it('TC0001 - Should create a new budget', async () => {
      const response = await request(app.getHttpServer())
        .post('/budgets')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
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
        });

      if (response.status !== 201) {
        console.log('Budget creation failed:', response.body);
      }

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.serviceOrderId).toBe(serviceOrderId);
      expect(response.body.customerId).toBe(customerId);
      expect(response.body.status).toBe('RASCUNHO');

      budgetId = response.body.id;
    });

    it('TC0002 - Should list all budgets', async () => {
      const response = await request(app.getHttpServer())
        .get('/budgets/all')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('TC0003 - Should get budget by ID', async () => {
      const response = await request(app.getHttpServer())
        .get(`/budgets/${budgetId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(budgetId);
      expect(response.body.serviceOrderId).toBe(serviceOrderId);
    });

    it('TC0004 - Should get budgets by service order', async () => {
      const response = await request(app.getHttpServer())
        .get(`/budgets/service-order/${serviceOrderId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0].serviceOrderId).toBe(serviceOrderId);
    });

    it('TC0005 - Should send budget to customer', async () => {
      const response = await request(app.getHttpServer())
        .put(`/budgets/${budgetId}/send`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('ENVIADO');
    });
  });

  describe('public budget flow', () => {
    it('TC0001 - Should view budget publicly', async () => {
      const response = await request(app.getHttpServer()).get(
        `/public/budgets/${budgetId}`,
      );

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(budgetId);
      expect(response.body.status).toBe('ENVIADO');
    });

    it('TC0002 - Should check budget status', async () => {
      const response = await request(app.getHttpServer()).get(
        `/public/budgets/${budgetId}/status`,
      );

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(budgetId);
      expect(response.body.status).toBe('ENVIADO');
      expect(response.body).toHaveProperty('validUntil');
      expect(response.body).toHaveProperty('isExpired');
      expect(response.body).toHaveProperty('canApprove');
      expect(response.body).toHaveProperty('canReject');
    });

    it('TC0003 - Should approve budget', async () => {
      const response = await request(app.getHttpServer()).put(
        `/public/budgets/${budgetId}/approve`,
      );

      expect(response.status).toBe(200);
      expect(response.body.budget.status).toBe('APROVADO');
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('budget enriched data', () => {
    it('TC0001 - Should get all budgets with enriched data', async () => {
      const response = await request(app.getHttpServer())
        .get('/budgets/enriched')
        .set('Authorization', `Bearer ${authToken}`);

      expect([200, 404]).toContain(response.status);

      if (response.status === 200) {
        expect(Array.isArray(response.body)).toBe(true);
        if (response.body.length > 0) {
          expect(response.body[0]).toHaveProperty('customer');
          expect(response.body[0]).toHaveProperty('serviceOrder');
        }
      }
    });

    it('TC0002 - Should get budget by ID with enriched data', async () => {
      const response = await request(app.getHttpServer())
        .get(`/budgets/${budgetId}/enriched`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(budgetId);
      expect(response.body).toHaveProperty('customer');
      expect(response.body).toHaveProperty('serviceOrder');
      expect(response.body.customer.id).toBe(customerId);
    });

    it('TC0003 - Should get budgets by customer with enriched data', async () => {
      const response = await request(app.getHttpServer())
        .get(`/budgets/customer/${customerId}/enriched`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0].customer.id).toBe(customerId);
    });

    it('TC0004 - Should get budgets by service order with enriched data', async () => {
      const response = await request(app.getHttpServer())
        .get(`/budgets/service-order/${serviceOrderId}/enriched`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0].serviceOrder.id).toBe(serviceOrderId);
    });
  });

  describe('validate budget business rules', () => {
    let originalConsoleError: typeof console.error;

    beforeAll(() => {
      originalConsoleError = console.error;
      console.error = jest.fn();
    });

    afterAll(() => {
      console.error = originalConsoleError;
    });

    it('TC0001 - Should not create budget with invalid service order', async () => {
      const response = await request(app.getHttpServer())
        .post('/budgets')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          serviceOrderId: '00000000-0000-0000-0000-000000000000',
          customerId: customerId,
          validDays: 7,
          items: [
            {
              id: faker.string.uuid(),
              type: 'SERVICE',
              description: 'Test',
              quantity: 1,
              unitPrice: 100.0,
              total: 100.0,
            },
          ],
        });

      expect(response.status).toBe(404);
    });

    it('TC0002 - Should not approve already approved budget', async () => {
      const response = await request(app.getHttpServer()).put(
        `/public/budgets/${budgetId}/approve`,
      );

      expect([400, 500]).toContain(response.status);
    });

    it('TC0003 - Should delete budget', async () => {
      const newServiceOrderResponse = await request(app.getHttpServer())
        .post('/api/service-orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          customerId: customerId,
          vehicleId: vehicleId,
          description: 'Test service order for delete budget',
        });

      const newServiceOrderId = newServiceOrderResponse.body.id;

      const createResponse = await request(app.getHttpServer())
        .post('/budgets')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          serviceOrderId: newServiceOrderId,
          customerId: customerId,
          validDays: 7,
          items: [
            {
              id: faker.string.uuid(),
              type: 'SERVICE',
              description: 'Test',
              quantity: 1,
              unitPrice: 50.0,
              total: 50.0,
            },
          ],
        });

      expect(createResponse.status).toBe(201);

      const deleteResponse = await request(app.getHttpServer())
        .delete(`/budgets/${createResponse.body.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(deleteResponse.status).toBe(204);

      const getResponse = await request(app.getHttpServer())
        .get(`/budgets/${createResponse.body.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(getResponse.status).toBe(404);
    });
  });
});
