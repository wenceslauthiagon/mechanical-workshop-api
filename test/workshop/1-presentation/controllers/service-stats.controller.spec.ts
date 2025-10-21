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

  const mockOverallStats = {
    totalCompletedOrders: faker.number.int({ min: 100, max: 1000 }),
    averageExecutionTime: faker.number.float({ min: 1.0, max: 10.0 }),
    averageEstimatedTime: faker.number.float({ min: 1.0, max: 10.0 }),
    overallAccuracy: faker.number.float({ min: 70, max: 95 }),
  };

  const mockSingleServiceStats = {
    serviceId: faker.string.uuid(),
    serviceName: faker.company.name(),
    averageExecutionHours: faker.number.float({ min: 0.5, max: 8.0 }),
    totalCompletedOrders: faker.number.int({ min: 1, max: 100 }),
    estimatedTimeHours: faker.number.float({ min: 0.5, max: 8.0 }),
    accuracyPercentage: faker.number.float({ min: 50, max: 100 }),
  };

  beforeEach(async () => {
    const mockServiceStatsService = {
      getServiceExecutionStats: jest.fn(),
      getOverallStats: jest.fn(),
      getServiceById: jest.fn(),
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
      serviceStatsService.getServiceExecutionStats.mockResolvedValue(
        mockServiceStats,
      );

      const result = await controller.getServiceStats();

      expect(
        serviceStatsService.getServiceExecutionStats,
      ).toHaveBeenCalledWith();
      expect(result).toEqual(mockServiceStats);
      expect(result).toHaveLength(2);
    });

    it('TC0002 - Should return empty array when no service stats available', async () => {
      serviceStatsService.getServiceExecutionStats.mockResolvedValue([]);

      const result = await controller.getServiceStats();

      expect(
        serviceStatsService.getServiceExecutionStats,
      ).toHaveBeenCalledWith();
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('TC0003 - Should throw error when service fails', async () => {
      const mockError = new Error('Database connection error');
      serviceStatsService.getServiceExecutionStats.mockRejectedValue(mockError);

      await expect(controller.getServiceStats()).rejects.toThrow(mockError);
      expect(
        serviceStatsService.getServiceExecutionStats,
      ).toHaveBeenCalledWith();
    });
  });

  describe('getOverallStats', () => {
    it('TC0001 - Should return overall system statistics', async () => {
      serviceStatsService.getOverallStats.mockResolvedValue(mockOverallStats);

      const result = await controller.getOverallStats();

      expect(serviceStatsService.getOverallStats).toHaveBeenCalledWith();
      expect(result).toEqual(mockOverallStats);
      expect(result.totalCompletedOrders).toBeDefined();
      expect(result.overallAccuracy).toBeDefined();
    });

    it('TC0002 - Should return zero stats when no data available', async () => {
      const emptyStats = {
        totalCompletedOrders: 0,
        averageExecutionTime: 0,
        averageEstimatedTime: 0,
        overallAccuracy: 0,
      };
      serviceStatsService.getOverallStats.mockResolvedValue(emptyStats);

      const result = await controller.getOverallStats();

      expect(serviceStatsService.getOverallStats).toHaveBeenCalledWith();
      expect(result).toEqual(emptyStats);
      expect(result.totalCompletedOrders).toBe(0);
    });

    it('TC0003 - Should throw error when service fails', async () => {
      const mockError = new Error('Service unavailable');
      serviceStatsService.getOverallStats.mockRejectedValue(mockError);

      await expect(controller.getOverallStats()).rejects.toThrow(mockError);
      expect(serviceStatsService.getOverallStats).toHaveBeenCalledWith();
    });
  });

  describe('getServiceStatsById', () => {
    const serviceId = faker.string.uuid();

    it('TC0001 - Should return statistics for a specific service', async () => {
      serviceStatsService.getServiceById.mockResolvedValue(
        mockSingleServiceStats,
      );

      const result = await controller.getServiceStatsById(serviceId);

      expect(serviceStatsService.getServiceById).toHaveBeenCalledWith(
        serviceId,
      );
      expect(result).toEqual(mockSingleServiceStats);
      expect(result.serviceId).toBe(mockSingleServiceStats.serviceId);
    });

    it('TC0002 - Should return message when service not found', async () => {
      serviceStatsService.getServiceById.mockResolvedValue(null);

      const result = await controller.getServiceStatsById(serviceId);

      expect(serviceStatsService.getServiceById).toHaveBeenCalledWith(
        serviceId,
      );
      expect(result).toEqual({
        message: 'Serviço não encontrado ou sem dados de execução suficientes',
        serviceId,
      });
    });

    it('TC0003 - Should throw error when database query fails', async () => {
      const mockError = new Error('Database query failed');
      serviceStatsService.getServiceById.mockRejectedValue(mockError);

      await expect(controller.getServiceStatsById(serviceId)).rejects.toThrow(
        mockError,
      );
      expect(serviceStatsService.getServiceById).toHaveBeenCalledWith(
        serviceId,
      );
    });

    it('TC0004 - Should handle invalid UUID format', async () => {
      const invalidServiceId = 'invalid-uuid';
      serviceStatsService.getServiceById.mockResolvedValue(null);

      const result = await controller.getServiceStatsById(invalidServiceId);

      expect(serviceStatsService.getServiceById).toHaveBeenCalledWith(
        invalidServiceId,
      );
      expect(result).toEqual({
        message: 'Serviço não encontrado ou sem dados de execução suficientes',
        serviceId: invalidServiceId,
      });
    });
  });
});
