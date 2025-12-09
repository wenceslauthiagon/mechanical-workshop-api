import { PrismaClient } from '@prisma/client';
import { logger } from '@shared/services/Logger';

type LogLevel = 'query' | 'error' | 'warn' | 'info';

const LOG_CONFIG: Record<string, readonly LogLevel[]> = {
  development: ['query', 'error', 'warn'],
  production: ['error'],
};

const NODE_ENV = process.env.NODE_ENV || 'development';
const isDevelopment = NODE_ENV === 'development';

export const prisma = new PrismaClient({
  log: (isDevelopment ? LOG_CONFIG.development : LOG_CONFIG.production) as LogLevel[],
});

const DATABASE_CONNECTION_MESSAGES = {
  SUCCESS: 'Connected successfully',
  FAILURE: 'Connection failed',
};

const DATABASE_CONTEXT = 'DatabaseConnection';

const EXIT_CODES = {
  FAILURE: 1,
};

export const connectDatabase = async (): Promise<void> => {
  try {
    await prisma.$connect();
    logger.info(DATABASE_CONNECTION_MESSAGES.SUCCESS, DATABASE_CONTEXT);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(DATABASE_CONNECTION_MESSAGES.FAILURE, errorMessage, DATABASE_CONTEXT);
    process.exit(EXIT_CODES.FAILURE);
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  await prisma.$disconnect();
};
