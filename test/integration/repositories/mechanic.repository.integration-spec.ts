import { Test, TestingModule } from '@nestjs/testing';
import { PrismaClient } from '@prisma/client';
import { PrismaService } from '../../../src/prisma/prisma.service';
import { MechanicRepository } from '../../../src/workshop/4-infrastructure/repositories/mechanic.repository';
import { ErrorHandlerService } from '../../../src/shared/services/error-handler.service';
import { faker } from '@faker-js/faker/locale/pt_BR';

describe('Mechanic Repository Integration Tests', () => {
  let prisma: PrismaClient;
  let mechanicRepository: MechanicRepository;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService, MechanicRepository, ErrorHandlerService],
    }).compile();

    prisma = module.get<PrismaService>(PrismaService);
    mechanicRepository = module.get<MechanicRepository>(MechanicRepository);

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

  describe('create mechanic', () => {
    it('TC0001 - Should create mechanic with valid data', async () => {
      const mechanicData = {
        name: 'João Mecânico',
        email: 'joao.mecanico@test.com',
        phone: '11999999999',
        specialties: ['Motor', 'Suspensão'],
        experienceYears: 5,
      };

      const mechanic = await mechanicRepository.create(mechanicData);

      expect(mechanic).toHaveProperty('id');
      expect(mechanic.name).toBe('João Mecânico');
      expect(mechanic.email).toBe('joao.mecanico@test.com');
      expect(mechanic.phone).toBe('11999999999');
      expect(mechanic.specialties).toEqual(['Motor', 'Suspensão']);
      expect(mechanic.experienceYears).toBe(5);
      expect(mechanic.isActive).toBe(true);
      expect(mechanic.isAvailable).toBe(true);
    });

    it('TC0002 - Should create mechanic with different specialties', async () => {
      const mechanicData = {
        name: 'Maria Silva',
        email: 'maria.silva@test.com',
        phone: '11988888888',
        specialties: ['Freios', 'Elétrica'],
        experienceYears: 3,
      };

      const mechanic = await mechanicRepository.create(mechanicData);

      expect(mechanic).toHaveProperty('id');
      expect(mechanic.name).toBe('Maria Silva');
      expect(mechanic.specialties).toEqual(['Freios', 'Elétrica']);
    });

    it('TC0003 - Should create mechanic without phone', async () => {
      const mechanicData = {
        name: 'Pedro Santos',
        email: 'pedro.santos@test.com',
        specialties: ['Injeção Eletrônica'],
        experienceYears: 2,
      };

      const mechanic = await mechanicRepository.create(mechanicData);

      expect(mechanic).toHaveProperty('id');
      expect(mechanic.phone).toBeNull();
    });
  });

  describe('find mechanic', () => {
    let testMechanicId: string;
    let testMechanicEmail: string;

    beforeAll(async () => {
      testMechanicEmail = 'carlos@test.com';

      const mechanic = await mechanicRepository.create({
        name: 'Carlos Oliveira',
        email: testMechanicEmail,
        phone: '11977777777',
        specialties: ['Ar Condicionado', 'Motor'],
        experienceYears: 10,
      });

      testMechanicId = mechanic.id;

      await mechanicRepository.create({
        name: 'Ana Costa',
        email: 'ana@test.com',
        phone: '11966666666',
        specialties: ['Funilaria', 'Pintura'],
        experienceYears: 7,
      });
    });

    it('TC0001 - Should find mechanic by ID', async () => {
      const mechanic = await mechanicRepository.findById(testMechanicId);

      expect(mechanic).not.toBeNull();
      expect(mechanic?.id).toBe(testMechanicId);
      expect(mechanic?.email).toBe(testMechanicEmail);
      expect(mechanic).toHaveProperty('activeServiceOrders');
      expect(mechanic).toHaveProperty('completedServiceOrders');
    });

    it('TC0002 - Should find mechanic by email', async () => {
      const mechanic = await mechanicRepository.findByEmail(testMechanicEmail);

      expect(mechanic).not.toBeNull();
      expect(mechanic?.email).toBe(testMechanicEmail);
      expect(mechanic?.id).toBe(testMechanicId);
    });

    it('TC0003 - Should find all mechanics', async () => {
      const mechanics = await mechanicRepository.findAll();

      expect(mechanics).toBeDefined();
      expect(Array.isArray(mechanics)).toBe(true);
      expect(mechanics.length).toBeGreaterThan(0);
      expect(mechanics[0]).toHaveProperty('activeServiceOrders');
      expect(mechanics[0]).toHaveProperty('completedServiceOrders');
    });

    it('TC0004 - Should find available mechanics', async () => {
      const mechanics = await mechanicRepository.findAvailable();

      expect(mechanics).toBeDefined();
      expect(Array.isArray(mechanics)).toBe(true);
      expect(mechanics.every((m) => m.isAvailable === true)).toBe(true);
    });

    it('TC0005 - Should find mechanics by specialty', async () => {
      const mechanics = await mechanicRepository.findBySpecialty('Motor');

      expect(mechanics).toBeDefined();
      expect(Array.isArray(mechanics)).toBe(true);
      expect(mechanics.length).toBeGreaterThan(0);
      expect(mechanics.every((m) => m.specialties.includes('Motor'))).toBe(
        true,
      );
    });

    it('TC0006 - Should return null when mechanic not found by ID', async () => {
      const mechanic = await mechanicRepository.findById(
        '00000000-0000-0000-0000-000000000000',
      );

      expect(mechanic).toBeNull();
    });
  });

  describe('update mechanic', () => {
    let updateMechanicId: string;

    beforeAll(async () => {
      const mechanic = await mechanicRepository.create({
        name: 'Roberto Alves',
        email: 'roberto@test.com',
        phone: '11955555555',
        specialties: ['Transmissão'],
        experienceYears: 4,
      });

      updateMechanicId = mechanic.id;
    });

    it('TC0001 - Should update mechanic name', async () => {
      const updatedMechanic = await mechanicRepository.update(
        updateMechanicId,
        {
          name: 'Roberto Alves Silva',
        },
      );

      expect(updatedMechanic.id).toBe(updateMechanicId);
      expect(updatedMechanic.name).toBe('Roberto Alves Silva');
    });

    it('TC0002 - Should update mechanic specialties', async () => {
      const updatedMechanic = await mechanicRepository.update(
        updateMechanicId,
        {
          specialties: ['Transmissão', 'Embreagem'],
        },
      );

      expect(updatedMechanic.id).toBe(updateMechanicId);
      expect(updatedMechanic.specialties).toEqual(['Transmissão', 'Embreagem']);
    });

    it('TC0003 - Should toggle mechanic availability', async () => {
      const initialMechanic =
        await mechanicRepository.findById(updateMechanicId);
      const initialAvailability = initialMechanic?.isAvailable;

      const updatedMechanic =
        await mechanicRepository.toggleAvailability(updateMechanicId);

      expect(updatedMechanic.id).toBe(updateMechanicId);
      expect(updatedMechanic.isAvailable).toBe(!initialAvailability);
    });

    it('TC0004 - Should mark mechanic as unavailable', async () => {
      await mechanicRepository.markAsUnavailable(updateMechanicId);

      const mechanic = await mechanicRepository.findById(updateMechanicId);

      expect(mechanic?.isAvailable).toBe(false);
    });

    it('TC0005 - Should release mechanic from service order', async () => {
      await mechanicRepository.releaseFromServiceOrder(updateMechanicId);

      const mechanic = await mechanicRepository.findById(updateMechanicId);

      expect(mechanic?.isAvailable).toBe(true);
    });
  });

  describe('get mechanic workload', () => {
    it('TC0001 - Should get workload for mechanic without orders', async () => {
      const mechanic = await mechanicRepository.create({
        name: 'Novo Mecânico',
        email: `novo${faker.number.int()}@test.com`,
        specialties: ['Geral'],
        experienceYears: 1,
      });

      const workload = await mechanicRepository.getWorkload(mechanic.id);

      expect(workload).toHaveProperty('activeOrders');
      expect(workload).toHaveProperty('completedThisMonth');
      expect(workload).toHaveProperty('averageCompletionTime');
      expect(workload.activeOrders).toBe(0);
      expect(workload.completedThisMonth).toBe(0);
      expect(workload.averageCompletionTime).toBe(0);
    });
  });

  describe('delete mechanic', () => {
    it('TC0001 - Should soft delete mechanic', async () => {
      const mechanic = await mechanicRepository.create({
        name: faker.person.fullName(),
        email: faker.internet.email(),
        specialties: ['Teste'],
        experienceYears: 1,
      });

      const deletedMechanic = await mechanicRepository.delete(mechanic.id);

      expect(deletedMechanic.id).toBe(mechanic.id);
      expect(deletedMechanic.isActive).toBe(false);

      const foundMechanic = await mechanicRepository.findById(mechanic.id);
      expect(foundMechanic).not.toBeNull();
      expect(foundMechanic?.isActive).toBe(false);
    });
  });
});
