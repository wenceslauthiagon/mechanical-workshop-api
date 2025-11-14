import { Injectable, Logger, Inject } from '@nestjs/common';
import { NOTIFICATION_CONSTANTS } from '../../../shared/constants/notification.constants';
import type {
  IEmailProvider,
  ISmsProvider,
  BudgetEmailData,
} from '../../3-domain/interfaces/notification.interface';
import { EmailTemplates } from '../../4-infrastructure/templates/email.templates';
import { Budget } from '../../3-domain/repositories/budget.repository.interface';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @Inject('IEmailProvider') private readonly emailProvider: IEmailProvider,
    @Inject('ISmsProvider') private readonly smsProvider: ISmsProvider,
  ) {}

  async sendBudgetReadyNotification(
    budget: Budget,
    customerEmail: string,
    customerName: string,
    customerPhone?: string,
  ): Promise<void> {
    try {
      const emailData = this.prepareBudgetEmailData(budget, customerName);

      // Send email
      await this.emailProvider.sendEmail({
        to: customerEmail,
        subject: `${NOTIFICATION_CONSTANTS.TEMPLATES.BUDGET_READY} - ${budget.id.substring(0, 8)}`,
        html: EmailTemplates.budgetReady(emailData),
      });

      // Send SMS if enabled and phone number provided.
      if (NOTIFICATION_CONSTANTS.SMS.ENABLED && customerPhone) {
        await this.smsProvider.sendSms({
          phone: customerPhone,
          message: `Orçamento pronto! Acesse: ${emailData.viewLink}`,
        });
      }

      this.logger.log(NOTIFICATION_CONSTANTS.MESSAGES.BUDGET_READY_SUCCESS, {
        budgetId: budget.id,
        customerEmail,
      });
    } catch (error) {
      this.logger.error(NOTIFICATION_CONSTANTS.MESSAGES.BUDGET_READY_ERROR, {
        error: error.message,
        budgetId: budget.id,
        customerEmail,
      });
      throw error;
    }
  }

  async sendBudgetApprovedNotification(
    budget: Budget,
    customerEmail: string,
    customerName: string,
  ): Promise<void> {
    try {
      const emailData = this.prepareBudgetEmailData(budget, customerName);

      await this.emailProvider.sendEmail({
        to: customerEmail,
        subject: `${NOTIFICATION_CONSTANTS.TEMPLATES.BUDGET_APPROVED} - ${budget.id.substring(0, 8)}`,
        html: EmailTemplates.budgetApproved(emailData),
      });

      this.logger.log(NOTIFICATION_CONSTANTS.MESSAGES.BUDGET_APPROVED_SUCCESS, {
        budgetId: budget.id,
        customerEmail,
      });
    } catch (error) {
      this.logger.error(NOTIFICATION_CONSTANTS.MESSAGES.BUDGET_APPROVED_ERROR, {
        error: error.message,
        budgetId: budget.id,
        customerEmail,
      });
      throw error;
    }
  }

  async sendBudgetRejectedNotification(
    budget: Budget,
    customerEmail: string,
    customerName: string,
  ): Promise<void> {
    try {
      const emailData = this.prepareBudgetEmailData(budget, customerName);

      await this.emailProvider.sendEmail({
        to: customerEmail,
        subject: `${NOTIFICATION_CONSTANTS.TEMPLATES.BUDGET_REJECTED} - ${budget.id.substring(0, 8)}`,
        html: EmailTemplates.budgetRejected(emailData),
      });

      this.logger.log(NOTIFICATION_CONSTANTS.MESSAGES.BUDGET_REJECTED_SUCCESS, {
        budgetId: budget.id,
        customerEmail,
      });
    } catch (error) {
      this.logger.error(NOTIFICATION_CONSTANTS.MESSAGES.BUDGET_REJECTED_ERROR, {
        error: error.message,
        budgetId: budget.id,
        customerEmail,
      });
      throw error;
    }
  }

  async sendServiceOrderStatusNotification(
    serviceOrderId: string,
    orderNumber: string,
    status: string,
    customerEmail: string,
    customerName: string,
    vehicleInfo: string,
    customerPhone?: string,
  ): Promise<void> {
    try {
      const message =
        NOTIFICATION_CONSTANTS.STATUS_MESSAGES[status] ||
        `Status atualizado para ${status}`;
      const subject = `${NOTIFICATION_CONSTANTS.TEMPLATES.SERVICE_ORDER_STATUS} ${orderNumber}`;

      await this.emailProvider.sendEmail({
        to: customerEmail,
        subject,
        html: EmailTemplates.serviceOrderStatus({
          customerName,
          orderNumber,
          vehicleInfo,
          status,
          message,
          companyName: NOTIFICATION_CONSTANTS.COMPANY.NAME,
          companyPhone: NOTIFICATION_CONSTANTS.COMPANY.PHONE,
          companyEmail: NOTIFICATION_CONSTANTS.COMPANY.EMAIL,
        }),
      });

      if (NOTIFICATION_CONSTANTS.SMS.ENABLED && customerPhone) {
        await this.smsProvider.sendSms({
          phone: customerPhone,
          message: `${orderNumber}: ${message}. ${NOTIFICATION_CONSTANTS.COMPANY.PHONE}`,
        });
      }

      this.logger.log(NOTIFICATION_CONSTANTS.MESSAGES.SERVICE_ORDER_SUCCESS, {
        serviceOrderId,
        orderNumber,
        status,
        customerEmail,
      });
    } catch (error) {
      this.logger.error(NOTIFICATION_CONSTANTS.MESSAGES.SERVICE_ORDER_ERROR, {
        error: error.message,
        serviceOrderId,
        orderNumber,
        status,
        customerEmail,
      });
      throw error;
    }
  }

  private prepareBudgetEmailData(
    budget: Budget,
    customerName: string,
  ): BudgetEmailData {
    const baseUrl = NOTIFICATION_CONSTANTS.URLS.BASE;

    return {
      customerName,
      budgetId: budget.id,
      orderNumber: budget.serviceOrderId,
      total: budget.total,
      validUntil: budget.validUntil,
      viewLink: `${baseUrl}/api/swagger#/Public%20-%20Budgets/PublicBudgetController_viewBudget`,
      approveLink: `${baseUrl}/api/swagger#/Public%20-%20Budgets/PublicBudgetController_approveBudget`,
      rejectLink: `${baseUrl}/api/swagger#/Public%20-%20Budgets/PublicBudgetController_rejectBudget`,
      companyName: NOTIFICATION_CONSTANTS.COMPANY.NAME,
      companyPhone: NOTIFICATION_CONSTANTS.COMPANY.PHONE,
      companyEmail: NOTIFICATION_CONSTANTS.COMPANY.EMAIL,
    };
  }
}
