import { BillingPrismaClient } from './budget.prisma.repository';

interface BillingPrismaModule {
  PrismaClient: new () => BillingPrismaClient;
}

let prisma: BillingPrismaClient | undefined;

export async function connectDatabase(): Promise<BillingPrismaClient> {
  if (prisma) {
    return prisma;
  }

  // Dynamic import keeps local/test environments working without forcing prisma client generation.
  const prismaModule = (await import('@prisma/client').catch(() => undefined)) as BillingPrismaModule | undefined;

  if (!prismaModule?.PrismaClient) {
    throw new Error('Prisma client not generated. Run "npx prisma generate" in billing-service.');
  }

  prisma = new prismaModule.PrismaClient();
  return prisma;
}