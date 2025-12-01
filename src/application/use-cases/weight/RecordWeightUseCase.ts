import { WeightHistory } from '@domain/entities/WeightHistory';
import { IWeightHistoryRepository } from '@domain/repositories/IWeightHistoryRepository';
import { IPetRepository } from '@domain/repositories/IPetRepository';
import { NotFoundError, ValidationError } from '@shared/errors/DomainError';

interface RecordWeightInput {
  petId: string;
  weight: number;
  measurementDate: Date;
  observations?: string;
  recordedBy?: string;
}

export class RecordWeightUseCase {
  constructor(
    private readonly weightHistoryRepository: IWeightHistoryRepository,
    private readonly petRepository: IPetRepository,
  ) {}

  async execute(input: RecordWeightInput): Promise<WeightHistory> {
    const pet = await this.petRepository.findById(input.petId);
    if (!pet) {
      throw new NotFoundError('Pet', input.petId);
    }

    if (input.weight <= 0) {
      throw new ValidationError('Weight must be greater than 0');
    }

    if (input.measurementDate > new Date()) {
      throw new ValidationError('Measurement date cannot be in the future');
    }

    const weightHistory = await this.weightHistoryRepository.create({
      petId: input.petId,
      weight: input.weight,
      measurementDate: input.measurementDate,
      observations: input.observations,
      recordedBy: input.recordedBy,
    });

    return weightHistory;
  }
}
