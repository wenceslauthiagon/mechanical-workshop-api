import { Injectable, Logger } from '@nestjs/common';
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
    private readonly emailProvider: IEmailProvider,
    private readonly smsProvider: ISmsProvider,
  ) {}

  async sendBudgetReadyNotification(
    budget: Budget,
    customerEmail: string,
    customerName: string,
    customerPhone?: string,
  ): Promise<void> {
    try {
      const emailData = this.prepareBudgetEmailData(budget, customerName);

      // Enviar email
      await this.emailProvider.sendEmail({
        to: customerEmail,
        subject: `${NOTIFICATION_CONSTANTS.TEMPLATES.BUDGET_READY} - ${budget.id.substring(0, 8)}`,
        html: EmailTemplates.budgetReady(emailData),
      });

      // Enviar SMS se habilitado e telefone fornecido
      if (NOTIFICATION_CONSTANTS.SMS.ENABLED && customerPhone) {
        await this.smsProvider.sendSms({
          phone: customerPhone,
          message: `Orçamento pronto! Acesse: ${emailData.viewLink}`,
        });
      }

      this.logger.log(`Budget ready notification sent successfully`, {
        budgetId: budget.id,
        customerEmail,
      });
    } catch (error) {
      this.logger.error('Failed to send budget ready notification', {
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

      this.logger.log(`Budget approved notification sent successfully`, {
        budgetId: budget.id,
        customerEmail,
      });
    } catch (error) {
      this.logger.error('Failed to send budget approved notification', {
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

      this.logger.log(`Budget rejected notification sent successfully`, {
        budgetId: budget.id,
        customerEmail,
      });
    } catch (error) {
      this.logger.error('Failed to send budget rejected notification', {
        error: error.message,
        budgetId: budget.id,
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
    const publicPath = NOTIFICATION_CONSTANTS.URLS.PUBLIC_BUDGET;

    return {
      customerName,
      budgetId: budget.id,
      orderNumber: budget.serviceOrderId,
      total: budget.total,
      validUntil: budget.validUntil,
      viewLink: `${baseUrl}${publicPath}/${budget.id}`,
      approveLink: `${baseUrl}${publicPath}/${budget.id}/approve`,
      rejectLink: `${baseUrl}${publicPath}/${budget.id}/reject`,
      companyName: NOTIFICATION_CONSTANTS.COMPANY.NAME,
      companyPhone: NOTIFICATION_CONSTANTS.COMPANY.PHONE,
      companyEmail: NOTIFICATION_CONSTANTS.COMPANY.EMAIL,
    };
  }
}
