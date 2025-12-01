import { PrismaClient } from '@prisma/client';
import { WeightHistory } from '@domain/entities/WeightHistory';
import { IWeightHistoryRepository } from '@domain/repositories/IWeightHistoryRepository';

export class PrismaWeightHistoryRepository implements IWeightHistoryRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(weightHistory: Omit<WeightHistory, 'id' | 'createdAt' | 'updatedAt'>): Promise<WeightHistory> {
    const created = await this.prisma.weightHistory.create({
      data: weightHistory,
    });
    return this.toDomain(created);
  }

  async findById(id: string): Promise<WeightHistory | null> {
    const weightHistory = await this.prisma.weightHistory.findUnique({
      where: { id },
    });
    return weightHistory ? this.toDomain(weightHistory) : null;
  }

  async findByPetId(petId: string): Promise<WeightHistory[]> {
    const weightHistories = await this.prisma.weightHistory.findMany({
      where: { petId },
      orderBy: { measurementDate: 'desc' },
    });
    return weightHistories.map(this.toDomain);
  }

  async findLatestByPetId(petId: string): Promise<WeightHistory | null> {
    const weightHistory = await this.prisma.weightHistory.findFirst({
      where: { petId },
      orderBy: { measurementDate: 'desc' },
    });
    return weightHistory ? this.toDomain(weightHistory) : null;
  }

  async findByDateRange(petId: string, startDate: Date, endDate: Date): Promise<WeightHistory[]> {
    const weightHistories = await this.prisma.weightHistory.findMany({
      where: {
        petId,
        measurementDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { measurementDate: 'asc' },
    });
    return weightHistories.map(this.toDomain);
  }

  async update(id: string, data: Partial<WeightHistory>): Promise<WeightHistory> {
    const updated = await this.prisma.weightHistory.update({
      where: { id },
      data,
    });
    return this.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.weightHistory.delete({
      where: { id },
    });
  }

  private toDomain(prismaWeightHistory: any): WeightHistory {
    return {
      id: prismaWeightHistory.id,
      petId: prismaWeightHistory.petId,
      weight: prismaWeightHistory.weight,
      measurementDate: prismaWeightHistory.measurementDate,
      observations: prismaWeightHistory.observations,
      recordedBy: prismaWeightHistory.recordedBy,
      createdAt: prismaWeightHistory.createdAt,
      updatedAt: prismaWeightHistory.updatedAt,
    };
  }
}
