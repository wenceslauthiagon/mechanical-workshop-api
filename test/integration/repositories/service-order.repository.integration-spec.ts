import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../../src/prisma/prisma.service';
import { ServiceOrderRepository } from '../../../src/workshop/4-infrastructure/repositories/service-order.repository';
import { CustomerRepository } from '../../../src/workshop/4-infrastructure/repositories/customer.repository';
import { VehicleRepository } from '../../../src/workshop/4-infrastructure/repositories/vehicle.repository';
import { CustomerType, ServiceOrderStatus } from '@prisma/client';
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

const createMockServiceOrderData = (
  customerId: string,
  vehicleId: string,
  mechanicId?: string,
  status: ServiceOrderStatus = ServiceOrderStatus.RECEBIDA,
) => ({
  orderNumber: `OS-${faker.number.int({ min: 1000, max: 9999 })}`,
  customerId,
  vehicleId,
  mechanicId,
  status,
  description: faker.lorem.sentence(),
  totalServicePrice: faker.number.float({
    min: 100,
    max: 1000,
    fractionDigits: 2,
  }),
  totalPartsPrice: faker.number.float({ min: 50, max: 500, fractionDigits: 2 }),
  totalPrice: faker.number.float({ min: 150, max: 1500, fractionDigits: 2 }),
  estimatedTimeHours: faker.number.float({
    min: 1,
    max: 10,
    fractionDigits: 1,
  }),
  estimatedCompletionDate: faker.date.future(),
});

