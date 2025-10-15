// Constantes para notificações
export const NOTIFICATION_CONSTANTS = {
  EMAIL: {
    ENABLED: true,
    FROM_NAME: 'Oficina Mecânica',
    FROM_EMAIL: process.env.SMTP_FROM_EMAIL || 'noreply@oficina.com',
    SMTP: {
      HOST: process.env.SMTP_HOST || 'smtp.gmail.com',
      PORT: parseInt(process.env.SMTP_PORT || '587'),
      SECURE: process.env.SMTP_SECURE === 'true',
      USER: process.env.SMTP_USER,
      PASS: process.env.SMTP_PASS,
    },
  },
  SMS: {
    ENABLED: false,
    PROVIDER: 'mock',
    MOCK_DELAY: 100,
  },
  TEMPLATES: {
    BUDGET_READY: 'Orçamento Disponível',
    BUDGET_APPROVED: 'Orçamento Aprovado',
    BUDGET_REJECTED: 'Orçamento Rejeitado',
    BUDGET_EXPIRED: 'Orçamento Expirado',
    SERVICE_ORDER_ASSIGNED: 'Nova Ordem de Serviço',
  },
  COMPANY: {
    NAME: process.env.COMPANY_NAME || 'Oficina Mecânica',
    PHONE: process.env.COMPANY_PHONE || '(11) 99999-9999',
    EMAIL: process.env.COMPANY_EMAIL || 'contato@oficina.com',
    ADDRESS: process.env.COMPANY_ADDRESS || 'Rua da Oficina, 123',
    WEBSITE: process.env.COMPANY_WEBSITE || 'https://oficina.com',
  },
  URLS: {
    BASE: process.env.APP_URL || 'http://localhost:3000',
    PUBLIC_BUDGET: '/public/budgets',
  },
  MESSAGES: {
    EMAIL_SENT_SUCCESS: 'Email sent successfully',
    EMAIL_SENT_ERROR: 'Failed to send email',
    SMS_SENT_SUCCESS: 'SMS sent successfully',
    SMS_SENT_ERROR: 'Failed to send SMS',
    CONNECTION_VERIFIED: 'Connection verified successfully',
    CONNECTION_FAILED: 'Connection verification failed',
    TRANSPORTER_INITIALIZED: 'Email transporter initialized successfully',
    TRANSPORTER_FAILED: 'Failed to initialize email transporter',
    TRANSPORTER_NOT_INITIALIZED: 'Email transporter not initialized',
    MOCK_SMS_PREFIX: '[MOCK SMS]',
    MOCK_SMS_CONNECTION: 'Connection verification - always returns true',
    UNSUPPORTED_PROVIDER: 'Unsupported provider',
  },
  ERROR_CODES: {
    EMAIL_SEND_ERROR: 'EMAIL_SEND_ERROR',
    SMS_SEND_ERROR: 'SMS_SEND_ERROR',
    TEMPLATE_NOT_FOUND: 'TEMPLATE_NOT_FOUND',
    INVALID_EMAIL: 'INVALID_EMAIL',
    INVALID_PHONE: 'INVALID_PHONE',
  },
} as const;
