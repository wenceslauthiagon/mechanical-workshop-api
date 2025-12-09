export const VALIDATION_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
} as const;

export const VALIDATION_LIMITS = {
  MIN_NAME_LENGTH: 1,
  MAX_NAME_LENGTH: 200,
  MIN_PHONE_LENGTH: 8,
  MAX_PHONE_LENGTH: 20,
  MAX_ADDRESS_LENGTH: 500,
  MIN_WEIGHT: 0,
} as const;
