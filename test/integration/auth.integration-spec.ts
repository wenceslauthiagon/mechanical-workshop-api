import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';
import request from 'supertest';
import * as bcrypt from 'bcryptjs';
import { faker } from '@faker-js/faker/locale/pt_BR';

const mockAdmin = {
  username: 'admin',
  password: 'admin123',
  email: 'admin@test.com',
  role: 'ADMIN' as const,
};

const mockEmployee = {
  username: 'employee',
  password: 'employee123',
  email: 'employee@test.com',
  role: 'EMPLOYEE' as const,
};

describe('Auth Integration Tests', () => {
  let app: INestApplication;
  let prisma: PrismaClient;
  let adminToken: string;
  let employeeToken: string;

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

    const hashedAdminPassword = await bcrypt.hash(mockAdmin.password, 10);
    await prisma.user.upsert({
      where: { email: mockAdmin.email },
      update: {},
      create: {
        username: mockAdmin.username,
        passwordHash: hashedAdminPassword,
        email: mockAdmin.email,
        role: mockAdmin.role,
      },
    });

    const hashedEmployeePassword = await bcrypt.hash(mockEmployee.password, 10);
    await prisma.user.upsert({
      where: { email: mockEmployee.email },
      update: {},
      create: {
        username: mockEmployee.username,
        passwordHash: hashedEmployeePassword,
        email: mockEmployee.email,
        role: mockEmployee.role,
      },
    });
  });

  afterAll(async () => {
    await app.close();
  });

  describe('login flow', () => {
    it('TC0001 - Should login successfully with valid ADMIN credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: mockAdmin.username,
          password: mockAdmin.password,
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('access_token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.username).toBe(mockAdmin.username);
      expect(response.body.user.email).toBe(mockAdmin.email);
      expect(response.body.user.role).toBe(mockAdmin.role);
      expect(response.body.user).not.toHaveProperty('passwordHash');

      adminToken = response.body.access_token;
    });

    it('TC0002 - Should login successfully with valid EMPLOYEE credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: mockEmployee.username,
          password: mockEmployee.password,
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('access_token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.username).toBe(mockEmployee.username);
      expect(response.body.user.role).toBe(mockEmployee.role);

      employeeToken = response.body.access_token;
    });

    it('TC0003 - Should retrieve user profile with valid token', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.username).toBe(mockAdmin.username);
      expect(response.body.email).toBe(mockAdmin.email);
      expect(response.body.role).toBe(mockAdmin.role);
      expect(response.body).not.toHaveProperty('passwordHash');
    });

    it('TC0004 - Should list users when authenticated as ADMIN', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(2);
      expect(response.body[0]).not.toHaveProperty('passwordHash');
    });

    it('TC0005 - Should create new user when authenticated as ADMIN', async () => {
      const newUser = {
        username: faker.internet.username(),
        password: 'Test@123',
        confirmPassword: 'Test@123',
        email: faker.internet.email(),
        role: 'EMPLOYEE',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newUser);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.username).toBe(newUser.username);
      expect(response.body.email).toBe(newUser.email);
      expect(response.body.role).toBe(newUser.role);
    });
  });

  describe('validate authentication rules', () => {
    let originalConsoleError: typeof console.error;

    beforeAll(() => {
      originalConsoleError = console.error;
      console.error = jest.fn();
    });

    afterAll(() => {
      console.error = originalConsoleError;
    });

    it('TC0001 - Should not login with invalid username', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: 'nonexistent',
          password: mockAdmin.password,
        });

      expect(response.status).toBe(401);
    });

    it('TC0002 - Should not login with invalid password', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: mockAdmin.username,
          password: 'wrongpassword',
        });

      expect(response.status).toBe(401);
    });

    it('TC0003 - Should not access profile without token', async () => {
      const response = await request(app.getHttpServer()).get('/auth/profile');

      expect(response.status).toBe(401);
    });

    it('TC0004 - Should not access profile with invalid token', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', 'Bearer invalid.token.here');

      expect(response.status).toBe(401);
    });

    it('TC0005 - Should not list users when authenticated as EMPLOYEE', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/users')
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(response.status).toBe(403);
    });

    it('TC0006 - Should not create user when authenticated as EMPLOYEE', async () => {
      const newUser = {
        username: faker.internet.username(),
        password: 'Test@123',
        confirmPassword: 'Test@123',
        email: faker.internet.email(),
        role: 'EMPLOYEE',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/users')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send(newUser);

      expect(response.status).toBe(403);
    });

    it('TC0007 - Should not create user without authentication', async () => {
      const newUser = {
        username: faker.internet.username(),
        password: 'Test@123',
        confirmPassword: 'Test@123',
        email: faker.internet.email(),
        role: 'EMPLOYEE',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/users')
        .send(newUser);

      expect(response.status).toBe(401);
    });

    it('TC0008 - Should not create user with mismatched passwords', async () => {
      const newUser = {
        username: faker.internet.username(),
        password: 'Test@123',
        confirmPassword: 'Different@123',
        email: faker.internet.email(),
        role: 'EMPLOYEE',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newUser);

      expect(response.status).toBe(400);
    });

    it('TC0009 - Should not create user with duplicate username', async () => {
      const duplicateUser = {
        username: mockAdmin.username,
        password: 'Test@123',
        confirmPassword: 'Test@123',
        email: faker.internet.email(),
        role: 'EMPLOYEE',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(duplicateUser);

      expect(response.status).toBe(409);
    });

    it('TC0010 - Should not login with missing credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: mockAdmin.username,
        });

      expect(response.status).toBe(400);
    });
  });
});
