import { faker } from '@faker-js/faker';
import { Test, TestingModule } from '@nestjs/testing';
import { v4 as uuidv4 } from 'uuid';
import { ServiceOrderStatus } from '@prisma/client';

import { ServiceOrderController } from '../../../../src/workshop/1-presentation/controllers/service-order.controller';
import { ServiceOrderService } from '../../../../src/workshop/2-application/services/service-order.service';
import { CreateServiceOrderDto } from '../../../../src/workshop/1-presentation/dtos/service-order/create-service-order.dto';
import { UpdateServiceOrderStatusDto } from '../../../../src/workshop/1-presentation/dtos/service-order/update-service-order-status.dto';

describe('ServiceOrderController', () => {
  let serviceOrderController: ServiceOrderController;
  let serviceOrderService: jest.Mocked<ServiceOrderService>;

  const mockServiceOrderId = uuidv4();
  const mockCustomerId = uuidv4();
  const mockVehicleId = uuidv4();
  const mockServiceId = uuidv4();
  const mockPartId = uuidv4();

  const mockServiceOrderData = {
    id: mockServiceOrderId,
    orderNumber: faker.string.alphanumeric(10).toUpperCase(),
    customerId: mockCustomerId,
    vehicleId: mockVehicleId,
    description: faker.lorem.paragraph(),
    status: ServiceOrderStatus.RECEIVED,
    totalServicePrice: faker.number
      .float({ min: 100, max: 500, fractionDigits: 2 })
      .toFixed(2),
    totalPartsPrice: faker.number
      .float({ min: 50, max: 300, fractionDigits: 2 })
      .toFixed(2),
    totalPrice: faker.number
      .float({ min: 150, max: 800, fractionDigits: 2 })
      .toFixed(2),
    estimatedTimeHours: faker.number
      .float({ min: 1, max: 8, fractionDigits: 1 })
      .toFixed(1),
    estimatedCompletionDate: faker.date.future(),
    startedAt: null,
    completedAt: null,
    deliveredAt: null,
    approvedAt: null,
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    customer: {
      id: mockCustomerId,
      name: faker.person.fullName(),
      document: faker.string.numeric(11),
      type: 'INDIVIDUAL',
      email: faker.internet.email(),
      phone: faker.phone.number(),
    },
    vehicle: {
      id: mockVehicleId,
      licensePlate: faker.vehicle.vrm(),
      brand: faker.vehicle.manufacturer(),
      model: faker.vehicle.model(),
      year: faker.date.past().getFullYear(),
      color: faker.vehicle.color(),
    },
    services: [],
    parts: [],
  };

  const mockCreateServiceOrderDto: CreateServiceOrderDto = {
    customerId: mockCustomerId,
    vehicleId: mockVehicleId,
    description: faker.lorem.paragraph(),
    services: [
      {
        serviceId: mockServiceId,
        quantity: 1,
      },
    ],
    parts: [
      {
        partId: mockPartId,
        quantity: 2,
      },
    ],
  };

  const mockUpdateStatusDto: UpdateServiceOrderStatusDto = {
    status: ServiceOrderStatus.IN_DIAGNOSIS,
    notes: faker.lorem.sentence(),
  };

  const mockStatusHistory = [
    {
      id: uuidv4(),
      serviceOrderId: mockServiceOrderId,
      status: ServiceOrderStatus.RECEIVED,
      notes: 'Ordem de serviço recebida',
      changedBy: faker.person.fullName(),
      createdAt: faker.date.past(),
    },
    {
      id: uuidv4(),
      serviceOrderId: mockServiceOrderId,
      status: ServiceOrderStatus.IN_DIAGNOSIS,
      notes: 'Iniciado diagnóstico',
      changedBy: faker.person.fullName(),
      createdAt: faker.date.recent(),
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ServiceOrderController],
      providers: [
        {
          provide: ServiceOrderService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findById: jest.fn(),
            findByCustomer: jest.fn(),
            updateStatus: jest.fn(),
            approveOrder: jest.fn(),
            getStatusHistory: jest.fn(),
          },
        },
      ],
    }).compile();

    serviceOrderController = module.get<ServiceOrderController>(
      ServiceOrderController,
    );
    serviceOrderService = module.get(ServiceOrderService);
  });

  describe('create', () => {
    it('TC0001 - Should create a service order successfully', async () => {
      const createdServiceOrder = { ...mockServiceOrderData };
      serviceOrderService.create.mockResolvedValue(createdServiceOrder);

      const result = await serviceOrderController.create(
        mockCreateServiceOrderDto,
      );

      expect(serviceOrderService.create).toHaveBeenCalledWith(
        mockCreateServiceOrderDto,
      );
      expect(result).toEqual(createdServiceOrder);
      expect(result.id).toBe(mockServiceOrderId);
      expect(result.status).toBe(ServiceOrderStatus.RECEIVED);
    });

    it('TC0002 - Should throw error when creating service order fails', async () => {
      const mockError = new Error('Falha ao criar ordem de serviço');
      serviceOrderService.create.mockRejectedValue(mockError);

      await expect(
        serviceOrderController.create(mockCreateServiceOrderDto),
      ).rejects.toThrow(mockError);
      expect(serviceOrderService.create).toHaveBeenCalledWith(
        mockCreateServiceOrderDto,
      );
    });

    it('TC0003 - Should handle customer not found error', async () => {
      const mockError = new Error('Cliente não encontrado');
      serviceOrderService.create.mockRejectedValue(mockError);

      await expect(
        serviceOrderController.create(mockCreateServiceOrderDto),
      ).rejects.toThrow(mockError);
      expect(serviceOrderService.create).toHaveBeenCalledWith(
        mockCreateServiceOrderDto,
      );
    });

    it('TC0004 - Should handle vehicle not found error', async () => {
      const mockError = new Error('Veículo não encontrado');
      serviceOrderService.create.mockRejectedValue(mockError);

      await expect(
        serviceOrderController.create(mockCreateServiceOrderDto),
      ).rejects.toThrow(mockError);
      expect(serviceOrderService.create).toHaveBeenCalledWith(
        mockCreateServiceOrderDto,
      );
    });
  });

  describe('findAll', () => {
    it('TC0001 - Should return all service orders without filter', async () => {
      const mockServiceOrders = [mockServiceOrderData];
      serviceOrderService.findAll.mockResolvedValue(mockServiceOrders);

      const result = await serviceOrderController.findAll();

      expect(serviceOrderService.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockServiceOrders);
      expect(result).toHaveLength(1);
    });

    it('TC0002 - Should return service orders filtered by customer', async () => {
      const mockServiceOrders = [mockServiceOrderData];
      serviceOrderService.findByCustomer.mockResolvedValue(mockServiceOrders);

      const result = await serviceOrderController.findAll(mockCustomerId);

      expect(serviceOrderService.findByCustomer).toHaveBeenCalledWith(
        mockCustomerId,
      );
      expect(result).toEqual(mockServiceOrders);
      expect(result[0].customerId).toBe(mockCustomerId);
    });

    it('TC0003 - Should throw error when findAll fails', async () => {
      const mockError = new Error('Falha ao listar ordens de serviço');
      serviceOrderService.findAll.mockRejectedValue(mockError);

      await expect(serviceOrderController.findAll()).rejects.toThrow(mockError);
      expect(serviceOrderService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('TC0001 - Should find service order by ID successfully', async () => {
      serviceOrderService.findById.mockResolvedValue(mockServiceOrderData);

      const result = await serviceOrderController.findOne(mockServiceOrderId);

      expect(serviceOrderService.findById).toHaveBeenCalledWith(
        mockServiceOrderId,
      );
      expect(result).toEqual(mockServiceOrderData);
      expect(result.id).toBe(mockServiceOrderId);
    });

    it('TC0002 - Should throw error when service order not found by ID', async () => {
      const mockError = new Error('Ordem de serviço não encontrada');
      serviceOrderService.findById.mockRejectedValue(mockError);

      await expect(
        serviceOrderController.findOne(mockServiceOrderId),
      ).rejects.toThrow(mockError);
      expect(serviceOrderService.findById).toHaveBeenCalledWith(
        mockServiceOrderId,
      );
    });

    it('TC0003 - Should handle invalid UUID format', async () => {
      const invalidId = 'invalid-uuid';
      const mockError = new Error('UUID inválido');
      serviceOrderService.findById.mockRejectedValue(mockError);

      await expect(serviceOrderController.findOne(invalidId)).rejects.toThrow(
        mockError,
      );
      expect(serviceOrderService.findById).toHaveBeenCalledWith(invalidId);
    });
  });

  describe('updateStatus', () => {
    it('TC0001 - Should update service order status successfully', async () => {
      const updatedServiceOrder = {
        ...mockServiceOrderData,
        status: ServiceOrderStatus.IN_DIAGNOSIS,
      };
      serviceOrderService.updateStatus.mockResolvedValue(updatedServiceOrder);

      const result = await serviceOrderController.updateStatus(
        mockServiceOrderId,
        mockUpdateStatusDto,
      );

      expect(serviceOrderService.updateStatus).toHaveBeenCalledWith(
        mockServiceOrderId,
        mockUpdateStatusDto,
      );
      expect(result.status).toBe(ServiceOrderStatus.IN_DIAGNOSIS);
      expect(result.id).toBe(mockServiceOrderId);
    });

    it('TC0002 - Should throw error when service order not found for status update', async () => {
      const mockError = new Error('Ordem de serviço não encontrada');
      serviceOrderService.updateStatus.mockRejectedValue(mockError);

      await expect(
        serviceOrderController.updateStatus(
          mockServiceOrderId,
          mockUpdateStatusDto,
        ),
      ).rejects.toThrow(mockError);
      expect(serviceOrderService.updateStatus).toHaveBeenCalledWith(
        mockServiceOrderId,
        mockUpdateStatusDto,
      );
    });

    it('TC0003 - Should handle invalid status transition', async () => {
      const mockError = new Error('Transição de status inválida');
      serviceOrderService.updateStatus.mockRejectedValue(mockError);

      await expect(
        serviceOrderController.updateStatus(
          mockServiceOrderId,
          mockUpdateStatusDto,
        ),
      ).rejects.toThrow(mockError);
      expect(serviceOrderService.updateStatus).toHaveBeenCalledWith(
        mockServiceOrderId,
        mockUpdateStatusDto,
      );
    });

    it('TC0004 - Should update status with notes', async () => {
      const statusWithNotes = {
        status: ServiceOrderStatus.AWAITING_APPROVAL,
        notes: 'Diagnóstico completo, aguardando aprovação do cliente',
      };
      const updatedServiceOrder = {
        ...mockServiceOrderData,
        status: ServiceOrderStatus.AWAITING_APPROVAL,
      };
      serviceOrderService.updateStatus.mockResolvedValue(updatedServiceOrder);

      const result = await serviceOrderController.updateStatus(
        mockServiceOrderId,
        statusWithNotes,
      );

      expect(serviceOrderService.updateStatus).toHaveBeenCalledWith(
        mockServiceOrderId,
        statusWithNotes,
      );
      expect(result.status).toBe(ServiceOrderStatus.AWAITING_APPROVAL);
    });
  });

  describe('approveOrder', () => {
    it('TC0001 - Should approve service order successfully', async () => {
      const approvedServiceOrder = {
        ...mockServiceOrderData,
        status: ServiceOrderStatus.IN_EXECUTION,
      };
      serviceOrderService.approveOrder.mockResolvedValue(approvedServiceOrder);

      const result =
        await serviceOrderController.approveOrder(mockServiceOrderId);

      expect(serviceOrderService.approveOrder).toHaveBeenCalledWith(
        mockServiceOrderId,
      );
      expect(result.status).toBe(ServiceOrderStatus.IN_EXECUTION);
      expect(result.id).toBe(mockServiceOrderId);
    });

    it('TC0002 - Should throw error when service order not found for approval', async () => {
      const mockError = new Error('Ordem de serviço não encontrada');
      serviceOrderService.approveOrder.mockRejectedValue(mockError);

      await expect(
        serviceOrderController.approveOrder(mockServiceOrderId),
      ).rejects.toThrow(mockError);
      expect(serviceOrderService.approveOrder).toHaveBeenCalledWith(
        mockServiceOrderId,
      );
    });

    it('TC0003 - Should handle service order not awaiting approval', async () => {
      const mockError = new Error(
        'Ordem de serviço não está aguardando aprovação',
      );
      serviceOrderService.approveOrder.mockRejectedValue(mockError);

      await expect(
        serviceOrderController.approveOrder(mockServiceOrderId),
      ).rejects.toThrow(mockError);
      expect(serviceOrderService.approveOrder).toHaveBeenCalledWith(
        mockServiceOrderId,
      );
    });
  });

  describe('getStatusHistory', () => {
    it('TC0001 - Should return status history successfully', async () => {
      serviceOrderService.getStatusHistory.mockResolvedValue(mockStatusHistory);

      const result =
        await serviceOrderController.getStatusHistory(mockServiceOrderId);

      expect(serviceOrderService.getStatusHistory).toHaveBeenCalledWith(
        mockServiceOrderId,
      );
      expect(result).toEqual(mockStatusHistory);
      expect(result).toHaveLength(2);
      expect(result[0].status).toBe(ServiceOrderStatus.RECEIVED);
      expect(result[1].status).toBe(ServiceOrderStatus.IN_DIAGNOSIS);
    });

    it('TC0002 - Should throw error when service order not found for history', async () => {
      const mockError = new Error('Ordem de serviço não encontrada');
      serviceOrderService.getStatusHistory.mockRejectedValue(mockError);

      await expect(
        serviceOrderController.getStatusHistory(mockServiceOrderId),
      ).rejects.toThrow(mockError);
      expect(serviceOrderService.getStatusHistory).toHaveBeenCalledWith(
        mockServiceOrderId,
      );
    });

    it('TC0003 - Should return empty history for new service order', async () => {
      serviceOrderService.getStatusHistory.mockResolvedValue([]);

      const result =
        await serviceOrderController.getStatusHistory(mockServiceOrderId);

      expect(serviceOrderService.getStatusHistory).toHaveBeenCalledWith(
        mockServiceOrderId,
      );
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });
  });

  describe('findByCustomer', () => {
    it('TC0001 - Should find service orders by customer successfully', async () => {
      const mockServiceOrders = [mockServiceOrderData];
      serviceOrderService.findByCustomer.mockResolvedValue(mockServiceOrders);

      const result =
        await serviceOrderController.findByCustomer(mockCustomerId);

      expect(serviceOrderService.findByCustomer).toHaveBeenCalledWith(
        mockCustomerId,
      );
      expect(result).toEqual(mockServiceOrders);
      expect(result).toHaveLength(1);
      expect(result[0].customerId).toBe(mockCustomerId);
    });

    it('TC0002 - Should return empty array when customer has no service orders', async () => {
      serviceOrderService.findByCustomer.mockResolvedValue([]);

      const result =
        await serviceOrderController.findByCustomer(mockCustomerId);

      expect(serviceOrderService.findByCustomer).toHaveBeenCalledWith(
        mockCustomerId,
      );
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('TC0003 - Should throw error when customer not found', async () => {
      const mockError = new Error('Cliente não encontrado');
      serviceOrderService.findByCustomer.mockRejectedValue(mockError);

      await expect(
        serviceOrderController.findByCustomer(mockCustomerId),
      ).rejects.toThrow(mockError);
      expect(serviceOrderService.findByCustomer).toHaveBeenCalledWith(
        mockCustomerId,
      );
    });

    it('TC0004 - Should handle invalid customer ID', async () => {
      const invalidCustomerId = 'invalid-uuid';
      const mockError = new Error('UUID inválido');
      serviceOrderService.findByCustomer.mockRejectedValue(mockError);

      await expect(
        serviceOrderController.findByCustomer(invalidCustomerId),
      ).rejects.toThrow(mockError);
      expect(serviceOrderService.findByCustomer).toHaveBeenCalledWith(
        invalidCustomerId,
      );
    });
  });
});
