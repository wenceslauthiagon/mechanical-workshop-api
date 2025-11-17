import { faker } from '@faker-js/faker/locale/pt_BR';
import { Test, TestingModule } from '@nestjs/testing';
import { v4 as uuidv4 } from 'uuid';
import { ServiceOrderStatus } from '@prisma/client';

import { ServiceOrderController } from '../../../../src/workshop/1-presentation/controllers/service-order.controller';
import { ServiceOrderService } from '../../../../src/workshop/2-application/services/service-order.service';
import { CreateServiceOrderDto } from '../../../../src/workshop/1-presentation/dtos/service-order/create-service-order.dto';
import { UpdateServiceOrderStatusDto } from '../../../../src/workshop/1-presentation/dtos/service-order/update-service-order-status.dto';
import { PaginationDto } from '../../../../src/shared/dtos/pagination.dto';

describe('ServiceOrderController', () => {
  let controller: ServiceOrderController;
  let serviceOrderService: jest.Mocked<ServiceOrderService>;

  const mockServiceOrderId = uuidv4();
  const mockCustomerId = uuidv4();
  const mockVehicleId = uuidv4();

  const mockServiceOrder = {
    id: mockServiceOrderId,
    orderNumber: faker.string.alphanumeric(10).toUpperCase(),
    customerId: mockCustomerId,
    vehicleId: mockVehicleId,
    description: faker.lorem.paragraph(),
    status: ServiceOrderStatus.RECEBIDA,
    totalServicePrice: '100.00',
    totalPartsPrice: '50.00',
    totalPrice: '150.00',
    estimatedTimeHours: '2.5',
    estimatedCompletionDate: faker.date.future(),
    startedAt: null,
    completedAt: null,
    deliveredAt: null,
    approvedAt: null,
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    services: [],
    parts: [],
  };

  const mockCreateServiceOrderDto: CreateServiceOrderDto = {
    customerId: mockCustomerId,
    vehicleId: mockVehicleId,
    description: faker.lorem.paragraph(),
    services: [{ serviceId: uuidv4(), quantity: 1 }],
    parts: [{ partId: uuidv4(), quantity: 2 }],
  };

  const mockUpdateServiceOrderStatusDto: UpdateServiceOrderStatusDto = {
    status: ServiceOrderStatus.EM_EXECUCAO,
  };

  beforeEach(async () => {
    const mockServiceOrderService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findAllPaginated: jest.fn(),
      findAllPaginatedWithPriority: jest.fn(),
      findById: jest.fn(),
      findByCustomer: jest.fn(),
      updateStatus: jest.fn(),
      approveOrder: jest.fn(),
      getStatusHistory: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ServiceOrderController],
      providers: [
        {
          provide: ServiceOrderService,
          useValue: mockServiceOrderService,
        },
      ],
    }).compile();

    controller = module.get<ServiceOrderController>(ServiceOrderController);
    serviceOrderService =
      module.get<jest.Mocked<ServiceOrderService>>(ServiceOrderService);
  });

  it('Should be defined', () => {
    expect(controller).toBeDefined();
    expect(controller).toBeInstanceOf(ServiceOrderController);
  });

  it('Should instantiate with service dependency', () => {
    const testController = new ServiceOrderController(serviceOrderService);
    expect(testController).toBeDefined();
  });

  describe('create', () => {
    it('TC0001 - Should create a service order successfully', async () => {
      serviceOrderService.create.mockResolvedValue(mockServiceOrder);

      const result = await controller.create(mockCreateServiceOrderDto);

      expect(serviceOrderService.create).toHaveBeenCalledWith(
        mockCreateServiceOrderDto,
      );
      expect(result).toEqual(mockServiceOrder);
    });

    it('TC0002 - Should handle service order creation error', async () => {
      const mockError = new Error('Falha ao criar ordem de serviço');
      serviceOrderService.create.mockRejectedValue(mockError);

      await expect(
        controller.create(mockCreateServiceOrderDto),
      ).rejects.toThrow(mockError);
      expect(serviceOrderService.create).toHaveBeenCalledWith(
        mockCreateServiceOrderDto,
      );
    });
  });

  describe('findAll', () => {
    it('TC0001 - Should return all service orders when no customerId', async () => {
      const mockServiceOrders = [mockServiceOrder];
      serviceOrderService.findAll.mockResolvedValue(mockServiceOrders);

      const result = await controller.findAll();

      expect(serviceOrderService.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockServiceOrders);
    });

    it('TC0002 - Should return paginated service orders when no customerId', async () => {
      const paginationDto = new PaginationDto();
      paginationDto.page = 1;
      paginationDto.size = 10;
      const mockPaginatedResponse = {
        data: [mockServiceOrder],
        pagination: { page: 1, size: 10, totalPages: 1, totalRecords: 1 },
      };
      serviceOrderService.findAllPaginated.mockResolvedValue(
        mockPaginatedResponse,
      );

      const result = await controller.findAllPaginated(paginationDto);

      expect(serviceOrderService.findAllPaginated).toHaveBeenCalledWith(
        paginationDto,
      );
      expect(result).toEqual(mockPaginatedResponse);
    });

    it('TC0003 - Should return service orders by customer when customerId provided', async () => {
      const mockServiceOrders = [mockServiceOrder];
      serviceOrderService.findByCustomer.mockResolvedValue(mockServiceOrders);

      const paginationDto = new PaginationDto();
      paginationDto.page = 0;
      paginationDto.size = 10;

      const result = await controller.findAllPaginated(
        paginationDto,
        mockCustomerId,
      );

      expect(serviceOrderService.findByCustomer).toHaveBeenCalledWith(
        mockCustomerId,
      );
      expect(result.data).toEqual(mockServiceOrders);
      expect(result.pagination.totalRecords).toBe(1);
    });
  });

  describe('findAllWithPriority', () => {
    it('TC0001 - Should return service orders with priority ordering', async () => {
      const paginationDto: PaginationDto = { page: 0, size: 10 };
      const mockServiceOrders = [mockServiceOrder];
      const mockPaginatedResponse = {
        data: mockServiceOrders,
        pagination: {
          page: 0,
          size: 10,
          totalPages: 1,
          totalRecords: 1,
        },
      };
      serviceOrderService.findAllPaginatedWithPriority.mockResolvedValue(
        mockPaginatedResponse,
      );

      const result = await controller.findAllWithPriority(paginationDto);

      expect(
        serviceOrderService.findAllPaginatedWithPriority,
      ).toHaveBeenCalledWith(paginationDto);
      expect(result).toEqual(mockPaginatedResponse);
      expect(result.data).toEqual(mockServiceOrders);
    });
  });

  describe('findOne', () => {
    it('TC0001 - Should find service order by ID', async () => {
      serviceOrderService.findById.mockResolvedValue(mockServiceOrder);

      const result = await controller.findOne(mockServiceOrderId);

      expect(serviceOrderService.findById).toHaveBeenCalledWith(
        mockServiceOrderId,
      );
      expect(result).toEqual(mockServiceOrder);
    });
  });

  describe('findByCustomer', () => {
    it('TC0001 - Should find service orders by customer', async () => {
      const mockServiceOrders = [mockServiceOrder];
      serviceOrderService.findByCustomer.mockResolvedValue(mockServiceOrders);

      const result = await controller.findByCustomer(mockCustomerId);

      expect(serviceOrderService.findByCustomer).toHaveBeenCalledWith(
        mockCustomerId,
      );
      expect(result).toEqual(mockServiceOrders);
    });
  });

  describe('updateStatus', () => {
    it('TC0001 - Should update service order status', async () => {
      const updatedServiceOrder = {
        ...mockServiceOrder,
        status: ServiceOrderStatus.EM_EXECUCAO,
      };
      serviceOrderService.updateStatus.mockResolvedValue(updatedServiceOrder);

      const result = await controller.updateStatus(
        mockServiceOrderId,
        mockUpdateServiceOrderStatusDto,
      );

      expect(serviceOrderService.updateStatus).toHaveBeenCalledWith(
        mockServiceOrderId,
        mockUpdateServiceOrderStatusDto,
      );
      expect(result).toEqual(updatedServiceOrder);
    });
  });

  describe('approveOrder', () => {
    it('TC0001 - Should approve service order', async () => {
      const approvedServiceOrder = {
        ...mockServiceOrder,
        approvedAt: new Date(),
      };
      serviceOrderService.approveOrder.mockResolvedValue(approvedServiceOrder);

      const result = await controller.approveOrder(mockServiceOrderId);

      expect(serviceOrderService.approveOrder).toHaveBeenCalledWith(
        mockServiceOrderId,
      );
      expect(result).toEqual(approvedServiceOrder);
    });
  });

  describe('getStatusHistory', () => {
    it('TC0001 - Should get status history', async () => {
      const mockHistory = [
        {
          id: uuidv4(),
          serviceOrderId: mockServiceOrderId,
          status: ServiceOrderStatus.RECEBIDA,
          changedAt: faker.date.past(),
          changedBy: faker.person.fullName(),
        },
      ];
      serviceOrderService.getStatusHistory.mockResolvedValue(mockHistory);

      const result = await controller.getStatusHistory(mockServiceOrderId);

      expect(serviceOrderService.getStatusHistory).toHaveBeenCalledWith(
        mockServiceOrderId,
      );
      expect(result).toEqual(mockHistory);
    });
  });
});
