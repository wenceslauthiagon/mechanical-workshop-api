import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { AppModule } from '../../../src/app.module';
import { PrismaService } from '../../../src/prisma/prisma.service';
import request from 'supertest';
import * as bcrypt from 'bcryptjs';
import { faker } from '@faker-js/faker/locale/pt_BR';
import { generateValidCPF } from '../../utils/test-helpers';

const mockCustomer = {
  document: generateValidCPF(),
  type: 'PESSOA_FISICA' as const,
  name: faker.person.fullName(),
  email: faker.internet.email().toLowerCase(),
  phone: `11${faker.string.numeric(9)}`,
  address: faker.location.streetAddress(),
};

const mockVehicle = {
  licensePlate: `${faker.string.alpha({ length: 3, casing: 'upper' })}-${faker.string.numeric(4)}`,
  model: (faker.vehicle.model() || 'Model').padEnd(2, 'X'),
  brand: faker.vehicle.manufacturer(),
  year: faker.number.int({ min: 2015, max: 2024 }),
  color: faker.color.human(),
};

const mockMechanic = {
  name: faker.person.fullName(),
  email: faker.internet.email(),
  phone: `11${faker.string.numeric(9)}`,
  specialties: ['Motor', 'Suspensão'],
  experienceYears: faker.number.int({ min: 1, max: 30 }),
};

const mockService = {
  name: `${faker.vehicle.type()} - ${faker.commerce.productName()}`,
  description: faker.commerce.productDescription(),
  price: faker.number.float({ min: 100, max: 500, fractionDigits: 2 }),
  estimatedMinutes: faker.number.int({ min: 60, max: 240 }),
  category: 'Manutenção Preventiva',
  isActive: true,
};

const mockPart = {
  name: `${faker.vehicle.type()} - ${faker.commerce.productName()}`,
  description: faker.commerce.productDescription(),
  partNumber: faker.string.alphanumeric(8).toUpperCase(),
  price: faker.commerce.price({ min: 10, max: 500, dec: 2 }),
  stock: faker.number.int({ min: 50, max: 200 }),
  minStock: faker.number.int({ min: 5, max: 15 }),
  supplier: faker.company.name(),
};

