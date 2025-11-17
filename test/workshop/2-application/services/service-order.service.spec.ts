import { Test, TestingModule } from '@nestjs/testing';
import { ServiceOrderStatus, CustomerType } from '@prisma/client';
import { faker } from '@faker-js/faker/locale/pt_BR';
import { Decimal } from '@prisma/client/runtime/library';
import { Logger } from '@nestjs/common';

import { ServiceOrderService } from '../../../../src/workshop/2-application/services/service-order.service';
import { ErrorHandlerService } from '../../../../src/shared/services/error-handler.service';
import { NotificationService } from '../../../../src/workshop/2-application/services/notification.service';
import { MechanicService } from '../../../../src/workshop/2-application/services/mechanic.service';
import { EmailService } from '../../../../src/shared/services/email.service';
import { PrismaService } from '../../../../src/prisma/prisma.service';
import { CreateServiceOrderDto } from '../../../../src/workshop/1-presentation/dtos/service-order/create-service-order.dto';
import { UpdateServiceOrderStatusDto } from '../../../../src/workshop/1-presentation/dtos/service-order/update-service-order-status.dto';

describe('ServiceOrderService', () => {
  let service: ServiceOrderService;
  let repositories: any;
  let services: any;

  const mockCustomer = {
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    document: faker.string.numeric(11),
    email: faker.internet.email(),
    phone: faker.phone.number(),
    type: CustomerType.PESSOA_FISICA,
    address: faker.location.streetAddress(),
    additionalInfo: null,
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
  };

  const mockVehicle = {
    id: faker.string.uuid(),
    customerId: mockCustomer.id,
    licensePlate: faker.vehicle.vrm(),
    brand: faker.vehicle.manufacturer(),
    model: faker.vehicle.model(),
    year: faker.number.int({ min: 2000, max: 2024 }),
    color: faker.color.human(),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
  };

  const mockService = {
    id: faker.string.uuid(),
    name: faker.commerce.productName(),
    description: faker.lorem.sentence(),
    price: new Decimal(
      faker.number.float({ min: 50, max: 500, fractionDigits: 2 }),
    ),
    estimatedMinutes: faker.number.int({ min: 30, max: 240 }),
    category: faker.commerce.department(),
    isActive: true,
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
  };

  const mockPart = {
    id: faker.string.uuid(),
    name: faker.commerce.productName(),
    description: faker.lorem.sentence(),
    price: new Decimal(
      faker.number.float({ min: 10, max: 200, fractionDigits: 2 }),
    ),
    partNumber: faker.string.alphanumeric(8),
    stock: faker.number.int({ min: 10, max: 100 }),
    minStock: faker.number.int({ min: 1, max: 10 }),
    supplier: faker.company.name(),
    isActive: true,
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
  };

  const mockServiceOrder = {
    id: faker.string.uuid(),
    orderNumber: `OS-${new Date().getFullYear()}-${faker.string.numeric(4)}`,
    customerId: mockCustomer.id,
    vehicleId: mockVehicle.id,
    mechanicId: faker.string.uuid(),
    description: faker.lorem.sentence(),
    status: ServiceOrderStatus.RECEBIDA,
    totalServicePrice: new Decimal(100),
    totalPartsPrice: new Decimal(50),
    totalPrice: new Decimal(150),
    estimatedTimeHours: 2,
    estimatedCompletionDate: faker.date.future(),
    startedAt: null,
    completedAt: null,
    deliveredAt: null,
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
  };

  const mockMechanic = {
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    email: faker.internet.email(),
    phone: faker.phone.number(),
    specialties: [faker.lorem.word()],
    isAvailable: true,
    experienceYears: faker.number.int({ min: 1, max: 20 }),
    totalServicesCompleted: faker.number.int({ min: 0, max: 100 }),
    averageCompletionTime: faker.number.float({ min: 1, max: 10 }),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
  };

  const createDto: CreateServiceOrderDto = {
    customerId: mockCustomer.id,
    vehicleId: mockVehicle.id,
    description: faker.lorem.sentence(),
    services: [{ serviceId: mockService.id, quantity: 1 }],
    parts: [{ partId: mockPart.id, quantity: 2 }],
  };

  beforeEach(async () => {
    // Mock Logger to suppress error logs during tests
    jest.spyOn(Logger.prototype, 'error').mockImplementation();

    const mockRepositories = {
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
      },
      part: {
        findById: jest.fn(),
        updateStock: jest.fn(),
      },
      serviceOrder: {
        create: jest.fn(),
        findAll: jest.fn(),
        findMany: jest.fn(),
        findManyWithPriority: jest.fn(),
        count: jest.fn(),
        countWithPriority: jest.fn(),
        findById: jest.fn(),
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
      },
      notification: {
        sendServiceOrderStatusNotification: jest.fn(),
      },
      mechanic: {
        findById: jest.fn(),
        markAsUnavailable: jest.fn(),
        releaseFromServiceOrder: jest.fn(),
      },
      email: {
        sendStatusChangeNotification: jest.fn(),
        sendBudgetApprovalRequest: jest.fn(),
      },
      prisma: {
        serviceOrderItem: { findMany: jest.fn() },
        serviceOrderPart: { findMany: jest.fn() },
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServiceOrderService,
        { provide: 'ICustomerRepository', useValue: mockRepositories.customer },
        { provide: 'IVehicleRepository', useValue: mockRepositories.vehicle },
        { provide: 'IServiceRepository', useValue: mockRepositories.service },
        { provide: 'IPartRepository', useValue: mockRepositories.part },
        {
          provide: 'IServiceOrderRepository',
          useValue: mockRepositories.serviceOrder,
        },
        { provide: ErrorHandlerService, useValue: mockServices.errorHandler },
        { provide: NotificationService, useValue: mockServices.notification },
        { provide: MechanicService, useValue: mockServices.mechanic },
        { provide: EmailService, useValue: mockServices.email },
        { provide: PrismaService, useValue: mockServices.prisma },
      ],
    }).compile();

    service = module.get<ServiceOrderService>(ServiceOrderService);
    repositories = {
      customer: module.get('ICustomerRepository'),
      vehicle: module.get('IVehicleRepository'),
      service: module.get('IServiceRepository'),
      part: module.get('IPartRepository'),
      serviceOrder: module.get('IServiceOrderRepository'),
    };
    services = {
      errorHandler: module.get(ErrorHandlerService),
      notification: module.get(NotificationService),
      mechanic: module.get(MechanicService),
      email: module.get(EmailService),
      prisma: module.get(PrismaService),
    };
  });

  it('Should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    beforeEach(() => {
      repositories.customer.findById.mockResolvedValue(mockCustomer);
      repositories.vehicle.findById.mockResolvedValue(mockVehicle);
      repositories.service.findById.mockResolvedValue(mockService);
      repositories.part.findById.mockResolvedValue(mockPart);
      repositories.serviceOrder.create.mockResolvedValue(mockServiceOrder);
      repositories.serviceOrder.countByYear.mockResolvedValue(1);
      repositories.serviceOrder.addServiceItem.mockResolvedValue(undefined);
      repositories.serviceOrder.addPartItem.mockResolvedValue(undefined);
      repositories.serviceOrder.updateTotals.mockResolvedValue(undefined);
      repositories.serviceOrder.addStatusHistory.mockResolvedValue(undefined);
      repositories.part.updateStock.mockResolvedValue(undefined);
      jest
        .spyOn(service, 'findById')
        .mockResolvedValue(mockServiceOrder as any);
    });

    it('TC0001 - Should create service order successfully', async () => {
      const result = await service.create(createDto);

      expect(result).toBeDefined();
      expect(repositories.customer.findById).toHaveBeenCalledWith(
        createDto.customerId,
      );
      expect(repositories.vehicle.findById).toHaveBeenCalledWith(
        createDto.vehicleId,
      );
      expect(repositories.serviceOrder.create).toHaveBeenCalled();
    });

    it('TC0002 - Should handle customer not found', async () => {
      repositories.customer.findById.mockResolvedValue(null);
      await expect(service.create(createDto)).rejects.toThrow('Not found');
    });

    it('TC0003 - Should handle vehicle not found', async () => {
      repositories.vehicle.findById.mockResolvedValue(null);
      await expect(service.create(createDto)).rejects.toThrow('Not found');
    });

    it('TC0004 - Should handle vehicle not belonging to customer', async () => {
      repositories.vehicle.findById.mockResolvedValue({
        ...mockVehicle,
        customerId: faker.string.uuid(),
      });
      await expect(service.create(createDto)).rejects.toThrow('Exception');
    });

    it('TC0005 - Should handle service not found', async () => {
      repositories.service.findById.mockResolvedValue(null);
      await expect(service.create(createDto)).rejects.toThrow('Not found');
    });

    it('TC0006 - Should handle inactive service', async () => {
      repositories.service.findById.mockResolvedValue({
        ...mockService,
        isActive: false,
      });
      await expect(service.create(createDto)).rejects.toThrow('Exception');
    });

    it('TC0007 - Should handle part not found', async () => {
      repositories.part.findById.mockResolvedValue(null);
      await expect(service.create(createDto)).rejects.toThrow('Not found');
    });

    it('TC0008 - Should handle inactive part', async () => {
      repositories.part.findById.mockResolvedValue({
        ...mockPart,
        isActive: false,
      });
      await expect(service.create(createDto)).rejects.toThrow('Exception');
    });

    it('TC0009 - Should handle insufficient part stock', async () => {
      repositories.part.findById.mockResolvedValue({ ...mockPart, stock: 1 });
      await expect(service.create(createDto)).rejects.toThrow('Exception');
    });
  });

  describe('create - edge cases', () => {
    it('TC0001 - Should create service order with no services or parts', async () => {
      const emptyDto = {
        ...createDto,
        services: [],
        parts: [],
      };
      repositories.customer.findById.mockResolvedValue(mockCustomer);
      repositories.vehicle.findById.mockResolvedValue(mockVehicle);
      repositories.serviceOrder.create.mockResolvedValue(mockServiceOrder);
      jest
        .spyOn(service, 'findById')
        .mockResolvedValue(mockServiceOrder as any);
      const result = await service.create(emptyDto);
      expect(result).toBeDefined();
      expect(repositories.serviceOrder.create).toHaveBeenCalled();
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
  });

  describe('findAllPaginated', () => {
    it('TC0001 - Should return paginated service orders', async () => {
      const paginationDto = { page: 1, size: 10, skip: 0, take: 10 };
      repositories.serviceOrder.findMany.mockResolvedValue([mockServiceOrder]);
      repositories.serviceOrder.count.mockResolvedValue(1);
      repositories.customer.findById.mockResolvedValue(mockCustomer);
      repositories.vehicle.findById.mockResolvedValue(mockVehicle);
      services.mechanic.findById.mockResolvedValue(mockMechanic);
      services.prisma.serviceOrderItem.findMany.mockResolvedValue([]);
      services.prisma.serviceOrderPart.findMany.mockResolvedValue([]);

      const result = await service.findAllPaginated(paginationDto);

      expect(result.data).toHaveLength(1);
      expect(result.pagination.totalRecords).toBe(1);
      expect(result.pagination.totalPages).toBe(1);
      expect(repositories.serviceOrder.findMany).toHaveBeenCalled();
      expect(repositories.serviceOrder.count).toHaveBeenCalled();
    });

    it('TC0002 - Should return empty paginated result', async () => {
      const paginationDto = { page: 1, size: 10, skip: 0, take: 10 };
      repositories.serviceOrder.findMany.mockResolvedValue([]);
      repositories.serviceOrder.count.mockResolvedValue(0);

      const result = await service.findAllPaginated(paginationDto);

      expect(result.data).toHaveLength(0);
      expect(result.pagination.totalRecords).toBe(0);
      expect(result.pagination.totalPages).toBe(0);
    });
  });

  describe('findAllPaginatedWithPriority', () => {
    it('TC0001 - Should return paginated service orders with priority', async () => {
      const paginationDto = { page: 0, size: 10, skip: 0, take: 10 };
      repositories.serviceOrder.findManyWithPriority.mockResolvedValue([
        mockServiceOrder,
      ]);
      repositories.serviceOrder.countWithPriority.mockResolvedValue(1);
      repositories.customer.findById.mockResolvedValue(mockCustomer);
      repositories.vehicle.findById.mockResolvedValue(mockVehicle);
      services.mechanic.findById.mockResolvedValue(mockMechanic);
      services.prisma.serviceOrderItem.findMany.mockResolvedValue([]);
      services.prisma.serviceOrderPart.findMany.mockResolvedValue([]);

      const result = await service.findAllPaginatedWithPriority(paginationDto);

      expect(result.data).toHaveLength(1);
      expect(result.pagination.totalRecords).toBe(1);
      expect(result.pagination.page).toBe(0);
      expect(repositories.serviceOrder.findManyWithPriority).toHaveBeenCalledWith(
        0,
        10,
      );
      expect(
        repositories.serviceOrder.countWithPriority,
      ).toHaveBeenCalled();
    });

    it('TC0002 - Should return empty paginated result with priority', async () => {
      const paginationDto = { page: 0, size: 10, skip: 0, take: 10 };
      repositories.serviceOrder.findManyWithPriority.mockResolvedValue([]);
      repositories.serviceOrder.countWithPriority.mockResolvedValue(0);

      const result = await service.findAllPaginatedWithPriority(paginationDto);

      expect(result.data).toHaveLength(0);
      expect(result.pagination.totalRecords).toBe(0);
      expect(result.pagination.totalPages).toBe(0);
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
    const updateDto: UpdateServiceOrderStatusDto = {
      status: ServiceOrderStatus.EM_EXECUCAO,
      notes: faker.lorem.sentence(),
    };

    it('TC0001 - Should update status to EM_EXECUCAO successfully', async () => {
      const orderWithMechanic = {
        ...mockServiceOrder,
        status: ServiceOrderStatus.EM_DIAGNOSTICO,
        mechanicId: mockMechanic.id,
      };
      repositories.serviceOrder.findById.mockResolvedValue(orderWithMechanic);
      services.mechanic.findById.mockResolvedValue(mockMechanic);
      services.mechanic.markAsUnavailable.mockResolvedValue(undefined);
      repositories.serviceOrder.updateStatus.mockResolvedValue(undefined);
      repositories.serviceOrder.addStatusHistory.mockResolvedValue(undefined);
      jest
        .spyOn(service, 'findById')
        .mockResolvedValue(mockServiceOrder as any);

      const result = await service.updateStatus(mockServiceOrder.id, updateDto);

      expect(result).toBeDefined();
      expect(repositories.serviceOrder.updateStatus).toHaveBeenCalled();
      expect(services.mechanic.markAsUnavailable).toHaveBeenCalledWith(
        mockMechanic.id,
      );
    });

    it('TC0002 - Should handle service order not found', async () => {
      repositories.serviceOrder.findById.mockResolvedValue(null);
      await expect(
        service.updateStatus(faker.string.uuid(), updateDto),
      ).rejects.toThrow('Not found');
    });

    it('TC0003 - Should handle missing mechanic for EM_EXECUCAO', async () => {
      const orderWithoutMechanic = {
        ...mockServiceOrder,
        status: ServiceOrderStatus.EM_DIAGNOSTICO,
        mechanicId: null,
      };
      repositories.serviceOrder.findById.mockResolvedValue(
        orderWithoutMechanic,
      );

      await expect(
        service.updateStatus(mockServiceOrder.id, updateDto),
      ).rejects.toThrow('Exception');
    });

    it('TC0004 - Should handle unavailable mechanic for EM_EXECUCAO', async () => {
      const orderWithMechanic = {
        ...mockServiceOrder,
        status: ServiceOrderStatus.EM_DIAGNOSTICO,
        mechanicId: mockMechanic.id,
      };
      repositories.serviceOrder.findById.mockResolvedValue(orderWithMechanic);
      services.mechanic.findById.mockResolvedValue({
        ...mockMechanic,
        isAvailable: false,
      });

      await expect(
        service.updateStatus(mockServiceOrder.id, updateDto),
      ).rejects.toThrow();
    });

    it('TC0005 - Should update status to FINALIZADA and release mechanic', async () => {
      const finalizadaDto = {
        status: ServiceOrderStatus.FINALIZADA,
        notes: faker.lorem.sentence(),
      };
      const orderEmExecucao = {
        ...mockServiceOrder,
        status: ServiceOrderStatus.EM_EXECUCAO,
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
        status: ServiceOrderStatus.ENTREGUE,
        notes: faker.lorem.sentence(),
      };
      const orderFinalizada = {
        ...mockServiceOrder,
        status: ServiceOrderStatus.FINALIZADA,
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
        status: ServiceOrderStatus.AGUARDANDO_APROVACAO,
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
        { id: faker.string.uuid(), status: ServiceOrderStatus.RECEBIDA },
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
      const aguardandoDto = {
        status: ServiceOrderStatus.AGUARDANDO_APROVACAO,
        notes: faker.lorem.sentence(),
      };
      const orderEmDiagnostico = {
        ...mockServiceOrder,
        status: ServiceOrderStatus.EM_DIAGNOSTICO,
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

      const result = await service.updateStatus(
        mockServiceOrder.id,
        aguardandoDto,
      );

      expect(result).toBeDefined();
      expect(repositories.serviceOrder.updateStatus).toHaveBeenCalled();
      expect(
        services.notification.sendServiceOrderStatusNotification,
      ).toHaveBeenCalled();
    });

    it('TC0002 - Should handle notification error gracefully', async () => {
      const aguardandoDto = {
        status: ServiceOrderStatus.AGUARDANDO_APROVACAO,
        notes: faker.lorem.sentence(),
      };
      const orderEmDiagnostico = {
        ...mockServiceOrder,
        status: ServiceOrderStatus.EM_DIAGNOSTICO,
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

      const loggerWarnSpy = jest.spyOn(service['logger'], 'warn');

      const result = await service.updateStatus(
        mockServiceOrder.id,
        aguardandoDto,
      );

      expect(result).toBeDefined();
      expect(repositories.serviceOrder.updateStatus).toHaveBeenCalled();
      expect(loggerWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to send email notification'),
      );
    });

    it('TC0003 - Should skip notification if customer or vehicle not found', async () => {
      const aguardandoDto = {
        status: ServiceOrderStatus.AGUARDANDO_APROVACAO,
        notes: faker.lorem.sentence(),
      };
      const orderEmDiagnostico = {
        ...mockServiceOrder,
        status: ServiceOrderStatus.EM_DIAGNOSTICO,
      };
      repositories.serviceOrder.findById.mockResolvedValue(orderEmDiagnostico);
      repositories.serviceOrder.updateStatus.mockResolvedValue(undefined);
      repositories.serviceOrder.addStatusHistory.mockResolvedValue(undefined);
      repositories.customer.findById.mockResolvedValue(null);
      repositories.vehicle.findById.mockResolvedValue(null);
      jest
        .spyOn(service, 'findById')
        .mockResolvedValue(mockServiceOrder as any);

      const result = await service.updateStatus(
        mockServiceOrder.id,
        aguardandoDto,
      );

      expect(result).toBeDefined();
      expect(
        services.notification.sendServiceOrderStatusNotification,
      ).not.toHaveBeenCalled();
    });

    it('TC0004 - Should handle push notification error gracefully', async () => {
      const aguardandoDto = {
        status: ServiceOrderStatus.AGUARDANDO_APROVACAO,
        notes: faker.lorem.sentence(),
      };
      const orderEmDiagnostico = {
        ...mockServiceOrder,
        status: ServiceOrderStatus.EM_DIAGNOSTICO,
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

      const loggerWarnSpy = jest.spyOn(service['logger'], 'warn');

      const result = await service.updateStatus(
        mockServiceOrder.id,
        aguardandoDto,
      );

      expect(result).toBeDefined();
      expect(repositories.serviceOrder.updateStatus).toHaveBeenCalled();
      expect(loggerWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to send push notification'),
      );
    });
  });

  describe('validateStatusTransition', () => {
    it('TC0001 - Should throw error on invalid status transition', async () => {
      const invalidDto = {
        status: ServiceOrderStatus.ENTREGUE,
        notes: faker.lorem.sentence(),
      };
      const orderRecebida = {
        ...mockServiceOrder,
        status: ServiceOrderStatus.RECEBIDA,
      };
      repositories.serviceOrder.findById.mockResolvedValue(orderRecebida);

      await expect(
        service.updateStatus(mockServiceOrder.id, invalidDto),
      ).rejects.toThrow('Exception');
    });

    it('TC0002 - Should throw error when trying to go back to RECEBIDA', async () => {
      const invalidDto = {
        status: ServiceOrderStatus.RECEBIDA,
        notes: faker.lorem.sentence(),
      };
      const orderEmDiagnostico = {
        ...mockServiceOrder,
        status: ServiceOrderStatus.EM_DIAGNOSTICO,
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
        price: new Decimal(100),
        totalPrice: new Decimal(100),
      };
      const mockPartItem = {
        id: faker.string.uuid(),
        serviceOrderId: mockServiceOrder.id,
        partId: mockPart.id,
        quantity: 2,
        price: new Decimal(50),
        totalPrice: new Decimal(100),
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
        price: new Decimal(100),
        totalPrice: new Decimal(100),
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
        price: new Decimal(50),
        totalPrice: new Decimal(100),
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
});
