import { Injectable, Inject } from '@nestjs/common';
import type {
  IBudgetRepository,
  CreateBudgetData,
  UpdateBudgetData,
  Budget,
} from '../../3-domain/repositories/budget.repository.interface';
import type { ICustomerRepository } from '../../3-domain/repositories/customer-repository.interface';
import { BudgetStatus } from '../../3-domain/entities/budget.entity';
import { ErrorHandlerService } from '../../../shared/services/error-handler.service';
import { NotificationService } from './notification.service';
import { BUDGET_CONSTANTS } from '../../../shared/constants/budget.constants';

@Injectable()
export class BudgetService {
  constructor(
    @Inject('IBudgetRepository')
    private readonly budgetRepository: IBudgetRepository,
    @Inject('ICustomerRepository')
    private readonly customerRepository: ICustomerRepository,
    private readonly errorHandler: ErrorHandlerService,
    private readonly notificationService: NotificationService,
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

      if (budget.status !== BudgetStatus.RASCUNHO) {
        this.errorHandler.handleError(
          new Error(BUDGET_CONSTANTS.MESSAGES.ONLY_DRAFT_CAN_BE_SENT),
        );
      }

      const updatedBudget = await this.budgetRepository.updateStatus(
        id,
        BudgetStatus.ENVIADO,
      );

      // Send notification to customer
      const customer = await this.customerRepository.findById(
        budget.customerId,
      );
      if (customer) {
        await this.notificationService.sendBudgetReadyNotification(
          updatedBudget,
          customer.email,
          customer.name,
          customer.phone || undefined,
        );
      }

      return updatedBudget;
    } catch (error) {
      this.errorHandler.handleError(error);
    }
  }

  async approveBudget(id: string): Promise<Budget> {
    try {
      const budget = await this.findById(id);

      if (budget.status !== BudgetStatus.ENVIADO) {
        this.errorHandler.handleError(
          new Error(BUDGET_CONSTANTS.MESSAGES.ONLY_SENT_CAN_BE_APPROVED),
        );
      }

      // Check if budget is not expired
      if (new Date() > budget.validUntil) {
        this.errorHandler.handleError(
          new Error(BUDGET_CONSTANTS.MESSAGES.EXPIRED_CANNOT_BE_APPROVED),
        );
      }

      return await this.budgetRepository.updateStatus(
        id,
        BudgetStatus.APROVADO,
      );
    } catch (error) {
      this.errorHandler.handleError(error);
    }
  }

  async rejectBudget(id: string): Promise<Budget> {
    try {
      const budget = await this.findById(id);

      if (budget.status !== BudgetStatus.ENVIADO) {
        this.errorHandler.handleError(
          new Error(BUDGET_CONSTANTS.MESSAGES.ONLY_SENT_CAN_BE_REJECTED),
        );
      }

      return await this.budgetRepository.updateStatus(
        id,
        BudgetStatus.REJEITADO,
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

  async findExpiredBudgets(): Promise<Budget[]> {
    try {
      return await this.budgetRepository.findExpired();
    } catch (error) {
      this.errorHandler.handleError(error);
    }
  }

  async markAsExpired(id: string): Promise<Budget> {
    try {
      const budget = await this.findById(id);

      // Only allow expiration for RASCUNHO and ENVIADO status
      if (
        budget.status !== BudgetStatus.RASCUNHO &&
        budget.status !== BudgetStatus.ENVIADO
      ) {
        this.errorHandler.handleError(
          new Error(BUDGET_CONSTANTS.MESSAGES.INVALID_STATUS_TRANSITION),
        );
      }

      return await this.budgetRepository.markAsExpired(id);
    } catch (error) {
      this.errorHandler.handleError(error);
    }
  }

  async findByCustomerId(customerId: string): Promise<Budget[]> {
    try {
      return await this.budgetRepository.findByCustomerId(customerId);
    } catch (error) {
      this.errorHandler.handleError(error);
    }
  }

  async findByStatus(status: BudgetStatus): Promise<Budget[]> {
    try {
      return await this.budgetRepository.findByStatus(status);
    } catch (error) {
      this.errorHandler.handleError(error);
    }
  }
}
