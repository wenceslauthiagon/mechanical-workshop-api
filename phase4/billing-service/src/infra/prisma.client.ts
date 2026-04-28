let prisma: any;

export async function connectDatabase(): Promise<any> {
  if (prisma) {
    return prisma;
  }

  // Dynamic import keeps local/test environments working without forcing prisma client generation.
  const prismaModule = await import('@prisma/client').catch(() => undefined as unknown as { PrismaClient: new () => any });
  if (!prismaModule?.PrismaClient) {
    throw new Error('Prisma client not generated. Run "npx prisma generate" in billing-service.');
  }

  prisma = new prismaModule.PrismaClient();
  return prisma;
}