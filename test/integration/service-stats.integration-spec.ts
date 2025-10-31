import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';
import request from 'supertest';
import * as bcrypt from 'bcryptjs';

describe('Service Stats Integration Tests', () => {
  let app: INestApplication;
  let prisma: PrismaClient;
  let authToken: string;

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

  describe('service stats endpoints', () => {
    it('TC0001 - Should get service execution stats', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/stats/services')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('TC0002 - Should get overall stats', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/stats/overall')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('totalCompletedOrders');
      expect(response.body).toHaveProperty('averageExecutionTime');
      expect(response.body).toHaveProperty('averageEstimatedTime');
      expect(response.body).toHaveProperty('overallAccuracy');
    });

    it('TC0003 - Should get stats for specific service', async () => {
      const service = await prisma.service.create({
        data: {
          name: 'Test Service',
          price: 100,
          estimatedMinutes: 60,
          category: 'Test',
        },
      });

      const response = await request(app.getHttpServer())
        .get(`/api/stats/services/${service.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('serviceId');
    });

    it('TC0004 - Should return message for service without execution data', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/stats/services/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('validate service stats authorization', () => {
    it('TC0001 - Should not access stats without authentication', async () => {
      const response = await request(app.getHttpServer()).get(
        '/api/stats/services',
      );

      expect(response.status).toBe(401);
    });

    it('TC0002 - Should not access overall stats without authentication', async () => {
      const response = await request(app.getHttpServer()).get(
        '/api/stats/overall',
      );

      expect(response.status).toBe(401);
    });

    it('TC0003 - Should not access specific service stats without authentication', async () => {
      const response = await request(app.getHttpServer()).get(
        '/api/stats/services/00000000-0000-0000-0000-000000000000',
      );

      expect(response.status).toBe(401);
    });
  });
});
