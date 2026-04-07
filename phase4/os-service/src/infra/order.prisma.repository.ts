/**
 * Prisma repository for ServiceOrder.
 * Requires: npx prisma generate (inside phase4/os-service) before first use.
 *
 * The interface below mirrors the os-service Prisma schema so this file compiles
 * without depending on the root-project generated client.
 */

import { ServiceOrder, OrderStatus } from '../domain/order';

// ── Prisma-shape interfaces (matches prisma/schema.prisma of this service) ──
interface PrismaServiceOrder {
  id: string;
  customerId: string;
  vehicleId: string;
  description: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  history?: PrismaServiceOrderHistory[];
}

interface PrismaServiceOrderHistory {
  id: string;
  orderId: string;
  status: string;
  reason: string | null;
  createdAt: Date;
}

interface OsServicePrismaClient {
  serviceOrder: {
    create(args: { data: Omit<PrismaServiceOrder, 'createdAt' | 'updatedAt' | 'history'> }): Promise<PrismaServiceOrder>;
    findUnique(args: { where: { id: string }; include?: { history?: boolean } }): Promise<(PrismaServiceOrder & { history: PrismaServiceOrderHistory[] }) | null>;
    update(args: { where: { id: string }; data: Partial<PrismaServiceOrder> }): Promise<PrismaServiceOrder>;
  };
  serviceOrderHistory: {
    create(args: { data: Omit<PrismaServiceOrderHistory, 'id' | 'createdAt'> }): Promise<PrismaServiceOrderHistory>;
  };
}

// ── Repository ──
export class OrderPrismaRepository {
  // Injected so it can be swapped in tests without touching prisma.client.ts
  constructor(private readonly db: OsServicePrismaClient) {}

  async create(order: ServiceOrder): Promise<ServiceOrder> {
    const created = await this.db.serviceOrder.create({
      data: {
        id: order.id,
        customerId: order.customerId,
        vehicleId: order.vehicleId,
        description: order.description,
        status: order.status,
      },
    });

    for (const hist of order.history) {
      await this.db.serviceOrderHistory.create({
        data: {
          orderId: created.id,
          status: hist.status,
          reason: hist.reason ?? null,
        },
      });
    }

    return this.toDomain({ ...created, history: [] });
  }

  async findById(id: string): Promise<ServiceOrder | undefined> {
    const order = await this.db.serviceOrder.findUnique({
      where: { id },
      include: { history: true },
    });

    return order ? this.toDomain(order) : undefined;
  }

  async save(order: ServiceOrder): Promise<void> {
    await this.db.serviceOrder.update({
      where: { id: order.id },
      data: { status: order.status },
    });

    const lastHist = order.history[order.history.length - 1];
    if (lastHist) {
      await this.db.serviceOrderHistory.create({
        data: {
          orderId: order.id,
          status: lastHist.status,
          reason: lastHist.reason ?? null,
        },
      });
    }
  }

  private toDomain(raw: PrismaServiceOrder & { history?: PrismaServiceOrderHistory[] }): ServiceOrder {
    return {
      id: raw.id,
      customerId: raw.customerId,
      vehicleId: raw.vehicleId,
      description: raw.description,
      status: raw.status as OrderStatus,
      history: (raw.history ?? []).map(h => ({
        status: h.status as OrderStatus,
        at: h.createdAt.toISOString(),
        reason: h.reason ?? undefined,
      })),
    };
  }
}
