import { Test, TestingModule } from '@nestjs/testing';
import { PrismaClient, Prisma } from '@prisma/client';
import { PrismaService } from '../../../src/prisma/prisma.service';
import { PartRepository } from '../../../src/workshop/4-infrastructure/repositories/part.repository';
import { faker } from '@faker-js/faker/locale/pt_BR';

const createMockPartData = () => ({
  name: faker.vehicle.vehicle(),
  description: faker.commerce.productDescription(),
  partNumber: `PN-${faker.string.alphanumeric(6).toUpperCase()}`,
  price: new Prisma.Decimal(
    faker.number.float({ min: 10, max: 500, fractionDigits: 2 }),
  ),
  stock: faker.number.int({ min: 0, max: 100 }),
  minStock: faker.number.int({ min: 1, max: 10 }),
  supplier: faker.company.name(),
  isActive: true,
});

describe('Part Repository Integration Tests', () => {
  let prisma: PrismaClient;
  let partRepository: PartRepository;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService, PartRepository],
    }).compile();

    prisma = module.get<PrismaService>(PrismaService);
    partRepository = module.get<PartRepository>(PartRepository);

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

  describe('create part', () => {
    it('TC0001 - Should create part with valid data', async () => {
      const partData = createMockPartData();

      const part = await partRepository.create(partData);

      expect(part).toHaveProperty('id');
      expect(part.name).toBe(partData.name);
      expect(part.partNumber).toBe(partData.partNumber);
      expect(part.price.toNumber()).toBeCloseTo(partData.price.toNumber(), 2);
      expect(part.stock).toBe(partData.stock);
      expect(part.minStock).toBe(partData.minStock);
      expect(part.supplier).toBe(partData.supplier);
      expect(part.isActive).toBe(true);
    });

    it('TC0002 - Should create part with different supplier', async () => {
      const partData = createMockPartData();

      const part = await partRepository.create(partData);

      expect(part).toHaveProperty('id');
      expect(part.name).toBe(partData.name);
      expect(part.supplier).toBe(partData.supplier);
    });

    it('TC0003 - Should create inactive part', async () => {
      const partData = {
        ...createMockPartData(),
        isActive: false,
      };

      const part = await partRepository.create(partData);

      expect(part).toHaveProperty('id');
      expect(part.isActive).toBe(false);
    });
  });

  describe('find part', () => {
    let testPartId: string;
    let testPartNumber: string;
    let testSupplier: string;

    beforeAll(async () => {
      const partData1 = createMockPartData();
      testPartNumber = partData1.partNumber;
      testSupplier = partData1.supplier;

      const part = await partRepository.create(partData1);
      testPartId = part.id;

      await partRepository.create({
        ...createMockPartData(),
        supplier: testSupplier,
        stock: 15,
        minStock: 3,
      });

      await partRepository.create({
        ...createMockPartData(),
        stock: 2,
        minStock: 8,
      });
    });

    it('TC0001 - Should find part by ID', async () => {
      const part = await partRepository.findById(testPartId);

      expect(part).not.toBeNull();
      expect(part?.id).toBe(testPartId);
      expect(part?.partNumber).toBe(testPartNumber);
    });

    it('TC0002 - Should find part by part number', async () => {
      const part = await partRepository.findByPartNumber(testPartNumber);

      expect(part).not.toBeNull();
      expect(part?.partNumber).toBe(testPartNumber);
      expect(part?.id).toBe(testPartId);
    });

    it('TC0003 - Should find parts by supplier', async () => {
      const parts = await partRepository.findBySupplier(testSupplier);

      expect(parts).toBeDefined();
      expect(Array.isArray(parts)).toBe(true);
      expect(parts.length).toBeGreaterThanOrEqual(2);
      expect(parts.every((p) => p.supplier === testSupplier)).toBe(true);
    });

    it('TC0004 - Should find all parts', async () => {
      const parts = await partRepository.findAll();

      expect(parts).toBeDefined();
      expect(Array.isArray(parts)).toBe(true);
      expect(parts.length).toBeGreaterThan(0);
    });

    it('TC0005 - Should filter active parts', async () => {
      const parts = await partRepository.findAll({ active: true });

      expect(parts).toBeDefined();
      expect(parts.every((p) => p.isActive === true)).toBe(true);
    });

    it('TC0006 - Should filter by supplier', async () => {
      const parts = await partRepository.findAll({ supplier: testSupplier });

      expect(parts).toBeDefined();
      expect(parts.every((p) => p.supplier === testSupplier)).toBe(true);
    });

    it('TC0007 - Should find low stock parts', async () => {
      const parts = await partRepository.findLowStock();

      expect(parts).toBeDefined();
      expect(Array.isArray(parts)).toBe(true);
      expect(parts.length).toBeGreaterThan(0);

      expect(parts.every((p: any) => p.stock <= p.min_stock)).toBe(true);
    });

    it('TC0008 - Should return null when part not found by ID', async () => {
      const part = await partRepository.findById(
        '00000000-0000-0000-0000-000000000000',
      );

      expect(part).toBeNull();
    });
  });

  describe('update part', () => {
    let updatePartId: string;

    beforeAll(async () => {
      const part = await partRepository.create(createMockPartData());
      updatePartId = part.id;
    });

    it('TC0001 - Should update part price', async () => {
      const newPrice = new Prisma.Decimal(
        faker.number.float({
          min: 50,
          max: 100,
          fractionDigits: 2,
        }),
      );
      const updatedPart = await partRepository.update(updatePartId, {
        price: newPrice,
      });

      expect(updatedPart.id).toBe(updatePartId);
      expect(updatedPart.price.toNumber()).toBeCloseTo(newPrice.toNumber(), 2);
    });

    it('TC0002 - Should update part stock', async () => {
      const newStock = faker.number.int({ min: 50, max: 100 });
      const updatedPart = await partRepository.updateStock(
        updatePartId,
        newStock,
      );

      expect(updatedPart.id).toBe(updatePartId);
      expect(updatedPart.stock).toBe(newStock);
    });

    it('TC0003 - Should update part to inactive', async () => {
      const updatedPart = await partRepository.update(updatePartId, {
        isActive: false,
      });

      expect(updatedPart.id).toBe(updatePartId);
      expect(updatedPart.isActive).toBe(false);
    });

    it('TC0004 - Should update multiple part fields', async () => {
      const newPrice = new Prisma.Decimal(
        faker.number.float({
          min: 60,
          max: 120,
          fractionDigits: 2,
        }),
      );
      const newMinStock = faker.number.int({ min: 10, max: 20 });

      const updatedPart = await partRepository.update(updatePartId, {
        price: newPrice,
        minStock: newMinStock,
        isActive: true,
      });

      expect(updatedPart.id).toBe(updatePartId);
      expect(updatedPart.price.toNumber()).toBeCloseTo(newPrice.toNumber(), 2);
      expect(updatedPart.minStock).toBe(newMinStock);
      expect(updatedPart.isActive).toBe(true);
    });
  });

  describe('delete part', () => {
    it('TC0001 - Should delete part successfully', async () => {
      const part = await partRepository.create(createMockPartData());

      await partRepository.delete(part.id);

      const deletedPart = await partRepository.findById(part.id);
      expect(deletedPart).toBeNull();
    });
  });
});
