import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';
import request from 'supertest';
import * as bcrypt from 'bcryptjs';
import { faker } from '@faker-js/faker/locale/pt_BR';

const mockPart = {
  name: `${faker.vehicle.type()} - ${faker.commerce.productName()}`,
  description: faker.commerce.productDescription(),
  partNumber: faker.string.alphanumeric(8).toUpperCase(),
  price: faker.commerce.price({ min: 10, max: 500, dec: 2 }),
  stock: faker.number.int({ min: 10, max: 100 }),
  minStock: faker.number.int({ min: 5, max: 15 }),
  supplier: faker.company.name(),
};

describe('Part Integration Tests', () => {
  let app: INestApplication;
  let prisma: PrismaClient;
  let authToken: string;
  let partId: string;

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

  describe('part CRUD flow', () => {
    it('TC0001 - Should create a new part', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/parts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(mockPart);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(mockPart.name);
      expect(response.body.partNumber).toBe(mockPart.partNumber);
      expect(parseFloat(response.body.price)).toBe(parseFloat(mockPart.price));
      expect(response.body.stock).toBe(mockPart.stock);
      expect(response.body.minStock).toBe(mockPart.minStock);
      expect(response.body.supplier).toBe(mockPart.supplier);
      expect(response.body.isActive).toBe(true);

      partId = response.body.id;
    });

    it('TC0002 - Should list all parts', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/parts/all')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('TC0003 - Should get part by ID', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/parts/${partId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(partId);
      expect(response.body.name).toBe(mockPart.name);
    });

    it('TC0004 - Should get part by part number', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/parts/part-number/${mockPart.partNumber}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.partNumber).toBe(mockPart.partNumber);
      expect(response.body.id).toBe(partId);
    });

    it('TC0005 - Should get parts by supplier', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/parts/supplier/${mockPart.supplier}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0].supplier).toBe(mockPart.supplier);
    });

    it('TC0006 - Should filter parts by active status', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/parts/all')
        .query({ active: true })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.every((part: any) => part.isActive === true)).toBe(
        true,
      );
    });

    it('TC0007 - Should update part', async () => {
      const updatedPrice = faker.commerce.price({ min: 20, max: 600, dec: 2 });
      const updatedStock = faker.number.int({ min: 50, max: 200 });

      const response = await request(app.getHttpServer())
        .patch(`/api/parts/${partId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          price: updatedPrice,
          stock: updatedStock,
        });

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(partId);
      expect(parseFloat(response.body.price)).toBe(parseFloat(updatedPrice));
      expect(response.body.stock).toBe(updatedStock);
    });

    it('TC0008 - Should update stock with positive quantity', async () => {
      const initialStock = await request(app.getHttpServer())
        .get(`/api/parts/${partId}`)
        .set('Authorization', `Bearer ${authToken}`);

      const addQuantity = 20;

      const response = await request(app.getHttpServer())
        .patch(`/api/parts/${partId}/stock`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ quantity: addQuantity });

      expect(response.status).toBe(200);
      expect(response.body.stock).toBe(initialStock.body.stock + addQuantity);
    });

    it('TC0009 - Should update stock with negative quantity', async () => {
      const initialStock = await request(app.getHttpServer())
        .get(`/api/parts/${partId}`)
        .set('Authorization', `Bearer ${authToken}`);

      const removeQuantity = -10;

      const response = await request(app.getHttpServer())
        .patch(`/api/parts/${partId}/stock`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ quantity: removeQuantity });

      expect(response.status).toBe(200);
      expect(response.body.stock).toBe(
        initialStock.body.stock + removeQuantity,
      );
    });

    it('TC0010 - Should delete part (soft delete)', async () => {
      const newPart = {
        name: faker.commerce.productName(),
        partNumber: faker.string.alphanumeric(8).toUpperCase(),
        price: faker.commerce.price({ min: 10, max: 500, dec: 2 }),
        stock: 10,
        minStock: 5,
      };

      const createResponse = await request(app.getHttpServer())
        .post('/api/parts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newPart);

      expect(createResponse.status).toBe(201);

      const deleteResponse = await request(app.getHttpServer())
        .delete(`/api/parts/${createResponse.body.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(deleteResponse.status).toBe(200);
      expect(deleteResponse.body.isActive).toBe(false);
    });
  });

  describe('validate part business rules', () => {
    let originalConsoleError: typeof console.error;

    beforeAll(() => {
      originalConsoleError = console.error;
      console.error = jest.fn();
    });

    afterAll(() => {
      console.error = originalConsoleError;
    });

    it('TC0001 - Should not create part with duplicate part number', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/parts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(mockPart);

      expect(response.status).toBe(409);
    });

    it('TC0002 - Should not create part without name', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/parts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          price: '10.00',
          stock: 10,
          minStock: 5,
        });

      expect(response.status).toBe(400);
    });

    it('TC0003 - Should not create part with invalid price format', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/parts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: faker.commerce.productName(),
          price: 'invalid-price',
          stock: 10,
          minStock: 5,
        });

      expect(response.status).toBe(400);
    });

    it('TC0004 - Should not create part with negative stock', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/parts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: faker.commerce.productName(),
          price: '10.00',
          stock: -5,
          minStock: 5,
        });

      expect(response.status).toBe(400);
    });

    it('TC0005 - Should not update stock below zero', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/parts/${partId}/stock`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ quantity: -999999 });

      expect(response.status).toBe(409);
    });

    it('TC0006 - Should not get part with non-existent ID', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/parts/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });

    it('TC0007 - Should not get part with non-existent part number', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/parts/part-number/NONEXISTENT')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });

    it('TC0008 - Should list low stock parts', async () => {
      const lowStockPart = {
        name: faker.commerce.productName(),
        partNumber: faker.string.alphanumeric(8).toUpperCase(),
        price: faker.commerce.price({ min: 10, max: 500, dec: 2 }),
        stock: 2,
        minStock: 10,
      };

      const createResponse = await request(app.getHttpServer())
        .post('/api/parts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(lowStockPart);

      expect(createResponse.status).toBe(201);

      const response = await request(app.getHttpServer())
        .get('/api/parts/low-stock')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });
});
