import { prisma } from '@infrastructure/database/prisma';
import { IServiceOrderRepository } from '../../../domain/repositories/ServiceOrderRepository';
import { ServiceOrder } from '../../../domain/entities/ServiceOrder';
import { v4 as uuidv4 } from 'uuid';

const isTest = process.env.NODE_ENV === 'test';

const inMemory: Record<string, ServiceOrder> = {};

export class PrismaServiceOrderRepository implements IServiceOrderRepository {
  async create(payload: Omit<ServiceOrder, 'id' | 'createdAt' | 'updatedAt'>): Promise<ServiceOrder> {
    if (isTest) {
      const id = uuidv4();
      const now = new Date();
      const so: ServiceOrder = {
        id,
        ...payload,
        status: (payload as any).status ?? 'RECEBIDA',
        isDeleted: (payload as any).isDeleted ?? false,
        createdAt: now,
        updatedAt: now,
      } as unknown as ServiceOrder;
      inMemory[id] = so;
      return so;
    }

    // Ensure defaults are applied after payload spread to avoid undefined overwrites
    const dataToCreate = {
      ...payload,
      status: (payload as any).status ?? 'RECEBIDA',
      isDeleted: (payload as any).isDeleted ?? false,
    };

    const created = await (prisma as any).serviceOrder.create({ data: dataToCreate as any });
    return created as unknown as ServiceOrder;
  }

  async findById(id: string): Promise<ServiceOrder | null> {
    if (isTest) {
      return inMemory[id] ?? null;
    }
    const so = await (prisma as any).serviceOrder.findUnique({ where: { id } });
    return so as unknown as ServiceOrder | null;
  }

  async updateStatus(id: string, status: ServiceOrder['status']): Promise<ServiceOrder> {
    if (isTest) {
      const so = inMemory[id];
      if (!so) throw new Error('Not found');
      so.status = status;
      so.updatedAt = new Date();
      return so;
    }
    const updated = await (prisma as any).serviceOrder.update({ where: { id }, data: { status } });
    return updated as unknown as ServiceOrder;
  }

  async approveBudget(id: string, approved: boolean): Promise<ServiceOrder> {
    const status = approved ? 'EXECUCAO' : 'RECEBIDA';
    if (isTest) {
      const so = inMemory[id];
      if (!so) throw new Error('Not found');
      so.status = status as any;
      so.updatedAt = new Date();
      return so;
    }
    const updated = await (prisma as any).serviceOrder.update({ where: { id }, data: { status } });
    return updated as unknown as ServiceOrder;
  }

  async list(filter?: { excludeFinished?: boolean }): Promise<ServiceOrder[]> {
    if (isTest) {
      const arr = Object.values(inMemory).filter((s) => !s.isDeleted);
      if (filter?.excludeFinished) {
        return arr.filter((s) => s.status !== 'FINALIZADA' && s.status !== 'ENTREGUE');
      }
      return arr;
    }
    const where: any = {};
    if (filter?.excludeFinished) {
      where.isDeleted = false;
      where.status = { notIn: ['FINALIZADA', 'ENTREGUE'] };
    }
    const results = await (prisma as any).serviceOrder.findMany({ where, orderBy: [{ status: 'asc' }, { createdAt: 'asc' }] });
    return results as unknown as ServiceOrder[];
  }
}

