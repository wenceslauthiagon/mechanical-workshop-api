import { Injectable, Inject } from '@nestjs/common';
import type {
  IBudgetRepository,
  CreateBudgetData,
  UpdateBudgetData,
  Budget,
} from '../../3-domain/repositories/budget.repository.interface';
import type { ICustomerRepository } from '../../3-domain/repositories/customer-repository.interface';
import type { IServiceOrderRepository } from '../../3-domain/repositories/service-order.repository.interface';
import type { IServiceRepository } from '../../3-domain/repositories/service-repository.interface';
import type { IPartRepository } from '../../3-domain/repositories/part-repository.interface';
import { BudgetStatus } from '../../3-domain/entities/budget.entity';
import { ServiceOrderStatus } from '../../../shared/enums/service-order-status.enum';
import { ErrorHandlerService } from '../../../shared/services/error-handler.service';
import { NotificationService } from './notification.service';
import { BUDGET_CONSTANTS } from '../../../shared/constants/budget.constants';
import { BudgetWithRelationsResponseDto } from '../../1-presentation/dtos/budget/budget-with-relations-response.dto';
import { PaginationDto, PaginatedResponseDto } from '../../../shared';

@Injectable()
export class BudgetService {
  constructor(
    @Inject('IBudgetRepository')
    private readonly budgetRepository: IBudgetRepository,
    @Inject('ICustomerRepository')
    private readonly customerRepository: ICustomerRepository,
    @Inject('IServiceOrderRepository')
    private readonly serviceOrderRepository: IServiceOrderRepository,
    @Inject('IServiceRepository')
    private readonly serviceRepository: IServiceRepository,
    @Inject('IPartRepository')
    private readonly partRepository: IPartRepository,
    private readonly errorHandler: ErrorHandlerService,
    private readonly notificationService: NotificationService,
  ) {}

  async create(data: CreateBudgetData): Promise<Budget> {
    // Validate that service order exists
    const serviceOrder = await this.serviceOrderRepository.findById(
      data.serviceOrderId,
    );
    if (!serviceOrder) {
      this.errorHandler.handleNotFoundError(
        BUDGET_CONSTANTS.MESSAGES.SERVICE_ORDER_NOT_FOUND,
      );
    }

    // Validate that customer exists
    const customer = await this.customerRepository.findById(data.customerId);
    if (!customer) {
      this.errorHandler.handleNotFoundError(
        BUDGET_CONSTANTS.MESSAGES.CUSTOMER_NOT_FOUND,
      );
    }

    // Validate items
    if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
      this.errorHandler.handleError(
        new Error(BUDGET_CONSTANTS.MESSAGES.ITEMS_REQUIRED),
      );
    }

    // Check if budget already exists for this service order
    const existingBudgets = await this.budgetRepository.findByServiceOrderId(
      data.serviceOrderId,
    );

    // Only prevent creation if there's an active budget (not rejected or expired)
    const activeBudget = existingBudgets.find(
      (budget) =>
        budget.status === BudgetStatus.RASCUNHO ||
        budget.status === BudgetStatus.ENVIADO ||
        budget.status === BudgetStatus.APROVADO,
    );

    if (activeBudget) {
      this.errorHandler.handleConflictError(
        BUDGET_CONSTANTS.MESSAGES.ACTIVE_BUDGET_EXISTS_FOR_SERVICE_ORDER,
      );
    }

