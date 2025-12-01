export const PRISMA_ERROR_CODES = {
  PREFIX: 'P',
  UNIQUE_CONSTRAINT_VIOLATION: 'P2002',
  FOREIGN_KEY_CONSTRAINT_VIOLATION: 'P2003',
  RECORD_NOT_FOUND: 'P2025',
} as const;

export const CONSTRAINT_FIELDS = {
  EMAIL: 'email',
  MICROCHIP_NUMBER: 'microchipNumber',
  PHONE: 'phone',
} as const;
