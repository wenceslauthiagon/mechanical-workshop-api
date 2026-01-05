import { Injectable, Logger } from '@nestjs/common';

export interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export interface StatusChangeEmailData {
  customerName: string;
  customerEmail: string;
  orderNumber: string;
  newStatus: string; // RECEIVED, IN_DIAGNOSIS, AWAITING_APPROVAL, IN_EXECUTION, FINISHED, DELIVERED
  statusMessage: string;
  orderLink?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      this.logger.log(`Sending email to ${options.to}: ${options.subject}`);
      this.logger.debug(`Email content: ${options.text}`);
      return true;
    } catch (error: any) {
      this.logger.error(`Failed to send email: ${error.message}`, error.stack);
      return false;
    }
  }

  async sendStatusChangeNotification(
    data: StatusChangeEmailData,
  ): Promise<boolean> {
    const statusMessages: Record<string, string> = {
      RECEIVED: 'recebida e aguardando diagnóstico',
      IN_DIAGNOSIS: 'em diagnóstico',
      AWAITING_APPROVAL: 'aguardando sua aprovação do orçamento',
      IN_EXECUTION: 'em execução',
      FINISHED: 'finalizada',
      DELIVERED: 'entregue',
    };

    const subject = `Atualização da Ordem de Serviço ${data.orderNumber}`;
    const statusText = statusMessages[data.newStatus] || data.statusMessage;

    const text = `
Olá ${data.customerName},

Sua ordem de serviço ${data.orderNumber} foi atualizada.

Status atual: ${statusText}

${data.orderLink ? `Acompanhe sua ordem de serviço: ${data.orderLink}` : ''}

Atenciosamente,
Equipe Oficina Mecânica
    `.trim();

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Atualização da Ordem de Serviço</h2>
        <p>Olá <strong>${data.customerName}</strong>,</p>
        <p>Sua ordem de serviço <strong>${data.orderNumber}</strong> foi atualizada.</p>
        <div style="background-color: #f0f0f0; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Status atual:</strong> ${statusText}</p>
        </div>
        ${data.orderLink ? `<p><a href="${data.orderLink}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Acompanhar Ordem de Serviço</a></p>` : ''}
        <p>Atenciosamente,<br/>Equipe Oficina Mecânica</p>
      </div>
    `;

    return this.sendEmail({
      to: data.customerEmail,
      subject,
      text,
      html,
    });
  }

  async sendBudgetApprovalRequest(data: {
    customerName: string;
    customerEmail: string;
    orderNumber: string;
    budgetId: string;
    totalValue: number;
    approvalLink: string;
  }): Promise<boolean> {
    const subject = `Orçamento Disponível - OS ${data.orderNumber}`;

    const text = `
Olá ${data.customerName},

Seu orçamento para a ordem de serviço ${data.orderNumber} está pronto!

Valor total: R$ ${data.totalValue.toFixed(2)}

Acesse o link abaixo para visualizar os detalhes e aprovar:
${data.approvalLink}

Atenciosamente,
Equipe Oficina Mecânica
    `.trim();

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Orçamento Disponível</h2>
        <p>Olá <strong>${data.customerName}</strong>,</p>
        <p>Seu orçamento para a ordem de serviço <strong>${data.orderNumber}</strong> está pronto!</p>
        <div style="background-color: #f0f0f0; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Valor total:</strong> R$ ${data.totalValue.toFixed(2)}</p>
        </div>
        <p><a href="${data.approvalLink}" style="background-color: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Visualizar e Aprovar Orçamento</a></p>
        <p>Atenciosamente,<br/>Equipe Oficina Mecânica</p>
      </div>
    `;

    return this.sendEmail({
      to: data.customerEmail,
      subject,
      text,
      html,
    });
  }
}
