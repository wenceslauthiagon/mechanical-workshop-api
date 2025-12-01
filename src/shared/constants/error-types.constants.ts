export const ERROR_TYPE_NAMES = {
  OK: 'OK',
  CREATED: 'Created',
  NO_CONTENT: 'No Content',
  BAD_REQUEST: 'Bad Request',
  UNAUTHORIZED: 'Unauthorized',
  FORBIDDEN: 'Forbidden',
  NOT_FOUND: 'Not Found',
  CONFLICT: 'Conflict',
  INTERNAL_SERVER_ERROR: 'Internal Server Error',
  UNKNOWN_ERROR: 'Unknown Error',
  VALIDATION_ERROR: 'Validation Error',
  DOMAIN_ERROR: 'Domain Error',
} as const;

export const ERROR_LOG_MESSAGES = {
  UNEXPECTED_ERROR: 'Unexpected error:',
  UNKNOWN_ERROR: 'Unknown error:',
  DATABASE_ERROR: 'Database error:',
  VALIDATION_FAILED: 'Validation failed:',
} as const;
