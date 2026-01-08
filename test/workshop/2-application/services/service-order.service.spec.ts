import { Test, TestingModule } from '@nestjs/testing';
import { ServiceOrderStatus } from '../../../../src/shared/enums/service-order-status.enum';
import { CustomerType } from '../../../../src/shared/enums/customer-type.enum';
import { PrismaService } from '../../../../src/prisma/prisma.service';
import { faker } from '@faker-js/faker/locale/pt_BR';
import { Logger } from '@nestjs/common';

import { ServiceOrderService } from '../../../../src/workshop/2-application/services/service-order.service';
import { ErrorHandlerService } from '../../../../src/shared/services/error-handler.service';
import { NotificationService } from '../../../../src/workshop/2-application/services/notification.service';
import { MechanicService } from '../../../../src/workshop/2-application/services/mechanic.service';
import { EmailService } from '../../../../src/shared/services/email.service';

describe('ServiceOrderService', () => {
  let service: ServiceOrderService;
  let repositories: any;
  let services: any;

  const mockServiceOrder = {
    id: faker.string.uuid(),
    orderNumber: 'OS-2025-001',
    customerId: faker.string.uuid(),
    vehicleId: faker.string.uuid(),
    mechanicId: faker.string.uuid(),
    status: ServiceOrderStatus.RECEIVED,
    description: faker.lorem.sentence(),
    totalAmount: 500,
    discount: 0,
    totalServicePrice: 300,
    totalPartsPrice: 200,
    totalPrice: 500,
    estimatedTimeHours: 2,
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
  };

  const mockCustomer = {
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    email: faker.internet.email(),
    document: '12345678900',
    type: CustomerType.PESSOA_FISICA,
  };

  const mockVehicle = {
    id: faker.string.uuid(),
    licensePlate: 'ABC-1234',
    model: faker.vehicle.model(),
    brand: faker.vehicle.manufacturer(),
  };

  const mockMechanic = {
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    phone: faker.phone.number(),
    specialization: 'Mecânica Geral',
    isAvailable: true,
  };

  const mockService = {
    id: faker.string.uuid(),
    name: faker.commerce.productName(),
    price: 100,
    isActive: true,
    estimatedMinutes: 60,
  };

  const mockPart = {
    id: faker.string.uuid(),
    name: faker.commerce.productName(),
    price: 50,
    isActive: true,
    stock: 10,
  };

  beforeEach(async () => {
    const mockRepositories = {
      serviceOrder: {
        create: jest.fn(),
        findById: jest.fn(),
        findAll: jest.fn(),
        findByCustomerId: jest.fn(),
        findByOrderNumber: jest.fn(),
        findByVehicleId: jest.fn(),
        updateStatus: jest.fn(),
        updateTotals: jest.fn(),
        addServiceItem: jest.fn(),
        addPartItem: jest.fn(),
        addStatusHistory: jest.fn(),
        getStatusHistory: jest.fn(),
        countByYear: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        findManyWithPriority: jest.fn(),
        countWithPriority: jest.fn(),
      },
      customer: {
        findById: jest.fn(),
        findByDocument: jest.fn(),
      },
      vehicle: {
        findById: jest.fn(),
        findByPlate: jest.fn(),
      },
      service: {
        findById: jest.fn(),
        findAll: jest.fn(),
      },
      part: {
        findById: jest.fn(),
        updateStock: jest.fn(),
        findAll: jest.fn(),
      },
    };

    const mockServices = {
      errorHandler: {
        handleNotFoundError: jest.fn().mockImplementation(() => {
          throw new Error('Not found');
        }),
        handleConflictError: jest.fn().mockImplementation(() => {
          throw new Error('Conflict');
        }),
        generateException: jest.fn().mockImplementation(() => {
          throw new Error('Exception');
        }),
        handleBusinessRuleError: jest.fn().mockImplementation(() => {
          throw new Error('Business rule error');
        }),
      },
      notification: {
        sendServiceOrderStatusNotification: jest.fn(),
      },
      mechanic: {
        findById: jest.fn(),
        checkAvailability: jest.fn().mockResolvedValue(true),
        assignToServiceOrder: jest.fn(),
        releaseFromServiceOrder: jest.fn(),
      },
      email: {
        sendStatusChangeNotification: jest.fn(),
        sendBudgetApprovalRequest: jest.fn(),
      },
      prisma: {
        serviceOrderItem: {
          findMany: jest.fn().mockResolvedValue([]),
        },
        serviceOrderPart: {
          findMany: jest.fn().mockResolvedValue([]),
        },
        mechanic: {
          findUnique: jest.fn().mockResolvedValue(null),
        },
        $transaction: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServiceOrderService,
        { provide: 'IServiceOrderRepository', useValue: mockRepositories.serviceOrder },
        { provide: 'ICustomerRepository', useValue: mockRepositories.customer },
        { provide: 'IVehicleRepository', useValue: mockRepositories.vehicle },
        { provide: 'IServiceRepository', useValue: mockRepositories.service },
        { provide: 'IPartRepository', useValue: mockRepositories.part },
        { provide: PrismaService, useValue: mockServices.prisma },
        { provide: ErrorHandlerService, useValue: mockServices.errorHandler },
        { provide: NotificationService, useValue: mockServices.notification },
        { provide: MechanicService, useValue: mockServices.mechanic },
        { provide: EmailService, useValue: mockServices.email },
        { provide: Logger, useValue: { log: jest.fn(), warn: jest.fn(), error: jest.fn() } },
      ],
    }).compile();

    service = module.get<ServiceOrderService>(ServiceOrderService);
    repositories = mockRepositories;
    services = mockServices;
  });

  describe('create', () => {
    const createDto = {
      customerId: mockCustomer.id,
      vehicleId: mockVehicle.id,
      description: faker.lorem.sentence(),
      services: [{ serviceId: mockService.id, quantity: 2 }],
      parts: [{ partId: mockPart.id, quantity: 3 }],
    };

    it('TC0002 - Should throw error when customer not found', async () => {
      repositories.customer.findById.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow('Not found');
      expect(services.errorHandler.handleNotFoundError).toHaveBeenCalled();
    });

    it('TC0003 - Should throw error when vehicle not found', async () => {
      repositories.customer.findById.mockResolvedValue(mockCustomer);
      repositories.vehicle.findById.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow('Not found');
      expect(services.errorHandler.handleNotFoundError).toHaveBeenCalled();
    });

    it('TC0004 - Should throw error when vehicle does not belong to customer', async () => {
      repositories.customer.findById.mockResolvedValue(mockCustomer);
      repositories.vehicle.findById.mockResolvedValue({ ...mockVehicle, customerId: 'different-id' });

      await expect(service.create(createDto)).rejects.toThrow('Exception');
      expect(services.errorHandler.generateException).toHaveBeenCalled();
    });

    it('TC0005 - Should throw error when service not found', async () => {
      repositories.customer.findById.mockResolvedValue(mockCustomer);
      repositories.vehicle.findById.mockResolvedValue({ ...mockVehicle, customerId: mockCustomer.id });
      repositories.service.findById.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow('Not found');
      expect(services.errorHandler.handleNotFoundError).toHaveBeenCalled();
    });

    it('TC0006 - Should throw error when service is inactive', async () => {
      repositories.customer.findById.mockResolvedValue(mockCustomer);
      repositories.vehicle.findById.mockResolvedValue({ ...mockVehicle, customerId: mockCustomer.id });
      repositories.service.findById.mockResolvedValue({ ...mockService, isActive: false });

      await expect(service.create(createDto)).rejects.toThrow();
    });

    it('TC0007 - Should throw error when part not found', async () => {
      repositories.customer.findById.mockResolvedValue(mockCustomer);
      repositories.vehicle.findById.mockResolvedValue({ ...mockVehicle, customerId: mockCustomer.id });
      repositories.service.findById.mockResolvedValue(mockService);
      repositories.part.findById.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow('Not found');
      expect(services.errorHandler.handleNotFoundError).toHaveBeenCalled();
    });

    it('TC0008 - Should throw error when part is inactive', async () => {
      repositories.customer.findById.mockResolvedValue(mockCustomer);
      repositories.vehicle.findById.mockResolvedValue({ ...mockVehicle, customerId: mockCustomer.id });
      repositories.service.findById.mockResolvedValue(mockService);
      repositories.part.findById.mockResolvedValue({ ...mockPart, isActive: false });

      await expect(service.create(createDto)).rejects.toThrow();
    });

    it('TC0009 - Should throw error when insufficient stock for part', async () => {
      repositories.customer.findById.mockResolvedValue(mockCustomer);
      repositories.vehicle.findById.mockResolvedValue({ ...mockVehicle, customerId: mockCustomer.id });
      repositories.service.findById.mockResolvedValue(mockService);
      repositories.part.findById.mockResolvedValue({ ...mockPart, stock: 1 });

      await expect(service.create(createDto)).rejects.toThrow();
    });

    it('TC0010 - Should create service order with services and parts successfully', async () => {
      const simpleCreateDto = {
        customerId: mockCustomer.id,
        vehicleId: mockVehicle.id,
        description: faker.lorem.sentence(),
        services: [{ serviceId: mockService.id, quantity: 1 }],
        parts: [{ partId: mockPart.id, quantity: 2 }],
      };
      
      // Clear previous mocks
      repositories.customer.findById.mockClear();
      repositories.vehicle.findById.mockClear();
      repositories.service.findById.mockClear();
      repositories.part.findById.mockClear();
      
      // Setup mocks for create flow
      repositories.customer.findById
        .mockResolvedValueOnce(mockCustomer)  // create validation
        .mockResolvedValue(mockCustomer);     // findById after create
      
      repositories.vehicle.findById
        .mockResolvedValueOnce({ ...mockVehicle, customerId: mockCustomer.id })  // create validation
        .mockResolvedValue(mockVehicle);  // findById after create
      
      // Service findById called twice: validation + item creation
      repositories.service.findById
        .mockImplementation(() => Promise.resolve(mockService));
      
      // Part findById called twice: validation + item creation  
      repositories.part.findById
        .mockImplementation(() => Promise.resolve({ ...mockPart, stock: 10, isActive: true }));
      
      repositories.serviceOrder.countByYear.mockResolvedValue(0);
      repositories.serviceOrder.create.mockResolvedValue(mockServiceOrder);
      repositories.serviceOrder.addServiceItem.mockResolvedValue(undefined);
      repositories.serviceOrder.addPartItem.mockResolvedValue(undefined);
      repositories.part.updateStock.mockResolvedValue(undefined);
      repositories.serviceOrder.updateTotals.mockResolvedValue(undefined);
      repositories.serviceOrder.addStatusHistory.mockResolvedValue(undefined);
      repositories.serviceOrder.findById.mockResolvedValue(mockServiceOrder);
      services.mechanic.findById.mockResolvedValue(mockMechanic);
      services.prisma.serviceOrderItem.findMany.mockResolvedValue([]);
      services.prisma.serviceOrderPart.findMany.mockResolvedValue([]);

      const result = await service.create(simpleCreateDto);

      expect(result).toBeDefined();
      expect(repositories.serviceOrder.addServiceItem).toHaveBeenCalled();
      expect(repositories.serviceOrder.addPartItem).toHaveBeenCalled();
      expect(repositories.part.updateStock).toHaveBeenCalled();
      expect(repositories.serviceOrder.updateTotals).toHaveBeenCalled();
      expect(repositories.serviceOrder.addStatusHistory).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('TC0001 - Should return service order by id', async () => {
      repositories.serviceOrder.findById.mockResolvedValue(mockServiceOrder);
      repositories.customer.findById.mockResolvedValue(mockCustomer);
      repositories.vehicle.findById.mockResolvedValue(mockVehicle);
      services.mechanic.findById.mockResolvedValue(mockMechanic);
      services.prisma.serviceOrderItem.findMany.mockResolvedValue([]);
      services.prisma.serviceOrderPart.findMany.mockResolvedValue([]);

      const result = await service.findById(mockServiceOrder.id);

      expect(result).toBeDefined();
      expect(result.customer).toBeDefined();
      expect(result.vehicle).toBeDefined();
      expect(result.mechanic).toBeDefined();
    });

    it('TC0002 - Should handle service order not found', async () => {
      repositories.serviceOrder.findById.mockResolvedValue(null);
      await expect(service.findById(faker.string.uuid())).rejects.toThrow(
        'Not found',
      );
    });

    it('TC0003 - Should handle missing customer data', async () => {
      repositories.serviceOrder.findById.mockResolvedValue(mockServiceOrder);
      repositories.customer.findById.mockResolvedValue(null);
      repositories.vehicle.findById.mockResolvedValue(mockVehicle);
      services.mechanic.findById.mockResolvedValue(mockMechanic);
      services.prisma.serviceOrderItem.findMany.mockResolvedValue([]);
      services.prisma.serviceOrderPart.findMany.mockResolvedValue([]);

      const result = await service.findById(mockServiceOrder.id);

      expect(result).toBeDefined();
      expect(result.customer).toBeUndefined();
    });

    it('TC0004 - Should handle missing vehicle data', async () => {
      repositories.serviceOrder.findById.mockResolvedValue(mockServiceOrder);
      repositories.customer.findById.mockResolvedValue(mockCustomer);
      repositories.vehicle.findById.mockResolvedValue(null);
      services.mechanic.findById.mockResolvedValue(mockMechanic);
      services.prisma.serviceOrderItem.findMany.mockResolvedValue([]);
      services.prisma.serviceOrderPart.findMany.mockResolvedValue([]);

      const result = await service.findById(mockServiceOrder.id);

      expect(result).toBeDefined();
      expect(result.vehicle).toBeUndefined();
    });
  });

  describe('findByCustomer', () => {
    it('TC0001 - Should return service orders by customer', async () => {
      repositories.customer.findById.mockResolvedValue(mockCustomer);
      repositories.serviceOrder.findByCustomerId.mockResolvedValue([
        mockServiceOrder,
      ]);
      repositories.vehicle.findById.mockResolvedValue(mockVehicle);
      services.mechanic.findById.mockResolvedValue(mockMechanic);
      services.prisma.serviceOrderItem.findMany.mockResolvedValue([]);
      services.prisma.serviceOrderPart.findMany.mockResolvedValue([]);

      const result = await service.findByCustomer(mockCustomer.id);

      expect(result).toHaveLength(1);
      expect(repositories.serviceOrder.findByCustomerId).toHaveBeenCalledWith(
        mockCustomer.id,
      );
    });

    it('TC0002 - Should handle customer not found', async () => {
      repositories.customer.findById.mockResolvedValue(null);
      await expect(service.findByCustomer(faker.string.uuid())).rejects.toThrow(
        'Not found',
      );
    });
  });

  describe('updateStatus', () => {
    const updateDto = {
      status: ServiceOrderStatus.IN_EXECUTION,
      notes: faker.lorem.sentence(),
    };

    it('TC0001 - Should update status to EM_EXECUCAO successfully', async () => {
      const updateDtoWithMechanic = {
        ...updateDto,
        mechanicId: mockMechanic.id,
      };
      const orderWithMechanic = {
        ...mockServiceOrder,
        status: ServiceOrderStatus.IN_DIAGNOSIS,
        mechanicId: mockMechanic.id,
      };
      repositories.serviceOrder.findById.mockResolvedValue(orderWithMechanic);
      services.mechanic.findById.mockResolvedValue(mockMechanic);
      services.mechanic.checkAvailability.mockResolvedValue(true);
      services.mechanic.assignToServiceOrder.mockResolvedValue(undefined);
      repositories.serviceOrder.updateStatus.mockResolvedValue(undefined);
      repositories.serviceOrder.addStatusHistory.mockResolvedValue(undefined);
      jest
        .spyOn(service, 'findById')
        .mockResolvedValue(mockServiceOrder as any);

      const result = await service.updateStatus(mockServiceOrder.id, updateDtoWithMechanic);

      expect(result).toBeDefined();
      expect(repositories.serviceOrder.updateStatus).toHaveBeenCalled();
      expect(services.mechanic.assignToServiceOrder).toHaveBeenCalledWith(
        mockMechanic.id,
        mockServiceOrder.id,
      );
    });

    it('TC0002 - Should handle service order not found', async () => {
      repositories.serviceOrder.findById.mockResolvedValue(null);
      await expect(
        service.updateStatus(faker.string.uuid(), updateDto),
      ).rejects.toThrow('Not found');
    });

    it('TC0003 - Should handle missing mechanic for EM_EXECUCAO', async () => {
      const updateDtoWithoutMechanic = {
        ...updateDto,
      };
      const orderWithoutMechanic = {
        ...mockServiceOrder,
        status: ServiceOrderStatus.IN_DIAGNOSIS,
        mechanicId: null,
      };
      repositories.serviceOrder.findById.mockResolvedValue(
        orderWithoutMechanic,
      );
      repositories.serviceOrder.updateStatus.mockResolvedValue(undefined);
      repositories.serviceOrder.addStatusHistory.mockResolvedValue(undefined);
      jest
        .spyOn(service, 'findById')
        .mockResolvedValue(mockServiceOrder as any);

      const result = await service.updateStatus(
        mockServiceOrder.id,
        updateDtoWithoutMechanic,
      );

      expect(result).toBeDefined();
    });

    it('TC0004 - Should handle unavailable mechanic for EM_EXECUCAO', async () => {
      const updateDtoWithMechanic = {
        ...updateDto,
        mechanicId: mockMechanic.id,
      };
      const orderWithMechanic = {
        ...mockServiceOrder,
        status: ServiceOrderStatus.IN_DIAGNOSIS,
        mechanicId: null,
      };
      repositories.serviceOrder.findById.mockResolvedValue(orderWithMechanic);
      services.mechanic.findById.mockResolvedValue(mockMechanic);
      services.mechanic.checkAvailability.mockResolvedValue(false);
      services.errorHandler.handleBusinessRuleError.mockImplementation(() => {
        throw new Error('Mechanic not available');
      });

      await expect(
        service.updateStatus(mockServiceOrder.id, updateDtoWithMechanic),
      ).rejects.toThrow('Mechanic not available');
    });

    it('TC0005 - Should update status to FINALIZADA and release mechanic', async () => {
      const finalizadaDto = {
        status: ServiceOrderStatus.FINISHED,
        notes: faker.lorem.sentence(),
      };
      const orderEmExecucao = {
        ...mockServiceOrder,
        status: ServiceOrderStatus.IN_EXECUTION,
      };
      repositories.serviceOrder.findById.mockResolvedValue(orderEmExecucao);
      services.mechanic.releaseFromServiceOrder.mockResolvedValue(undefined);
      repositories.serviceOrder.updateStatus.mockResolvedValue(undefined);
      repositories.serviceOrder.addStatusHistory.mockResolvedValue(undefined);
      jest
        .spyOn(service, 'findById')
        .mockResolvedValue(mockServiceOrder as any);

      await service.updateStatus(mockServiceOrder.id, finalizadaDto);

      expect(services.mechanic.releaseFromServiceOrder).toHaveBeenCalledWith(
        mockServiceOrder.mechanicId,
      );
    });

    it('TC0006 - Should update status to ENTREGUE and release mechanic', async () => {
      const entregueDto = {
        status: ServiceOrderStatus.DELIVERED,
        notes: faker.lorem.sentence(),
      };
      const orderFinalizada = {
        ...mockServiceOrder,
        status: ServiceOrderStatus.FINISHED,
      };
      repositories.serviceOrder.findById.mockResolvedValue(orderFinalizada);
      services.mechanic.releaseFromServiceOrder.mockResolvedValue(undefined);
      repositories.serviceOrder.updateStatus.mockResolvedValue(undefined);
      repositories.serviceOrder.addStatusHistory.mockResolvedValue(undefined);
      jest
        .spyOn(service, 'findById')
        .mockResolvedValue(mockServiceOrder as any);

      await service.updateStatus(mockServiceOrder.id, entregueDto);

      expect(services.mechanic.releaseFromServiceOrder).toHaveBeenCalledWith(
        mockServiceOrder.mechanicId,
      );
    });
  });

  describe('approveOrder', () => {
    it('TC0001 - Should approve order successfully', async () => {
      const orderAguardando = {
        ...mockServiceOrder,
        status: ServiceOrderStatus.AWAITING_APPROVAL,
      };
      repositories.serviceOrder.findById.mockResolvedValue(orderAguardando);
      repositories.serviceOrder.updateStatus.mockResolvedValue(undefined);
      repositories.serviceOrder.addStatusHistory.mockResolvedValue(undefined);
      jest
        .spyOn(service, 'findById')
        .mockResolvedValue(mockServiceOrder as any);

      const result = await service.approveOrder(mockServiceOrder.id);

      expect(result).toBeDefined();
      expect(repositories.serviceOrder.updateStatus).toHaveBeenCalled();
    });

    it('TC0002 - Should handle service order not found', async () => {
      repositories.serviceOrder.findById.mockResolvedValue(null);
      await expect(service.approveOrder(faker.string.uuid())).rejects.toThrow(
        'Not found',
      );
    });

    it('TC0003 - Should handle invalid status for approval', async () => {
      repositories.serviceOrder.findById.mockResolvedValue(mockServiceOrder);
      await expect(service.approveOrder(mockServiceOrder.id)).rejects.toThrow(
        'Exception',
      );
    });
  });

  describe('getStatusHistory', () => {
    it('TC0001 - Should return status history', async () => {
      const mockHistory = [
        { id: faker.string.uuid(), status: ServiceOrderStatus.RECEIVED },
      ];
      repositories.serviceOrder.findById.mockResolvedValue(mockServiceOrder);
      repositories.serviceOrder.getStatusHistory.mockResolvedValue(mockHistory);

      const result = await service.getStatusHistory(mockServiceOrder.id);

      expect(result).toEqual(mockHistory);
      expect(repositories.serviceOrder.getStatusHistory).toHaveBeenCalledWith(
        mockServiceOrder.id,
      );
    });

    it('TC0002 - Should handle service order not found', async () => {
      repositories.serviceOrder.findById.mockResolvedValue(null);
      await expect(
        service.getStatusHistory(faker.string.uuid()),
      ).rejects.toThrow('Not found');
    });
  });
  describe('findAll', () => {
    it('TC0001 - Should return all service orders', async () => {
      repositories.serviceOrder.findAll.mockResolvedValue([mockServiceOrder]);
      repositories.customer.findById.mockResolvedValue(mockCustomer);
      repositories.vehicle.findById.mockResolvedValue(mockVehicle);
      services.mechanic.findById.mockResolvedValue(mockMechanic);
      services.prisma.serviceOrderItem.findMany.mockResolvedValue([]);
      services.prisma.serviceOrderPart.findMany.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toHaveLength(1);
      expect(repositories.serviceOrder.findAll).toHaveBeenCalled();
    });

    it('TC0002 - Should return empty array when no orders', async () => {
      repositories.serviceOrder.findAll.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findByVehiclePlate', () => {
    it('TC0001 - Should return service orders by vehicle plate', async () => {
      repositories.vehicle.findByPlate.mockResolvedValue(mockVehicle);
      repositories.serviceOrder.findByVehicleId.mockResolvedValue([mockServiceOrder]);
      repositories.customer.findById.mockResolvedValue(mockCustomer);
      services.mechanic.findById.mockResolvedValue(mockMechanic);
      services.prisma.serviceOrderItem.findMany.mockResolvedValue([]);
      services.prisma.serviceOrderPart.findMany.mockResolvedValue([]);

      const result = await service.findByVehiclePlate('ABC-1234');

      expect(result).toHaveLength(1);
      expect(repositories.vehicle.findByPlate).toHaveBeenCalledWith('ABC-1234');
    });

    it('TC0002 - Should handle vehicle not found', async () => {
      repositories.vehicle.findByPlate.mockResolvedValue(null);

      await expect(service.findByVehiclePlate('XYZ-9999')).rejects.toThrow('Not found');
    });
  });
  describe('findByOrderNumber', () => {
    it('TC0001 - Should find service order by order number', async () => {
      repositories.serviceOrder.findByOrderNumber.mockResolvedValue(
        mockServiceOrder,
      );
      repositories.customer.findById.mockResolvedValue(mockCustomer);
      repositories.vehicle.findById.mockResolvedValue(mockVehicle);
      services.mechanic.findById.mockResolvedValue(mockMechanic);
      services.prisma.serviceOrderItem.findMany.mockResolvedValue([]);
      services.prisma.serviceOrderPart.findMany.mockResolvedValue([]);

      const result = await service.findByOrderNumber(
        mockServiceOrder.orderNumber,
      );

      expect(result).toBeDefined();
      expect(repositories.serviceOrder.findByOrderNumber).toHaveBeenCalledWith(
        mockServiceOrder.orderNumber,
      );
    });

    it('TC0002 - Should handle service order not found by order number', async () => {
      repositories.serviceOrder.findByOrderNumber.mockResolvedValue(null);
      await expect(service.findByOrderNumber('OS-2025-9999')).rejects.toThrow(
        'Not found',
      );
    });
  });

  describe('findByCustomerDocument', () => {
    it('TC0001 - Should find service orders by customer document', async () => {
      repositories.customer.findByDocument.mockResolvedValue(mockCustomer);
      repositories.serviceOrder.findByCustomerId.mockResolvedValue([
        mockServiceOrder,
      ]);
      repositories.customer.findById.mockResolvedValue(mockCustomer);
      repositories.vehicle.findById.mockResolvedValue(mockVehicle);
      services.mechanic.findById.mockResolvedValue(mockMechanic);
      services.prisma.serviceOrderItem.findMany.mockResolvedValue([]);
      services.prisma.serviceOrderPart.findMany.mockResolvedValue([]);

      const result = await service.findByCustomerDocument(
        mockCustomer.document,
      );

      expect(result).toHaveLength(1);
      expect(repositories.customer.findByDocument).toHaveBeenCalledWith(
        mockCustomer.document,
      );
    });

    it('TC0002 - Should handle customer not found by document', async () => {
      repositories.customer.findByDocument.mockResolvedValue(null);
      await expect(
        service.findByCustomerDocument('99999999999'),
      ).rejects.toThrow('Not found');
    });

    it('TC0003 - Should clean document before searching', async () => {
      repositories.customer.findByDocument.mockResolvedValue(mockCustomer);
      repositories.serviceOrder.findByCustomerId.mockResolvedValue([]);

      await service.findByCustomerDocument('123.456.789-10');

      expect(repositories.customer.findByDocument).toHaveBeenCalledWith(
        '12345678910',
      );
    });
  });

  describe('findByVehiclePlate', () => {
    it('TC0001 - Should find service orders by vehicle plate', async () => {
      repositories.vehicle.findByPlate.mockResolvedValue(mockVehicle);
      repositories.serviceOrder.findByVehicleId.mockResolvedValue([
        mockServiceOrder,
      ]);
      repositories.customer.findById.mockResolvedValue(mockCustomer);
      repositories.vehicle.findById.mockResolvedValue(mockVehicle);
      services.mechanic.findById.mockResolvedValue(mockMechanic);
      services.prisma.serviceOrderItem.findMany.mockResolvedValue([]);
      services.prisma.serviceOrderPart.findMany.mockResolvedValue([]);

      const result = await service.findByVehiclePlate(mockVehicle.licensePlate);

      expect(result).toHaveLength(1);
      expect(repositories.vehicle.findByPlate).toHaveBeenCalledWith(
        mockVehicle.licensePlate,
      );
    });

    it('TC0002 - Should handle vehicle not found by plate', async () => {
      repositories.vehicle.findByPlate.mockResolvedValue(null);
      await expect(service.findByVehiclePlate('XXX-9999')).rejects.toThrow(
        'Not found',
      );
    });
  });

  describe('updateStatus - AGUARDANDO_APROVACAO', () => {
    it('TC0001 - Should update status to AGUARDANDO_APROVACAO', async () => {
      
      const orderEmDiagnostico = {
        ...mockServiceOrder,
        status: ServiceOrderStatus.IN_DIAGNOSIS,
      };
      repositories.serviceOrder.findById.mockResolvedValue(orderEmDiagnostico);
      repositories.serviceOrder.updateStatus.mockResolvedValue(undefined);
      repositories.serviceOrder.addStatusHistory.mockResolvedValue(undefined);
      repositories.customer.findById.mockResolvedValue(mockCustomer);
      repositories.vehicle.findById.mockResolvedValue(mockVehicle);
      services.notification.sendServiceOrderStatusNotification.mockResolvedValue(
        undefined,
      );
      jest
        .spyOn(service, 'findById')
        .mockResolvedValue(mockServiceOrder as any);

      const updateDto = {
        status: ServiceOrderStatus.AWAITING_APPROVAL,
        notes: 'Test',
      };
      const result = await service.updateStatus(mockServiceOrder.id, updateDto);

      expect(result).toBeDefined();
      expect(repositories.serviceOrder.updateStatus).toHaveBeenCalled();
      expect(
        services.notification.sendServiceOrderStatusNotification,
      ).toHaveBeenCalled();
    });

    it('TC0002 - Should handle notification error gracefully', async () => {
      const orderEmDiagnostico = {
        ...mockServiceOrder,
        status: ServiceOrderStatus.IN_DIAGNOSIS,
      };
      const customerWithEmail = { ...mockCustomer, email: 'test@example.com' };

      repositories.serviceOrder.findById.mockResolvedValue(orderEmDiagnostico);
      repositories.serviceOrder.updateStatus.mockResolvedValue(undefined);
      repositories.serviceOrder.addStatusHistory.mockResolvedValue(undefined);
      repositories.customer.findById.mockResolvedValue(customerWithEmail);
      repositories.vehicle.findById.mockResolvedValue(mockVehicle);
      services.notification.sendServiceOrderStatusNotification.mockResolvedValue(
        undefined,
      );
      services.email.sendStatusChangeNotification.mockRejectedValue(
        new Error('Email failed'),
      );
      jest
        .spyOn(service, 'findById')
        .mockResolvedValue(mockServiceOrder as any);

    });

    it('TC0003 - Should skip notification if customer or vehicle not found', async () => {
      const orderEmDiagnostico = {
        ...mockServiceOrder,
        status: ServiceOrderStatus.IN_DIAGNOSIS,
      };
      repositories.serviceOrder.findById.mockResolvedValue(orderEmDiagnostico);
      repositories.serviceOrder.updateStatus.mockResolvedValue(undefined);
      repositories.serviceOrder.addStatusHistory.mockResolvedValue(undefined);
      repositories.customer.findById.mockResolvedValue(null);
      repositories.vehicle.findById.mockResolvedValue(null);
      jest
        .spyOn(service, 'findById')
        .mockResolvedValue(mockServiceOrder as any);

      const updateDto = {
        status: ServiceOrderStatus.AWAITING_APPROVAL,
        notes: 'Test',
      };
      const result = await service.updateStatus(mockServiceOrder.id, updateDto);

      expect(result).toBeDefined();
      expect(
        services.notification.sendServiceOrderStatusNotification,
      ).not.toHaveBeenCalled();
    });

    it('TC0004 - Should handle push notification error gracefully', async () => {
      
      const orderEmDiagnostico = {
        ...mockServiceOrder,
        status: ServiceOrderStatus.IN_DIAGNOSIS,
      };
      const customerWithPhone = { ...mockCustomer, phone: '+5511999999999' };

      repositories.serviceOrder.findById.mockResolvedValue(orderEmDiagnostico);
      repositories.serviceOrder.updateStatus.mockResolvedValue(undefined);
      repositories.serviceOrder.addStatusHistory.mockResolvedValue(undefined);
      repositories.customer.findById.mockResolvedValue(customerWithPhone);
      repositories.vehicle.findById.mockResolvedValue(mockVehicle);
      services.notification.sendServiceOrderStatusNotification.mockRejectedValue(
        new Error('Push notification failed'),
      );
      jest
        .spyOn(service, 'findById')
        .mockResolvedValue(mockServiceOrder as any);

      const updateDto = {
        status: ServiceOrderStatus.AWAITING_APPROVAL,
        notes: 'Test',
      };

      const result = await service.updateStatus(mockServiceOrder.id, updateDto);

      expect(result).toBeDefined();
      expect(repositories.serviceOrder.updateStatus).toHaveBeenCalled();
    });
  });

  describe('validateStatusTransition', () => {
    it('TC0001 - Should throw error on invalid status transition', async () => {
      const invalidDto = {
        status: ServiceOrderStatus.DELIVERED,
        notes: faker.lorem.sentence(),
      };
      const orderRecebida = {
        ...mockServiceOrder,
        status: ServiceOrderStatus.RECEIVED,
      };
      repositories.serviceOrder.findById.mockResolvedValue(orderRecebida);

      await expect(
        service.updateStatus(mockServiceOrder.id, invalidDto),
      ).rejects.toThrow('Exception');
    });

    it('TC0002 - Should throw error when trying to go back to RECEBIDA', async () => {
      const invalidDto = {
        status: ServiceOrderStatus.RECEIVED,
        notes: faker.lorem.sentence(),
      };
      const orderEmDiagnostico = {
        ...mockServiceOrder,
        status: ServiceOrderStatus.IN_DIAGNOSIS,
      };
      repositories.serviceOrder.findById.mockResolvedValue(orderEmDiagnostico);

      await expect(
        service.updateStatus(mockServiceOrder.id, invalidDto),
      ).rejects.toThrow('Exception');
    });
  });

  describe('mapToResponseDto - with items', () => {
    it('TC0001 - Should map service order with service and part items', async () => {
      const mockServiceItem = {
        id: faker.string.uuid(),
        serviceOrderId: mockServiceOrder.id,
        serviceId: mockService.id,
        quantity: 1,
        price: 100,
        totalPrice: 100,
      };
      const mockPartItem = {
        id: faker.string.uuid(),
        serviceOrderId: mockServiceOrder.id,
        partId: mockPart.id,
        quantity: 2,
        price: 50,
        totalPrice: 100,
      };

      repositories.serviceOrder.findById.mockResolvedValue(mockServiceOrder);
      repositories.customer.findById.mockResolvedValue(mockCustomer);
      repositories.vehicle.findById.mockResolvedValue(mockVehicle);
      services.mechanic.findById.mockResolvedValue(mockMechanic);
      services.prisma.serviceOrderItem.findMany.mockResolvedValue([
        mockServiceItem,
      ]);
      services.prisma.serviceOrderPart.findMany.mockResolvedValue([
        mockPartItem,
      ]);
      repositories.service.findById.mockResolvedValue(mockService);
      repositories.part.findById.mockResolvedValue(mockPart);

      const result = await service.findById(mockServiceOrder.id);

      expect(result).toBeDefined();
      expect(result.services).toHaveLength(1);
      expect(result.parts).toHaveLength(1);
    });

    it('TC0002 - Should handle service not found in items with empty name', async () => {
      const mockServiceItem = {
        id: faker.string.uuid(),
        serviceOrderId: mockServiceOrder.id,
        serviceId: mockService.id,
        quantity: 1,
        price: 100,
        totalPrice: 100,
      };

      repositories.serviceOrder.findById.mockResolvedValue(mockServiceOrder);
      repositories.customer.findById.mockResolvedValue(mockCustomer);
      repositories.vehicle.findById.mockResolvedValue(mockVehicle);
      services.mechanic.findById.mockResolvedValue(mockMechanic);
      services.prisma.serviceOrderItem.findMany.mockResolvedValue([
        mockServiceItem,
      ]);
      services.prisma.serviceOrderPart.findMany.mockResolvedValue([]);
      repositories.service.findById.mockResolvedValue(null);

      const result = await service.findById(mockServiceOrder.id);

      expect(result).toBeDefined();
      expect(result.services[0].service.name).toBe('');
    });

    it('TC0003 - Should handle part not found in items with empty name', async () => {
      const mockPartItem = {
        id: faker.string.uuid(),
        serviceOrderId: mockServiceOrder.id,
        partId: mockPart.id,
        quantity: 2,
        price: 50,
        totalPrice: 100,
      };

      repositories.serviceOrder.findById.mockResolvedValue(mockServiceOrder);
      repositories.customer.findById.mockResolvedValue(mockCustomer);
      repositories.vehicle.findById.mockResolvedValue(mockVehicle);
      services.mechanic.findById.mockResolvedValue(mockMechanic);
      services.prisma.serviceOrderItem.findMany.mockResolvedValue([]);
      services.prisma.serviceOrderPart.findMany.mockResolvedValue([
        mockPartItem,
      ]);
      repositories.part.findById.mockResolvedValue(null);

      const result = await service.findById(mockServiceOrder.id);

      expect(result).toBeDefined();
      expect(result.parts[0].part.name).toBe('');
    });
  });

  describe('mapToResponseDto - edge cases', () => {
    it('TC0001 - Should handle missing customer', async () => {
      repositories.serviceOrder.findById.mockResolvedValue(mockServiceOrder);
      repositories.customer.findById.mockResolvedValue(null);
      repositories.vehicle.findById.mockResolvedValue(mockVehicle);
      services.mechanic.findById.mockResolvedValue(mockMechanic);
      services.prisma.serviceOrderItem.findMany.mockResolvedValue([]);
      services.prisma.serviceOrderPart.findMany.mockResolvedValue([]);
      const result = await service.findById(mockServiceOrder.id);
      expect(result.customer).toBeUndefined();
    });

    it('TC0002 - Should handle missing vehicle', async () => {
      repositories.serviceOrder.findById.mockResolvedValue(mockServiceOrder);
      repositories.customer.findById.mockResolvedValue(mockCustomer);
      repositories.vehicle.findById.mockResolvedValue(null);
      services.mechanic.findById.mockResolvedValue(mockMechanic);
      services.prisma.serviceOrderItem.findMany.mockResolvedValue([]);
      services.prisma.serviceOrderPart.findMany.mockResolvedValue([]);
      const result = await service.findById(mockServiceOrder.id);
      expect(result.vehicle).toBeUndefined();
    });

    it('TC0003 - Should handle missing mechanic', async () => {
      const orderWithoutMechanic = { ...mockServiceOrder, mechanicId: null };
      repositories.serviceOrder.findById.mockResolvedValue(
        orderWithoutMechanic,
      );
      repositories.customer.findById.mockResolvedValue(mockCustomer);
      repositories.vehicle.findById.mockResolvedValue(mockVehicle);
      services.prisma.serviceOrderItem.findMany.mockResolvedValue([]);
      services.prisma.serviceOrderPart.findMany.mockResolvedValue([]);
      const result = await service.findById(mockServiceOrder.id);
      expect(result.mechanic).toBeNull();
    });

    it('TC0004 - Should handle empty services and parts arrays', async () => {
      repositories.serviceOrder.findById.mockResolvedValue(mockServiceOrder);
      repositories.customer.findById.mockResolvedValue(mockCustomer);
      repositories.vehicle.findById.mockResolvedValue(mockVehicle);
      services.mechanic.findById.mockResolvedValue(mockMechanic);
      services.prisma.serviceOrderItem.findMany.mockResolvedValue([]);
      services.prisma.serviceOrderPart.findMany.mockResolvedValue([]);
      const result = await service.findById(mockServiceOrder.id);
      expect(result.services).toEqual([]);
      expect(result.parts).toEqual([]);
    });
  });

  describe('findAllPaginated', () => {
    it('TC0001 - Should return paginated service orders', async () => {
      const paginationDto = { page: 0, size: 10, skip: 0, take: 10 };
      repositories.serviceOrder.findMany.mockResolvedValue([mockServiceOrder]);
      repositories.serviceOrder.count.mockResolvedValue(1);
      repositories.customer.findById.mockResolvedValue(mockCustomer);
      repositories.vehicle.findById.mockResolvedValue(mockVehicle);
      services.mechanic.findById.mockResolvedValue(mockMechanic);
      services.prisma.serviceOrderItem.findMany.mockResolvedValue([]);
      services.prisma.serviceOrderPart.findMany.mockResolvedValue([]);

      const result = await service.findAllPaginated(paginationDto);

      expect(result).toBeDefined();
      expect(result.data).toHaveLength(1);
      expect(result.pagination.totalRecords).toBe(1);
      expect(repositories.serviceOrder.findMany).toHaveBeenCalledWith(0, 10);
    });

    it('TC0002 - Should return empty paginated result when no orders', async () => {
      const paginationDto = { page: 0, size: 10, skip: 0, take: 10 };
      repositories.serviceOrder.findMany.mockResolvedValue([]);
      repositories.serviceOrder.count.mockResolvedValue(0);

      const result = await service.findAllPaginated(paginationDto);

      expect(result).toBeDefined();
      expect(result.data).toHaveLength(0);
      expect(result.pagination.totalRecords).toBe(0);
    });
  });

  describe('findAllPaginatedWithPriority', () => {
    it('TC0001 - Should return paginated service orders with priority', async () => {
      const paginationDto = { page: 0, size: 10, skip: 0, take: 10 };
      repositories.serviceOrder.findManyWithPriority.mockResolvedValue([mockServiceOrder]);
      repositories.serviceOrder.countWithPriority.mockResolvedValue(1);
      repositories.customer.findById.mockResolvedValue(mockCustomer);
      repositories.vehicle.findById.mockResolvedValue(mockVehicle);
      services.mechanic.findById.mockResolvedValue(mockMechanic);
      services.prisma.serviceOrderItem.findMany.mockResolvedValue([]);
      services.prisma.serviceOrderPart.findMany.mockResolvedValue([]);

      const result = await service.findAllPaginatedWithPriority(paginationDto);

      expect(result).toBeDefined();
      expect(result.data).toHaveLength(1);
      expect(result.pagination.totalRecords).toBe(1);
      expect(repositories.serviceOrder.findManyWithPriority).toHaveBeenCalledWith(0, 10);
    });

    it('TC0002 - Should return empty paginated result with priority when no orders', async () => {
      const paginationDto = { page: 0, size: 10, skip: 0, take: 10 };
      repositories.serviceOrder.findManyWithPriority.mockResolvedValue([]);
      repositories.serviceOrder.countWithPriority.mockResolvedValue(0);

      const result = await service.findAllPaginatedWithPriority(paginationDto);

      expect(result).toBeDefined();
      expect(result.data).toHaveLength(0);
      expect(result.pagination.totalRecords).toBe(0);
    });
  });
});



