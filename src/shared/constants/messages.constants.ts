export const ERROR_MESSAGES = {
  // General
  UNEXPECTED_ERROR: 'An unexpected error occurred',
  INTERNAL_SERVER_ERROR: 'Erro interno do servidor',
  
  // Validation
  VALIDATION_FAILED: 'Validation failed',
  INVALID_INPUT: 'Invalid input data',
  
  // Auth
  TOKEN_EXPIRED: 'Token inválido ou expirado',
  INVALID_CREDENTIALS: 'Email ou senha inválidos',
  EMAIL_ALREADY_REGISTERED: 'Já existe um usuário com este email',
  PASSWORD_MISMATCH: 'As senhas não coincidem',
  PASSWORD_TOO_SHORT: 'A senha deve ter no mínimo 6 caracteres',
  
  // Not Found
  OWNER_NOT_FOUND: 'Owner not found',
  PET_NOT_FOUND: 'Pet not found',
  VACCINE_NOT_FOUND: 'Vaccine not found',
  MEDICATION_NOT_FOUND: 'Medication not found',
  VETERINARY_VISIT_NOT_FOUND: 'Veterinary visit not found',
  REMINDER_NOT_FOUND: 'Reminder not found',
  WEIGHT_HISTORY_NOT_FOUND: 'Weight history not found',
  ALLERGY_NOT_FOUND: 'Allergy not found',
  RESOURCE_NOT_FOUND: 'Resource not found',
  RELATED_RESOURCE_NOT_FOUND: 'Related resource not found',
  
  // Conflict
  EMAIL_ALREADY_EXISTS: 'Email already registered',
  MICROCHIP_ALREADY_EXISTS: 'Microchip number already registered',
  DUPLICATE_ENTRY: 'Duplicate entry found',
  PHONE_ALREADY_EXISTS: 'Já existe um usuário com este telefone',
  CONSTRAINT_VIOLATION: 'Dados duplicados encontrados. Verifique os campos únicos.',
  
  // Business Rules
  INVALID_WEIGHT: 'Weight must be greater than 0',
  INVALID_BIRTH_DATE: 'Birth date cannot be in the future',
  INVALID_APPLICATION_DATE: 'Application date cannot be in the future',
  INVALID_NEXT_DOSE_DATE: 'Next dose date must be in the future',
  INVALID_DATE_RANGE: 'End date must be after start date',
  INVALID_EMAIL_FORMAT: 'Invalid email format',
} as const;

export const SUCCESS_MESSAGES = {
  OWNER_CREATED: 'Owner created successfully',
  PET_CREATED: 'Pet created successfully',
  VACCINE_RECORDED: 'Vaccine recorded successfully',
  MEDICATION_SCHEDULED: 'Medication scheduled successfully',
  VISIT_RECORDED: 'Veterinary visit recorded successfully',
  RESOURCE_UPDATED: 'Resource updated successfully',
  RESOURCE_DELETED: 'Resource deleted successfully',
} as const;
