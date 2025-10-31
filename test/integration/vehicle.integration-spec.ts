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

describe('Vehicle Integration Tests', () => {
  let app: INestApplication;
  let prisma: PrismaClient;
  let authToken: string;
  let customerId: string;
  let vehicleId: string;

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
  });

  afterAll(async () => {
    await app.close();
  });

  describe('vehicle CRUD flow', () => {
    it('TC0001 - Should create a new vehicle', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          ...mockVehicle,
          customerId: customerId,
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.licensePlate).toBe(mockVehicle.licensePlate);
      expect(response.body.brand).toBe(mockVehicle.brand);
      expect(response.body.model).toBe(mockVehicle.model);
      expect(response.body.year).toBe(mockVehicle.year);
      expect(response.body.customerId).toBe(customerId);

      vehicleId = response.body.id;
    });

    it('TC0002 - Should list all vehicles', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/vehicles/all')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('TC0003 - Should get vehicle by ID', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/vehicles/${vehicleId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(vehicleId);
      expect(response.body.licensePlate).toBe(mockVehicle.licensePlate);
    });

    it('TC0004 - Should get vehicles by customer', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/vehicles/customer/${customerId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0].customerId).toBe(customerId);
    });

    it('TC0005 - Should get vehicle by license plate', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/vehicles/plate/${mockVehicle.licensePlate}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.licensePlate).toBe(mockVehicle.licensePlate);
      expect(response.body.id).toBe(vehicleId);
    });

    it('TC0006 - Should update vehicle', async () => {
      const updatedColor = faker.color.human();
      const updatedYear = faker.number.int({ min: 2020, max: 2024 });

      const response = await request(app.getHttpServer())
        .patch(`/api/vehicles/${vehicleId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          color: updatedColor,
          year: updatedYear,
        });

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(vehicleId);
      expect(response.body.color).toBe(updatedColor);
      expect(response.body.year).toBe(updatedYear);
    });

    it('TC0007 - Should delete vehicle', async () => {
      const uniquePlate = `${faker.string.alpha({ length: 3, casing: 'upper' })}-${faker.string.numeric(4)}`;

      const newVehicle = {
        licensePlate: uniquePlate,
        customerId: customerId,
        brand: faker.vehicle.manufacturer(),
        model: (faker.vehicle.model() || 'Model').padEnd(2, 'X'),
        year: faker.number.int({ min: 2000, max: 2024 }),
        color: faker.color.human(),
      };

      const createResponse = await request(app.getHttpServer())
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newVehicle);

      expect(createResponse.status).toBe(201);

      const deleteResponse = await request(app.getHttpServer())
        .delete(`/api/vehicles/${createResponse.body.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(deleteResponse.status).toBe(204);

      const getResponse = await request(app.getHttpServer())
        .get(`/api/vehicles/${createResponse.body.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(getResponse.status).toBe(404);
    });
  });

  describe('validate vehicle business rules', () => {
    let originalConsoleError: typeof console.error;

    beforeAll(() => {
      originalConsoleError = console.error;
      console.error = jest.fn();
    });

    afterAll(() => {
      console.error = originalConsoleError;
    });

    it('TC0001 - Should not create vehicle with duplicate license plate', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          ...mockVehicle,
          customerId: customerId,
        });

      expect(response.status).toBe(409);
    });

    it('TC0002 - Should not create vehicle with invalid license plate format', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          licensePlate: 'INVALID',
          customerId: customerId,
          brand: faker.vehicle.manufacturer(),
          model: faker.vehicle.model(),
          year: 2023,
          color: faker.color.human(),
        });

      expect(response.status).toBe(400);
    });

    it('TC0003 - Should not create vehicle with non-existent customer', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          licensePlate: `${faker.string.alpha({ length: 3, casing: 'upper' })}-${faker.string.numeric(4)}`,
          customerId: '00000000-0000-0000-0000-000000000000',
          brand: faker.vehicle.manufacturer(),
          model: faker.vehicle.model(),
          year: 2023,
          color: faker.color.human(),
        });

      // API pode retornar 400 (bad request) ou 404 (not found) dependendo da ordem de validação
      expect([400, 404]).toContain(response.status);
    });

    it('TC0004 - Should not create vehicle with invalid year', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          licensePlate: `${faker.string.alpha({ length: 3, casing: 'upper' })}-${faker.string.numeric(4)}`,
          customerId: customerId,
          brand: faker.vehicle.manufacturer(),
          model: faker.vehicle.model(),
          year: 1800,
          color: faker.color.human(),
        });

      expect(response.status).toBe(400);
    });

    it('TC0005 - Should not get vehicle with invalid ID', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/vehicles/invalid-uuid')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
    });

    it('TC0006 - Should not get vehicle with non-existent ID', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/vehicles/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });

    it('TC0007 - Should not get vehicle with non-existent license plate', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/vehicles/plate/XXX-9999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });

    it('TC0008 - Should not update vehicle with duplicate license plate', async () => {
      const anotherVehicle = {
        licensePlate: `${faker.string.alpha({ length: 3, casing: 'upper' })}-${faker.string.numeric(4)}`,
        customerId: customerId,
        brand: faker.vehicle.manufacturer(),
        model: (faker.vehicle.model() || 'Model').padEnd(2, 'X'),
        year: faker.number.int({ min: 2000, max: 2024 }),
        color: faker.color.human(),
      };

      const createResponse = await request(app.getHttpServer())
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${authToken}`)
        .send(anotherVehicle);

      expect(createResponse.status).toBe(201);

      const updateResponse = await request(app.getHttpServer())
        .patch(`/api/vehicles/${createResponse.body.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          licensePlate: mockVehicle.licensePlate,
        });

      expect(updateResponse.status).toBe(409);
    });
  });
});
