import { Injectable, BadRequestException } from '@nestjs/common';
import type {
  IBudgetRepository,
  CreateBudgetData,
  UpdateBudgetData,
  Budget,
} from '../../3-domain/repositories/budget.repository.interface';
import { BudgetStatus } from '../../3-domain/entities/budget.entity';
import { ErrorHandlerService } from '../../../shared/services/error-handler.service';
import { BUDGET_CONSTANTS } from '../../../shared/constants/budget.constants';

@Injectable()
export class BudgetService {
  constructor(
    private readonly budgetRepository: IBudgetRepository,
    private readonly errorHandler: ErrorHandlerService,
  ) {}

  async create(data: CreateBudgetData): Promise<Budget> {
    try {
      return await this.budgetRepository.create(data);
    } catch (error) {
      this.errorHandler.handleError(error);
    }
  }

  async findAll(): Promise<Budget[]> {
    try {
      return await this.budgetRepository.findAll();
    } catch (error) {
      this.errorHandler.handleError(error);
    }
  }

  async findById(id: string): Promise<Budget> {
    try {
      const budget = await this.budgetRepository.findById(id);
      if (!budget) {
        this.errorHandler.handleNotFoundError(
          BUDGET_CONSTANTS.MESSAGES.NOT_FOUND,
        );
      }
      return budget;
    } catch (error) {
      this.errorHandler.handleError(error);
    }
  }

  async findByServiceOrderId(serviceOrderId: string): Promise<Budget[]> {
    try {
      return await this.budgetRepository.findByServiceOrderId(serviceOrderId);
    } catch (error) {
      this.errorHandler.handleError(error);
    }
  }

  async update(id: string, data: UpdateBudgetData): Promise<Budget> {
    try {
      await this.findById(id);
      return await this.budgetRepository.update(id, data);
    } catch (error) {
      this.errorHandler.handleError(error);
    }
  }

  async sendBudget(id: string): Promise<Budget> {
    try {
      const budget = await this.findById(id);

      if (budget.status !== BudgetStatus.DRAFT) {
        throw new BadRequestException(BUDGET_CONSTANTS.MESSAGES.ALREADY_SENT);
      }

      return await this.budgetRepository.updateStatus(id, BudgetStatus.SENT);
    } catch (error) {
      this.errorHandler.handleError(error);
    }
  }

  async approveBudget(id: string): Promise<Budget> {
    try {
      const budget = await this.findById(id);

      if (budget.status !== BudgetStatus.SENT) {
        throw new BadRequestException(
          BUDGET_CONSTANTS.MESSAGES.INVALID_STATUS_TRANSITION,
        );
      }

      return await this.budgetRepository.updateStatus(
        id,
        BudgetStatus.APPROVED,
      );
    } catch (error) {
      this.errorHandler.handleError(error);
    }
  }

  async rejectBudget(id: string): Promise<Budget> {
    try {
      const budget = await this.findById(id);

      if (budget.status !== BudgetStatus.SENT) {
        throw new BadRequestException(
          BUDGET_CONSTANTS.MESSAGES.INVALID_STATUS_TRANSITION,
        );
      }

      return await this.budgetRepository.updateStatus(
        id,
        BudgetStatus.REJECTED,
      );
    } catch (error) {
      this.errorHandler.handleError(error);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.findById(id);
      await this.budgetRepository.delete(id);
    } catch (error) {
      this.errorHandler.handleError(error);
    }
  }
}
