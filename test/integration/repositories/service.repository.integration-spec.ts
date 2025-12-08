import { Test, TestingModule } from '@nestjs/testing';
import { Prisma, PrismaClient } from '@prisma/client';
import { PrismaService } from '../../../src/prisma/prisma.service';
import { ServiceRepository } from '../../../src/workshop/4-infrastructure/repositories/service.repository';
import { faker } from '@faker-js/faker/locale/pt_BR';

const createMockServiceData = () => ({
  name: faker.commerce.productName(),
  description: faker.commerce.productDescription(),
  price: new Prisma.Decimal(faker.number.float({ min: 50, max: 500 })),
  estimatedMinutes: faker.number.int({ min: 30, max: 240 }),
  category: faker.helpers.arrayElement([
    'Manutenção',
    'Suspensão',
    'Freios',
    'Elétrica',
    'Motor',
  ]),
  isActive: true,
});

describe('Service Repository Integration Tests', () => {
  let prisma: PrismaClient;
  let serviceRepository: ServiceRepository;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService, ServiceRepository],
    }).compile();

    prisma = module.get<PrismaService>(PrismaService);
    serviceRepository = module.get<ServiceRepository>(ServiceRepository);

    // Clean database before tests
    await prisma.$executeRawUnsafe('PRAGMA foreign_keys = OFF;');
    await prisma.serviceOrderItem.deleteMany();
    await prisma.serviceOrderPart.deleteMany();
    await prisma.serviceOrderStatusHistory.deleteMany();
    await prisma.budgetItem.deleteMany();
    await prisma.budget.deleteMany();
    await prisma.serviceOrder.deleteMany();
    await prisma.vehicle.deleteMany();
    await prisma.customer.deleteMany();
    await prisma.mechanic.deleteMany();
    await prisma.service.deleteMany();
    await prisma.part.deleteMany();
    await prisma.$executeRawUnsafe('PRAGMA foreign_keys = ON;');
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('create service', () => {
    it('TC0001 - Should create service with valid data', async () => {
      const serviceData = createMockServiceData();

      const service = await serviceRepository.create(serviceData);

      expect(service).toHaveProperty('id');
      expect(service.name).toBe(serviceData.name);
      expect(service.description).toBe(serviceData.description);
      expect(service.price.toNumber()).toBeCloseTo(
        serviceData.price.toNumber(),
        2,
      );
      expect(service.estimatedMinutes).toBe(serviceData.estimatedMinutes);
      expect(service.category).toBe(serviceData.category);
      expect(service.isActive).toBe(true);
    });

    it('TC0002 - Should create service with different category', async () => {
      const serviceData = createMockServiceData();

      const service = await serviceRepository.create(serviceData);

      expect(service).toHaveProperty('id');
      expect(service.name).toBe(serviceData.name);
      expect(service.category).toBe(serviceData.category);
    });

    it('TC0003 - Should create inactive service', async () => {
      const serviceData = {
        ...createMockServiceData(),
        isActive: false,
      };

      const service = await serviceRepository.create(serviceData);

      expect(service).toHaveProperty('id');
      expect(service.isActive).toBe(false);
    });
  });

  describe('find service', () => {
    let testServiceId: string;
    let testServiceName: string;
    let testCategory: string;

    beforeAll(async () => {
      const serviceData1 = createMockServiceData();
      testServiceName = serviceData1.name;
      testCategory = serviceData1.category;

      const service = await serviceRepository.create(serviceData1);
      testServiceId = service.id;

      await serviceRepository.create({
        ...createMockServiceData(),
        category: testCategory,
      });
    });

    it('TC0001 - Should find service by ID', async () => {
      const service = await serviceRepository.findById(testServiceId);

      expect(service).not.toBeNull();
      expect(service?.id).toBe(testServiceId);
      expect(service?.name).toBe(testServiceName);
    });

    it('TC0002 - Should find service by name', async () => {
      const service = await serviceRepository.findByName(testServiceName);

      expect(service).not.toBeNull();
      expect(service?.name).toBe(testServiceName);
      expect(service?.id).toBe(testServiceId);
    });

    it('TC0003 - Should find services by category', async () => {
      const services = await serviceRepository.findByCategory(testCategory);

      expect(services).toBeDefined();
      expect(Array.isArray(services)).toBe(true);
      expect(services.length).toBeGreaterThanOrEqual(2);
      expect(services.every((s) => s.category === testCategory)).toBe(true);
    });

    it('TC0004 - Should find all services', async () => {
      const services = await serviceRepository.findAll();

      expect(services).toBeDefined();
      expect(Array.isArray(services)).toBe(true);
      expect(services.length).toBeGreaterThan(0);
    });

    it('TC0005 - Should filter active services', async () => {
      const services = await serviceRepository.findAll({ active: true });

      expect(services).toBeDefined();
      expect(services.every((s) => s.isActive === true)).toBe(true);
    });

    it('TC0006 - Should filter by category', async () => {
      const services = await serviceRepository.findAll({
        category: testCategory,
      });

      expect(services).toBeDefined();
      expect(services.every((s) => s.category === testCategory)).toBe(true);
    });

    it('TC0007 - Should return null when service not found by ID', async () => {
      const service = await serviceRepository.findById(
        '00000000-0000-0000-0000-000000000000',
      );

      expect(service).toBeNull();
    });

    it('TC0008 - Should return null when service not found by name', async () => {
      const service = await serviceRepository.findByName('Serviço Inexistente');

      expect(service).toBeNull();
    });
  });

  describe('update service', () => {
    let updateServiceId: string;
    let updateServiceName: string;

    beforeAll(async () => {
      const serviceData = createMockServiceData();
      const service = await serviceRepository.create(serviceData);
      updateServiceId = service.id;
      updateServiceName = service.name;
    });

    it('TC0001 - Should update service price', async () => {
      const newPrice = new Prisma.Decimal(450.0);
      const updatedService = await serviceRepository.update(updateServiceId, {
        price: newPrice,
      });

      expect(updatedService.id).toBe(updateServiceId);
      expect(updatedService.price.toNumber()).toBe(450.0);
      expect(updatedService.name).toBe(updateServiceName);
    });

    it('TC0002 - Should update service description', async () => {
      const updatedService = await serviceRepository.update(updateServiceId, {
        description: 'Troca dos 4 pneus com alinhamento',
      });

      expect(updatedService.id).toBe(updateServiceId);
      expect(updatedService.description).toBe(
        'Troca dos 4 pneus com alinhamento',
      );
    });

    it('TC0003 - Should update service to inactive', async () => {
      const updatedService = await serviceRepository.update(updateServiceId, {
        isActive: false,
      });

      expect(updatedService.id).toBe(updateServiceId);
      expect(updatedService.isActive).toBe(false);
    });

    it('TC0004 - Should update multiple service fields', async () => {
      const newPrice = new Prisma.Decimal(500.0);
      const updatedService = await serviceRepository.update(updateServiceId, {
        price: newPrice,
        estimatedMinutes: 150,
        isActive: true,
      });

      expect(updatedService.id).toBe(updateServiceId);
      expect(updatedService.price.toNumber()).toBe(500.0);
      expect(updatedService.estimatedMinutes).toBe(150);
      expect(updatedService.isActive).toBe(true);
    });
  });

  describe('delete service', () => {
    it('TC0001 - Should delete service successfully', async () => {
      const serviceData = createMockServiceData();
      const service = await serviceRepository.create(serviceData);

      await serviceRepository.delete(service.id);

      const deletedService = await serviceRepository.findById(service.id);
      expect(deletedService).toBeNull();
    });
  });
});
