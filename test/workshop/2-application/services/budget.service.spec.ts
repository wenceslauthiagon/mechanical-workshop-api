import { Test, TestingModule } from '@nestjs/testing';
import { ServiceOrderStatus } from '../../../../src/shared/enums/service-order-status.enum';
import { CustomerType } from '../../../../src/shared/enums/customer-type.enum';
import { faker } from '@faker-js/faker/locale/pt_BR';
import { Decimal } from '@prisma/client/runtime/library';

import { BudgetService } from '../../../../src/workshop/2-application/services/budget.service';
import { ErrorHandlerService } from '../../../../src/shared/services/error-handler.service';
import { NotificationService } from '../../../../src/workshop/2-application/services/notification.service';
import { BudgetStatus } from '../../../../src/workshop/3-domain/entities/budget.entity';
import { BUDGET_CONSTANTS } from '../../../../src/shared/constants/budget.constants';

describe('BudgetService', () => {
  let service: BudgetService;
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

  const mockServiceOrder = {
    id: faker.string.uuid(),
    orderNumber: `OS-${new Date().getFullYear()}-${faker.string.numeric(4)}`,
    customerId: mockCustomer.id,
    vehicleId: faker.string.uuid(),
    mechanicId: faker.string.uuid(),
    description: faker.lorem.sentence(),
    status: ServiceOrderStatus.AWAITING_APPROVAL,
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

  const mockService = {
    id: faker.string.uuid(),
    name: faker.commerce.productName(),
    description: faker.lorem.sentence(),
    price: new Decimal(100),
    estimatedMinutes: 60,
    category: faker.commerce.department(),
    isActive: true,
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
  };

  const mockPart = {
    id: faker.string.uuid(),
    name: faker.commerce.productName(),
    description: faker.lorem.sentence(),
    price: new Decimal(50),
    partNumber: faker.string.alphanumeric(8),
    stock: 10,
    minStock: 2,
    supplier: faker.company.name(),
    isActive: true,
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
  };

  const mockBudgetItem = {
    id: faker.string.uuid(),
    type: 'SERVICE' as const,
    serviceId: mockService.id,
    partId: undefined,
    description: faker.lorem.sentence(),
    quantity: 1,
    unitPrice: 100,
    total: 100,
  };

  const mockBudget = {
    id: faker.string.uuid(),
    serviceOrderId: mockServiceOrder.id,
    customerId: mockCustomer.id,
    subtotal: 150,
    taxes: 15,
    discount: 0,
    total: 165,
    validUntil: faker.date.future(),
    status: BudgetStatus.DRAFT,
    items: [mockBudgetItem],
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
  };

  const createBudgetDto = {
    serviceOrderId: mockServiceOrder.id,
    customerId: mockCustomer.id,
    subtotal: 150,
    taxes: 15,
    discount: 0,
    total: 165,
    validUntil: faker.date.future(),
    items: [mockBudgetItem],
  };

  beforeEach(async () => {
    repositories = {
      budget: {
        create: jest.fn(),
        findAll: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        findById: jest.fn(),
        update: jest.fn(),
        updateStatus: jest.fn(),
        delete: jest.fn(),
        findByServiceOrderId: jest.fn(),
        findByCustomerId: jest.fn(),
        findExpired: jest.fn(),
        markAsExpired: jest.fn(),
        findByStatus: jest.fn(),
      },
      serviceOrder: {
        findById: jest.fn(),
        update: jest.fn(),
        updateStatus: jest.fn(),
        addStatusHistory: jest.fn(),
      },
      customer: {
        findById: jest.fn(),
      },
      service: {
        findById: jest.fn(),
      },
      part: {
        findById: jest.fn(),
      },
    };

    services = {
      errorHandler: {
        handleNotFoundError: jest.fn().mockImplementation((msg) => {
          throw new Error(msg);
        }),
        handleConflictError: jest.fn().mockImplementation((msg) => {
          throw new Error(msg);
        }),
        handleError: jest.fn().mockImplementation((err) => {
          throw err;
        }),
      },
      notification: {
        sendBudgetNotification: jest.fn(),
        sendBudgetReadyNotification: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BudgetService,
        {
          provide: 'IBudgetRepository',
          useValue: repositories.budget,
        },
        {
          provide: 'IServiceOrderRepository',
          useValue: repositories.serviceOrder,
        },
        {
          provide: 'ICustomerRepository',
          useValue: repositories.customer,
        },
        {
          provide: 'IServiceRepository',
          useValue: repositories.service,
        },
        {
          provide: 'IPartRepository',
          useValue: repositories.part,
        },
        {
          provide: ErrorHandlerService,
          useValue: services.errorHandler,
        },
        {
          provide: NotificationService,
          useValue: services.notification,
        },
      ],
    }).compile();

    service = module.get<BudgetService>(BudgetService);
  });

  describe('create', () => {
    it('TC0001 - Should create budget successfully', async () => {
      repositories.serviceOrder.findById.mockResolvedValue(mockServiceOrder);
      repositories.customer.findById.mockResolvedValue(mockCustomer);
      repositories.budget.findByServiceOrderId.mockResolvedValue([]);
      repositories.budget.create.mockResolvedValue(mockBudget);

      const result = await service.create(createBudgetDto);

      expect(repositories.budget.create).toHaveBeenCalledWith(createBudgetDto);
      expect(result).toEqual(mockBudget);
    });

    it('TC0002 - Should throw error if service order not found', async () => {
      repositories.serviceOrder.findById.mockResolvedValue(null);

      await expect(service.create(createBudgetDto)).rejects.toThrow();
      expect(services.errorHandler.handleNotFoundError).toHaveBeenCalled();
    });

    it('TC0003 - Should throw error if customer not found', async () => {
      repositories.serviceOrder.findById.mockResolvedValue(mockServiceOrder);
      repositories.customer.findById.mockResolvedValue(null);

      await expect(service.create(createBudgetDto)).rejects.toThrow();
      expect(services.errorHandler.handleNotFoundError).toHaveBeenCalled();
    });

    it('TC0004 - Should throw error if items are empty', async () => {
      repositories.serviceOrder.findById.mockResolvedValue(mockServiceOrder);
      repositories.customer.findById.mockResolvedValue(mockCustomer);
      const invalidDto = { ...createBudgetDto, items: [] };

      await expect(service.create(invalidDto)).rejects.toThrow();
      expect(services.errorHandler.handleError).toHaveBeenCalled();
    });

    it('TC0005 - Should throw error if active budget exists', async () => {
      repositories.serviceOrder.findById.mockResolvedValue(mockServiceOrder);
      repositories.customer.findById.mockResolvedValue(mockCustomer);
      repositories.budget.findByServiceOrderId.mockResolvedValue([
        { ...mockBudget, status: BudgetStatus.DRAFT },
      ]);

      await expect(service.create(createBudgetDto)).rejects.toThrow();
      expect(services.errorHandler.handleConflictError).toHaveBeenCalled();
    });

    it('TC0006 - Should handle error during creation', async () => {
      repositories.serviceOrder.findById.mockResolvedValue(mockServiceOrder);
      repositories.customer.findById.mockResolvedValue(mockCustomer);
      repositories.budget.findByServiceOrderId.mockResolvedValue([]);
      const error = new Error('Database error');
      repositories.budget.create.mockRejectedValue(error);

      await expect(service.create(createBudgetDto)).rejects.toThrow(error);
    });
  });

  describe('findAll', () => {
    it('TC0001 - Should return all budgets', async () => {
      const budgets = [mockBudget, { ...mockBudget, id: faker.string.uuid() }];
      repositories.budget.findAll.mockResolvedValue(budgets);

      const result = await service.findAll();

      expect(repositories.budget.findAll).toHaveBeenCalled();
      expect(result).toEqual(budgets);
    });

    it('TC0002 - Should return empty array when no budgets exist', async () => {
      repositories.budget.findAll.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });

    it('TC0003 - Should handle error', async () => {
      const error = new Error('Database error');
      repositories.budget.findAll.mockRejectedValue(error);

      await expect(service.findAll()).rejects.toThrow(error);
      expect(services.errorHandler.handleError).toHaveBeenCalledWith(error);
    });
  });

  describe('findAllPaginated', () => {
    it('TC0001 - Should return paginated budgets', async () => {
      const budgets = [mockBudget, { ...mockBudget, id: faker.string.uuid() }];
      repositories.budget.findMany.mockResolvedValue(budgets);
      repositories.budget.count.mockResolvedValue(10);

      const paginationDto = { page: 0, size: 10, skip: 0, take: 10 };
      const result = await service.findAllPaginated(paginationDto);

      expect(repositories.budget.findMany).toHaveBeenCalledWith(0, 10);
      expect(repositories.budget.count).toHaveBeenCalled();
      expect(result.data).toEqual(budgets);
      expect(result.pagination.totalRecords).toBe(10);
    });

    it('TC0002 - Should handle error', async () => {
      const error = new Error('Database error');
      repositories.budget.findMany.mockRejectedValue(error);

      const paginationDto = { page: 0, size: 10, skip: 0, take: 10 };
      await expect(service.findAllPaginated(paginationDto)).rejects.toThrow(error);
      expect(services.errorHandler.handleError).toHaveBeenCalledWith(error);
    });
  });

  describe('findById', () => {
    it('TC0001 - Should return budget by id', async () => {
      repositories.budget.findById.mockResolvedValue(mockBudget);

      const result = await service.findById(mockBudget.id);

      expect(result).toEqual(mockBudget);
    });

    it('TC0002 - Should throw error if not found', async () => {
      repositories.budget.findById.mockResolvedValue(null);

      await expect(service.findById(faker.string.uuid())).rejects.toThrow(
        'Orçamento não encontrado',
      );
    });

    it('TC0003 - Should handle error', async () => {
      repositories.budget.findById.mockRejectedValue(new Error('DB error'));

      await expect(service.findById(mockBudget.id)).rejects.toThrow('DB error');
    });

    it('TC0004 - Should use createBudgetDto in test', () => {
      expect(createBudgetDto).toBeDefined();
      expect(createBudgetDto.serviceOrderId).toBe(mockServiceOrder.id);
    });
  });

  describe('findByServiceOrderId', () => {
    it('TC0001 - Should return budgets by service order id', async () => {
      repositories.budget.findByServiceOrderId.mockResolvedValue([mockBudget]);

      const result = await service.findByServiceOrderId(mockServiceOrder.id);

      expect(result).toEqual([mockBudget]);
    });

    it('TC0002 - Should handle error', async () => {
      repositories.budget.findByServiceOrderId.mockRejectedValue(
        new Error('DB error'),
      );

      await expect(
        service.findByServiceOrderId(mockServiceOrder.id),
      ).rejects.toThrow('DB error');
    });
  });

  describe('update', () => {
    const updateDto = { discount: 10, total: 155 };

    it('TC0001 - Should update budget successfully', async () => {
      repositories.budget.findById.mockResolvedValue(mockBudget);
      repositories.budget.update.mockResolvedValue({
        ...mockBudget,
        ...updateDto,
      });

      const result = await service.update(mockBudget.id, updateDto);

      expect(result).toEqual({ ...mockBudget, ...updateDto });
    });

    it('TC0002 - Should throw error if budget not found', async () => {
      repositories.budget.findById.mockResolvedValue(null);

      await expect(service.update(mockBudget.id, updateDto)).rejects.toThrow(
        'Orçamento não encontrado',
      );
    });

    it('TC0003 - Should handle error', async () => {
      repositories.budget.findById.mockResolvedValue(mockBudget);
      repositories.budget.update.mockRejectedValue(new Error('DB error'));

      await expect(service.update(mockBudget.id, updateDto)).rejects.toThrow(
        'DB error',
      );
    });
  });

  describe('sendBudget', () => {
    it('TC0001 - Should send budget successfully', async () => {
      const sentBudget = { ...mockBudget, status: BudgetStatus.SENT };
      repositories.budget.findById.mockResolvedValue(mockBudget);
      repositories.budget.updateStatus.mockResolvedValue(sentBudget);
      repositories.customer.findById.mockResolvedValue(mockCustomer);

      const result = await service.sendBudget(mockBudget.id);

      expect(result).toEqual(sentBudget);
      expect(
        services.notification.sendBudgetReadyNotification,
      ).toHaveBeenCalled();
    });

    it('TC0002 - Should send budget without phone when customer has no phone', async () => {
      const sentBudget = { ...mockBudget, status: BudgetStatus.SENT };
      const customerWithoutPhone = { ...mockCustomer, phone: null };
      repositories.budget.findById.mockResolvedValue(mockBudget);
      repositories.budget.updateStatus.mockResolvedValue(sentBudget);
      repositories.customer.findById.mockResolvedValue(customerWithoutPhone);

      const result = await service.sendBudget(mockBudget.id);

      expect(result).toEqual(sentBudget);
      expect(
        services.notification.sendBudgetReadyNotification,
      ).toHaveBeenCalledWith(
        sentBudget,
        customerWithoutPhone.email,
        customerWithoutPhone.name,
        undefined,
      );
    });

    it('TC0003 - Should throw error if not draft', async () => {
      const sentBudget = { ...mockBudget, status: BudgetStatus.SENT };
      repositories.budget.findById.mockResolvedValue(sentBudget);

      await expect(service.sendBudget(mockBudget.id)).rejects.toThrow();
      expect(services.errorHandler.handleError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: BUDGET_CONSTANTS.MESSAGES.ONLY_DRAFT_CAN_BE_SENT,
        }),
      );
    });

    it('TC0004 - Should handle errors through errorHandler', async () => {
      const error = new Error('DB error');
      repositories.budget.findById.mockResolvedValue(mockBudget);
      repositories.budget.updateStatus.mockRejectedValue(error);

      await expect(service.sendBudget(mockBudget.id)).rejects.toThrow(
        'DB error',
      );
      expect(services.errorHandler.handleError).toHaveBeenCalledWith(error);
    });

    it('TC0005 - Should send budget even when customer is not found', async () => {
      const sentBudget = { ...mockBudget, status: BudgetStatus.SENT };
      repositories.budget.findById.mockResolvedValue(mockBudget);
      repositories.budget.updateStatus.mockResolvedValue(sentBudget);
      repositories.customer.findById.mockResolvedValue(null);

      const result = await service.sendBudget(mockBudget.id);

      expect(result).toEqual(sentBudget);
      expect(
        services.notification.sendBudgetReadyNotification,
      ).not.toHaveBeenCalled();
    });
  });

  describe('approveBudget', () => {
    it('TC0001 - Should approve budget successfully', async () => {
      const sentBudget = { ...mockBudget, status: BudgetStatus.SENT };
      const approvedBudget = { ...mockBudget, status: BudgetStatus.APPROVED };
      repositories.budget.findById.mockResolvedValue(sentBudget);
      repositories.budget.updateStatus.mockResolvedValue(approvedBudget);
      repositories.serviceOrder.updateStatus.mockResolvedValue({
        ...mockServiceOrder,
        status: ServiceOrderStatus.IN_EXECUTION,
      });
      repositories.serviceOrder.addStatusHistory.mockResolvedValue(undefined);

      const result = await service.approveBudget(mockBudget.id);

      expect(result.status).toBe(BudgetStatus.APPROVED);
      expect(repositories.budget.updateStatus).toHaveBeenCalledWith(
        mockBudget.id,
        BudgetStatus.APPROVED
      );
      expect(repositories.serviceOrder.updateStatus).toHaveBeenCalled();
      expect(repositories.serviceOrder.addStatusHistory).toHaveBeenCalled();
    });

    it('TC0002 - Should throw error if budget not found', async () => {
      repositories.budget.findById.mockResolvedValue(null);

      await expect(service.approveBudget(mockBudget.id)).rejects.toThrow();
      expect(services.errorHandler.handleNotFoundError).toHaveBeenCalled();
    });

    it('TC0003 - Should throw error if budget is not in sent status', async () => {
      const draftBudget = { ...mockBudget, status: BudgetStatus.DRAFT };
      repositories.budget.findById.mockResolvedValue(draftBudget);

      await expect(service.approveBudget(mockBudget.id)).rejects.toThrow();
      expect(services.errorHandler.handleError).toHaveBeenCalled();
    });

    it('TC0004 - Should handle error', async () => {
      const error = new Error('Database error');
      repositories.budget.findById.mockRejectedValue(error);

      await expect(service.approveBudget(mockBudget.id)).rejects.toThrow(error);
      expect(services.errorHandler.handleError).toHaveBeenCalledWith(error);
    });

    it('TC0005 - Should throw error if budget is expired', async () => {
      const expiredBudget = { 
        ...mockBudget, 
        status: BudgetStatus.SENT,
        validUntil: faker.date.past()
      };
      repositories.budget.findById.mockResolvedValue(expiredBudget);

      await expect(service.approveBudget(mockBudget.id)).rejects.toThrow();
      expect(services.errorHandler.handleError).toHaveBeenCalled();
    });
  });

  describe('rejectBudget', () => {
    it('TC0001 - Should reject budget successfully', async () => {
      const sentBudget = { ...mockBudget, status: BudgetStatus.SENT };
      const rejectedBudget = { ...mockBudget, status: BudgetStatus.REJECTED };
      repositories.budget.findById.mockResolvedValue(sentBudget);
      repositories.budget.updateStatus.mockResolvedValue(rejectedBudget);

      const result = await service.rejectBudget(mockBudget.id);

      expect(result.status).toBe(BudgetStatus.REJECTED);
      expect(repositories.budget.updateStatus).toHaveBeenCalledWith(
        mockBudget.id,
        BudgetStatus.REJECTED
      );
    });

    it('TC0002 - Should throw error if budget not found', async () => {
      repositories.budget.findById.mockResolvedValue(null);

      await expect(service.rejectBudget(mockBudget.id)).rejects.toThrow();
      expect(services.errorHandler.handleNotFoundError).toHaveBeenCalled();
    });

    it('TC0003 - Should throw error if budget is not in sent status', async () => {
      const draftBudget = { ...mockBudget, status: BudgetStatus.DRAFT };
      repositories.budget.findById.mockResolvedValue(draftBudget);

      await expect(service.rejectBudget(mockBudget.id)).rejects.toThrow();
      expect(services.errorHandler.handleError).toHaveBeenCalled();
    });

    it('TC0004 - Should handle error', async () => {
      const error = new Error('Database error');
      repositories.budget.findById.mockRejectedValue(error);

      await expect(service.rejectBudget(mockBudget.id)).rejects.toThrow(error);
      expect(services.errorHandler.handleError).toHaveBeenCalledWith(error);
    });
  });

  describe('delete', () => {
    it('TC0001 - Should delete budget successfully', async () => {
      repositories.budget.findById.mockResolvedValue(mockBudget);
      repositories.budget.delete.mockResolvedValue(undefined);

      await service.delete(mockBudget.id);

      expect(repositories.budget.findById).toHaveBeenCalledWith(mockBudget.id);
      expect(repositories.budget.delete).toHaveBeenCalledWith(mockBudget.id);
    });

    it('TC0002 - Should throw error if budget not found', async () => {
      repositories.budget.findById.mockResolvedValue(null);

      await expect(service.delete(mockBudget.id)).rejects.toThrow();
      expect(services.errorHandler.handleNotFoundError).toHaveBeenCalled();
    });

    it('TC0003 - Should handle error', async () => {
      const error = new Error('Database error');
      repositories.budget.findById.mockRejectedValue(error);

      await expect(service.delete(mockBudget.id)).rejects.toThrow(error);
      expect(services.errorHandler.handleError).toHaveBeenCalledWith(error);
    });
  });

  describe('findExpiredBudgets', () => {
    it('TC0001 - Should return expired budgets', async () => {
      const expiredBudgets = [
        { ...mockBudget, validUntil: faker.date.past() },
        { ...mockBudget, id: faker.string.uuid(), validUntil: faker.date.past() },
      ];
      repositories.budget.findExpired.mockResolvedValue(expiredBudgets);

      const result = await service.findExpiredBudgets();

      expect(repositories.budget.findExpired).toHaveBeenCalled();
      expect(result).toEqual(expiredBudgets);
    });

    it('TC0002 - Should return empty array when no expired budgets', async () => {
      repositories.budget.findExpired.mockResolvedValue([]);

      const result = await service.findExpiredBudgets();

      expect(result).toEqual([]);
    });

    it('TC0003 - Should handle error', async () => {
      const error = new Error('Database error');
      repositories.budget.findExpired.mockRejectedValue(error);

      await expect(service.findExpiredBudgets()).rejects.toThrow(error);
      expect(services.errorHandler.handleError).toHaveBeenCalledWith(error);
    });
  });

  describe('markAsExpired', () => {
    it('TC0001 - Should mark budget as expired successfully', async () => {
      const draftBudget = { ...mockBudget, status: BudgetStatus.DRAFT };
      const expiredBudget = { ...mockBudget, status: BudgetStatus.EXPIRED };
      repositories.budget.findById.mockResolvedValue(draftBudget);
      repositories.budget.markAsExpired.mockResolvedValue(expiredBudget);

      const result = await service.markAsExpired(mockBudget.id);

      expect(result.status).toBe(BudgetStatus.EXPIRED);
      expect(repositories.budget.markAsExpired).toHaveBeenCalledWith(mockBudget.id);
    });

    it('TC0002 - Should throw error if budget not found', async () => {
      repositories.budget.findById.mockResolvedValue(null);

      await expect(service.markAsExpired(mockBudget.id)).rejects.toThrow();
      expect(services.errorHandler.handleNotFoundError).toHaveBeenCalled();
    });

    it('TC0003 - Should handle error', async () => {
      const error = new Error('Database error');
      repositories.budget.findById.mockRejectedValue(error);

      await expect(service.markAsExpired(mockBudget.id)).rejects.toThrow(error);
      expect(services.errorHandler.handleError).toHaveBeenCalledWith(error);
    });

    it('TC0004 - Should throw error for invalid status transition', async () => {
      const approvedBudget = { ...mockBudget, status: BudgetStatus.APPROVED };
      repositories.budget.findById.mockResolvedValue(approvedBudget);

      await expect(service.markAsExpired(mockBudget.id)).rejects.toThrow();
      expect(services.errorHandler.handleError).toHaveBeenCalled();
    });
  });

  describe('findByCustomerId', () => {
    it('TC0001 - Should return budgets by customer id', async () => {
      const budgets = [mockBudget, { ...mockBudget, id: faker.string.uuid() }];
      repositories.budget.findByCustomerId.mockResolvedValue(budgets);

      const result = await service.findByCustomerId(mockCustomer.id);

      expect(repositories.budget.findByCustomerId).toHaveBeenCalledWith(mockCustomer.id);
      expect(result).toEqual(budgets);
    });

    it('TC0002 - Should return empty array when no budgets found', async () => {
      repositories.budget.findByCustomerId.mockResolvedValue([]);

      const result = await service.findByCustomerId(mockCustomer.id);

      expect(result).toEqual([]);
    });

    it('TC0003 - Should handle error', async () => {
      const error = new Error('Database error');
      repositories.budget.findByCustomerId.mockRejectedValue(error);

      await expect(service.findByCustomerId(mockCustomer.id)).rejects.toThrow(error);
      expect(services.errorHandler.handleError).toHaveBeenCalledWith(error);
    });
  });

  describe('findByStatus', () => {
    it('TC0001 - Should return budgets by status', async () => {
      const budgets = [mockBudget, { ...mockBudget, id: faker.string.uuid() }];
      repositories.budget.findByStatus.mockResolvedValue(budgets);

      const result = await service.findByStatus(BudgetStatus.DRAFT);

      expect(repositories.budget.findByStatus).toHaveBeenCalledWith(BudgetStatus.DRAFT);
      expect(result).toEqual(budgets);
    });

    it('TC0002 - Should return empty array when no budgets with status', async () => {
      repositories.budget.findByStatus.mockResolvedValue([]);

      const result = await service.findByStatus(BudgetStatus.APPROVED);

      expect(result).toEqual([]);
    });

    it('TC0003 - Should handle error', async () => {
      const error = new Error('Database error');
      repositories.budget.findByStatus.mockRejectedValue(error);

      await expect(service.findByStatus(BudgetStatus.DRAFT)).rejects.toThrow(error);
      expect(services.errorHandler.handleError).toHaveBeenCalledWith(error);
    });
  });

  describe('findAllWithRelations', () => {
    it('TC0001 - Should return all budgets with relations', async () => {
      const budgets = [mockBudget, { ...mockBudget, id: faker.string.uuid() }];
      repositories.budget.findAll.mockResolvedValue(budgets);
      repositories.customer.findById.mockResolvedValue(mockCustomer);
      repositories.serviceOrder.findById.mockResolvedValue(mockServiceOrder);
      repositories.service.findById.mockResolvedValue(mockService);

      const result = await service.findAllWithRelations();

      expect(result).toHaveLength(2);
      expect(result[0].customer).toBeDefined();
      expect(result[0].serviceOrder).toBeDefined();
    });

    it('TC0002 - Should return empty array when no budgets', async () => {
      repositories.budget.findAll.mockResolvedValue([]);

      const result = await service.findAllWithRelations();

      expect(result).toEqual([]);
    });

    it('TC0003 - Should handle error', async () => {
      const error = new Error('Database error');
      repositories.budget.findAll.mockRejectedValue(error);

      await expect(service.findAllWithRelations()).rejects.toThrow(error);
      expect(services.errorHandler.handleError).toHaveBeenCalledWith(error);
    });
  });

  describe('findByIdWithRelations', () => {
    it('TC0002 - Should include part data in items', async () => {
      const budgetWithPart = {
        ...mockBudget,
        items: [
          {
            id: faker.string.uuid(),
            type: 'PART' as const,
            serviceId: undefined,
            partId: mockPart.id,
            description: faker.lorem.sentence(),
            quantity: 2,
            unitPrice: 50,
            total: 100,
          },
        ],
      };
      repositories.budget.findById.mockResolvedValue(budgetWithPart);
      repositories.customer.findById.mockResolvedValue(mockCustomer);
      repositories.serviceOrder.findById.mockResolvedValue(mockServiceOrder);
      repositories.part.findById.mockResolvedValue(mockPart);

      const result = await service.findByIdWithRelations(mockBudget.id);

      expect(result.items[0].part).toBeDefined();
      expect(result.items[0].part?.name).toBe(mockPart.name);
      expect(result.items[0].part?.partNumber).toBe(mockPart.partNumber);
    });

    it('TC0003 - Should handle missing customer data', async () => {
      repositories.budget.findById.mockResolvedValue(mockBudget);
      repositories.customer.findById.mockResolvedValue(null);
      repositories.serviceOrder.findById.mockResolvedValue(mockServiceOrder);
      repositories.service.findById.mockResolvedValue(mockService);

      const result = await service.findByIdWithRelations(mockBudget.id);

      expect(result.customer.name).toBe('');
    });

    it('TC0004 - Should handle missing service order data', async () => {
      repositories.budget.findById.mockResolvedValue(mockBudget);
      repositories.customer.findById.mockResolvedValue(mockCustomer);
      repositories.serviceOrder.findById.mockResolvedValue(null);
      repositories.service.findById.mockResolvedValue(mockService);

      const result = await service.findByIdWithRelations(mockBudget.id);

      expect(result.serviceOrder.orderNumber).toBe('');
    });

    it('TC0005 - Should handle missing service data in items', async () => {
      repositories.budget.findById.mockResolvedValue(mockBudget);
      repositories.customer.findById.mockResolvedValue(mockCustomer);
      repositories.serviceOrder.findById.mockResolvedValue(mockServiceOrder);
      repositories.service.findById.mockResolvedValue(null);

      const result = await service.findByIdWithRelations(mockBudget.id);

      expect(result.items[0].service).toBeUndefined();
    });

    it('TC0006 - Should handle missing part data in items', async () => {
      const budgetWithPart = {
        ...mockBudget,
        items: [
          {
            id: faker.string.uuid(),
            type: 'PART' as const,
            serviceId: undefined,
            partId: mockPart.id,
            description: faker.lorem.sentence(),
            quantity: 2,
            unitPrice: 50,
            total: 100,
          },
        ],
      };
      repositories.budget.findById.mockResolvedValue(budgetWithPart);
      repositories.customer.findById.mockResolvedValue(mockCustomer);
      repositories.serviceOrder.findById.mockResolvedValue(mockServiceOrder);
      repositories.part.findById.mockResolvedValue(null);

      const result = await service.findByIdWithRelations(mockBudget.id);

      expect(result.items[0].part).toBeUndefined();
    });

    it('TC0007 - Should handle budget with empty items array', async () => {
      const budgetWithNoItems = { ...mockBudget, items: [] };
      repositories.budget.findById.mockResolvedValue(budgetWithNoItems);
      repositories.customer.findById.mockResolvedValue(mockCustomer);
      repositories.serviceOrder.findById.mockResolvedValue(mockServiceOrder);

      const result = await service.findByIdWithRelations(mockBudget.id);

      expect(result.items).toEqual([]);
    });

    it('TC0008 - Should handle budget with null items', async () => {
      const budgetWithNullItems = { ...mockBudget, items: null };
      repositories.budget.findById.mockResolvedValue(budgetWithNullItems);
      repositories.customer.findById.mockResolvedValue(mockCustomer);
      repositories.serviceOrder.findById.mockResolvedValue(mockServiceOrder);

      const result = await service.findByIdWithRelations(mockBudget.id);

      expect(result.items).toEqual([]);
    });

    it('TC0009 - Should handle error', async () => {
      const error = new Error('Database error');
      repositories.budget.findById.mockRejectedValue(error);

      await expect(service.findByIdWithRelations(mockBudget.id)).rejects.toThrow(error);
      expect(services.errorHandler.handleError).toHaveBeenCalledWith(error);
    });
  });

  describe('findByCustomerIdWithRelations', () => {
    it('TC0001 - Should return budgets by customer with relations', async () => {
      const budgets = [mockBudget, { ...mockBudget, id: faker.string.uuid() }];
      repositories.budget.findByCustomerId.mockResolvedValue(budgets);
      repositories.customer.findById.mockResolvedValue(mockCustomer);
      repositories.serviceOrder.findById.mockResolvedValue(mockServiceOrder);
      repositories.service.findById.mockResolvedValue(mockService);

      const result = await service.findByCustomerIdWithRelations(mockCustomer.id);

      expect(result).toHaveLength(2);
      expect(result[0].customer).toBeDefined();
      expect(result[0].serviceOrder).toBeDefined();
    });

    it('TC0002 - Should handle error', async () => {
      const error = new Error('Database error');
      repositories.budget.findByCustomerId.mockRejectedValue(error);

      await expect(service.findByCustomerIdWithRelations(mockCustomer.id)).rejects.toThrow(error);
      expect(services.errorHandler.handleError).toHaveBeenCalledWith(error);
    });
  });

  describe('findByServiceOrderIdWithRelations', () => {
    it('TC0001 - Should return budgets by service order with relations', async () => {
      const budgets = [mockBudget, { ...mockBudget, id: faker.string.uuid() }];
      repositories.budget.findByServiceOrderId.mockResolvedValue(budgets);
      repositories.customer.findById.mockResolvedValue(mockCustomer);
      repositories.serviceOrder.findById.mockResolvedValue(mockServiceOrder);
      repositories.service.findById.mockResolvedValue(mockService);

      const result = await service.findByServiceOrderIdWithRelations(mockServiceOrder.id);

      expect(result).toHaveLength(2);
      expect(result[0].customer).toBeDefined();
      expect(result[0].serviceOrder).toBeDefined();
    });

    it('TC0002 - Should handle error', async () => {
      const error = new Error('Database error');
      repositories.budget.findByServiceOrderId.mockRejectedValue(error);

      await expect(service.findByServiceOrderIdWithRelations(mockServiceOrder.id)).rejects.toThrow(error);
      expect(services.errorHandler.handleError).toHaveBeenCalledWith(error);
    });
  });
});
