import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';

import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';
import request from 'supertest';
import * as bcrypt from 'bcryptjs';
import { faker } from '@faker-js/faker/locale/pt_BR';
import { generateValidCPF } from '../utils/test-helpers';

const testData = {
  customer: {
    name: faker.person.fullName(),
    document: generateValidCPF(),
    type: 'PESSOA_FISICA',
    email: faker.internet.email(),
    phone: faker.phone.number(),
    address: faker.location.streetAddress(),
  },
  vehicle: {
    plate: 'ABC1234',
    model: faker.vehicle.model(),
    brand: faker.vehicle.manufacturer(),
    year: faker.number.int({ min: 2000, max: 2024 }),
    color: faker.vehicle.color(),
  },
  service: {
    name: faker.commerce.productName(),
    description: faker.commerce.productDescription(),
    estimatedMinutes: faker.number.int({ min: 30, max: 240 }),
    price: parseFloat(faker.commerce.price({ min: 50, max: 500 })),
    category: faker.commerce.department(),
  },
  part: {
    name: faker.commerce.productName(),
    description: faker.commerce.productDescription(),
    partNumber: faker.string.alphanumeric(10).toUpperCase(),
    price: parseFloat(faker.commerce.price({ min: 10, max: 200 })),
    stock: faker.number.int({ min: 10, max: 100 }),
    minStock: faker.number.int({ min: 1, max: 5 }),
    supplier: faker.company.name(),
  },
  serviceOrder: {
    description: faker.lorem.sentence(),
    notes: faker.lorem.sentence(),
  },
};

describe('Service Order Integration Tests', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;
  let customerId: string;
  let vehicleId: string;
  let serviceId: string;
  let partId: string;
  let serviceOrderId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);

    await prisma.$executeRawUnsafe('PRAGMA foreign_keys = OFF;');
    await prisma.serviceOrderItem.deleteMany();
    await prisma.serviceOrderPart.deleteMany();
    await prisma.serviceOrderStatusHistory.deleteMany();
    await prisma.serviceOrder.deleteMany();
    await prisma.vehicle.deleteMany();
    await prisma.customer.deleteMany();
    await prisma.service.deleteMany();
    await prisma.part.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$executeRawUnsafe('PRAGMA foreign_keys = ON;');

    const hashedPassword = await bcrypt.hash('admin123', 10);
    await prisma.user.upsert({
      where: { email: 'admin@test.com' },
      update: {},
      create: {
        username: 'admin',
        email: 'admin@test.com',
        passwordHash: hashedPassword,
        role: 'ADMIN',
      },
    });

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'admin', password: 'admin123' });

    authToken = loginResponse.body.access_token;

    if (!authToken) {
      throw new Error(
        `Failed to get auth token. Status: ${loginResponse.status}, Body: ${JSON.stringify(loginResponse.body)}`,
      );
    }
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  describe('create complete service order flow', () => {
    it('TC0001 - Should create a customer', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/customers')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testData.customer);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(testData.customer.name);
      customerId = response.body.id;
    });

    it('TC0002 - Should create a vehicle for the customer', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ ...testData.vehicle, customerId });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.plate).toBe(testData.vehicle.plate);
      vehicleId = response.body.id;
    });

    it('TC0003 - Should create a service', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/services')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testData.service);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      serviceId = response.body.id;
    });

    it('TC0004 - Should create a part', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/parts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testData.part);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      partId = response.body.id;
    });

    it('TC0005 - Should create a service order', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/service-orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          customerId,
          vehicleId,
          description: testData.serviceOrder.description,
          services: [{ serviceId, quantity: 1 }],
          parts: [{ partId, quantity: 2 }],
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.status).toBe('RECEIVED');
      expect(response.body).toHaveProperty('orderNumber');
      serviceOrderId = response.body.id;
    });

    it('TC0006 - Should update service order status to EM_DIAGNOSTICO', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/service-orders/${serviceOrderId}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: 'IN_DIAGNOSIS',
          notes: testData.serviceOrder.notes,
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('IN_DIAGNOSIS');
    });

    it('TC0007 - Should update service order status to AGUARDANDO_APROVACAO', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/service-orders/${serviceOrderId}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: 'AWAITING_APPROVAL',
          notes: testData.serviceOrder.notes,
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe(
        'AWAITING_APPROVAL',
      );
    });

    it('TC0008 - Should approve service order budget', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/service-orders/${serviceOrderId}/approve`)
        .set('Authorization', `Bearer ${authToken}`)
        .send();

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('IN_EXECUTION');
    });

    it('TC0009 - Should update service order status to FINALIZADA', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/service-orders/${serviceOrderId}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: 'FINISHED',
          notes: testData.serviceOrder.notes,
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('FINISHED');
    });

    it('TC0010 - Should update service order status to ENTREGUE', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/service-orders/${serviceOrderId}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: 'DELIVERED',
          notes: testData.serviceOrder.notes,
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('DELIVERED');
    });

    it('TC0011 - Should get service order by ID', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/service-orders/${serviceOrderId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(serviceOrderId);
      expect(response.body.status).toBe('DELIVERED');
      expect(response.body).toHaveProperty('customer');
      expect(response.body).toHaveProperty('vehicle');
    });

    it('TC0012 - Should get status history', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/service-orders/${serviceOrderId}/status-history`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('TC0013 - Should list all service orders', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/service-orders/all')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('TC0014 - Should filter service orders by customer', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/service-orders?customerId=${customerId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data[0].customerId).toBe(customerId);
    });
  });

  describe('validate service order business rules', () => {
    let originalConsoleError: typeof console.error;

    beforeAll(() => {
      originalConsoleError = console.error;
      console.error = jest.fn();
    });

    afterAll(() => {
      console.error = originalConsoleError;
    });

    it('TC0001 - Should not create service order with non-existent customer', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/service-orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          customerId: '00000000-0000-0000-0000-000000000000',
          vehicleId: vehicleId,
          description: testData.serviceOrder.description,
        });

      expect([400, 404]).toContain(response.status);
    });

    it('TC0002 - Should not create service order with vehicle from different customer', async () => {
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

      const otherCustomerId = customerResponse.body.id;

      const response = await request(app.getHttpServer())
        .post('/api/service-orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          customerId: otherCustomerId,
          vehicleId: vehicleId,
          description: testData.serviceOrder.description,
        });

      expect(response.status).toBe(400);
    });

    it('TC0003 - Should not transition to invalid status', async () => {
      const orderResponse = await request(app.getHttpServer())
        .post('/api/service-orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          customerId: customerId,
          vehicleId: vehicleId,
          description: testData.serviceOrder.description,
          services: [],
          parts: [],
        });

      const newOrderId = orderResponse.body.id;

      const response = await request(app.getHttpServer())
        .patch(`/api/service-orders/${newOrderId}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: 'FINISHED',
        });

      expect(response.status).toBe(400);
    });
  });
});
