import { Test, TestingModule } from '@nestjs/testing';
import { ServiceStatsController } from '../../../../src/workshop/1-presentation/controllers/service-stats.controller';
import { ServiceStatsService } from '../../../../src/workshop/2-application/services/service-stats.service';
import { JwtAuthGuard } from '../../../../src/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../src/auth/guards/roles.guard';
import { faker } from '@faker-js/faker/locale/pt_BR';

describe('ServiceStatsController', () => {
  let controller: ServiceStatsController;
  let serviceStatsService: jest.Mocked<ServiceStatsService>;

  const mockServiceStats = [
    {
      serviceId: faker.string.uuid(),
      serviceName: faker.company.name(),
      averageExecutionHours: faker.number.float({ min: 0.5, max: 8.0 }),
      totalCompletedOrders: faker.number.int({ min: 1, max: 100 }),
      estimatedTimeHours: faker.number.float({ min: 0.5, max: 8.0 }),
      accuracyPercentage: faker.number.float({ min: 50, max: 100 }),
    },
    {
      serviceId: faker.string.uuid(),
      serviceName: faker.company.name(),
      averageExecutionHours: faker.number.float({ min: 0.5, max: 8.0 }),
      totalCompletedOrders: faker.number.int({ min: 1, max: 100 }),
      estimatedTimeHours: faker.number.float({ min: 0.5, max: 8.0 }),
      accuracyPercentage: faker.number.float({ min: 50, max: 100 }),
    },
  ];

  beforeEach(async () => {
    const mockServiceStatsService = {
      getServiceStats: jest.fn(),
      getTopServices: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ServiceStatsController],
      providers: [
        {
          provide: ServiceStatsService,
          useValue: mockServiceStatsService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<ServiceStatsController>(ServiceStatsController);
    serviceStatsService = module.get(ServiceStatsService);
  });

  it('Should be defined', () => {
    expect(controller).toBeDefined();
    expect(controller).toBeInstanceOf(ServiceStatsController);
    expect(serviceStatsService).toBeDefined();
  });

  describe('getServiceStats', () => {
    it('TC0001 - Should return service execution statistics', async () => {
      serviceStatsService.getServiceStats.mockResolvedValue(
        mockServiceStats,
      );

      const result = await controller.getServiceStats();

      expect(
        serviceStatsService.getServiceStats,
      ).toHaveBeenCalledWith(undefined, undefined);
      expect(result).toEqual(mockServiceStats);
      expect(result).toHaveLength(2);
    });

    it('TC0002 - Should return empty array when no service stats available', async () => {
      serviceStatsService.getServiceStats.mockResolvedValue([]);

      const result = await controller.getServiceStats();

      expect(
        serviceStatsService.getServiceStats,
      ).toHaveBeenCalledWith(undefined, undefined);
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('TC0003 - Should throw error when service fails', async () => {
      const mockError = new Error('Database connection error');
      serviceStatsService.getServiceStats.mockRejectedValue(mockError);

      await expect(controller.getServiceStats()).rejects.toThrow(mockError);
      expect(
        serviceStatsService.getServiceStats,
      ).toHaveBeenCalledWith(undefined, undefined);
    });
  });

  describe('getTopServices', () => {
    it('TC0001 - Should return top performing services', async () => {
      serviceStatsService.getTopServices.mockResolvedValue(mockServiceStats);

      const result = await controller.getTopServices();

      expect(serviceStatsService.getTopServices).toHaveBeenCalledWith(10);
      expect(result).toEqual(mockServiceStats);
      expect(result).toHaveLength(2);
    });

    it('TC0002 - Should return empty array when no data available', async () => {
      serviceStatsService.getTopServices.mockResolvedValue([]);

      const result = await controller.getTopServices(5);

      expect(serviceStatsService.getTopServices).toHaveBeenCalledWith(5);
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('TC0003 - Should throw error when service fails', async () => {
      const mockError = new Error('Service unavailable');
      serviceStatsService.getTopServices.mockRejectedValue(mockError);

      await expect(controller.getTopServices()).rejects.toThrow(mockError);
      expect(serviceStatsService.getTopServices).toHaveBeenCalledWith(10);
    });
  });
});
