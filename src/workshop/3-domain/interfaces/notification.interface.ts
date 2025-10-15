// Interface para provedor de email
export interface IEmailProvider {
  sendEmail(data: EmailData): Promise<void>;
}

// Interface para provedor de SMS (preparado para futuro)
export interface ISmsProvider {
  sendSms(data: SmsData): Promise<void>;
}

// Dados para envio de email
export interface EmailData {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  attachments?: EmailAttachment[];
}

// Dados para envio de SMS
export interface SmsData {
  phone: string;
  message: string;
}

// Anexos de email
export interface EmailAttachment {
  filename: string;
  content: Buffer | string;
  contentType?: string;
}

// Dados para templates de email
export interface BudgetEmailData {
  customerName: string;
  budgetId: string;
  orderNumber: string;
  total: number;
  validUntil: Date;
  viewLink: string;
  approveLink: string;
  rejectLink: string;
  companyName: string;
  companyPhone: string;
  companyEmail: string;
}

export interface ServiceOrderEmailData {
  mechanicName: string;
  customerName: string;
  orderNumber: string;
  vehicleInfo: string;
  description: string;
  priority: string;
  dueDate?: Date;
  companyName: string;
}
