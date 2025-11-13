import { Test, TestingModule } from '@nestjs/testing';
import { faker } from '@faker-js/faker/locale/pt_BR';
import { CustomerType, ServiceOrderStatus } from '@prisma/client';
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
    status: ServiceOrderStatus.AGUARDANDO_APROVACAO,
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
    status: BudgetStatus.RASCUNHO,
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
    const mockRepositories = {
      budget: {
        create: jest.fn(),
        findAll: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        findById: jest.fn(),
        findByServiceOrderId: jest.fn(),
        findByCustomerId: jest.fn(),
        findByStatus: jest.fn(),
        findExpired: jest.fn(),
        update: jest.fn(),
        updateStatus: jest.fn(),
        markAsExpired: jest.fn(),
        delete: jest.fn(),
      },
      customer: {
        findById: jest.fn(),
      },
      serviceOrder: {
        findById: jest.fn(),
        updateStatus: jest.fn(),
        addStatusHistory: jest.fn(),
      },
      service: {
        findById: jest.fn(),
      },
      part: {
        findById: jest.fn(),
      },
    };

    const mockServices = {
      errorHandler: {
        handleError: jest.fn().mockImplementation((error) => {
          throw error;
        }),
        handleNotFoundError: jest.fn().mockImplementation(() => {
          throw new Error('Not found');
        }),
        handleConflictError: jest.fn().mockImplementation(() => {
          throw new Error('Conflict');
        }),
      },
      notification: {
        sendBudgetReadyNotification: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BudgetService,
        { provide: 'IBudgetRepository', useValue: mockRepositories.budget },
        {
          provide: 'ICustomerRepository',
          useValue: mockRepositories.customer,
        },
        {
          provide: 'IServiceOrderRepository',
          useValue: mockRepositories.serviceOrder,
        },
        { provide: 'IServiceRepository', useValue: mockRepositories.service },
        { provide: 'IPartRepository', useValue: mockRepositories.part },
        { provide: ErrorHandlerService, useValue: mockServices.errorHandler },
        { provide: NotificationService, useValue: mockServices.notification },
      ],
    }).compile();

    service = module.get<BudgetService>(BudgetService);
    repositories = {
      budget: module.get('IBudgetRepository'),
      customer: module.get('ICustomerRepository'),
      serviceOrder: module.get('IServiceOrderRepository'),
      service: module.get('IServiceRepository'),
      part: module.get('IPartRepository'),
    };
    services = {
      errorHandler: module.get(ErrorHandlerService),
      notification: module.get(NotificationService),
    };
  });

  it('Should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    beforeEach(() => {
      repositories.serviceOrder.findById.mockResolvedValue(mockServiceOrder);
      repositories.customer.findById.mockResolvedValue(mockCustomer);
      repositories.budget.findByServiceOrderId.mockResolvedValue([]);
      repositories.budget.create.mockResolvedValue(mockBudget);
    });

    it('TC0001 - Should create budget successfully', async () => {
      const result = await service.create(createBudgetDto);

      expect(result).toEqual(mockBudget);
      expect(repositories.budget.create).toHaveBeenCalledWith(createBudgetDto);
    });

    it('TC0002 - Should throw error if service order not found', async () => {
      repositories.serviceOrder.findById.mockResolvedValue(null);

      await expect(service.create(createBudgetDto)).rejects.toThrow(
        'Not found',
      );
    });

    it('TC0003 - Should throw error if customer not found', async () => {
      repositories.customer.findById.mockResolvedValue(null);

      await expect(service.create(createBudgetDto)).rejects.toThrow(
        'Not found',
      );
      expect(services.errorHandler.handleNotFoundError).toHaveBeenCalledWith(
        BUDGET_CONSTANTS.MESSAGES.CUSTOMER_NOT_FOUND,
      );
    });

    it('TC0004 - Should throw error if items are empty array', async () => {
      const invalidDto = { ...createBudgetDto, items: [] };

      await expect(service.create(invalidDto)).rejects.toThrow();
      expect(services.errorHandler.handleError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: BUDGET_CONSTANTS.MESSAGES.ITEMS_REQUIRED,
        }),
      );
    });

    it('TC0005 - Should throw error if items are null', async () => {
      const invalidDto = { ...createBudgetDto, items: null as any };

      await expect(service.create(invalidDto)).rejects.toThrow();
      expect(services.errorHandler.handleError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: BUDGET_CONSTANTS.MESSAGES.ITEMS_REQUIRED,
        }),
      );
    });

    it('TC0006 - Should throw error if items are undefined', async () => {
      const invalidDto = { ...createBudgetDto, items: undefined as any };

      await expect(service.create(invalidDto)).rejects.toThrow();
      expect(services.errorHandler.handleError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: BUDGET_CONSTANTS.MESSAGES.ITEMS_REQUIRED,
        }),
      );
    });

    it('TC0007 - Should throw error if active RASCUNHO budget exists', async () => {
      const activeBudget = { ...mockBudget, status: BudgetStatus.RASCUNHO };
      repositories.budget.findByServiceOrderId.mockResolvedValue([
        activeBudget,
      ]);

      await expect(service.create(createBudgetDto)).rejects.toThrow('Conflict');
      expect(services.errorHandler.handleConflictError).toHaveBeenCalledWith(
        BUDGET_CONSTANTS.MESSAGES.ACTIVE_BUDGET_EXISTS_FOR_SERVICE_ORDER,
      );
    });

    it('TC0008 - Should throw error if active ENVIADO budget exists', async () => {
      const activeBudget = { ...mockBudget, status: BudgetStatus.ENVIADO };
      repositories.budget.findByServiceOrderId.mockResolvedValue([
        activeBudget,
      ]);

      await expect(service.create(createBudgetDto)).rejects.toThrow('Conflict');
      expect(services.errorHandler.handleConflictError).toHaveBeenCalledWith(
        BUDGET_CONSTANTS.MESSAGES.ACTIVE_BUDGET_EXISTS_FOR_SERVICE_ORDER,
      );
    });

    it('TC0009 - Should throw error if active APROVADO budget exists', async () => {
      const activeBudget = { ...mockBudget, status: BudgetStatus.APROVADO };
      repositories.budget.findByServiceOrderId.mockResolvedValue([
        activeBudget,
      ]);

      await expect(service.create(createBudgetDto)).rejects.toThrow('Conflict');
      expect(services.errorHandler.handleConflictError).toHaveBeenCalledWith(
        BUDGET_CONSTANTS.MESSAGES.ACTIVE_BUDGET_EXISTS_FOR_SERVICE_ORDER,
      );
    });

    it('TC0010 - Should allow creation if only rejected budgets exist', async () => {
      const rejectedBudget = { ...mockBudget, status: BudgetStatus.REJEITADO };
      repositories.budget.findByServiceOrderId.mockResolvedValue([
        rejectedBudget,
      ]);

      const result = await service.create(createBudgetDto);

      expect(result).toEqual(mockBudget);
    });

    it('TC0011 - Should allow creation if only expired budgets exist', async () => {
      const expiredBudget = { ...mockBudget, status: BudgetStatus.EXPIRADO };
      repositories.budget.findByServiceOrderId.mockResolvedValue([
        expiredBudget,
      ]);

      const result = await service.create(createBudgetDto);

      expect(result).toEqual(mockBudget);
    });
  });

  describe('findAll', () => {
    it('TC0001 - Should return all budgets', async () => {
      repositories.budget.findAll.mockResolvedValue([mockBudget]);

      const result = await service.findAll();

      expect(result).toEqual([mockBudget]);
    });

    it('TC0002 - Should handle error', async () => {
      repositories.budget.findAll.mockRejectedValue(new Error('DB error'));

      await expect(service.findAll()).rejects.toThrow('DB error');
    });
  });

  describe('findAllPaginated', () => {
    it('TC0001 - Should return paginated budgets', async () => {
      const paginationDto = { page: 0, size: 10, skip: 0, take: 10 };
      repositories.budget.findMany.mockResolvedValue([mockBudget]);
      repositories.budget.count.mockResolvedValue(1);

      const result = await service.findAllPaginated(paginationDto);

      expect(repositories.budget.findMany).toHaveBeenCalledWith(0, 10);
      expect(repositories.budget.count).toHaveBeenCalled();
      expect(result.data).toEqual([mockBudget]);
      expect(result.pagination.totalRecords).toBe(1);
      expect(result.pagination.page).toBe(0);
      expect(result.pagination.totalPages).toBe(1);
    });

    it('TC0002 - Should handle error in findAllPaginated', async () => {
      const paginationDto = { page: 0, size: 10, skip: 0, take: 10 };
      repositories.budget.findMany.mockRejectedValue(new Error('DB error'));

      await expect(service.findAllPaginated(paginationDto)).rejects.toThrow(
        'DB error',
      );
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
        'Not found',
      );
    });

    it('TC0003 - Should handle error', async () => {
      repositories.budget.findById.mockRejectedValue(new Error('DB error'));

      await expect(service.findById(mockBudget.id)).rejects.toThrow('DB error');
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
        'Not found',
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
      const sentBudget = { ...mockBudget, status: BudgetStatus.ENVIADO };
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
      const sentBudget = { ...mockBudget, status: BudgetStatus.ENVIADO };
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
      const sentBudget = { ...mockBudget, status: BudgetStatus.ENVIADO };
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
      const sentBudget = { ...mockBudget, status: BudgetStatus.ENVIADO };
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
      const sentBudget = { ...mockBudget, status: BudgetStatus.ENVIADO };
      const approvedBudget = { ...mockBudget, status: BudgetStatus.APROVADO };
      repositories.budget.findById.mockResolvedValue(sentBudget);
      repositories.budget.updateStatus.mockResolvedValue(approvedBudget);
      repositories.serviceOrder.updateStatus.mockResolvedValue(undefined);
      repositories.serviceOrder.addStatusHistory.mockResolvedValue(undefined);

      const result = await service.approveBudget(mockBudget.id);

      expect(result).toEqual(approvedBudget);
      expect(repositories.serviceOrder.updateStatus).toHaveBeenCalled();
    });

    it('TC0002 - Should throw error if not sent', async () => {
      repositories.budget.findById.mockResolvedValue(mockBudget);

      await expect(service.approveBudget(mockBudget.id)).rejects.toThrow();
      expect(services.errorHandler.handleError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: BUDGET_CONSTANTS.MESSAGES.ONLY_SENT_CAN_BE_APPROVED,
        }),
      );
    });

    it('TC0003 - Should throw error if expired', async () => {
      const expiredBudget = {
        ...mockBudget,
        status: BudgetStatus.ENVIADO,
        validUntil: faker.date.past(),
      };
      repositories.budget.findById.mockResolvedValue(expiredBudget);

      await expect(service.approveBudget(mockBudget.id)).rejects.toThrow();
      expect(services.errorHandler.handleError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: BUDGET_CONSTANTS.MESSAGES.EXPIRED_CANNOT_BE_APPROVED,
        }),
      );
    });

    it('TC0004 - Should handle errors through errorHandler', async () => {
      const sentBudget = { ...mockBudget, status: BudgetStatus.ENVIADO };
      const error = new Error('DB error');
      repositories.budget.findById.mockResolvedValue(sentBudget);
      repositories.budget.updateStatus.mockRejectedValue(error);

      await expect(service.approveBudget(mockBudget.id)).rejects.toThrow(
        'DB error',
      );
      expect(services.errorHandler.handleError).toHaveBeenCalledWith(error);
    });
  });

  describe('rejectBudget', () => {
    it('TC0001 - Should reject budget successfully', async () => {
      const sentBudget = { ...mockBudget, status: BudgetStatus.ENVIADO };
      const rejectedBudget = { ...mockBudget, status: BudgetStatus.REJEITADO };
      repositories.budget.findById.mockResolvedValue(sentBudget);
      repositories.budget.updateStatus.mockResolvedValue(rejectedBudget);

      const result = await service.rejectBudget(mockBudget.id);

      expect(result).toEqual(rejectedBudget);
    });

    it('TC0002 - Should throw error if not sent', async () => {
      repositories.budget.findById.mockResolvedValue(mockBudget);

      await expect(service.rejectBudget(mockBudget.id)).rejects.toThrow();
      expect(services.errorHandler.handleError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: BUDGET_CONSTANTS.MESSAGES.ONLY_SENT_CAN_BE_REJECTED,
        }),
      );
    });

    it('TC0003 - Should handle errors through errorHandler', async () => {
      const sentBudget = { ...mockBudget, status: BudgetStatus.ENVIADO };
      const error = new Error('DB error');
      repositories.budget.findById.mockResolvedValue(sentBudget);
      repositories.budget.updateStatus.mockRejectedValue(error);

      await expect(service.rejectBudget(mockBudget.id)).rejects.toThrow(
        'DB error',
      );
      expect(services.errorHandler.handleError).toHaveBeenCalledWith(error);
    });
  });

  describe('delete', () => {
    it('TC0001 - Should delete budget successfully', async () => {
      repositories.budget.findById.mockResolvedValue(mockBudget);
      repositories.budget.delete.mockResolvedValue(undefined);

      await expect(service.delete(mockBudget.id)).resolves.toBeUndefined();
    });

    it('TC0002 - Should throw error if not found', async () => {
      repositories.budget.findById.mockResolvedValue(null);

      await expect(service.delete(mockBudget.id)).rejects.toThrow('Not found');
      expect(services.errorHandler.handleNotFoundError).toHaveBeenCalledWith(
        BUDGET_CONSTANTS.MESSAGES.NOT_FOUND,
      );
    });

    it('TC0003 - Should handle errors through errorHandler', async () => {
      const error = new Error('DB error');
      repositories.budget.findById.mockResolvedValue(mockBudget);
      repositories.budget.delete.mockRejectedValue(error);

      await expect(service.delete(mockBudget.id)).rejects.toThrow('DB error');
      expect(services.errorHandler.handleError).toHaveBeenCalledWith(error);
    });
  });

  describe('findExpiredBudgets', () => {
    it('TC0001 - Should return expired budgets', async () => {
      repositories.budget.findExpired.mockResolvedValue([mockBudget]);

      const result = await service.findExpiredBudgets();

      expect(result).toEqual([mockBudget]);
    });

    it('TC0002 - Should handle errors through errorHandler', async () => {
      const error = new Error('DB error');
      repositories.budget.findExpired.mockRejectedValue(error);

      await expect(service.findExpiredBudgets()).rejects.toThrow('DB error');
      expect(services.errorHandler.handleError).toHaveBeenCalledWith(error);
    });
  });

  describe('markAsExpired', () => {
    it('TC0001 - Should mark RASCUNHO budget as expired', async () => {
      const draftBudget = { ...mockBudget, status: BudgetStatus.RASCUNHO };
      const expiredBudget = { ...mockBudget, status: BudgetStatus.EXPIRADO };
      repositories.budget.findById.mockResolvedValue(draftBudget);
      repositories.budget.markAsExpired.mockResolvedValue(expiredBudget);

      const result = await service.markAsExpired(mockBudget.id);

      expect(result).toEqual(expiredBudget);
    });

    it('TC0002 - Should mark ENVIADO budget as expired', async () => {
      const sentBudget = { ...mockBudget, status: BudgetStatus.ENVIADO };
      const expiredBudget = { ...mockBudget, status: BudgetStatus.EXPIRADO };
      repositories.budget.findById.mockResolvedValue(sentBudget);
      repositories.budget.markAsExpired.mockResolvedValue(expiredBudget);

      const result = await service.markAsExpired(mockBudget.id);

      expect(result).toEqual(expiredBudget);
    });

    it('TC0003 - Should throw error if status is APROVADO', async () => {
      const approvedBudget = { ...mockBudget, status: BudgetStatus.APROVADO };
      repositories.budget.findById.mockResolvedValue(approvedBudget);

      await expect(service.markAsExpired(mockBudget.id)).rejects.toThrow();
      expect(services.errorHandler.handleError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: BUDGET_CONSTANTS.MESSAGES.INVALID_STATUS_TRANSITION,
        }),
      );
    });

    it('TC0004 - Should throw error if status is REJEITADO', async () => {
      const rejectedBudget = { ...mockBudget, status: BudgetStatus.REJEITADO };
      repositories.budget.findById.mockResolvedValue(rejectedBudget);

      await expect(service.markAsExpired(mockBudget.id)).rejects.toThrow();
      expect(services.errorHandler.handleError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: BUDGET_CONSTANTS.MESSAGES.INVALID_STATUS_TRANSITION,
        }),
      );
    });

    it('TC0005 - Should handle errors through errorHandler', async () => {
      const draftBudget = { ...mockBudget, status: BudgetStatus.RASCUNHO };
      const error = new Error('DB error');
      repositories.budget.findById.mockResolvedValue(draftBudget);
      repositories.budget.markAsExpired.mockRejectedValue(error);

      await expect(service.markAsExpired(mockBudget.id)).rejects.toThrow(
        'DB error',
      );
      expect(services.errorHandler.handleError).toHaveBeenCalledWith(error);
    });
  });

  describe('findByCustomerId', () => {
    it('TC0001 - Should return budgets by customer id', async () => {
      repositories.budget.findByCustomerId.mockResolvedValue([mockBudget]);

      const result = await service.findByCustomerId(mockCustomer.id);

      expect(result).toEqual([mockBudget]);
    });

    it('TC0002 - Should handle errors through errorHandler', async () => {
      const error = new Error('DB error');
      repositories.budget.findByCustomerId.mockRejectedValue(error);

      await expect(service.findByCustomerId(mockCustomer.id)).rejects.toThrow(
        'DB error',
      );
      expect(services.errorHandler.handleError).toHaveBeenCalledWith(error);
    });
  });

  describe('findByStatus', () => {
    it('TC0001 - Should return budgets by status', async () => {
      repositories.budget.findByStatus.mockResolvedValue([mockBudget]);

      const result = await service.findByStatus(BudgetStatus.RASCUNHO);

      expect(result).toEqual([mockBudget]);
    });

    it('TC0002 - Should handle errors through errorHandler', async () => {
      const error = new Error('DB error');
      repositories.budget.findByStatus.mockRejectedValue(error);

      await expect(service.findByStatus(BudgetStatus.RASCUNHO)).rejects.toThrow(
        'DB error',
      );
      expect(services.errorHandler.handleError).toHaveBeenCalledWith(error);
    });
  });

  describe('findByIdWithRelations', () => {
    it('TC0001 - Should return budget with relations', async () => {
      repositories.budget.findById.mockResolvedValue(mockBudget);
      repositories.customer.findById.mockResolvedValue(mockCustomer);
      repositories.serviceOrder.findById.mockResolvedValue(mockServiceOrder);
      repositories.service.findById.mockResolvedValue(mockService);

      const result = await service.findByIdWithRelations(mockBudget.id);

      expect(result).toBeDefined();
      expect(result.customer).toBeDefined();
      expect(result.serviceOrder).toBeDefined();
    });

    it('TC0002 - Should handle errors through errorHandler', async () => {
      const error = new Error('DB error');
      repositories.budget.findById.mockRejectedValue(error);

      await expect(
        service.findByIdWithRelations(mockBudget.id),
      ).rejects.toThrow('DB error');
      expect(services.errorHandler.handleError).toHaveBeenCalledWith(error);
    });
  });

  describe('findAllWithRelations', () => {
    it('TC0001 - Should return all budgets with relations', async () => {
      repositories.budget.findAll.mockResolvedValue([mockBudget]);
      repositories.customer.findById.mockResolvedValue(mockCustomer);
      repositories.serviceOrder.findById.mockResolvedValue(mockServiceOrder);
      repositories.service.findById.mockResolvedValue(mockService);

      const result = await service.findAllWithRelations();

      expect(result).toHaveLength(1);
      expect(result[0].customer).toBeDefined();
    });

    it('TC0002 - Should handle errors through errorHandler', async () => {
      const error = new Error('DB error');
      repositories.budget.findAll.mockRejectedValue(error);

      await expect(service.findAllWithRelations()).rejects.toThrow('DB error');
      expect(services.errorHandler.handleError).toHaveBeenCalledWith(error);
    });
  });

  describe('findByCustomerIdWithRelations', () => {
    it('TC0001 - Should return customer budgets with relations', async () => {
      repositories.budget.findByCustomerId.mockResolvedValue([mockBudget]);
      repositories.customer.findById.mockResolvedValue(mockCustomer);
      repositories.serviceOrder.findById.mockResolvedValue(mockServiceOrder);
      repositories.service.findById.mockResolvedValue(mockService);

      const result = await service.findByCustomerIdWithRelations(
        mockCustomer.id,
      );

      expect(result).toHaveLength(1);
    });

    it('TC0002 - Should handle errors through errorHandler', async () => {
      const error = new Error('DB error');
      repositories.budget.findByCustomerId.mockRejectedValue(error);

      await expect(
        service.findByCustomerIdWithRelations(mockCustomer.id),
      ).rejects.toThrow('DB error');
      expect(services.errorHandler.handleError).toHaveBeenCalledWith(error);
    });
  });

  describe('findByServiceOrderIdWithRelations', () => {
    it('TC0001 - Should return service order budgets with relations', async () => {
      repositories.budget.findByServiceOrderId.mockResolvedValue([mockBudget]);
      repositories.customer.findById.mockResolvedValue(mockCustomer);
      repositories.serviceOrder.findById.mockResolvedValue(mockServiceOrder);
      repositories.service.findById.mockResolvedValue(mockService);

      const result = await service.findByServiceOrderIdWithRelations(
        mockServiceOrder.id,
      );

      expect(result).toHaveLength(1);
    });

    it('TC0002 - Should handle errors through errorHandler', async () => {
      const error = new Error('DB error');
      repositories.budget.findByServiceOrderId.mockRejectedValue(error);

      await expect(
        service.findByServiceOrderIdWithRelations(mockServiceOrder.id),
      ).rejects.toThrow('DB error');
      expect(services.errorHandler.handleError).toHaveBeenCalledWith(error);
    });
  });

  describe('mapToEnrichedResponseDto', () => {
    it('TC0001 - Should map budget with service items', async () => {
      repositories.budget.findById.mockResolvedValue(mockBudget);
      repositories.customer.findById.mockResolvedValue(mockCustomer);
      repositories.serviceOrder.findById.mockResolvedValue(mockServiceOrder);
      repositories.service.findById.mockResolvedValue(mockService);

      const result = await service.findByIdWithRelations(mockBudget.id);

      expect(result.items[0].service).toBeDefined();
      expect(result.items[0].service?.name).toBe(mockService.name);
      expect(result.items[0].service?.category).toBe(mockService.category);
    });

    it('TC0002 - Should map budget with part items', async () => {
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
  });
});
