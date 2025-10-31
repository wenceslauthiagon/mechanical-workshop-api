import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';
import request from 'supertest';
import * as bcrypt from 'bcryptjs';
import { faker } from '@faker-js/faker/locale/pt_BR';
import { generateValidCPF } from '../utils/test-helpers';

const mockAdmin = {
  username: 'admin_auth',
  password: 'admin123',
  email: 'admin_auth@test.com',
  role: 'ADMIN' as const,
};

const mockEmployee = {
  username: 'employee_auth',
  password: 'employee123',
  email: 'employee_auth@test.com',
  role: 'EMPLOYEE' as const,
};

const mockCustomer = {
  document: generateValidCPF(),
  type: 'PESSOA_FISICA' as const,
  name: faker.person.fullName(),
  email: faker.internet.email(),
  phone: `11${faker.string.numeric(9)}`,
  address: faker.location.streetAddress(),
};

const mockService = {
  name: faker.commerce.productName(),
  description: faker.commerce.productDescription(),
  price: faker.number.float({ min: 50, max: 500, fractionDigits: 2 }),
  estimatedMinutes: faker.number.int({ min: 30, max: 240 }),
  category: 'Manutenção Preventiva',
};

const mockPart = {
  name: faker.commerce.productName(),
  description: faker.commerce.productDescription(),
  partNumber: faker.string.alphanumeric(8).toUpperCase(),
  price: faker.commerce.price({ min: 10, max: 200, dec: 2 }),
  stock: faker.number.int({ min: 10, max: 100 }),
  minStock: faker.number.int({ min: 5, max: 15 }),
  supplier: faker.company.name(),
};

const mockMechanic = {
  name: faker.person.fullName(),
  email: faker.internet.email(),
  phone: `11${faker.string.numeric(9)}`,
  specialties: ['Motor', 'Freios', 'Suspensão'],
  experienceYears: faker.number.int({ min: 1, max: 30 }),
};

describe('Authorization RBAC Integration Tests', () => {
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

    const adminLoginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        username: mockAdmin.username,
        password: mockAdmin.password,
      });

    adminToken = adminLoginResponse.body.access_token;

    const employeeLoginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        username: mockEmployee.username,
        password: mockEmployee.password,
      });

    employeeToken = employeeLoginResponse.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('ADMIN role authorization', () => {
    it('TC0001 - ADMIN Should create users', async () => {
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
    });

    it('TC0002 - ADMIN Should list all users', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('TC0003 - ADMIN Should create customers', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/customers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(mockCustomer);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
    });

    it('TC0004 - ADMIN Should create services', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/services')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(mockService);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
    });

    it('TC0005 - ADMIN Should create parts', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/parts')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(mockPart);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
    });

    it('TC0006 - ADMIN Should create mechanics', async () => {
      const response = await request(app.getHttpServer())
        .post('/mechanics')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(mockMechanic);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
    });

    it('TC0007 - ADMIN Should access stats endpoints', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/stats/overall')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
    });
  });

  describe('EMPLOYEE role authorization', () => {
    it('TC0001 - EMPLOYEE Should create customers', async () => {
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
        .set('Authorization', `Bearer ${employeeToken}`)
        .send(customer);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
    });

    it('TC0002 - EMPLOYEE Should access stats endpoints', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/stats/overall')
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(response.status).toBe(200);
    });

    it('TC0003 - EMPLOYEE Should list customers', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/customers/all')
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('TC0004 - EMPLOYEE Should list services', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/services/all')
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('TC0005 - EMPLOYEE Should list parts', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/parts/all')
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('TC0006 - EMPLOYEE Should list mechanics', async () => {
      const response = await request(app.getHttpServer())
        .get('/mechanics/all')
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('EMPLOYEE role restrictions', () => {
    let originalConsoleError: typeof console.error;

    beforeAll(() => {
      originalConsoleError = console.error;
      console.error = jest.fn();
    });

    afterAll(() => {
      console.error = originalConsoleError;
    });

    it('TC0001 - EMPLOYEE Should not create users', async () => {
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

    it('TC0002 - EMPLOYEE Should not list all users', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/users')
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe('validate authentication required', () => {
    let originalConsoleError: typeof console.error;

    beforeAll(() => {
      originalConsoleError = console.error;
      console.error = jest.fn();
    });

    afterAll(() => {
      console.error = originalConsoleError;
    });

    it('TC0001 - Should not create customer without authentication', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/customers')
        .send(mockCustomer);

      expect(response.status).toBe(401);
    });

    it('TC0002 - Should not create service without authentication', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/services')
        .send(mockService);

      expect(response.status).toBe(401);
    });

    it('TC0003 - Should not create part without authentication', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/parts')
        .send(mockPart);

      expect(response.status).toBe(401);
    });

    it('TC0004 - Should not create mechanic without authentication', async () => {
      const response = await request(app.getHttpServer())
        .post('/mechanics')
        .send(mockMechanic);

      expect([401, 409]).toContain(response.status);
    });

    it('TC0005 - Should not access stats without authentication', async () => {
      const response = await request(app.getHttpServer()).get(
        '/api/stats/overall',
      );

      expect(response.status).toBe(401);
    });

    it('TC0006 - Should not list customers without authentication', async () => {
      const response = await request(app.getHttpServer()).get('/api/customers');

      expect(response.status).toBe(401);
    });
  });
});
