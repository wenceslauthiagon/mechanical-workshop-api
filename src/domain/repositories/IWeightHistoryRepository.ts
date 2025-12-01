import { WeightHistory } from '@domain/entities/WeightHistory';

export interface IWeightHistoryRepository {
  create(weightHistory: Omit<WeightHistory, 'id' | 'createdAt' | 'updatedAt'>): Promise<WeightHistory>;
  findById(id: string): Promise<WeightHistory | null>;
  findByPetId(petId: string): Promise<WeightHistory[]>;
  findLatestByPetId(petId: string): Promise<WeightHistory | null>;
  findByDateRange(petId: string, startDate: Date, endDate: Date): Promise<WeightHistory[]>;
  update(id: string, data: Partial<WeightHistory>): Promise<WeightHistory>;
  delete(id: string): Promise<void>;
}
