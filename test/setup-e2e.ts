import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./test.db',
    },
  },
  log: [],
});

const originalConsoleError = console.error;

beforeAll(() => {
  console.error = jest.fn();
});

afterAll(async () => {
  console.error = originalConsoleError;
  await prisma.$disconnect();
});

export { prisma };
