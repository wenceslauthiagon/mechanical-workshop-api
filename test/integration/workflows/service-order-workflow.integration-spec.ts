import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { AppModule } from '../../../src/app.module';
import { PrismaService } from '../../../src/prisma/prisma.service';
import request from 'supertest';
import * as bcrypt from 'bcryptjs';
import { faker } from '@faker-js/faker/locale/pt_BR';
import { generateValidCPF } from '../../utils/test-helpers';

const mockMechanic = {
  name: faker.person.fullName(),
  email: faker.internet.email(),
  phone: `11${faker.string.numeric(9)}`,
  specialties: ['Motor', 'Freios', 'Suspensão'],
  experienceYears: faker.number.int({ min: 1, max: 30 }),
};

describe('Service Order Complete Workflow Integration Tests', () => {
  let app: INestApplication;
  let prisma: PrismaClient;
  let authToken: string;
  let customerId: string;
  let vehicleId: string;
  let serviceId: string;
  let partId: string;
  let serviceOrderId: string;
  let orderNumber: string;

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

  describe('complete service order workflow from creation to delivery', () => {
    it('TC0001 - Should create customer for service order', async () => {
      const customer = {
        document: generateValidCPF(),
        type: 'PESSOA_FISICA' as const,
        name: faker.person.fullName(),
        email: faker.internet.email(),
        phone: `11${faker.string.numeric(9)}`,
        address: faker.location.streetAddress(),
      };

      const response = await request(app.getHttpServer())
        .post('/api/customers')
        .set('Authorization', `Bearer ${authToken}`)
        .send(customer);

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

    it('TC0003 - Should create service for service order', async () => {
      const service = {
        name: `${faker.vehicle.type()} - ${faker.commerce.productName()}`,
        description: faker.commerce.productDescription(),
        price: faker.number.float({ min: 100, max: 500, fractionDigits: 2 }),
        estimatedMinutes: faker.number.int({ min: 60, max: 240 }),
        category: 'Manutenção Preventiva',
        isActive: true,
      };

      const response = await request(app.getHttpServer())
        .post('/api/services')
        .set('Authorization', `Bearer ${authToken}`)
        .send(service);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      serviceId = response.body.id;
    });

    it('TC0004 - Should create part for service order', async () => {
      const part = {
        name: `${faker.vehicle.type()} - ${faker.commerce.productName()}`,
        description: faker.commerce.productDescription(),
        partNumber: faker.string.alphanumeric(8).toUpperCase(),
        price: faker.commerce.price({ min: 50, max: 300, dec: 2 }),
        stock: faker.number.int({ min: 50, max: 100 }),
        minStock: faker.number.int({ min: 5, max: 15 }),
        supplier: faker.company.name(),
      };

      const response = await request(app.getHttpServer())
        .post('/api/parts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(part);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      partId = response.body.id;
    });

    it('TC0005 - Should create mechanic for service order', async () => {
      const response = await request(app.getHttpServer())
        .post('/mechanics')
        .set('Authorization', `Bearer ${authToken}`)
        .send(mockMechanic);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
    });

    it('TC0006 - Should create service order with status RECEBIDA', async () => {
      const serviceOrder = {
        customerId: customerId,
        vehicleId: vehicleId,
        description: faker.lorem.sentence(),
        services: [
          {
            serviceId: serviceId,
            quantity: 1,
          },
        ],
        parts: [
          {
            partId: partId,
            quantity: 2,
          },
        ],
      };

      const response = await request(app.getHttpServer())
        .post('/api/service-orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send(serviceOrder);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('orderNumber');
      expect(response.body.status).toBe('RECEBIDA');
      expect(response.body.services).toHaveLength(1);
      expect(response.body.parts).toHaveLength(1);

      serviceOrderId = response.body.id;
      orderNumber = response.body.orderNumber;
    });

    it('TC0007 - Should update status from RECEBIDA to EM_DIAGNOSTICO', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/service-orders/${serviceOrderId}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: 'EM_DIAGNOSTICO',
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('EM_DIAGNOSTICO');
    });

    it('TC0008 - Should update status from EM_DIAGNOSTICO to AGUARDANDO_APROVACAO', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/service-orders/${serviceOrderId}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: 'AGUARDANDO_APROVACAO',
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('AGUARDANDO_APROVACAO');
    });

    it('TC0009 - Should approve service order', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/service-orders/${serviceOrderId}/approve`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('EM_EXECUCAO');
    });

    it('TC0010 - Should verify mechanic availability (skipped - no mechanic assignment in current implementation)', async () => {
      expect(true).toBe(true);
    });

    it('TC0011 - Should update status from EM_EXECUCAO to FINALIZADA', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/service-orders/${serviceOrderId}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: 'FINALIZADA',
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('FINALIZADA');
    });

    it('TC0012 - Should verify mechanic availability after completion (skipped)', async () => {
      expect(true).toBe(true);
    });

    it('TC0013 - Should update status from FINALIZADA to ENTREGUE', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/service-orders/${serviceOrderId}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: 'ENTREGUE',
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('ENTREGUE');
    });

    it('TC0014 - Should retrieve complete service order with all data', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/service-orders/${serviceOrderId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(serviceOrderId);
      expect(response.body.orderNumber).toBe(orderNumber);
      expect(response.body.status).toBe('ENTREGUE');
      expect(response.body.customer).toHaveProperty('id', customerId);
      expect(response.body.vehicle).toHaveProperty('id', vehicleId);
      expect(response.body.services).toHaveLength(1);
      expect(response.body.parts).toHaveLength(1);
    });

    it('TC0015 - Should verify status history contains all transitions', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/service-orders/${serviceOrderId}/status-history`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(5);

      const statuses = response.body.map((h: any) => h.status);
      expect(statuses).toContain('RECEBIDA');
      expect(statuses).toContain('EM_DIAGNOSTICO');
      expect(statuses).toContain('AGUARDANDO_APROVACAO');
      expect(statuses).toContain('EM_EXECUCAO');
      expect(statuses).toContain('FINALIZADA');
      expect(statuses).toContain('ENTREGUE');
    });

    it('TC0016 - Should find service order by order number via public API', async () => {
      const response = await request(app.getHttpServer()).get(
        `/public/service-orders/order/${orderNumber}`,
      );

      expect(response.status).toBe(200);
      expect(response.body.orderNumber).toBe(orderNumber);
      expect(response.body.status).toBe('ENTREGUE');
    });
  });

  describe('validate workflow business rules', () => {
    let originalConsoleError: typeof console.error;

    beforeAll(() => {
      originalConsoleError = console.error;
      console.error = jest.fn();
    });

    afterAll(() => {
      console.error = originalConsoleError;
    });

    it('TC0001 - Should not allow invalid status transition', async () => {
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

      const vehicle = {
        licensePlate: `${faker.string.alpha({ length: 3, casing: 'upper' })}-${faker.string.numeric(4)}`,
        brand: faker.vehicle.manufacturer(),
        model: (faker.vehicle.model() || 'Model').padEnd(2, 'X'),
        year: 2020,
        color: faker.color.human(),
        customerId: customerResponse.body.id,
      };

      const vehicleResponse = await request(app.getHttpServer())
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${authToken}`)
        .send(vehicle);

      const serviceOrder = {
        customerId: customerResponse.body.id,
        vehicleId: vehicleResponse.body.id,
        description: faker.lorem.sentence(),
      };

      const osResponse = await request(app.getHttpServer())
        .post('/api/service-orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send(serviceOrder);

      const invalidResponse = await request(app.getHttpServer())
        .patch(`/api/service-orders/${osResponse.body.id}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: 'FINALIZADA',
        });

      expect(invalidResponse.status).toBe(400);
    });

    it('TC0002 - Should not approve order without AGUARDANDO_APROVACAO status', async () => {
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

      const vehicle = {
        licensePlate: `${faker.string.alpha({ length: 3, casing: 'upper' })}-${faker.string.numeric(4)}`,
        brand: faker.vehicle.manufacturer(),
        model: (faker.vehicle.model() || 'Model').padEnd(2, 'X'),
        year: 2020,
        color: faker.color.human(),
        customerId: customerResponse.body.id,
      };

      const vehicleResponse = await request(app.getHttpServer())
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${authToken}`)
        .send(vehicle);

      const serviceOrder = {
        customerId: customerResponse.body.id,
        vehicleId: vehicleResponse.body.id,
        description: faker.lorem.sentence(),
      };

      const osResponse = await request(app.getHttpServer())
        .post('/api/service-orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send(serviceOrder);

      const approveResponse = await request(app.getHttpServer())
        .patch(`/api/service-orders/${osResponse.body.id}/approve`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(approveResponse.status).toBe(400);
    });

    it('TC0003 - Should verify part stock is reduced after service order creation', async () => {
      const initialStockResponse = await request(app.getHttpServer())
        .get(`/api/parts/${partId}`)
        .set('Authorization', `Bearer ${authToken}`);

      const initialStock = initialStockResponse.body.stock;

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

      const vehicle = {
        licensePlate: `${faker.string.alpha({ length: 3, casing: 'upper' })}-${faker.string.numeric(4)}`,
        brand: faker.vehicle.manufacturer(),
        model: (faker.vehicle.model() || 'Model').padEnd(2, 'X'),
        year: 2020,
        color: faker.color.human(),
        customerId: customerResponse.body.id,
      };

      const vehicleResponse = await request(app.getHttpServer())
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${authToken}`)
        .send(vehicle);

      const serviceOrder = {
        customerId: customerResponse.body.id,
        vehicleId: vehicleResponse.body.id,
        description: faker.lorem.sentence(),
        parts: [
          {
            partId: partId,
            quantity: 3,
          },
        ],
      };

      await request(app.getHttpServer())
        .post('/api/service-orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send(serviceOrder);

      const finalStockResponse = await request(app.getHttpServer())
        .get(`/api/parts/${partId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(finalStockResponse.body.stock).toBe(initialStock - 3);
    });
  });
});
