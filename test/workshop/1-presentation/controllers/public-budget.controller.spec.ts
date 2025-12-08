import { faker } from '@faker-js/faker/locale/pt_BR';
import { Test, TestingModule } from '@nestjs/testing';
import { v4 as uuidv4 } from 'uuid';

import { PublicBudgetController } from '../../../../src/workshop/1-presentation/controllers/public-budget.controller';
import { BudgetService } from '../../../../src/workshop/2-application/services/budget.service';
import { BudgetResponseDto } from '../../../../src/workshop/1-presentation/dtos/budget/budget-response.dto';
import { BudgetStatus } from '../../../../src/workshop/3-domain/entities/budget.entity';
import { BUDGET_CONSTANTS } from '../../../../src/shared/constants/budget.constants';

describe('PublicBudgetController', () => {
  let controller: PublicBudgetController;
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
    validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    status: BudgetStatus.ENVIADO,
    sentAt: faker.date.recent(),
    approvedAt: undefined,
    rejectedAt: undefined,
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
  };

  const mockApprovedBudget = {
    ...mockBudget,
    status: BudgetStatus.APROVADO,
    approvedAt: new Date(),
    rejectedAt: undefined,
  };

  const mockRejectedBudget = {
    ...mockBudget,
    status: BudgetStatus.REJEITADO,
    approvedAt: undefined,
    rejectedAt: new Date(),
  };

  const mockExpiredBudget = {
    ...mockBudget,
    validUntil: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    status: BudgetStatus.EXPIRADO,
    approvedAt: undefined,
    rejectedAt: undefined,
  };

  beforeEach(async () => {
    const mockBudgetService = {
      findById: jest.fn(),
      approveBudget: jest.fn(),
      rejectBudget: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PublicBudgetController],
      providers: [
        {
          provide: BudgetService,
          useValue: mockBudgetService,
        },
      ],
    }).compile();

    controller = module.get<PublicBudgetController>(PublicBudgetController);
    budgetService = module.get<jest.Mocked<BudgetService>>(BudgetService);
  });

  it('Should be defined', () => {
    expect(controller).toBeDefined();
    expect(controller).toBeInstanceOf(PublicBudgetController);
    expect(budgetService).toBeDefined();
  });

  it('Should instantiate controller with service dependency', () => {
    const mockService = {} as BudgetService;
    const testController = new PublicBudgetController(mockService);
    expect(testController).toBeInstanceOf(PublicBudgetController);
  });

  describe('viewBudget', () => {
    it('TC0001 - Should return budget details when valid ID is provided', async () => {
      budgetService.findById.mockResolvedValue(mockBudget);

      const result = await controller.viewBudget(mockBudgetId);

      expect(budgetService.findById).toHaveBeenCalledWith(mockBudgetId);
      expect(result).toBeInstanceOf(BudgetResponseDto);
      expect(result.id).toBe(mockBudgetId);
      expect(result.status).toBe(BudgetStatus.ENVIADO);
    });

    it('TC0002 - Should throw error when budget not found', async () => {
      const error = new Error('Budget not found');
      budgetService.findById.mockRejectedValue(error);

      await expect(controller.viewBudget('invalid-id')).rejects.toThrow(error);
      expect(budgetService.findById).toHaveBeenCalledWith('invalid-id');
    });
  });

  describe('approveBudget', () => {
    it('TC0001 - Should approve budget and return success response', async () => {
      budgetService.approveBudget.mockResolvedValue(mockApprovedBudget);

      const result = await controller.approveBudget(mockBudgetId);

      expect(budgetService.approveBudget).toHaveBeenCalledWith(mockBudgetId);
      expect(result.budget).toBeInstanceOf(BudgetResponseDto);
      expect(result.budget.status).toBe(BudgetStatus.APROVADO);
      expect(result.message).toBe(BUDGET_CONSTANTS.MESSAGES.APPROVED_SUCCESS);
    });

    it('TC0002 - Should throw error when trying to approve invalid budget', async () => {
      const error = new Error('Cannot approve this budget');
      budgetService.approveBudget.mockRejectedValue(error);

      await expect(controller.approveBudget(mockBudgetId)).rejects.toThrow(
        error,
      );
      expect(budgetService.approveBudget).toHaveBeenCalledWith(mockBudgetId);
    });
  });

  describe('rejectBudget', () => {
    it('TC0001 - Should reject budget and return success response', async () => {
      budgetService.rejectBudget.mockResolvedValue(mockRejectedBudget);

      const result = await controller.rejectBudget(mockBudgetId);

      expect(budgetService.rejectBudget).toHaveBeenCalledWith(mockBudgetId);
      expect(result.budget).toBeInstanceOf(BudgetResponseDto);
      expect(result.budget.status).toBe(BudgetStatus.REJEITADO);
      expect(result.message).toBe(BUDGET_CONSTANTS.MESSAGES.REJECTED_SUCCESS);
    });

    it('TC0002 - Should throw error when trying to reject invalid budget', async () => {
      const error = new Error('Cannot reject this budget');
      budgetService.rejectBudget.mockRejectedValue(error);

      await expect(controller.rejectBudget(mockBudgetId)).rejects.toThrow(
        error,
      );
      expect(budgetService.rejectBudget).toHaveBeenCalledWith(mockBudgetId);
    });
  });

  describe('getBudgetStatus', () => {
    it('TC0001 - Should return valid budget status with approval options', async () => {
      budgetService.findById.mockResolvedValue(mockBudget);

      const result = await controller.getBudgetStatus(mockBudgetId);

      expect(budgetService.findById).toHaveBeenCalledWith(mockBudgetId);
      expect(result.id).toBe(mockBudgetId);
      expect(result.status).toBe(BudgetStatus.ENVIADO);
      expect(result.isExpired).toBe(false);
      expect(result.canApprove).toBe(true);
      expect(result.canReject).toBe(true);
    });

    it('TC0002 - Should return expired budget status without approval options', async () => {
      budgetService.findById.mockResolvedValue(mockExpiredBudget);

      const result = await controller.getBudgetStatus(mockBudgetId);

      expect(budgetService.findById).toHaveBeenCalledWith(mockBudgetId);
      expect(result.id).toBe(mockBudgetId);
      expect(result.isExpired).toBe(true);
      expect(result.canApprove).toBe(false);
      expect(result.canReject).toBe(false);
    });

    it('TC0003 - Should return approved budget status without interaction options', async () => {
      budgetService.findById.mockResolvedValue(mockApprovedBudget);

      const result = await controller.getBudgetStatus(mockBudgetId);

      expect(budgetService.findById).toHaveBeenCalledWith(mockBudgetId);
      expect(result.id).toBe(mockBudgetId);
      expect(result.status).toBe(BudgetStatus.APROVADO);
      expect(result.canApprove).toBe(false);
      expect(result.canReject).toBe(false);
    });

    it('TC0004 - Should throw error when budget not found for status check', async () => {
      const error = new Error('Budget not found');
      budgetService.findById.mockRejectedValue(error);

      await expect(controller.getBudgetStatus('invalid-id')).rejects.toThrow(
        error,
      );
      expect(budgetService.findById).toHaveBeenCalledWith('invalid-id');
    });

    it('TC0005 - Should return rejected budget status without interaction options', async () => {
      budgetService.findById.mockResolvedValue(mockRejectedBudget);

      const result = await controller.getBudgetStatus(mockBudgetId);

      expect(result.status).toBe(BudgetStatus.REJEITADO);
      expect(result.canApprove).toBe(false);
      expect(result.canReject).toBe(false);
    });
  });
});
