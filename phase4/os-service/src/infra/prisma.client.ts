import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
  log: ['error', 'warn'],
});

export async function connectDatabase() {
  try {
    await prisma.$connect();
  } catch {
    process.exit(1);
  }
}

export async function disconnectDatabase() {
  await prisma.$disconnect();
}
