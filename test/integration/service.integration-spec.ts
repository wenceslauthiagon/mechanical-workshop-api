import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';
import request from 'supertest';
import * as bcrypt from 'bcryptjs';
import { faker } from '@faker-js/faker/locale/pt_BR';

const mockService = {
  name: `${faker.vehicle.type()} - ${faker.commerce.productName()}`,
  description: faker.commerce.productDescription(),
  price: parseFloat(faker.commerce.price({ min: 50, max: 500, dec: 2 })),
  estimatedMinutes: faker.number.int({ min: 30, max: 240 }),
  category: faker.helpers.arrayElement([
    'Manutenção Preventiva',
    'Manutenção Corretiva',
    'Elétrica',
    'Mecânica',
  ]),
};

describe('Service Integration Tests', () => {
  let app: INestApplication;
  let prisma: PrismaClient;
  let authToken: string;
  let serviceId: string;

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

  describe('service CRUD flow', () => {
    it('TC0001 - Should create a new service', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/services')
        .set('Authorization', `Bearer ${authToken}`)
        .send(mockService);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(mockService.name);
      expect(response.body.description).toBe(mockService.description);
      expect(parseFloat(response.body.price)).toBe(mockService.price);
      expect(response.body.estimatedMinutes).toBe(mockService.estimatedMinutes);
      expect(response.body.category).toBe(mockService.category);
      expect(response.body.isActive).toBe(true);

      serviceId = response.body.id;
    });

    it('TC0002 - Should list all services', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/services/all')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('TC0003 - Should get service by ID', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/services/${serviceId}`)
        .set('Authorization', `Bearer ${authToken}`);

      if (response.status !== 200) {
        console.log('Service ID:', serviceId);
        console.log('Response status:', response.status);
        console.log('Response body:', response.body);
      }

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(serviceId);
      expect(response.body.name).toBe(mockService.name);
    });

    it('TC0004 - Should get services by category', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/services/category/${mockService.category}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0].category).toBe(mockService.category);
    });

    it('TC0005 - Should filter services by active status', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/services/all')
        .query({ active: true })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(
        response.body.every((service: any) => service.isActive === true),
      ).toBe(true);
    });

    it('TC0006 - Should update service', async () => {
      const updatedPrice = parseFloat(
        faker.commerce.price({ min: 100, max: 700, dec: 2 }),
      );
      const updatedMinutes = faker.number.int({ min: 60, max: 300 });

      const response = await request(app.getHttpServer())
        .patch(`/api/services/${serviceId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          price: updatedPrice,
          estimatedMinutes: updatedMinutes,
        });

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(serviceId);
      expect(parseFloat(response.body.price)).toBe(updatedPrice);
      expect(response.body.estimatedMinutes).toBe(updatedMinutes);
    });

    it('TC0007 - Should delete service (soft delete)', async () => {
      const newService = {
        name: faker.commerce.productName(),
        price: parseFloat(faker.commerce.price({ min: 50, max: 500, dec: 2 })),
        estimatedMinutes: faker.number.int({ min: 30, max: 180 }),
        category: 'Elétrica',
      };

      const createResponse = await request(app.getHttpServer())
        .post('/api/services')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newService);

      expect(createResponse.status).toBe(201);

      const deleteResponse = await request(app.getHttpServer())
        .delete(`/api/services/${createResponse.body.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(deleteResponse.status).toBe(204);
    });
  });

  describe('validate service business rules', () => {
    let originalConsoleError: typeof console.error;

    beforeAll(() => {
      originalConsoleError = console.error;
      console.error = jest.fn();
    });

    afterAll(() => {
      console.error = originalConsoleError;
    });

    it('TC0001 - Should not create service with duplicate name', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/services')
        .set('Authorization', `Bearer ${authToken}`)
        .send(mockService);

      expect(response.status).toBe(409);
    });

    it('TC0002 - Should not create service without name', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/services')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          price: 100.0,
          estimatedMinutes: 60,
          category: 'Test',
        });

      expect(response.status).toBe(400);
    });

    it('TC0003 - Should not create service with price having more than 2 decimals', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/services')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: faker.commerce.productName(),
          price: 100.999,
          estimatedMinutes: 60,
          category: 'Test',
        });

      expect(response.status).toBe(400);
    });

    it('TC0004 - Should not create service with invalid estimated minutes', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/services')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: faker.commerce.productName(),
          price: 100.0,
          estimatedMinutes: 0,
          category: 'Test',
        });

      expect(response.status).toBe(400);
    });

    it('TC0005 - Should not create service with name too short', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/services')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'A',
          price: 100.0,
          estimatedMinutes: 60,
          category: 'Test',
        });

      expect(response.status).toBe(400);
    });

    it('TC0006 - Should not get service with non-existent ID', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/services/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });

    it('TC0007 - Should not update service with invalid price decimals', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/services/${serviceId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          price: 100.999,
        });

      expect(response.status).toBe(400);
    });
  });
});
