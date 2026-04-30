import { BillingPrismaClient } from './budget.prisma.repository';

let prisma: BillingPrismaClient | undefined;

export async function connectDatabase(): Promise<BillingPrismaClient> {
  if (prisma) {
    return prisma;
  }

  // Dynamic import keeps local/test environments working without forcing prisma client generation.
  const prismaModuleUnknown: unknown = await import('@prisma/client').catch(() => undefined);
  const hasPrismaClientCtor =
    prismaModuleUnknown &&
    typeof prismaModuleUnknown === 'object' &&
    'PrismaClient' in prismaModuleUnknown &&
    typeof (prismaModuleUnknown as { PrismaClient?: unknown }).PrismaClient === 'function';

  if (!hasPrismaClientCtor) {
    throw new Error('Prisma client not generated. Run "npx prisma generate" in billing-service.');
  }

  const PrismaClientCtor = (prismaModuleUnknown as { PrismaClient: new () => BillingPrismaClient }).PrismaClient;
  prisma = new PrismaClientCtor();
  return prisma;
}