describe('Service Order Repository Integration Tests', () => {
  let serviceOrderRepository: ServiceOrderRepository;
  let customerRepository: CustomerRepository;
  let vehicleRepository: VehicleRepository;
  let prisma: PrismaService;
  let customerId: string;
  let vehicleId: string;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaService,
        ServiceOrderRepository,
        CustomerRepository,
        VehicleRepository,
      ],
    }).compile();

    serviceOrderRepository = module.get<ServiceOrderRepository>(
      ServiceOrderRepository,
    );
    customerRepository = module.get<CustomerRepository>(CustomerRepository);
    vehicleRepository = module.get<VehicleRepository>(VehicleRepository);
    prisma = module.get<PrismaService>(PrismaService);

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

    const customer = await customerRepository.create({
      document: generateValidCPF(),
      type: CustomerType.PESSOA_FISICA,
      name: faker.person.fullName(),
      email: faker.internet.email(),
      phone: faker.phone.number(),
      address: faker.location.streetAddress(),
      additionalInfo: null,
    });
    customerId = customer.id;

    const vehicle = await vehicleRepository.create({
      licensePlate: `${faker.string.alpha({ length: 3, casing: 'upper' })}${faker.string.numeric(4)}`,
      customerId: customerId,
      brand: faker.vehicle.manufacturer(),
      model: faker.vehicle.model(),
      year: faker.number.int({ min: 2015, max: 2024 }),
      color: faker.color.human(),
    });
    vehicleId = vehicle.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('create service order', () => {
    it('TC0001 - Should create a new service order', async () => {
      const orderData = createMockServiceOrderData(customerId, vehicleId);

      const serviceOrder = await serviceOrderRepository.create(orderData);

      expect(serviceOrder).toBeDefined();
      expect(serviceOrder.id).toBeDefined();
      expect(serviceOrder.orderNumber).toBe(orderData.orderNumber);
      expect(serviceOrder.status).toBe(ServiceOrderStatus.RECEBIDA);
      expect(serviceOrder.customerId).toBe(customerId);
      expect(serviceOrder.vehicleId).toBe(vehicleId);
    });

    it('TC0002 - Should create service order with mechanic', async () => {
      const mechanic = await prisma.mechanic.create({
        data: {
          name: faker.person.fullName(),
          email: faker.internet.email(),
          phone: faker.phone.number(),
          specialties: JSON.stringify([
            faker.helpers.arrayElement([
              'Motor',
              'Suspensão',
              'Freios',
              'Elétrica',
            ]),
            faker.helpers.arrayElement(['Ar Condicionado', 'Transmissão']),
          ]),
          isAvailable: true,
        },
      });

      const orderData = createMockServiceOrderData(
        customerId,
        vehicleId,
        mechanic.id,
        ServiceOrderStatus.EM_EXECUCAO,
      );

      const serviceOrder = await serviceOrderRepository.create(orderData);

      expect(serviceOrder.mechanicId).toBe(mechanic.id);
      expect(serviceOrder.status).toBe(ServiceOrderStatus.EM_EXECUCAO);
    });
  });

  describe('find service order', () => {
    let serviceOrderId: string;
    let orderNumber: string;

    beforeAll(async () => {
      const orderData = createMockServiceOrderData(customerId, vehicleId);
      orderNumber = orderData.orderNumber;

      const serviceOrder = await serviceOrderRepository.create(orderData);
      serviceOrderId = serviceOrder.id;
    });

    it('TC0001 - Should find service order by ID', async () => {
      const serviceOrder =
        await serviceOrderRepository.findById(serviceOrderId);

      expect(serviceOrder).toBeDefined();
      expect(serviceOrder?.id).toBe(serviceOrderId);
    });

    it('TC0002 - Should find service order by order number', async () => {
      const serviceOrder =
        await serviceOrderRepository.findByOrderNumber(orderNumber);

      expect(serviceOrder).toBeDefined();
      expect(serviceOrder?.orderNumber).toBe(orderNumber);
    });

    it('TC0003 - Should find service orders by customer ID', async () => {
      const serviceOrders =
        await serviceOrderRepository.findByCustomerId(customerId);

      expect(serviceOrders).toBeDefined();
      expect(Array.isArray(serviceOrders)).toBe(true);
      expect(serviceOrders.length).toBeGreaterThan(0);
      expect(serviceOrders[0].customerId).toBe(customerId);
    });

    it('TC0004 - Should find all service orders', async () => {
      const serviceOrders = await serviceOrderRepository.findAll();

      expect(serviceOrders).toBeDefined();
      expect(Array.isArray(serviceOrders)).toBe(true);
      expect(serviceOrders.length).toBeGreaterThan(0);
    });

    it('TC0005 - Should return null for non-existent service order', async () => {
      const serviceOrder = await serviceOrderRepository.findById(
        '00000000-0000-0000-0000-000000000000',
      );

      expect(serviceOrder).toBeNull();
    });
  });

  describe('update service order', () => {
    let serviceOrderId: string;

    beforeAll(async () => {
      const orderData = createMockServiceOrderData(customerId, vehicleId);
      const serviceOrder = await serviceOrderRepository.create(orderData);
      serviceOrderId = serviceOrder.id;
    });

    it('TC0001 - Should update service order status', async () => {
      const updatedOrder = await serviceOrderRepository.updateStatus(
        serviceOrderId,
        {
          status: ServiceOrderStatus.EM_DIAGNOSTICO,
        },
      );

      expect(updatedOrder.status).toBe(ServiceOrderStatus.EM_DIAGNOSTICO);
    });

    it('TC0002 - Should update service order prices', async () => {
      const updatedOrder = await serviceOrderRepository.updateTotals(
        serviceOrderId,
        {
          totalServicePrice: 250.0,
          totalPartsPrice: 150.0,
          totalPrice: 400.0,
          estimatedTimeHours: 4.0,
          estimatedCompletionDate: new Date('2025-10-27'),
        },
      );

      expect(Number(updatedOrder.totalServicePrice)).toBe(250.0);
      expect(Number(updatedOrder.totalPartsPrice)).toBe(150.0);
      expect(Number(updatedOrder.totalPrice)).toBe(400.0);
    });

    it('TC0003 - Should set started date when status changes to EM_EXECUCAO', async () => {
      const updatedOrder = await serviceOrderRepository.updateStatus(
        serviceOrderId,
        {
          status: ServiceOrderStatus.EM_EXECUCAO,
          startedAt: new Date(),
        },
      );

      expect(updatedOrder.status).toBe(ServiceOrderStatus.EM_EXECUCAO);
      expect(updatedOrder.startedAt).toBeDefined();
    });

    it('TC0004 - Should set completed date when status changes to FINALIZADA', async () => {
      const updatedOrder = await serviceOrderRepository.updateStatus(
        serviceOrderId,
        {
          status: ServiceOrderStatus.FINALIZADA,
          completedAt: new Date(),
        },
      );

      expect(updatedOrder.status).toBe(ServiceOrderStatus.FINALIZADA);
      expect(updatedOrder.completedAt).toBeDefined();
    });

    it('TC0005 - Should set delivered date when status changes to ENTREGUE', async () => {
      const updatedOrder = await serviceOrderRepository.updateStatus(
        serviceOrderId,
        {
          status: ServiceOrderStatus.ENTREGUE,
          deliveredAt: new Date(),
        },
      );

      expect(updatedOrder.status).toBe(ServiceOrderStatus.ENTREGUE);
      expect(updatedOrder.deliveredAt).toBeDefined();
    });
  });

  describe('delete service order', () => {
    it('TC0001 - Should delete service order by ID', async () => {
      const orderData = createMockServiceOrderData(customerId, vehicleId);
      const serviceOrder = await serviceOrderRepository.create(orderData);

      await serviceOrderRepository.delete(serviceOrder.id);

      const deletedOrder = await serviceOrderRepository.findById(
        serviceOrder.id,
      );
      expect(deletedOrder).toBeNull();
    });
  });
});
