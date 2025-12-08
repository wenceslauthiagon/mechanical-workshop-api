import { WeightHistory } from '@domain/entities/WeightHistory';
import { IWeightHistoryRepository } from '@domain/repositories/IWeightHistoryRepository';

export class GetLatestWeightUseCase {
  constructor(private readonly weightHistoryRepository: IWeightHistoryRepository) {}

  async execute(petId: string): Promise<WeightHistory | null> {
    return await this.weightHistoryRepository.findLatestByPetId(petId);
  }
}
