import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { AppModule } from '../../../src/app.module';
import { PrismaService } from '../../../src/prisma/prisma.service';
import request from 'supertest';
import * as bcrypt from 'bcryptjs';
import { faker } from '@faker-js/faker/locale/pt_BR';

const mockMechanic1 = {
  name: faker.person.fullName(),
  email: faker.internet.email(),
  phone: `11${faker.string.numeric(9)}`,
  specialties: ['Motor', 'Freios'],
  experienceYears: faker.number.int({ min: 5, max: 15 }),
};

const mockMechanic2 = {
  name: faker.person.fullName(),
  email: faker.internet.email(),
  phone: `11${faker.string.numeric(9)}`,
  specialties: ['Suspensão', 'Elétrica'],
  experienceYears: faker.number.int({ min: 3, max: 10 }),
};

const mockMechanic3 = {
  name: faker.person.fullName(),
  email: faker.internet.email(),
  phone: `11${faker.string.numeric(9)}`,
  specialties: ['Motor'],
  experienceYears: faker.number.int({ min: 2, max: 8 }),
};

describe('Mechanic Workload Workflow Integration Tests', () => {
  let app: INestApplication;
  let prisma: PrismaClient;
  let authToken: string;
  let mechanicId1: string;
  let mechanicId2: string;
  let mechanicId3: string;

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

  describe('mechanic management and specialty workflow', () => {
    it('TC0001 - Should create first mechanic with Motor and Freios specialties', async () => {
      const response = await request(app.getHttpServer())
        .post('/mechanics')
        .set('Authorization', `Bearer ${authToken}`)
        .send(mockMechanic1);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.specialties).toEqual(
        expect.arrayContaining(['Motor', 'Freios']),
      );
      mechanicId1 = response.body.id;
    });

    it('TC0002 - Should create second mechanic with Suspensão and Elétrica specialties', async () => {
      const response = await request(app.getHttpServer())
        .post('/mechanics')
        .set('Authorization', `Bearer ${authToken}`)
        .send(mockMechanic2);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.specialties).toEqual(
        expect.arrayContaining(['Suspensão', 'Elétrica']),
      );
      mechanicId2 = response.body.id;
    });

    it('TC0003 - Should create third mechanic with Motor specialty', async () => {
      const response = await request(app.getHttpServer())
        .post('/mechanics')
        .set('Authorization', `Bearer ${authToken}`)
        .send(mockMechanic3);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.specialties).toContain('Motor');
      mechanicId3 = response.body.id;
    });

    it('TC0004 - Should list all mechanics', async () => {
      const response = await request(app.getHttpServer())
        .get('/mechanics/all')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(3);
    });

    it('TC0005 - Should get mechanics by Motor specialty', async () => {
      const response = await request(app.getHttpServer())
        .get('/mechanics/by-specialty?specialty=Motor')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(2);
      expect(
        response.body.every((m: any) => m.specialties.includes('Motor')),
      ).toBe(true);
    });

    it('TC0006 - Should get mechanic details by ID', async () => {
      const response = await request(app.getHttpServer())
        .get(`/mechanics/${mechanicId1}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(mechanicId1);
      expect(response.body.name).toBe(mockMechanic1.name);
      expect(response.body.specialties).toEqual(mockMechanic1.specialties);
    });

    it('TC0007 - Should update mechanic specialties', async () => {
      const updateData = {
        name: mockMechanic1.name,
        email: mockMechanic1.email,
        phone: mockMechanic1.phone,
        specialties: ['Motor', 'Freios', 'Suspensão'],
        experienceYears: mockMechanic1.experienceYears,
      };

      const response = await request(app.getHttpServer())
        .put(`/mechanics/${mechanicId1}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.specialties).toEqual(updateData.specialties);
    });

    it('TC0008 - Should toggle mechanic availability to unavailable', async () => {
      const response = await request(app.getHttpServer())
        .put(`/mechanics/${mechanicId2}/toggle-availability`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.isAvailable).toBe(false);
    });

    it('TC0009 - Should toggle mechanic availability back to available', async () => {
      const response = await request(app.getHttpServer())
        .put(`/mechanics/${mechanicId2}/toggle-availability`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.isAvailable).toBe(true);
    });

    it('TC0010 - Should get only available mechanics', async () => {
      await request(app.getHttpServer())
        .put(`/mechanics/${mechanicId3}/toggle-availability`)
        .set('Authorization', `Bearer ${authToken}`);

      const response = await request(app.getHttpServer())
        .get('/mechanics/available')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.every((m: any) => m.isAvailable === true)).toBe(
        true,
      );
    });
  });

  describe('validate mechanic business rules', () => {
    it('TC0001 - Should not create mechanic with duplicate email', async () => {
      const duplicateEmail = {
        name: faker.person.fullName(),
        email: mockMechanic1.email,
        phone: `11${faker.string.numeric(9)}`,
        specialties: ['Motor'],
        experienceYears: 5,
      };

      const response = await request(app.getHttpServer())
        .post('/mechanics')
        .set('Authorization', `Bearer ${authToken}`)
        .send(duplicateEmail);

      expect(response.status).toBe(409);
    });

    it('TC0002 - Should not update mechanic with empty specialties', async () => {
      const updateData = {
        name: mockMechanic1.name,
        email: mockMechanic1.email,
        phone: mockMechanic1.phone,
        specialties: [],
        experienceYears: mockMechanic1.experienceYears,
      };

      const response = await request(app.getHttpServer())
        .put(`/mechanics/${mechanicId1}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(400);
    });

    it('TC0003 - Should require at least one specialty when creating mechanic', async () => {
      const noSpecialties = {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        phone: `11${faker.string.numeric(9)}`,
        specialties: [],
        experienceYears: 5,
      };

      const response = await request(app.getHttpServer())
        .post('/mechanics')
        .set('Authorization', `Bearer ${authToken}`)
        .send(noSpecialties);

      expect(response.status).toBe(400);
    });
  });

  describe('delete mechanic workflow', () => {
    it('TC0001 - Should delete mechanic successfully', async () => {
      const mechanic = {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        phone: `11${faker.string.numeric(9)}`,
        specialties: ['Pintura'],
        experienceYears: 3,
      };

      const createResponse = await request(app.getHttpServer())
        .post('/mechanics')
        .set('Authorization', `Bearer ${authToken}`)
        .send(mechanic);

      const mechanicId = createResponse.body.id;

      const deleteResponse = await request(app.getHttpServer())
        .delete(`/mechanics/${mechanicId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(deleteResponse.status).toBe(204);
    });
  });
});
