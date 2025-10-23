import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./test.db',
    },
  },
});

afterAll(async () => {
  await prisma.$disconnect();
});

export { prisma };
