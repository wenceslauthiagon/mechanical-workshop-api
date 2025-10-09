/**
 * Application Constants
 * Centralized constants for the Mechanical Workshop API
 */

export const APP_CONSTANTS = {
  // Application Info
  APP_NAME: 'Mechanical Workshop API',
  APP_DESCRIPTION: 'Sistema de gestão para oficina mecânica',
  APP_VERSION: '1.0.0',

  // Default Values
  DEFAULT_PORT: 3000,
  DEFAULT_HOST: '0.0.0.0',
  DEFAULT_JWT_EXPIRES_IN: '24h',
  DEFAULT_SWAGGER_PATH: 'api',

  // Security
  MIN_JWT_SECRET_LENGTH: 32,
  PASSWORD_HASH_ROUNDS: 10,

  // Health Check
  DEFAULT_HEALTH_TIMEOUT: 5000,
  DEFAULT_HEALTH_RETRIES: 3,
  DEFAULT_HEALTH_RETRY_DELAY: 1000,

  // Database
  DEFAULT_DATABASE_SCHEMA: 'public',

  // Admin User Defaults (for development only)
  DEV_ADMIN: {
    USERNAME: 'admin',
    EMAIL: 'admin@example.com',
    // Note: Password should ALWAYS come from environment in production
  },
} as const;

/**
 * Environment-specific configuration keys
 */
export const ENV_KEYS = {
  // Server
  NODE_ENV: 'NODE_ENV',
  PORT: 'PORT',
  HOST: 'HOST',

  // Database
  DATABASE_URL: 'DATABASE_URL',

  // JWT
  JWT_SECRET: 'JWT_SECRET',
  JWT_EXPIRES_IN: 'JWT_EXPIRES_IN',

  // Admin User
  ADMIN_USERNAME: 'ADMIN_USERNAME',
  ADMIN_EMAIL: 'ADMIN_EMAIL',
  ADMIN_PASSWORD: 'ADMIN_PASSWORD',

  // Health Check
  HEALTH_CHECK_URL: 'HEALTH_CHECK_URL',
  HEALTH_CHECK_TIMEOUT: 'HEALTH_CHECK_TIMEOUT',
  HEALTH_CHECK_RETRIES: 'HEALTH_CHECK_RETRIES',
  HEALTH_CHECK_RETRY_DELAY: 'HEALTH_CHECK_RETRY_DELAY',

  // Swagger
  SWAGGER_TITLE: 'SWAGGER_TITLE',
  SWAGGER_DESCRIPTION: 'SWAGGER_DESCRIPTION',
  SWAGGER_VERSION: 'SWAGGER_VERSION',
  SWAGGER_PATH: 'SWAGGER_PATH',
} as const;

/**
 * Required environment variables
 */
export const REQUIRED_ENV_VARS = [
  ENV_KEYS.JWT_SECRET,
  ENV_KEYS.DATABASE_URL,
] as const;

/**
 * Environment types
 */
export const NODE_ENVIRONMENTS = {
  DEVELOPMENT: 'development',
  PRODUCTION: 'production',
  TEST: 'test',
} as const;

export type NodeEnvironment =
  (typeof NODE_ENVIRONMENTS)[keyof typeof NODE_ENVIRONMENTS];
