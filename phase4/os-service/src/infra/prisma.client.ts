import { OsServicePrismaClient } from './order.prisma.repository';

interface OsPrismaClient extends OsServicePrismaClient {
  $connect(): Promise<void>;
  $disconnect(): Promise<void>;
}

interface OsPrismaModule {
  PrismaClient: new (args: { log: Array<'error' | 'warn'> }) => OsPrismaClient;
}

let prismaClient: OsPrismaClient | undefined;

function ensurePrismaClient(): Promise<OsPrismaClient> {
  if (prismaClient) {
    return Promise.resolve(prismaClient);
  }

  return (async () => {
    const prismaModule = (await import('@prisma/client').catch(() => undefined)) as OsPrismaModule | undefined;
    if (!prismaModule?.PrismaClient) {
      throw new Error('Prisma client not generated. Run "npx prisma generate" in os-service.');
    }

    prismaClient = new prismaModule.PrismaClient({
      log: ['error', 'warn'],
    });
    return prismaClient;
  })();
}

export async function connectDatabase(): Promise<void> {
  try {
    const client = await ensurePrismaClient();
    await client.$connect();
  } catch {
    process.exit(1);
  }
}

export function getPrismaClient(): OsServicePrismaClient {
  if (!prismaClient) {
    throw new Error('Prisma client not initialized. Call connectDatabase first.');
  }
  return prismaClient;
}

export async function disconnectDatabase(): Promise<void> {
  if (!prismaClient) {
    return;
  }
  await prismaClient.$disconnect();
}
