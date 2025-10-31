import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';
import request from 'supertest';
import * as bcrypt from 'bcryptjs';
import { faker } from '@faker-js/faker/locale/pt_BR';

const mockMechanic = {
  name: faker.person.fullName(),
  email: faker.internet.email(),
  phone: `11${faker.string.numeric(9)}`,
  specialties: ['Motor', 'Freios', 'Suspensão'],
  experienceYears: faker.number.int({ min: 1, max: 30 }),
};

describe('Mechanic Integration Tests', () => {
  let app: INestApplication;
  let prisma: PrismaClient;
  let authToken: string;
  let mechanicId: string;

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

  describe('mechanic CRUD flow', () => {
    it('TC0001 - Should create a new mechanic', async () => {
      const response = await request(app.getHttpServer())
        .post('/mechanics')
        .set('Authorization', `Bearer ${authToken}`)
        .send(mockMechanic);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(mockMechanic.name);
      expect(response.body.email).toBe(mockMechanic.email);
      expect(response.body.phone).toBe(mockMechanic.phone);
      expect(response.body.specialties).toEqual(mockMechanic.specialties);
      expect(response.body.experienceYears).toBe(mockMechanic.experienceYears);
      expect(response.body.isAvailable).toBe(true);

      mechanicId = response.body.id;
    });

    it('TC0002 - Should list all mechanics', async () => {
      const response = await request(app.getHttpServer())
        .get('/mechanics/all')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('TC0003 - Should get mechanic by ID', async () => {
      const response = await request(app.getHttpServer())
        .get(`/mechanics/${mechanicId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(mechanicId);
      expect(response.body.name).toBe(mockMechanic.name);
      expect(response.body.email).toBe(mockMechanic.email);
    });

    it('TC0004 - Should get available mechanics', async () => {
      const response = await request(app.getHttpServer())
        .get('/mechanics/available')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0].isAvailable).toBe(true);
    });

    it('TC0005 - Should get mechanics by specialty', async () => {
      const response = await request(app.getHttpServer())
        .get('/mechanics/by-specialty')
        .query({ specialty: 'Motor' })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0].specialties).toContain('Motor');
    });

    it('TC0006 - Should update mechanic', async () => {
      const updatedName = faker.person.fullName();
      const updatedExperience = faker.number.int({ min: 5, max: 35 });

      const response = await request(app.getHttpServer())
        .put(`/mechanics/${mechanicId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: updatedName,
          experienceYears: updatedExperience,
        });

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(mechanicId);
      expect(response.body.name).toBe(updatedName);
      expect(response.body.experienceYears).toBe(updatedExperience);
    });

    it('TC0007 - Should toggle mechanic availability', async () => {
      const response = await request(app.getHttpServer())
        .put(`/mechanics/${mechanicId}/toggle-availability`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(mechanicId);
      expect(response.body.isAvailable).toBe(false);

      const toggleBackResponse = await request(app.getHttpServer())
        .put(`/mechanics/${mechanicId}/toggle-availability`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(toggleBackResponse.status).toBe(200);
      expect(toggleBackResponse.body.isAvailable).toBe(true);
    });

    it('TC0008 - Should get mechanic workload', async () => {
      const response = await request(app.getHttpServer())
        .get(`/mechanics/${mechanicId}/workload`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('activeOrders');
      expect(response.body).toHaveProperty('completedThisMonth');
      expect(response.body).toHaveProperty('averageCompletionTime');
    });

    it('TC0009 - Should delete mechanic', async () => {
      const newMechanic = {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        phone: `11${faker.string.numeric(9)}`,
        specialties: ['Elétrica'],
        experienceYears: faker.number.int({ min: 1, max: 10 }),
      };

      const createResponse = await request(app.getHttpServer())
        .post('/mechanics')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newMechanic);

      expect(createResponse.status).toBe(201);

      const deleteResponse = await request(app.getHttpServer())
        .delete(`/mechanics/${createResponse.body.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(deleteResponse.status).toBe(204);

      const getResponse = await request(app.getHttpServer())
        .get(`/mechanics/${createResponse.body.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(getResponse.status).toBe(200);
      expect(getResponse.body.deletedAt).not.toBeNull();
    });
  });

  describe('validate mechanic business rules', () => {
    let originalConsoleError: typeof console.error;

    beforeAll(() => {
      originalConsoleError = console.error;
      console.error = jest.fn();
    });

    afterAll(() => {
      console.error = originalConsoleError;
    });

    it('TC0001 - Should not create mechanic with duplicate email', async () => {
      const response = await request(app.getHttpServer())
        .post('/mechanics')
        .set('Authorization', `Bearer ${authToken}`)
        .send(mockMechanic);

      expect(response.status).toBe(409);
    });

    it('TC0002 - Should not create mechanic with invalid email format', async () => {
      const response = await request(app.getHttpServer())
        .post('/mechanics')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: faker.person.fullName(),
          email: 'invalid-email',
          specialties: ['Motor'],
        });

      expect(response.status).toBe(400);
    });

    it('TC0003 - Should not create mechanic without specialties', async () => {
      const response = await request(app.getHttpServer())
        .post('/mechanics')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: faker.person.fullName(),
          email: faker.internet.email(),
          specialties: [],
        });

      expect(response.status).toBe(400);
    });

    it('TC0004 - Should not create mechanic with invalid experience years', async () => {
      const response = await request(app.getHttpServer())
        .post('/mechanics')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: faker.person.fullName(),
          email: faker.internet.email(),
          specialties: ['Motor'],
          experienceYears: -5,
        });

      expect(response.status).toBe(400);
    });

    it('TC0005 - Should not create mechanic with experience years exceeding maximum', async () => {
      const response = await request(app.getHttpServer())
        .post('/mechanics')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: faker.person.fullName(),
          email: faker.internet.email(),
          specialties: ['Motor'],
          experienceYears: 100,
        });

      expect(response.status).toBe(400);
    });

    it('TC0006 - Should not get mechanic with invalid ID', async () => {
      const response = await request(app.getHttpServer())
        .get('/mechanics/invalid-uuid')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });

    it('TC0007 - Should not get mechanic with non-existent ID', async () => {
      const response = await request(app.getHttpServer())
        .get('/mechanics/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });

    it('TC0008 - Should not update mechanic with name too short', async () => {
      const response = await request(app.getHttpServer())
        .put(`/mechanics/${mechanicId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'A',
        });

      expect(response.status).toBe(400);
    });
  });
});
