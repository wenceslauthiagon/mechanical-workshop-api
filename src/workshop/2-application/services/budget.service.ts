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

      if (budget.status !== BudgetStatus.DRAFT) {
        this.errorHandler.handleError(
          new Error(BUDGET_CONSTANTS.MESSAGES.ALREADY_SENT),
        );
      }

      // Atualizar status do orçamento
      const updatedBudget = await this.budgetRepository.updateStatus(
        id,
        BudgetStatus.SENT,
      );

      // Buscar dados do cliente para envio de notificação
      const customer = await this.customerRepository.findById(
        budget.customerId,
      );
      if (customer) {
        // Enviar notificação por email
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

      if (budget.status !== BudgetStatus.SENT) {
        this.errorHandler.handleError(
          new Error(BUDGET_CONSTANTS.MESSAGES.INVALID_STATUS_TRANSITION),
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
        this.errorHandler.handleError(
          new Error(BUDGET_CONSTANTS.MESSAGES.INVALID_STATUS_TRANSITION),
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
