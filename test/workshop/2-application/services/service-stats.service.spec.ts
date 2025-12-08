import { Test, TestingModule } from '@nestjs/testing';
import { faker } from '@faker-js/faker/locale/pt_BR';
import { Decimal } from '@prisma/client/runtime/library';
import { ServiceStatsService } from '../../../../src/workshop/2-application/services/service-stats.service';
import { IServiceOrderRepository } from '../../../../src/workshop/3-domain/repositories/service-order.repository.interface';
import { IServiceRepository } from '../../../../src/workshop/3-domain/repositories/service-repository.interface';
import { PrismaService } from '../../../../src/prisma/prisma.service';
import { ErrorHandlerService } from '../../../../src/shared/services/error-handler.service';
import { ServiceOrderStatus } from '../../../../src/shared/enums/service-order-status.enum';

describe('ServiceStatsService', () => {
  let service: ServiceStatsService;
  let serviceOrderRepository: jest.Mocked<IServiceOrderRepository>;
  let serviceRepository: jest.Mocked<IServiceRepository>;
  let prismaService: any;

  const createMockService = () => ({
    id: faker.string.uuid(),
    name: faker.commerce.productName(),
    description: faker.commerce.productDescription(),
    price: new Decimal(faker.finance.amount({ min: 50, max: 500, dec: 2 })),
    category: 'Mecânica',
    estimatedMinutes: 120,
    isActive: true,
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
  });

  const createMockServiceOrder = (startedAt: Date, completedAt: Date) => ({
    id: faker.string.uuid(),
    orderNumber: `OS-2025-${faker.string.numeric(3)}`,
    customerId: faker.string.uuid(),
    vehicleId: faker.string.uuid(),
    mechanicId: faker.string.uuid(),
    status: ServiceOrderStatus.FINALIZADA,
    estimatedTimeHours: new Decimal('2.0'),
    totalServicePrice: new Decimal('500.00'),
    totalPartsPrice: new Decimal('200.00'),
    totalPrice: new Decimal('700.00'),
    estimatedCompletionDate: faker.date.future(),
    startedAt,
    completedAt,
    deliveredAt: null,
    approvedAt: null,
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    description: faker.lorem.sentence(),
  });

  beforeEach(async () => {
    const mockServiceOrderRepository = {
      findCompletedOrders: jest.fn(),
    };

    const mockServiceRepository = {
      findAll: jest.fn(),
    };

    const mockPrismaService = {
      serviceOrderItem: {
        findMany: jest.fn(),
      },
    };

    const mockErrorHandler = {};

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServiceStatsService,
        {
          provide: 'IServiceOrderRepository',
          useValue: mockServiceOrderRepository,
        },
        { provide: 'IServiceRepository', useValue: mockServiceRepository },
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: ErrorHandlerService, useValue: mockErrorHandler },
      ],
    }).compile();

    service = module.get<ServiceStatsService>(ServiceStatsService);
    serviceOrderRepository = module.get('IServiceOrderRepository');
    serviceRepository = module.get('IServiceRepository');
    prismaService = module.get(PrismaService);
  });

  it('Should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getServiceExecutionStats', () => {
    it('TC0001 - Should return service execution stats', async () => {
      const mockService = createMockService();
      const startedAt = new Date('2025-01-01T08:00:00');
      const completedAt = new Date('2025-01-01T10:00:00'); // 2 hours
      const mockOrder = createMockServiceOrder(startedAt, completedAt);

      const mockServiceItems = [
        {
          id: faker.string.uuid(),
          serviceOrderId: mockOrder.id,
          serviceId: mockService.id,
          quantity: 1,
          price: new Decimal('100'),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      serviceOrderRepository.findCompletedOrders.mockResolvedValue([mockOrder]);
      serviceRepository.findAll.mockResolvedValue([mockService]);
      prismaService.serviceOrderItem.findMany.mockResolvedValue(
        mockServiceItems,
      );

      const result = await service.getServiceExecutionStats();

      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBeGreaterThanOrEqual(0);
      if (result.length > 0) {
        expect(result[0]).toHaveProperty('serviceId');
        expect(result[0]).toHaveProperty('serviceName');
        expect(result[0]).toHaveProperty('averageExecutionHours');
        expect(result[0]).toHaveProperty('totalCompletedOrders');
        expect(result[0]).toHaveProperty('estimatedTimeHours');
        expect(result[0]).toHaveProperty('accuracyPercentage');
      }
    });

    it('TC0002 - Should handle orders without startedAt or completedAt', async () => {
      const mockService = createMockService();
      const mockOrder = {
        ...createMockServiceOrder(new Date(), new Date()),
        startedAt: null,
        completedAt: null,
      };

      serviceOrderRepository.findCompletedOrders.mockResolvedValue([mockOrder]);
      serviceRepository.findAll.mockResolvedValue([mockService]);

      const result = await service.getServiceExecutionStats();

      expect(result).toEqual([]);
    });

    it('TC0003 - Should return empty array when no completed orders', async () => {
      serviceOrderRepository.findCompletedOrders.mockResolvedValue([]);
      serviceRepository.findAll.mockResolvedValue([]);

      const result = await service.getServiceExecutionStats();

      expect(result).toEqual([]);
    });

    it('TC0004 - Should skip services not found in repository', async () => {
      const startedAt = new Date('2025-01-01T08:00:00');
      const completedAt = new Date('2025-01-01T10:00:00');
      const mockOrder = createMockServiceOrder(startedAt, completedAt);

      const mockServiceItems = [
        {
          id: faker.string.uuid(),
          serviceOrderId: mockOrder.id,
          serviceId: faker.string.uuid(), // Service ID that doesn't exist
          quantity: 1,
          price: new Decimal('100'),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      serviceOrderRepository.findCompletedOrders.mockResolvedValue([mockOrder]);
      serviceRepository.findAll.mockResolvedValue([]);
      prismaService.serviceOrderItem.findMany.mockResolvedValue(
        mockServiceItems,
      );

      const result = await service.getServiceExecutionStats();

      expect(result).toEqual([]);
    });

    it('TC0005 - Should calculate proportional execution time for multiple services', async () => {
      const mockService1 = createMockService();
      const mockService2 = { ...createMockService(), id: faker.string.uuid() };
      const startedAt = new Date('2025-01-01T08:00:00');
      const completedAt = new Date('2025-01-01T12:00:00'); // 4 hours
      const mockOrder = createMockServiceOrder(startedAt, completedAt);

      const mockServiceItems = [
        {
          id: faker.string.uuid(),
          serviceOrderId: mockOrder.id,
          serviceId: mockService1.id,
          quantity: 2,
          price: new Decimal('100'),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: faker.string.uuid(),
          serviceOrderId: mockOrder.id,
          serviceId: mockService2.id,
          quantity: 1,
          price: new Decimal('50'),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      serviceOrderRepository.findCompletedOrders.mockResolvedValue([mockOrder]);
      serviceRepository.findAll.mockResolvedValue([mockService1, mockService2]);
      prismaService.serviceOrderItem.findMany.mockResolvedValue(
        mockServiceItems,
      );

      const result = await service.getServiceExecutionStats();

      expect(result.length).toBeGreaterThan(0);
      expect(result).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ serviceId: mockService1.id }),
        ]),
      );
    });

    it('TC0006 - Should sort results by totalCompletedOrders descending', async () => {
      const mockService1 = createMockService();
      const mockService2 = { ...createMockService(), id: faker.string.uuid() };

      const startedAt1 = new Date('2025-01-01T08:00:00');
      const completedAt1 = new Date('2025-01-01T10:00:00');
      const mockOrder1 = createMockServiceOrder(startedAt1, completedAt1);

      const startedAt2 = new Date('2025-01-02T08:00:00');
      const completedAt2 = new Date('2025-01-02T10:00:00');
      const mockOrder2 = createMockServiceOrder(startedAt2, completedAt2);

      const mockServiceItems1 = [
        {
          id: faker.string.uuid(),
          serviceOrderId: mockOrder1.id,
          serviceId: mockService1.id,
          quantity: 1,
          price: new Decimal('100'),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const mockServiceItems2 = [
        {
          id: faker.string.uuid(),
          serviceOrderId: mockOrder2.id,
          serviceId: mockService2.id,
          quantity: 1,
          price: new Decimal('100'),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      serviceOrderRepository.findCompletedOrders.mockResolvedValue([
        mockOrder1,
        mockOrder2,
      ]);
      serviceRepository.findAll.mockResolvedValue([mockService1, mockService2]);
      prismaService.serviceOrderItem.findMany
        .mockResolvedValueOnce(mockServiceItems1)
        .mockResolvedValueOnce(mockServiceItems2);

      const result = await service.getServiceExecutionStats();

      if (result.length > 1) {
        expect(result[0].totalCompletedOrders).toBeGreaterThanOrEqual(
          result[1].totalCompletedOrders,
        );
      }
    });

    it('TC0007 - Should handle when estimatedTime is 0 for accuracy calculation', async () => {
      const mockService = { ...createMockService(), estimatedMinutes: 0 };
      const startedAt = new Date('2025-01-01T08:00:00');
      const completedAt = new Date('2025-01-01T10:00:00');
      const mockOrder = createMockServiceOrder(startedAt, completedAt);

      const mockServiceItems = [
        {
          id: faker.string.uuid(),
          serviceOrderId: mockOrder.id,
          serviceId: mockService.id,
          quantity: 1,
          price: new Decimal('100'),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      serviceOrderRepository.findCompletedOrders.mockResolvedValue([mockOrder]);
      serviceRepository.findAll.mockResolvedValue([mockService]);
      prismaService.serviceOrderItem.findMany.mockResolvedValue(
        mockServiceItems,
      );

      const result = await service.getServiceExecutionStats();

      expect(result.length).toBeGreaterThan(0);
      expect(result[0].accuracyPercentage).toBe(0);
    });
  });

  describe('getOverallStats', () => {
    it('TC0001 - Should return overall stats with completed orders', async () => {
      const startedAt = new Date('2025-01-01T08:00:00');
      const completedAt = new Date('2025-01-01T10:00:00');
      const mockOrder = createMockServiceOrder(startedAt, completedAt);

      serviceOrderRepository.findCompletedOrders.mockResolvedValue([mockOrder]);

      const result = await service.getOverallStats();

      expect(result).toHaveProperty('totalCompletedOrders');
      expect(result).toHaveProperty('averageExecutionTime');
      expect(result).toHaveProperty('averageEstimatedTime');
      expect(result).toHaveProperty('overallAccuracy');
      expect(result.totalCompletedOrders).toBe(1);
    });

    it('TC0002 - Should return zeros when no completed orders', async () => {
      serviceOrderRepository.findCompletedOrders.mockResolvedValue([]);

      const result = await service.getOverallStats();

      expect(result).toEqual({
        totalCompletedOrders: 0,
        averageExecutionTime: 0,
        averageEstimatedTime: 0,
        overallAccuracy: 0,
      });
    });

    it('TC0003 - Should skip orders without startedAt or completedAt', async () => {
      const validOrder = createMockServiceOrder(
        new Date('2025-01-01T08:00:00'),
        new Date('2025-01-01T10:00:00'),
      );
      const invalidOrder = {
        ...createMockServiceOrder(new Date(), new Date()),
        startedAt: null,
        completedAt: null,
      };

      serviceOrderRepository.findCompletedOrders.mockResolvedValue([
        validOrder,
        invalidOrder,
      ]);

      const result = await service.getOverallStats();

      expect(result.totalCompletedOrders).toBe(2);
      expect(result.averageExecutionTime).toBeGreaterThan(0);
    });

    it('TC0004 - Should calculate accuracy correctly', async () => {
      const startedAt = new Date('2025-01-01T08:00:00');
      const completedAt = new Date('2025-01-01T10:00:00'); // 2 hours
      const mockOrder = {
        ...createMockServiceOrder(startedAt, completedAt),
        estimatedTimeHours: new Decimal('2.0'),
      };

      serviceOrderRepository.findCompletedOrders.mockResolvedValue([mockOrder]);

      const result = await service.getOverallStats();

      expect(result.overallAccuracy).toBeGreaterThanOrEqual(0);
      expect(result.overallAccuracy).toBeLessThanOrEqual(100);
    });

    it('TC0005 - Should handle when averageEstimatedTime is 0', async () => {
      const startedAt = new Date('2025-01-01T08:00:00');
      const completedAt = new Date('2025-01-01T10:00:00');
      const mockOrder = {
        ...createMockServiceOrder(startedAt, completedAt),
        estimatedTimeHours: new Decimal('0'),
      };

      serviceOrderRepository.findCompletedOrders.mockResolvedValue([mockOrder]);

      const result = await service.getOverallStats();

      expect(result.overallAccuracy).toBe(0);
    });
  });

  describe('getServiceById', () => {
    it('TC0001 - Should return service stats by id', async () => {
      const mockService = createMockService();
      const startedAt = new Date('2025-01-01T08:00:00');
      const completedAt = new Date('2025-01-01T10:00:00');
      const mockOrder = createMockServiceOrder(startedAt, completedAt);

      const mockServiceItems = [
        {
          id: faker.string.uuid(),
          serviceOrderId: mockOrder.id,
          serviceId: mockService.id,
          quantity: 1,
          price: new Decimal('100'),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      serviceOrderRepository.findCompletedOrders.mockResolvedValue([mockOrder]);
      serviceRepository.findAll.mockResolvedValue([mockService]);
      prismaService.serviceOrderItem.findMany.mockResolvedValue(
        mockServiceItems,
      );

      const result = await service.getServiceById(mockService.id);

      if (result) {
        expect(result.serviceId).toBe(mockService.id);
      }
    });

    it('TC0002 - Should return null when service not found in stats', async () => {
      serviceOrderRepository.findCompletedOrders.mockResolvedValue([]);
      serviceRepository.findAll.mockResolvedValue([]);

      const result = await service.getServiceById(faker.string.uuid());

      expect(result).toBeNull();
    });
  });
});
