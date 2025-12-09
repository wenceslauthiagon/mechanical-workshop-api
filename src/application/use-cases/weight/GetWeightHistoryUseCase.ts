import { WeightHistory } from '@domain/entities/WeightHistory';
import { IWeightHistoryRepository } from '@domain/repositories/IWeightHistoryRepository';

export class GetWeightHistoryUseCase {
  constructor(private readonly weightHistoryRepository: IWeightHistoryRepository) {}

  async execute(petId: string): Promise<WeightHistory[]> {
    return await this.weightHistoryRepository.findByPetId(petId);
  }
}