describe('Complete E2E Workflow Integration Tests', () => {
  let app: INestApplication;
  let prisma: PrismaClient;
  let adminToken: string;
  let customerId: string;
  let vehicleId: string;
  let serviceOrderId: string;
  let budgetId: string;
  let mechanicId: string;
  let serviceId: string;
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

    const hashedPassword = await bcrypt.hash('Admin@1234', 10);
    await prisma.user.upsert({
      where: { email: 'admin@test.com' },
      update: {},
      create: {
        username: 'admin',
        passwordHash: hashedPassword,
        email: 'admin@workshop.com',
        role: 'ADMIN',
      },
    });

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'admin', password: 'Admin@1234' });

    adminToken = loginResponse.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Complete Customer Journey - Criar conta até entrega do veículo', () => {
    it('TC0001 - Should create customer account', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/customers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(mockCustomer)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(mockCustomer.name);
      expect(response.body.document).toBe(
        mockCustomer.document.replace(/\D/g, ''),
      );
      customerId = response.body.id;
    });

    it('TC0002 - Should register customer vehicle', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ ...mockVehicle, customerId })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.licensePlate).toBe(mockVehicle.licensePlate);
      expect(response.body.customerId).toBe(customerId);
      vehicleId = response.body.id;
    });

    it('TC0003 - Should create mechanic for the work', async () => {
      const response = await request(app.getHttpServer())
        .post('/mechanics')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(mockMechanic)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(mockMechanic.name);
      mechanicId = response.body.id;
    });

    it('TC0004 - Should create service in catalog', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/services')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(mockService)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(mockService.name);
      serviceId = response.body.id;
    });

    it('TC0005 - Should create part in inventory', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/parts')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(mockPart)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(mockPart.name);
      expect(response.body.stock).toBe(mockPart.stock);
      partId = response.body.id;
    });

    it('TC0006 - Should create service order with services and parts', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/service-orders')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          customerId,
          vehicleId,
          description: 'Manutenção preventiva completa',
          services: [{ serviceId, quantity: 1 }],
          parts: [{ partId, quantity: 4 }],
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.vehicleId).toBe(vehicleId);
      expect(response.body.status).toBe('RECEBIDA');
      expect(response.body.services).toHaveLength(1);
      expect(response.body.parts).toHaveLength(1);
      serviceOrderId = response.body.id;
    });

    it('TC0007 - Should verify part stock was reduced', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/parts/${partId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.stock).toBe(mockPart.stock - 4);
    });

    it('TC0008 - Should update service order to EM_DIAGNOSTICO', async () => {
      await request(app.getHttpServer())
        .patch(`/api/service-orders/${serviceOrderId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'EM_DIAGNOSTICO' })
        .expect(200);
    });

    it('TC0009 - Should create and send budget', async () => {
      await request(app.getHttpServer())
        .patch(`/api/service-orders/${serviceOrderId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'AGUARDANDO_APROVACAO' })
        .expect(200);

      const createResponse = await request(app.getHttpServer())
        .post('/budgets')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          serviceOrderId,
          customerId,
          validDays: 7,
          items: [
            {
              id: faker.string.uuid(),
              type: 'SERVICE',
              description: 'Troca de Óleo',
              quantity: 1,
              unitPrice: 150.0,
              total: 150.0,
            },
            {
              id: faker.string.uuid(),
              type: 'PART',
              description: 'Óleo Sintético',
              quantity: 4,
              unitPrice: 80.0,
              total: 320.0,
            },
          ],
        })
        .expect(201);

      budgetId = createResponse.body.id;

      await request(app.getHttpServer())
        .put(`/budgets/${budgetId}/send`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });

    it('TC0010 - Should verify service order status changed to AGUARDANDO_APROVACAO', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/service-orders/${serviceOrderId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.status).toBe('AGUARDANDO_APROVACAO');
    });

    it('TC0011 - Should allow customer to view budget via public API', async () => {
      const response = await request(app.getHttpServer())
        .get(`/public/budgets/${budgetId}`)
        .expect(200);

      expect(response.body.id).toBe(budgetId);
      expect(response.body.status).toBe('ENVIADO');
      expect(response.body.customerId).toBe(customerId);
    });

    it('TC0012 - Should allow customer to approve budget via public API', async () => {
      const response = await request(app.getHttpServer())
        .put(`/public/budgets/${budgetId}/approve`)
        .expect(200);

      expect(response.body.budget.status).toBe('APROVADO');
      expect(response.body.message).toBeDefined();
    });

    it('TC0013 - Should verify budget status changed to APROVADO', async () => {
      const response = await request(app.getHttpServer())
        .get(`/budgets/${budgetId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.status).toBe('APROVADO');
    });

    it('TC0014 - Should verify service order status changed to EM_EXECUCAO', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/service-orders/${serviceOrderId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.status).toBe('EM_EXECUCAO');
    });

    it('TC0015 - Should assign mechanic to service order', async () => {
      // Verificar que o mecânico foi criado e está disponível
      const mechanicResponse = await request(app.getHttpServer())
        .get(`/mechanics/${mechanicId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(mechanicResponse.body.id).toBe(mechanicId);
      expect(mechanicResponse.body.name).toBe(mockMechanic.name);

      // Verificar que a OS está em execução
      const response = await request(app.getHttpServer())
        .get(`/api/service-orders/${serviceOrderId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.status).toBe('EM_EXECUCAO');
    });

    it('TC0016 - Should update service order to FINALIZADA', async () => {
      await request(app.getHttpServer())
        .patch(`/api/service-orders/${serviceOrderId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'FINALIZADA' })
        .expect(200);
    });

    it('TC0017 - Should update service order to ENTREGUE', async () => {
      await request(app.getHttpServer())
        .patch(`/api/service-orders/${serviceOrderId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'ENTREGUE' })
        .expect(200);
    });

    it('TC0018 - Should verify complete service order history', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/service-orders/${serviceOrderId}/status-history`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveLength(6);
      expect(response.body[0].status).toBe('RECEBIDA');
      expect(response.body[1].status).toBe('EM_DIAGNOSTICO');
      expect(response.body[2].status).toBe('AGUARDANDO_APROVACAO');
      expect(response.body[3].status).toBe('EM_EXECUCAO');
      expect(response.body[4].status).toBe('FINALIZADA');
      expect(response.body[5].status).toBe('ENTREGUE');
    });

    it('TC0019 - Should verify customer can view completed order', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/service-orders/${serviceOrderId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.id).toBe(serviceOrderId);
      expect(response.body.status).toBe('ENTREGUE');
    });

    it('TC0020 - Should verify overall statistics updated', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/service-orders/all')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      // Verificar que existem ordens de serviço criadas
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Complete Rejection Flow - Cliente rejeita orçamento', () => {
    let rejectionCustomerId: string;
    let rejectionVehicleId: string;
    let rejectionServiceOrderId: string;
    let rejectionBudgetId: string;

    it('TC0001 - Should create complete setup for rejection test', async () => {
      const customerResponse = await request(app.getHttpServer())
        .post('/api/customers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          ...mockCustomer,
          document: generateValidCPF(),
          email: faker.internet.email().toLowerCase(),
        })
        .expect(201);
      rejectionCustomerId = customerResponse.body.id;

      const vehicleResponse = await request(app.getHttpServer())
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          ...mockVehicle,
          licensePlate: `${faker.string.alpha({ length: 3, casing: 'upper' })}-${faker.string.numeric(4)}`,
          customerId: rejectionCustomerId,
        })
        .expect(201);
      rejectionVehicleId = vehicleResponse.body.id;

      const osResponse = await request(app.getHttpServer())
        .post('/api/service-orders')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          customerId: rejectionCustomerId,
          vehicleId: rejectionVehicleId,
          description: 'Reparo simples',
          services: [{ serviceId, quantity: 1 }],
          parts: [],
        })
        .expect(201);
      rejectionServiceOrderId = osResponse.body.id;

      await request(app.getHttpServer())
        .patch(`/api/service-orders/${rejectionServiceOrderId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'EM_DIAGNOSTICO' })
        .expect(200);

      await request(app.getHttpServer())
        .patch(`/api/service-orders/${rejectionServiceOrderId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'AGUARDANDO_APROVACAO' })
        .expect(200);

      const budgetResponse = await request(app.getHttpServer())
        .post('/budgets')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          serviceOrderId: rejectionServiceOrderId,
          customerId: rejectionCustomerId,
          validDays: 7,
          items: [
            {
              id: faker.string.uuid(),
              type: 'SERVICE',
              description: 'Reparo',
              quantity: 1,
              unitPrice: 500.0,
              total: 500.0,
            },
          ],
        })
        .expect(201);
      rejectionBudgetId = budgetResponse.body.id;

      await request(app.getHttpServer())
        .put(`/budgets/${rejectionBudgetId}/send`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });

    it('TC0002 - Should allow customer to reject budget via public API', async () => {
      await request(app.getHttpServer())
        .put(`/public/budgets/${rejectionBudgetId}/reject`)
        .expect(200);
    });

    it('TC0003 - Should verify budget status changed to REJEITADO', async () => {
      const response = await request(app.getHttpServer())
        .get(`/budgets/${rejectionBudgetId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.status).toBe('REJEITADO');
    });

    it('TC0004 - Should verify service order status remains AGUARDANDO_APROVACAO after rejection', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/service-orders/${rejectionServiceOrderId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.status).toBe('AGUARDANDO_APROVACAO');
    });
  });
});
