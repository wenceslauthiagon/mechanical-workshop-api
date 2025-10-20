// Constantes para Budget
export const BUDGET_CONSTANTS = {
  VALIDATION: {
    MIN_ITEMS: 1,
    MAX_ITEMS: 50,
    MIN_VALID_DAYS: 1,
    MAX_VALID_DAYS: 90,
    MAX_DISCOUNT_PERCENTAGE: 50,
  },
  DEFAULT_VALUES: {
    VALID_DAYS: 15,
    TAX_RATE: 0.1, // 10%
    DISCOUNT: 0,
    CURRENCY: 'BRL',
  },
  MESSAGES: {
    NOT_FOUND: 'Orçamento não encontrado',
    ONLY_SENT_CAN_BE_APPROVED: 'Apenas orçamentos enviados podem ser aprovados',
    ONLY_SENT_CAN_BE_REJECTED:
      'Apenas orçamentos enviados podem ser rejeitados',
    ONLY_DRAFT_CAN_BE_SENT: 'Apenas orçamentos em rascunho podem ser enviados',
    EXPIRED_CANNOT_BE_APPROVED: 'Orçamento expirado não pode ser aprovado',
    ALREADY_EXISTS_FOR_SERVICE_ORDER:
      'Já existe um orçamento para esta ordem de serviço',
    ACTIVE_BUDGET_EXISTS_FOR_SERVICE_ORDER:
      'Já existe um orçamento ativo para esta ordem de serviço. Finalize o orçamento atual antes de criar um novo.',
    ITEMS_REQUIRED: 'Items do orçamento são obrigatórios',
    SERVICE_ORDER_NOT_FOUND: 'Ordem de serviço não encontrada',
    CUSTOMER_NOT_FOUND: 'Cliente não encontrado',
    ALREADY_SENT: 'Orçamento já foi enviado',
    ALREADY_APPROVED: 'Orçamento já foi aprovado',
    ALREADY_REJECTED: 'Orçamento já foi rejeitado',
    EXPIRED: 'Orçamento expirado',
    CANNOT_MODIFY: 'Orçamento não pode ser modificado',
    INVALID_STATUS_TRANSITION: 'Transição de status inválida',
    CREATED_SUCCESS: 'Orçamento criado com sucesso',
    UPDATED_SUCCESS: 'Orçamento atualizado com sucesso',
    SENT_SUCCESS: 'Orçamento enviado com sucesso',
    APPROVED_SUCCESS: 'Orçamento aprovado com sucesso',
    REJECTED_SUCCESS: 'Orçamento rejeitado com sucesso',
    ERROR_CREATE: 'Erro ao criar orçamento',
    ERROR_UPDATE: 'Erro ao atualizar orçamento',
    ERROR_SEND: 'Erro ao enviar orçamento',
    ERROR_APPROVE: 'Erro ao aprovar orçamento',
    ERROR_REJECT: 'Erro ao rejeitar orçamento',
    ERROR_CALCULATE: 'Erro ao calcular orçamento',
    ERROR_GENERATE_PDF: 'Erro ao gerar PDF do orçamento',
    ERROR_SEND_EMAIL: 'Erro ao enviar email do orçamento',
    ERROR_SEND_SMS: 'Erro ao enviar SMS do orçamento',
    INVALID_TOKEN: 'Token de acesso inválido',
    EXPIRED_TOKEN: 'Token de acesso expirado',
    TOKEN_REQUIRED: 'Token de acesso obrigatório',
  },
  ERROR_CODES: {
    BUDGET_NOT_FOUND: 'BUDGET_NOT_FOUND',
    BUDGET_ALREADY_SENT: 'BUDGET_ALREADY_SENT',
    BUDGET_ALREADY_APPROVED: 'BUDGET_ALREADY_APPROVED',
    BUDGET_ALREADY_REJECTED: 'BUDGET_ALREADY_REJECTED',
    BUDGET_EXPIRED: 'BUDGET_EXPIRED',
    BUDGET_CANNOT_MODIFY: 'BUDGET_CANNOT_MODIFY',
    INVALID_STATUS_TRANSITION: 'INVALID_STATUS_TRANSITION',
    CREATE_BUDGET_ERROR: 'CREATE_BUDGET_ERROR',
    UPDATE_BUDGET_ERROR: 'UPDATE_BUDGET_ERROR',
    SEND_BUDGET_ERROR: 'SEND_BUDGET_ERROR',
    APPROVE_BUDGET_ERROR: 'APPROVE_BUDGET_ERROR',
    REJECT_BUDGET_ERROR: 'REJECT_BUDGET_ERROR',
    CALCULATE_BUDGET_ERROR: 'CALCULATE_BUDGET_ERROR',
    GENERATE_PDF_ERROR: 'GENERATE_PDF_ERROR',
    SEND_EMAIL_ERROR: 'SEND_EMAIL_ERROR',
    SEND_SMS_ERROR: 'SEND_SMS_ERROR',
  },
  EMAIL: {
    SUBJECT_NEW_BUDGET: 'Orçamento Disponível - {orderNumber}',
    SUBJECT_BUDGET_APPROVED: 'Orçamento Aprovado - {orderNumber}',
    SUBJECT_BUDGET_REJECTED: 'Orçamento Rejeitado - {orderNumber}',
    TEMPLATE_NEW_BUDGET: 'new-budget',
    TEMPLATE_BUDGET_APPROVED: 'budget-approved',
    TEMPLATE_BUDGET_REJECTED: 'budget-rejected',
  },
  SMS: {
    NEW_BUDGET:
      'Seu orçamento está pronto! Acesse o link para visualizar: {link}',
    BUDGET_APPROVED:
      'Orçamento aprovado! Iniciando o serviço. Acompanhe em: {link}',
    BUDGET_REJECTED: 'Orçamento rejeitado. Entre em contato para negociar.',
  },
  PDF: {
    TITLE: 'ORÇAMENTO',
    COMPANY_NAME: 'Oficina Mecânica',
    FOOTER_TEXT: 'Orçamento válido até {validUntil}',
  },
  STATUS_TRANSITIONS: {
    DRAFT: ['SENT'],
    SENT: ['APPROVED', 'REJECTED', 'EXPIRED'],
    APPROVED: [],
    REJECTED: [],
    EXPIRED: [],
  },
} as const;

// Status válidos para orçamento
export const BUDGET_STATUS = {
  DRAFT: 'DRAFT',
  SENT: 'SENT',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  EXPIRED: 'EXPIRED',
} as const;

export type BudgetStatusType = keyof typeof BUDGET_STATUS;
