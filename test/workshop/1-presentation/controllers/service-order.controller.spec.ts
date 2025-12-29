import { faker } from '@faker-js/faker/locale/pt_BR';
import { Test, TestingModule } from '@nestjs/testing';
import { v4 as uuidv4 } from 'uuid';
import { ServiceOrderStatus } from '@prisma/client';

import { ServiceOrderController } from '../../../../src/workshop/1-presentation/controllers/service-order.controller';
import { ServiceOrderService } from '../../../../src/workshop/2-application/services/service-order.service';
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
    serviceOrderService = module.get(ServiceOrderService);
  });

  describe('findAllWithPriority', () => {
    it('TC0001 - Should return service orders with priority ordering', async () => {
      const paginationDto = new PaginationDto();
      paginationDto.page = 0;
      paginationDto.size = 10;
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