    return await this.budgetRepository.create(data);
  }

  async findAll(): Promise<Budget[]> {
    try {
      return await this.budgetRepository.findAll();
    } catch (error) {
      this.errorHandler.handleError(error);
    }
  }

  async findAllPaginated(
    paginationDto: PaginationDto,
  ): Promise<PaginatedResponseDto<Budget>> {
    try {
      const [budgets, total] = await Promise.all([
        this.budgetRepository.findMany(paginationDto.skip, paginationDto.take),
        this.budgetRepository.count(),
      ]);

      return new PaginatedResponseDto(
        budgets,
        paginationDto.page || 0,
        paginationDto.size || 10,
        total,
      );
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

      // Update budget status to approved
      const approvedBudget = await this.budgetRepository.updateStatus(
        id,
        BudgetStatus.APROVADO,
      );

      // Update service order status and set approvedAt
      await this.serviceOrderRepository.updateStatus(budget.serviceOrderId, {
        status: ServiceOrderStatus.EM_EXECUCAO,
        approvedAt: new Date(),
        startedAt: new Date(),
      });

      // Add status history entry
      await this.serviceOrderRepository.addStatusHistory({
        serviceOrderId: budget.serviceOrderId,
        status: ServiceOrderStatus.EM_EXECUCAO,
        notes: 'Orçamento aprovado pelo cliente - execução iniciada',
      });

      return approvedBudget;
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

  // Methods with data freshness for related entities
  async findByIdWithRelations(
    id: string,
  ): Promise<BudgetWithRelationsResponseDto> {
    try {
      const budget = await this.findById(id);
      return await this.mapToEnrichedResponseDto(budget);
    } catch (error) {
      this.errorHandler.handleError(error);
    }
  }

  async findAllWithRelations(): Promise<BudgetWithRelationsResponseDto[]> {
    try {
      const budgets = await this.budgetRepository.findAll();
      return await Promise.all(
        budgets.map((budget) => this.mapToEnrichedResponseDto(budget)),
      );
    } catch (error) {
      this.errorHandler.handleError(error);
    }
  }

  async findByCustomerIdWithRelations(
    customerId: string,
  ): Promise<BudgetWithRelationsResponseDto[]> {
    try {
      const budgets = await this.budgetRepository.findByCustomerId(customerId);
      return await Promise.all(
        budgets.map((budget) => this.mapToEnrichedResponseDto(budget)),
      );
    } catch (error) {
      this.errorHandler.handleError(error);
    }
  }

  async findByServiceOrderIdWithRelations(
    serviceOrderId: string,
  ): Promise<BudgetWithRelationsResponseDto[]> {
    try {
      const budgets =
        await this.budgetRepository.findByServiceOrderId(serviceOrderId);
      return await Promise.all(
        budgets.map((budget) => this.mapToEnrichedResponseDto(budget)),
      );
    } catch (error) {
      this.errorHandler.handleError(error);
    }
  }

  private async mapToEnrichedResponseDto(
    budget: Budget,
  ): Promise<BudgetWithRelationsResponseDto> {
    // Fetch fresh data for all related entities
    const customer = await this.customerRepository.findById(budget.customerId);
    const serviceOrder = await this.serviceOrderRepository.findById(
      budget.serviceOrderId,
    );

    // Fetch fresh data for each budget item's related service/part
    const enrichedItems = await Promise.all(
      (budget.items || []).map(async (item) => {
        let service:
          | { name: string; description: string; category: string }
          | undefined;
        let part:
          | { name: string; description: string; partNumber: string }
          | undefined;

        if (item.type === 'SERVICE' && item.serviceId) {
          const serviceData = await this.serviceRepository.findById(
            item.serviceId,
          );
          if (serviceData) {
            service = {
              name: serviceData.name,
              description: serviceData.description || '',
              category: serviceData.category,
            };
          }
        }

        if (item.type === 'PART' && item.partId) {
          const partData = await this.partRepository.findById(item.partId);
          if (partData) {
            part = {
              name: partData.name,
              description: partData.description || '',
              partNumber: partData.partNumber || '',
            };
          }
        }

        return {
          id: item.id,
          type: item.type,
          serviceId: item.serviceId,
          partId: item.partId,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.total,
          service,
          part,
        };
      }),
    );

    return {
      id: budget.id,
      serviceOrderId: budget.serviceOrderId,
      customerId: budget.customerId,
      subtotal: budget.subtotal,
      taxes: budget.taxes,
      discount: budget.discount,
      total: budget.total,
      validUntil: budget.validUntil,
      status: budget.status,
      createdAt: budget.createdAt,
      updatedAt: budget.updatedAt,
      customer: {
        id: customer?.id || '',
        name: customer?.name || '',
        document: customer?.document || '',
        email: customer?.email || '',
        phone: customer?.phone || '',
      },
      serviceOrder: {
        id: serviceOrder?.id || '',
        orderNumber: serviceOrder?.orderNumber || '',
        status: serviceOrder?.status || '',
        description: serviceOrder?.description || '',
      },
      items: enrichedItems,
    };
  }
}
