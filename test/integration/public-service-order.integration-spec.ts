import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';
import request from 'supertest';
import * as bcrypt from 'bcryptjs';
import { faker } from '@faker-js/faker/locale/pt_BR';
import { generateValidCPF } from '../utils/test-helpers';

const mockCustomer = {
  document: generateValidCPF(),
  type: 'PESSOA_FISICA' as const,
  name: faker.person.fullName(),
  email: faker.internet.email(),
  phone: `11${faker.string.numeric(9)}`,
  address: faker.location.streetAddress(),
};

const mockVehicle = {
  licensePlate: `${faker.string.alpha({ length: 3, casing: 'upper' })}-${faker.string.numeric(4)}`,
  brand: faker.vehicle.manufacturer(),
  model: (faker.vehicle.model() || 'Model').padEnd(2, 'X'),
  year: faker.number.int({ min: 2000, max: 2024 }),
  color: faker.color.human(),
};

describe('Public Service Order Integration Tests', () => {
  let app: INestApplication;
  let prisma: PrismaClient;
  let authToken: string;
  let customerId: string;
  let vehicleId: string;
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

    const customerResponse = await request(app.getHttpServer())
      .post('/api/customers')
      .set('Authorization', `Bearer ${authToken}`)
      .send(mockCustomer);

    customerId = customerResponse.body.id;

    const vehicleResponse = await request(app.getHttpServer())
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        ...mockVehicle,
        customerId: customerId,
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

    serviceOrderId = serviceOrderResponse.body.id;
    orderNumber = serviceOrderResponse.body.orderNumber;

    if (!serviceOrderId || !orderNumber) {
      console.log('Service Order Response:', serviceOrderResponse.body);
      console.log('Status:', serviceOrderResponse.status);
    }
  });

  afterAll(async () => {
    await app.close();
  });

  describe('public service order lookup', () => {
    it('TC0001 - Should find service order by order number without authentication', async () => {
      const response = await request(app.getHttpServer()).get(
        `/public/service-orders/order/${orderNumber}`,
      );

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', serviceOrderId);
      expect(response.body).toHaveProperty('orderNumber', orderNumber);
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('customer');
      expect(response.body).toHaveProperty('vehicle');
    });

    it('TC0002 - Should find service orders by customer document without authentication', async () => {
      const response = await request(app.getHttpServer()).get(
        `/public/service-orders/customer/${mockCustomer.document}`,
      );

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('id', serviceOrderId);
      expect(response.body[0]).toHaveProperty('orderNumber', orderNumber);
      expect(response.body[0].customer.document.replace(/\D/g, '')).toBe(
        mockCustomer.document.replace(/\D/g, ''),
      );
    });

    it('TC0003 - Should find service orders by vehicle license plate without authentication', async () => {
      const response = await request(app.getHttpServer()).get(
        `/public/service-orders/vehicle/${mockVehicle.licensePlate}`,
      );

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('id', serviceOrderId);
      expect(response.body[0]).toHaveProperty('orderNumber', orderNumber);
      expect(response.body[0].vehicle.licensePlate).toBe(
        mockVehicle.licensePlate,
      );
    });
  });

  describe('validate public service order not found scenarios', () => {
    let originalConsoleError: typeof console.error;

    beforeAll(() => {
      originalConsoleError = console.error;
      console.error = jest.fn();
    });

    afterAll(() => {
      console.error = originalConsoleError;
    });

    it('TC0001 - Should return 404 for non-existent order number', async () => {
      const response = await request(app.getHttpServer()).get(
        '/public/service-orders/order/OS-9999-999',
      );

      expect(response.status).toBe(404);
    });

    it('TC0002 - Should return 404 for non-existent customer document', async () => {
      const nonExistentCPF = generateValidCPF();

      const response = await request(app.getHttpServer()).get(
        `/public/service-orders/customer/${nonExistentCPF}`,
      );

      expect(response.status).toBe(404);
    });

    it('TC0003 - Should return 404 for non-existent vehicle license plate', async () => {
      const nonExistentPlate = `${faker.string.alpha({ length: 3, casing: 'upper' })}-${faker.string.numeric(4)}`;

      const response = await request(app.getHttpServer()).get(
        `/public/service-orders/vehicle/${nonExistentPlate}`,
      );

      expect(response.status).toBe(404);
    });

    it('TC0004 - Should work without Authorization header', async () => {
      const response = await request(app.getHttpServer()).get(
        `/public/service-orders/order/${orderNumber}`,
      );

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('orderNumber', orderNumber);
    });
  });
});
