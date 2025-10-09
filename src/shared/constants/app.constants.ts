export const APP_CONSTANTS = {
  APP_NAME: 'Mechanical Workshop API',
  APP_DESCRIPTION: 'Sistema de gestão para oficina mecânica',
  APP_VERSION: '1.0.0',

  DEFAULT_PORT: 3000,
  DEFAULT_HOST: '0.0.0.0',
  DEFAULT_JWT_EXPIRES_IN: '24h',
  DEFAULT_SWAGGER_PATH: 'api',

  MIN_JWT_SECRET_LENGTH: 32,
  PASSWORD_HASH_ROUNDS: 10,

  DEFAULT_HEALTH_TIMEOUT: 5000,
  DEFAULT_HEALTH_RETRIES: 3,
  DEFAULT_HEALTH_RETRY_DELAY: 1000,

  DEFAULT_DATABASE_SCHEMA: 'public',

  // Security defaults
  DEFAULT_JWT_SECRET_FALLBACK: 'your-secret-key-change-in-production',
  RADIX_BASE_10: 10,

  // Health check defaults
  DEFAULT_HEALTH_URL: 'http://localhost:3000/health',

  // Service Order constants
  ORDER_NUMBER_PADDING: 3,
  ORDER_NUMBER_PAD_CHAR: '0',

  // Time conversion constants
  MS_TO_HOURS_DIVISOR: 1000 * 60 * 60,
  PERCENTAGE_MAX: 100,

  // Development defaults - never used in production
  DEV_ADMIN: {
    USERNAME: 'admin',
    EMAIL: 'admin@example.com',
  },
} as const;

export const ENV_KEYS = {
  NODE_ENV: 'NODE_ENV',
  PORT: 'PORT',
  HOST: 'HOST',

  DATABASE_URL: 'DATABASE_URL',

  JWT_SECRET: 'JWT_SECRET',
  JWT_EXPIRES_IN: 'JWT_EXPIRES_IN',

  ADMIN_USERNAME: 'ADMIN_USERNAME',
  ADMIN_EMAIL: 'ADMIN_EMAIL',
  ADMIN_PASSWORD: 'ADMIN_PASSWORD',

  HEALTH_CHECK_URL: 'HEALTH_CHECK_URL',
  HEALTH_CHECK_TIMEOUT: 'HEALTH_CHECK_TIMEOUT',
  HEALTH_CHECK_RETRIES: 'HEALTH_CHECK_RETRIES',
  HEALTH_CHECK_RETRY_DELAY: 'HEALTH_CHECK_RETRY_DELAY',

  SWAGGER_TITLE: 'SWAGGER_TITLE',
  SWAGGER_DESCRIPTION: 'SWAGGER_DESCRIPTION',
  SWAGGER_VERSION: 'SWAGGER_VERSION',
  SWAGGER_PATH: 'SWAGGER_PATH',
} as const;

export const REQUIRED_ENV_VARS = [
  ENV_KEYS.JWT_SECRET,
  ENV_KEYS.DATABASE_URL,
] as const;

export const NODE_ENVIRONMENTS = {
  DEVELOPMENT: 'development',
  PRODUCTION: 'production',
  TEST: 'test',
} as const;

export type NodeEnvironment =
  (typeof NODE_ENVIRONMENTS)[keyof typeof NODE_ENVIRONMENTS];
