import { faker } from '@faker-js/faker/locale/pt_BR';
import { Test, TestingModule } from '@nestjs/testing';
import { v4 as uuidv4 } from 'uuid';

import { BudgetController } from '../../../../src/workshop/1-presentation/controllers/budget.controller';
import { BudgetService } from '../../../../src/workshop/2-application/services/budget.service';
import { CreateBudgetDto } from '../../../../src/workshop/1-presentation/dtos/budget/create-budget.dto';
import { BudgetResponseDto } from '../../../../src/workshop/1-presentation/dtos/budget/budget-response.dto';
import { BudgetWithRelationsResponseDto } from '../../../../src/workshop/1-presentation/dtos/budget/budget-with-relations-response.dto';
import { BudgetStatus } from '../../../../src/workshop/3-domain/entities/budget.entity';

describe('BudgetController', () => {
  let controller: BudgetController;
  let budgetService: jest.Mocked<BudgetService>;

  const mockBudgetId = uuidv4();
  const mockServiceOrderId = uuidv4();
  const mockCustomerId = uuidv4();

  const mockBudget = {
    id: mockBudgetId,
    serviceOrderId: mockServiceOrderId,
    customerId: mockCustomerId,
    items: [
      {
        id: uuidv4(),
        type: 'SERVICE' as const,
        serviceId: uuidv4(),
        description: 'Troca de óleo',
        quantity: 1,
        unitPrice: 100,
        total: 100,
      },
      {
        id: uuidv4(),
        type: 'PART' as const,
        partId: uuidv4(),
        description: 'Filtro de óleo',
        quantity: 1,
        unitPrice: 50,
        total: 50,
      },
    ],
    subtotal: 1000,
    taxes: 100,
    discount: 0,
    total: 1100,
    validUntil: faker.date.future(),
    status: BudgetStatus.RASCUNHO,
    sentAt: undefined,
    approvedAt: undefined,
    rejectedAt: undefined,
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
  };

  const mockSentBudget = {
    ...mockBudget,
    status: BudgetStatus.ENVIADO,
    sentAt: new Date(),
  };

  const mockCreateBudgetDto: CreateBudgetDto = {
    serviceOrderId: mockServiceOrderId,
    customerId: mockCustomerId,
    items: [
      {
        id: uuidv4(),
        type: 'SERVICE',
        serviceId: uuidv4(),
        description: 'Troca de óleo',
        quantity: 1,
        unitPrice: 100,
        total: 100,
      },
      {
        id: uuidv4(),
        type: 'PART',
        partId: uuidv4(),
        description: 'Filtro de óleo',
        quantity: 1,
        unitPrice: 50,
        total: 50,
      },
    ],
    validDays: 15,
  };

  const mockBudgetWithRelations: BudgetWithRelationsResponseDto = {
    id: mockBudgetId,
    serviceOrderId: mockServiceOrderId,
    customerId: mockCustomerId,
    subtotal: 1000,
    taxes: 100,
    discount: 0,
    total: 1100,
    validUntil: faker.date.future(),
    status: BudgetStatus.RASCUNHO,
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    customer: {
      id: mockCustomerId,
      name: faker.person.fullName(),
      email: faker.internet.email(),
      phone: faker.phone.number(),
      document: '12345678901',
    },
    serviceOrder: {
      id: mockServiceOrderId,
      orderNumber: 'OS-2025-001',
      description: faker.lorem.sentence(),
      status: 'EM_DIAGNOSTICO',
    },
    items: [],
  };

  beforeEach(async () => {
    const mockBudgetService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findAllPaginated: jest.fn(),
      findById: jest.fn(),
      findByServiceOrderId: jest.fn(),
      sendBudget: jest.fn(),
      delete: jest.fn(),
      findAllWithRelations: jest.fn(),
      findByIdWithRelations: jest.fn(),
      findByCustomerIdWithRelations: jest.fn(),
      findByServiceOrderIdWithRelations: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [BudgetController],
      providers: [
        {
          provide: BudgetService,
          useValue: mockBudgetService,
        },
      ],
    }).compile();

    controller = module.get<BudgetController>(BudgetController);
    budgetService = module.get<jest.Mocked<BudgetService>>(BudgetService);
  });

  it('Should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('TC0001 - Should create a new budget successfully', async () => {
      budgetService.create.mockResolvedValue(mockBudget);

      const result = await controller.create(mockCreateBudgetDto);

      expect(budgetService.create).toHaveBeenCalledWith(mockCreateBudgetDto);
      expect(result).toBeInstanceOf(BudgetResponseDto);
      expect(result.id).toBe(mockBudgetId);
    });

    it('TC0002 - Should throw error when creation fails', async () => {
      const error = new Error('Creation failed');
      budgetService.create.mockRejectedValue(error);

      await expect(controller.create(mockCreateBudgetDto)).rejects.toThrow(
        error,
      );
      expect(budgetService.create).toHaveBeenCalledWith(mockCreateBudgetDto);
    });
  });

  describe('findAll', () => {
    it('TC0001 - Should return list of all budgets', async () => {
      const mockBudgets = [mockBudget, { ...mockBudget, id: uuidv4() }];
      budgetService.findAll.mockResolvedValue(mockBudgets);

      const result = await controller.findAll();

      expect(budgetService.findAll).toHaveBeenCalledWith();
      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(BudgetResponseDto);
    });

    it('TC0002 - Should return empty array when no budgets found', async () => {
      budgetService.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(budgetService.findAll).toHaveBeenCalledWith();
      expect(result).toHaveLength(0);
    });
  });

  describe('findAllPaginated', () => {
    it('TC0001 - Should return paginated budgets', async () => {
      const mockBudgets = [mockBudget, { ...mockBudget, id: uuidv4() }];
      const paginationDto = { page: 0, size: 10 };
      const mockPaginatedResult = {
        data: mockBudgets,
        pagination: { page: 0, totalPages: 1, totalRecords: 2 },
      };

      budgetService.findAllPaginated.mockResolvedValue(mockPaginatedResult);

      const result = await controller.findAllPaginated(paginationDto as any);

      expect(budgetService.findAllPaginated).toHaveBeenCalledWith(
        paginationDto,
      );
      expect(result.data).toHaveLength(2);
      expect(result.data[0]).toBeInstanceOf(BudgetResponseDto);
      expect(result.pagination.totalRecords).toBe(2);
    });

    it('TC0002 - Should return empty paginated result when no budgets found', async () => {
      const paginationDto = { page: 0, size: 10 };
      const mockPaginatedResult = {
        data: [],
        pagination: { page: 0, totalPages: 0, totalRecords: 0 },
      };

      budgetService.findAllPaginated.mockResolvedValue(mockPaginatedResult);

      const result = await controller.findAllPaginated(paginationDto as any);

      expect(budgetService.findAllPaginated).toHaveBeenCalledWith(
        paginationDto,
      );
      expect(result.data).toHaveLength(0);
      expect(result.pagination.totalRecords).toBe(0);
    });
  });

  describe('findOne', () => {
    it('TC0001 - Should return budget by ID', async () => {
      budgetService.findById.mockResolvedValue(mockBudget);

      const result = await controller.findOne(mockBudgetId);

      expect(budgetService.findById).toHaveBeenCalledWith(mockBudgetId);
      expect(result).toBeInstanceOf(BudgetResponseDto);
      expect(result.id).toBe(mockBudgetId);
    });

    it('TC0002 - Should throw error when budget not found', async () => {
      const error = new Error('Budget not found');
      budgetService.findById.mockRejectedValue(error);

      await expect(controller.findOne('invalid-id')).rejects.toThrow(error);
      expect(budgetService.findById).toHaveBeenCalledWith('invalid-id');
    });
  });

  describe('findByServiceOrder', () => {
    it('TC0001 - Should return budgets for service order', async () => {
      const mockBudgets = [mockBudget];
      budgetService.findByServiceOrderId.mockResolvedValue(mockBudgets);

      const result = await controller.findByServiceOrder(mockServiceOrderId);

      expect(budgetService.findByServiceOrderId).toHaveBeenCalledWith(
        mockServiceOrderId,
      );
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(BudgetResponseDto);
    });

    it('TC0002 - Should return empty array when no budgets found for service order', async () => {
      budgetService.findByServiceOrderId.mockResolvedValue([]);

      const result = await controller.findByServiceOrder(mockServiceOrderId);

      expect(budgetService.findByServiceOrderId).toHaveBeenCalledWith(
        mockServiceOrderId,
      );
      expect(result).toHaveLength(0);
    });
  });

  describe('sendBudget', () => {
    it('TC0001 - Should send budget successfully', async () => {
      budgetService.sendBudget.mockResolvedValue(mockSentBudget);

      const result = await controller.sendBudget(mockBudgetId);

      expect(budgetService.sendBudget).toHaveBeenCalledWith(mockBudgetId);
      expect(result).toBeInstanceOf(BudgetResponseDto);
      expect(result.status).toBe(BudgetStatus.ENVIADO);
    });

    it('TC0002 - Should throw error when sending fails', async () => {
      const error = new Error('Send failed');
      budgetService.sendBudget.mockRejectedValue(error);

      await expect(controller.sendBudget(mockBudgetId)).rejects.toThrow(error);
      expect(budgetService.sendBudget).toHaveBeenCalledWith(mockBudgetId);
    });
  });

  describe('remove', () => {
    it('TC0001 - Should delete budget successfully', async () => {
      budgetService.delete.mockResolvedValue(undefined);

      await controller.remove(mockBudgetId);

      expect(budgetService.delete).toHaveBeenCalledWith(mockBudgetId);
    });

    it('TC0002 - Should throw error when deletion fails', async () => {
      const error = new Error('Deletion failed');
      budgetService.delete.mockRejectedValue(error);

      await expect(controller.remove(mockBudgetId)).rejects.toThrow(error);
      expect(budgetService.delete).toHaveBeenCalledWith(mockBudgetId);
    });
  });

  describe('findAllEnriched', () => {
    it('TC0001 - Should return all budgets with relations', async () => {
      const mockEnrichedBudgets = [mockBudgetWithRelations];
      budgetService.findAllWithRelations.mockResolvedValue(mockEnrichedBudgets);

      const result = await controller.findAllEnriched();

      expect(budgetService.findAllWithRelations).toHaveBeenCalledWith();
      expect(result).toHaveLength(1);
      expect(result[0]).toBe(mockBudgetWithRelations);
    });

    it('TC0002 - Should throw error when service fails', async () => {
      const error = new Error('Service error');
      budgetService.findAllWithRelations.mockRejectedValue(error);

      await expect(controller.findAllEnriched()).rejects.toThrow(error);
    });
  });

  describe('findOneEnriched', () => {
    it('TC0001 - Should return budget with relations by ID', async () => {
      budgetService.findByIdWithRelations.mockResolvedValue(
        mockBudgetWithRelations,
      );

      const result = await controller.findOneEnriched(mockBudgetId);

      expect(budgetService.findByIdWithRelations).toHaveBeenCalledWith(
        mockBudgetId,
      );
      expect(result).toBe(mockBudgetWithRelations);
    });

    it('TC0002 - Should throw error when enriched budget not found', async () => {
      const error = new Error('Budget not found');
      budgetService.findByIdWithRelations.mockRejectedValue(error);

      await expect(controller.findOneEnriched('invalid-id')).rejects.toThrow(
        error,
      );
      expect(budgetService.findByIdWithRelations).toHaveBeenCalledWith(
        'invalid-id',
      );
    });
  });

  describe('findByCustomerEnriched', () => {
    it('TC0001 - Should return customer budgets with relations', async () => {
      const mockEnrichedBudgets = [mockBudgetWithRelations];
      budgetService.findByCustomerIdWithRelations.mockResolvedValue(
        mockEnrichedBudgets,
      );

      const result = await controller.findByCustomerEnriched(mockCustomerId);

      expect(budgetService.findByCustomerIdWithRelations).toHaveBeenCalledWith(
        mockCustomerId,
      );
      expect(result).toHaveLength(1);
      expect(result[0]).toBe(mockBudgetWithRelations);
    });

    it('TC0002 - Should throw error when service fails', async () => {
      const error = new Error('Service error');
      budgetService.findByCustomerIdWithRelations.mockRejectedValue(error);

      await expect(
        controller.findByCustomerEnriched(mockCustomerId),
      ).rejects.toThrow(error);
    });
  });

  describe('findByServiceOrderEnriched', () => {
    it('TC0001 - Should return service order budgets with relations', async () => {
      const mockEnrichedBudgets = [mockBudgetWithRelations];
      budgetService.findByServiceOrderIdWithRelations.mockResolvedValue(
        mockEnrichedBudgets,
      );

      const result =
        await controller.findByServiceOrderEnriched(mockServiceOrderId);

      expect(
        budgetService.findByServiceOrderIdWithRelations,
      ).toHaveBeenCalledWith(mockServiceOrderId);
      expect(result).toHaveLength(1);
      expect(result[0]).toBe(mockBudgetWithRelations);
    });

    it('TC0002 - Should return empty array when no enriched budgets found for service order', async () => {
      budgetService.findByServiceOrderIdWithRelations.mockResolvedValue([]);

      const result =
        await controller.findByServiceOrderEnriched(mockServiceOrderId);

      expect(
        budgetService.findByServiceOrderIdWithRelations,
      ).toHaveBeenCalledWith(mockServiceOrderId);
      expect(result).toHaveLength(0);
    });
  });
});
