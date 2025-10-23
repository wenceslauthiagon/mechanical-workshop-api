import { Test, TestingModule } from '@nestjs/testing';
import { PrismaClient } from '@prisma/client';
import { PrismaService } from '../../../src/prisma/prisma.service';
import { VehicleRepository } from '../../../src/workshop/4-infrastructure/repositories/vehicle.repository';
import { CustomerRepository } from '../../../src/workshop/4-infrastructure/repositories/customer.repository';
import { faker } from '@faker-js/faker/locale/pt_BR';

function generateValidCPF(): string {
  const numbers = Array.from({ length: 9 }, () =>
    faker.number.int({ min: 0, max: 9 }),
  );

  // Calculate first digit
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += numbers[i] * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  numbers.push(remainder);

  // Calculate second digit
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

describe('Vehicle Repository Integration Tests', () => {
  let prisma: PrismaClient;
  let vehicleRepository: VehicleRepository;
  let customerRepository: CustomerRepository;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService, VehicleRepository, CustomerRepository],
    }).compile();

    prisma = module.get<PrismaService>(PrismaService);
    vehicleRepository = module.get<VehicleRepository>(VehicleRepository);
    customerRepository = module.get<CustomerRepository>(CustomerRepository);

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

  describe('create vehicle', () => {
    let testCustomerId: string;

    beforeAll(async () => {
      const customer = await customerRepository.create({
        document: generateValidCPF(),
        type: 'PESSOA_FISICA',
        name: faker.person.fullName(),
        email: faker.internet.email(),
        phone: faker.phone.number(),
        address: faker.location.streetAddress(true),
        additionalInfo: null,
      });
      testCustomerId = customer.id;
    });

    it('TC0001 - Should create vehicle with valid data', async () => {
      const vehicleData = {
        licensePlate: 'ABC1234',
        customerId: testCustomerId,
        brand: 'Volkswagen',
        model: 'Gol',
        year: 2020,
        color: 'Preto',
      };

      const vehicle = await vehicleRepository.create(vehicleData);

      expect(vehicle).toHaveProperty('id');
      expect(vehicle.licensePlate).toBe('ABC1234');
      expect(vehicle.brand).toBe('Volkswagen');
      expect(vehicle.model).toBe('Gol');
      expect(vehicle.year).toBe(2020);
      expect(vehicle.color).toBe('Preto');
      expect(vehicle.customerId).toBe(testCustomerId);
    });

    it('TC0002 - Should create vehicle with different customer', async () => {
      const newCustomer = await customerRepository.create({
        document: '44451959007',
        type: 'PESSOA_FISICA',
        name: 'Maria Santos',
        email: 'maria@test.com',
        phone: '11988888888',
        address: 'Rua Teste, 456',
        additionalInfo: null,
      });

      const vehicleData = {
        licensePlate: 'DEF5678',
        customerId: newCustomer.id,
        brand: 'Fiat',
        model: 'Uno',
        year: 2019,
        color: 'Branco',
      };

      const vehicle = await vehicleRepository.create(vehicleData);

      expect(vehicle).toHaveProperty('id');
      expect(vehicle.licensePlate).toBe('DEF5678');
      expect(vehicle.customerId).toBe(newCustomer.id);
    });

    it('TC0003 - Should create vehicle with complete data', async () => {
      const vehicleData = {
        licensePlate: `${faker.string.alpha({ length: 3, casing: 'upper' })}${faker.string.numeric(4)}`,
        customerId: testCustomerId,
        brand: faker.vehicle.manufacturer(),
        model: faker.vehicle.model(),
        year: faker.number.int({ min: 2000, max: 2025 }),
        color: faker.color.human(),
      };

      const vehicle = await vehicleRepository.create(vehicleData);

      expect(vehicle).toHaveProperty('id');
      expect(vehicle).toHaveProperty('createdAt');
      expect(vehicle).toHaveProperty('updatedAt');
      expect(vehicle.licensePlate).toBe(vehicleData.licensePlate);
    });
  });

  describe('find vehicle', () => {
    let testVehicleId: string;
    let testLicensePlate: string;
    let testCustomerId: string;

    beforeAll(async () => {
      const customer = await customerRepository.create({
        document: generateValidCPF(),
        type: 'PESSOA_FISICA',
        name: faker.person.fullName(),
        email: faker.internet.email(),
        phone: faker.phone.number(),
        address: faker.location.streetAddress(true),
        additionalInfo: null,
      });
      testCustomerId = customer.id;

      testLicensePlate = 'GHI9012';
      const vehicle = await vehicleRepository.create({
        licensePlate: testLicensePlate,
        customerId: testCustomerId,
        brand: 'Honda',
        model: 'Civic',
        year: 2021,
        color: 'Prata',
      });
      testVehicleId = vehicle.id;
    });

    it('TC0001 - Should find vehicle by ID', async () => {
      const vehicle = await vehicleRepository.findById(testVehicleId);

      expect(vehicle).not.toBeNull();
      expect(vehicle?.id).toBe(testVehicleId);
      expect(vehicle?.licensePlate).toBe(testLicensePlate);
      expect(vehicle?.brand).toBe('Honda');
    });

    it('TC0002 - Should find vehicle by license plate', async () => {
      const vehicle = await vehicleRepository.findByPlate(testLicensePlate);

      expect(vehicle).not.toBeNull();
      expect(vehicle?.licensePlate).toBe(testLicensePlate);
      expect(vehicle?.id).toBe(testVehicleId);
    });

    it('TC0003 - Should find vehicles by customer ID', async () => {
      const vehicles = await vehicleRepository.findByCustomerId(testCustomerId);

      expect(vehicles).toBeDefined();
      expect(Array.isArray(vehicles)).toBe(true);
      expect(vehicles.length).toBeGreaterThan(0);
      expect(vehicles.every((v) => v.customerId === testCustomerId)).toBe(true);
    });

    it('TC0004 - Should find all vehicles', async () => {
      const vehicles = await vehicleRepository.findAll();

      expect(vehicles).toBeDefined();
      expect(Array.isArray(vehicles)).toBe(true);
      expect(vehicles.length).toBeGreaterThan(0);
    });

    it('TC0005 - Should return null when vehicle not found by ID', async () => {
      const vehicle = await vehicleRepository.findById(
        '00000000-0000-0000-0000-000000000000',
      );

      expect(vehicle).toBeNull();
    });

    it('TC0006 - Should return null when vehicle not found by plate', async () => {
      const vehicle = await vehicleRepository.findByPlate('ZZZ9999');

      expect(vehicle).toBeNull();
    });
  });

  describe('update vehicle', () => {
    let updateVehicleId: string;
    let testCustomerId: string;

    beforeAll(async () => {
      const customer = await customerRepository.create({
        document: generateValidCPF(),
        type: 'PESSOA_FISICA',
        name: faker.person.fullName(),
        email: faker.internet.email(),
        phone: faker.phone.number(),
        address: faker.location.streetAddress(true),
        additionalInfo: null,
      });
      testCustomerId = customer.id;

      const vehicle = await vehicleRepository.create({
        licensePlate: 'JKL3456',
        customerId: testCustomerId,
        brand: 'Toyota',
        model: 'Corolla',
        year: 2018,
        color: 'Azul',
      });
      updateVehicleId = vehicle.id;
    });

    it('TC0001 - Should update vehicle brand', async () => {
      const updatedVehicle = await vehicleRepository.update(updateVehicleId, {
        brand: 'Toyota Updated',
      });

      expect(updatedVehicle.id).toBe(updateVehicleId);
      expect(updatedVehicle.brand).toBe('Toyota Updated');
      expect(updatedVehicle.model).toBe('Corolla');
    });

    it('TC0002 - Should update vehicle color', async () => {
      const updatedVehicle = await vehicleRepository.update(updateVehicleId, {
        color: 'Verde',
      });

      expect(updatedVehicle.id).toBe(updateVehicleId);
      expect(updatedVehicle.color).toBe('Verde');
    });

    it('TC0003 - Should update multiple vehicle fields', async () => {
      const updatedVehicle = await vehicleRepository.update(updateVehicleId, {
        year: 2022,
        color: 'Vermelho',
      });

      expect(updatedVehicle.id).toBe(updateVehicleId);
      expect(updatedVehicle.year).toBe(2022);
      expect(updatedVehicle.color).toBe('Vermelho');
    });
  });

  describe('check service orders', () => {
    let vehicleWithOrderId: string;
    let vehicleWithoutOrderId: string;
    let testCustomerId: string;

    beforeAll(async () => {
      const customer = await customerRepository.create({
        document: generateValidCPF(),
        type: 'PESSOA_FISICA',
        name: faker.person.fullName(),
        email: faker.internet.email(),
        phone: faker.phone.number(),
        address: faker.location.streetAddress(true),
        additionalInfo: null,
      });
      testCustomerId = customer.id;

      const vehicleWithOrder = await vehicleRepository.create({
        licensePlate: 'MNO7890',
        customerId: testCustomerId,
        brand: 'Chevrolet',
        model: 'Onix',
        year: 2020,
        color: 'Cinza',
      });
      vehicleWithOrderId = vehicleWithOrder.id;

      await prisma.serviceOrder.create({
        data: {
          orderNumber: 'SO-001',
          customerId: testCustomerId,
          vehicleId: vehicleWithOrderId,
          status: 'RECEBIDA',
          description: 'Test order',
          estimatedCompletionDate: new Date(),
        },
      });

      const vehicleWithoutOrder = await vehicleRepository.create({
        licensePlate: 'PQR1234',
        customerId: testCustomerId,
        brand: 'Renault',
        model: 'Logan',
        year: 2021,
        color: 'Preto',
      });
      vehicleWithoutOrderId = vehicleWithoutOrder.id;
    });

    it('TC0001 - Should return true when vehicle has service orders', async () => {
      const hasOrders =
        await vehicleRepository.hasServiceOrders(vehicleWithOrderId);

      expect(hasOrders).toBe(true);
    });

    it('TC0002 - Should return false when vehicle has no service orders', async () => {
      const hasOrders = await vehicleRepository.hasServiceOrders(
        vehicleWithoutOrderId,
      );

      expect(hasOrders).toBe(false);
    });
  });

  describe('delete vehicle', () => {
    let testCustomerId: string;

    beforeAll(async () => {
      const customer = await customerRepository.create({
        document: generateValidCPF(),
        type: 'PESSOA_FISICA',
        name: faker.person.fullName(),
        email: faker.internet.email(),
        phone: faker.phone.number(),
        address: faker.location.streetAddress(true),
        additionalInfo: null,
      });
      testCustomerId = customer.id;
    });

    it('TC0001 - Should delete vehicle successfully', async () => {
      const vehicle = await vehicleRepository.create({
        licensePlate: 'STU5678',
        customerId: testCustomerId,
        brand: 'Nissan',
        model: 'Kicks',
        year: 2022,
        color: 'Branco',
      });

      await vehicleRepository.delete(vehicle.id);

      const deletedVehicle = await vehicleRepository.findById(vehicle.id);
      expect(deletedVehicle).toBeNull();
    });
  });
});
