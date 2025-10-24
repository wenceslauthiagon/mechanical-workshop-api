import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';
import request from 'supertest';
import * as bcrypt from 'bcryptjs';
import { faker } from '@faker-js/faker/locale/pt_BR';

function generateValidCPF(): string {
  const numbers = Array.from({ length: 9 }, () =>
    faker.number.int({ min: 0, max: 9 }),
  );

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += numbers[i] * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  numbers.push(remainder);

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

const mockCustomer = {
  document: generateValidCPF(),
  type: 'PESSOA_FISICA' as const,
  name: faker.person.fullName(),
  email: faker.internet.email(),
  phone: `11${faker.string.numeric(9)}`,
  address: faker.location.streetAddress(),
  additionalInfo: faker.lorem.sentence(),
};

describe('Customer Integration Tests', () => {
  let app: INestApplication;
  let prisma: PrismaClient;
  let authToken: string;
  let customerId: string;

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
    await prisma.user.create({
      data: {
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

  describe('customer CRUD flow', () => {
    it('TC0001 - Should create a new customer', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/customers')
        .set('Authorization', `Bearer ${authToken}`)
        .send(mockCustomer);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(mockCustomer.name);
      expect(response.body.email).toBe(mockCustomer.email);
      expect(response.body.document).toBe(
        mockCustomer.document.replace(/\D/g, ''),
      );
      expect(response.body.type).toBe(mockCustomer.type);

      customerId = response.body.id;
    });

    it('TC0002 - Should list all customers', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/customers')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('TC0003 - Should get customer by ID', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/customers/${customerId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(customerId);
      expect(response.body.name).toBe(mockCustomer.name);
    });

    it('TC0004 - Should get customer by document', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/customers/document/${mockCustomer.document}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.document).toBe(
        mockCustomer.document.replace(/\D/g, ''),
      );
      expect(response.body.id).toBe(customerId);
    });

    it('TC0005 - Should update customer', async () => {
      const updatedName = faker.person.fullName();
      const updatedPhone = `11${faker.string.numeric(9)}`;

      const response = await request(app.getHttpServer())
        .patch(`/api/customers/${customerId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: updatedName,
          phone: updatedPhone,
        });

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(customerId);
      expect(response.body.name).toBe(updatedName);
      expect(response.body.phone).toBe(updatedPhone);
    });

    it('TC0006 - Should delete customer', async () => {
      const newCustomer = {
        document: generateValidCPF(),
        type: 'PESSOA_FISICA',
        name: faker.person.fullName(),
        email: faker.internet.email(),
        phone: `11${faker.string.numeric(9)}`,
        address: faker.location.streetAddress(),
      };

      const createResponse = await request(app.getHttpServer())
        .post('/api/customers')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newCustomer);

      expect(createResponse.status).toBe(201);

      const deleteResponse = await request(app.getHttpServer())
        .delete(`/api/customers/${createResponse.body.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(deleteResponse.status).toBe(200);

      const getResponse = await request(app.getHttpServer())
        .get(`/api/customers/${createResponse.body.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(getResponse.status).toBe(404);
    });
  });

  describe('validate customer business rules', () => {
    let originalConsoleError: typeof console.error;

    beforeAll(() => {
      originalConsoleError = console.error;
      console.error = jest.fn();
    });

    afterAll(() => {
      console.error = originalConsoleError;
    });

    it('TC0001 - Should not create customer with duplicate email', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/customers')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          ...mockCustomer,
          document: generateValidCPF(),
        });

      expect(response.status).toBe(409);
    });

    it('TC0002 - Should not create customer with duplicate document', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/customers')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          ...mockCustomer,
          email: faker.internet.email(),
        });

      expect(response.status).toBe(409);
    });

    it('TC0003 - Should not create customer with invalid data', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/customers')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: '',
          email: 'invalid-email',
          phone: '',
        });

      expect(response.status).toBe(400);
    });

    it('TC0004 - Should not get customer with invalid ID', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/customers/invalid-uuid')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
    });

    it('TC0005 - Should not get customer with non-existent ID', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/customers/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });

    it('TC0006 - Should not get customer with non-existent document', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/customers/document/000.000.000-00')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });

    it('TC0007 - Should not update customer with duplicate email', async () => {
      const anotherCustomer = {
        document: generateValidCPF(),
        type: 'PESSOA_FISICA',
        name: faker.person.fullName(),
        email: faker.internet.email(),
        phone: `11${faker.string.numeric(9)}`,
        address: faker.location.streetAddress(),
      };

      const createResponse = await request(app.getHttpServer())
        .post('/api/customers')
        .set('Authorization', `Bearer ${authToken}`)
        .send(anotherCustomer);

      expect(createResponse.status).toBe(201);

      const updateResponse = await request(app.getHttpServer())
        .patch(`/api/customers/${createResponse.body.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          email: mockCustomer.email,
        });

      expect(updateResponse.status).toBe(409);
    });
  });
});
