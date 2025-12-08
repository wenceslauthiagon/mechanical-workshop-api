export const NOTIFICATION_CONFIG = {
  PROVIDERS: {
    EMAIL: process.env.EMAIL_PROVIDER || 'gmail',
    SMS: process.env.SMS_PROVIDER || 'mock',
  },

  GMAIL: {
    HOST: process.env.SMTP_HOST || 'smtp.gmail.com',
    PORT: parseInt(process.env.SMTP_PORT || '587'),
    SECURE: process.env.SMTP_SECURE === 'true',
    USER: process.env.SMTP_USER,
    PASS: process.env.SMTP_PASS,
  },

  COMPANY: {
    NAME: process.env.COMPANY_NAME || 'Oficina Mecânica',
    PHONE: process.env.COMPANY_PHONE || '(11) 99999-9999',
    EMAIL: process.env.COMPANY_EMAIL || 'contato@oficina.com',
  },

  URLS: {
    BASE: process.env.APP_URL || 'http://localhost:3000',
    PUBLIC_BUDGET: '/public/budgets',
  },
} as const;
