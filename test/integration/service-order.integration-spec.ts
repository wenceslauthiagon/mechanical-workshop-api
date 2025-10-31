import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaClient, ServiceOrderStatus, UserRole } from '@prisma/client';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';
import request from 'supertest';
import * as bcrypt from 'bcryptjs';
import { faker } from '@faker-js/faker/locale/pt_BR';

function generateValidCPF(): string {
  const numbers = Array.from({ length: 9 }, () =>
    faker.number.int({ min: 0, max: 9 }),
  );

  // Calculate first digit
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += numbers[i] * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  numbers.push(remainder);

  // Calculate second digit
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += numbers[i] * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  numbers.push(remainder);

  const cpf = numbers.join('');
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

// Mock data
const mockData = {
  customer: {
    document: generateValidCPF(),
    type: 'PESSOA_FISICA' as const,
    name: faker.person.fullName(),
    email: faker.internet.email(),
    phone: `11${faker.string.numeric(9)}`,
    address: faker.location.streetAddress(),
  },
  vehicle: {
    licensePlate: `${faker.string.alpha({ length: 3, casing: 'upper' })}-${faker.string.numeric(4)}`,
    brand: faker.vehicle.manufacturer(),
    model: faker.vehicle.model(),
    year: faker.number.int({ min: 2000, max: 2024 }),
    color: faker.vehicle.color(),
  },
  service: {
    name: faker.commerce.productName(),
    description: faker.commerce.productDescription(),
    price: faker.number.int({ min: 50, max: 500 }),
    estimatedMinutes: faker.number.int({ min: 30, max: 240 }),
    category: faker.helpers.arrayElement([
      'Manutenção',
      'Reparo',
      'Diagnóstico',
    ]),
  },
  part: {
    name: faker.vehicle.bicycle(),
    description: faker.commerce.productDescription(),
    partNumber: faker.string.alphanumeric(8).toUpperCase(),
    price: faker.commerce.price({ min: 10, max: 200, dec: 2 }),
    stock: faker.number.int({ min: 50, max: 200 }),
    minStock: faker.number.int({ min: 5, max: 20 }),
    supplier: faker.company.name(),
  },
  serviceOrder: {
    description: faker.lorem.sentence(),
    notes: faker.lorem.sentence(),
  },
};

describe('Service Order Integration Tests', () => {
  let app: INestApplication;
  let prisma: PrismaClient;
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
    await prisma.budgetItem.deleteMany();
    await prisma.budget.deleteMany();
    await prisma.serviceOrder.deleteMany();
    await prisma.mechanic.deleteMany();
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
        role: UserRole.ADMIN,
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
        .send(mockData.customer);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(mockData.customer.name);
      customerId = response.body.id;
    });

    it('TC0002 - Should create a vehicle for the customer', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ ...mockData.vehicle, customerId });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.licensePlate).toBe(mockData.vehicle.licensePlate);
      vehicleId = response.body.id;
    });

    it('TC0003 - Should create a service', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/services')
        .set('Authorization', `Bearer ${authToken}`)
        .send(mockData.service);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      serviceId = response.body.id;
    });

    it('TC0004 - Should create a part', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/parts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(mockData.part);

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
          description: mockData.serviceOrder.description,
          services: [{ serviceId, quantity: 1 }],
          parts: [{ partId, quantity: 2 }],
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.status).toBe(ServiceOrderStatus.RECEBIDA);
      expect(response.body).toHaveProperty('orderNumber');
      serviceOrderId = response.body.id;
    });

    it('TC0006 - Should update service order status to EM_DIAGNOSTICO', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/service-orders/${serviceOrderId}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: ServiceOrderStatus.EM_DIAGNOSTICO,
          notes: mockData.serviceOrder.notes,
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe(ServiceOrderStatus.EM_DIAGNOSTICO);
    });

    it('TC0007 - Should update service order status to AGUARDANDO_APROVACAO', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/service-orders/${serviceOrderId}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: ServiceOrderStatus.AGUARDANDO_APROVACAO,
          notes: mockData.serviceOrder.notes,
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe(
        ServiceOrderStatus.AGUARDANDO_APROVACAO,
      );
    });

    it('TC0008 - Should approve service order budget', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/service-orders/${serviceOrderId}/approve`)
        .set('Authorization', `Bearer ${authToken}`)
        .send();

      expect(response.status).toBe(200);
      expect(response.body.status).toBe(ServiceOrderStatus.EM_EXECUCAO);
    });

    it('TC0009 - Should update service order status to FINALIZADA', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/service-orders/${serviceOrderId}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: ServiceOrderStatus.FINALIZADA,
          notes: mockData.serviceOrder.notes,
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe(ServiceOrderStatus.FINALIZADA);
    });

    it('TC0010 - Should update service order status to ENTREGUE', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/service-orders/${serviceOrderId}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: ServiceOrderStatus.ENTREGUE,
          notes: mockData.serviceOrder.notes,
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe(ServiceOrderStatus.ENTREGUE);
    });

    it('TC0011 - Should get service order by ID', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/service-orders/${serviceOrderId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(serviceOrderId);
      expect(response.body.status).toBe(ServiceOrderStatus.ENTREGUE);
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
          description: mockData.serviceOrder.description,
        });

      expect(response.status).toBe(404);
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
          description: mockData.serviceOrder.description,
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
          description: mockData.serviceOrder.description,
        });

      const newOrderId = orderResponse.body.id;

      const response = await request(app.getHttpServer())
        .patch(`/api/service-orders/${newOrderId}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: ServiceOrderStatus.FINALIZADA,
        });

      expect(response.status).toBe(400);
    });
  });
});
