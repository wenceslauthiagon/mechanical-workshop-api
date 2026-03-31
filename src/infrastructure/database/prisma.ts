import { PrismaClient } from '@prisma/client';
import { logger } from '@shared/services/Logger';

const prisma = new PrismaClient({
  log: [
    {
      emit: 'event',
      level: 'query',
    },
    {
      emit: 'event',
      level: 'error',
    },
    {
      emit: 'event',
      level: 'info',
    },
    {
      emit: 'event',
      level: 'warn',
    },
  ],
});

prisma.$on('query', (e) => {
  logger.debug(`Query: ${e.query} - Duration: ${e.duration}ms`, 'Prisma', {
    params: e.params,
    duration: e.duration,
  });
});

prisma.$on('error', (e) => {
  logger.error(`Prisma error: ${e.message}`, undefined, 'Prisma');
});

export const connectDatabase = async (): Promise<void> => {
  try {
    await prisma.$connect();
    logger.info('Database connected successfully', 'Prisma');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Failed to connect to database', errorMessage, 'Prisma');
    throw error;
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  try {
    await prisma.$disconnect();
    logger.info('Database disconnected successfully', 'Prisma');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Failed to disconnect from database', errorMessage, 'Prisma');
    throw error;
  }
};

export { prisma };
