import { Medication } from '@domain/entities/Medication';
import { IMedicationRepository, CreateMedicationData } from '@domain/repositories/IMedicationRepository';
import { IPetRepository } from '@domain/repositories/IPetRepository';
import { NotFoundError, ValidationError } from '@shared/errors/DomainError';
import { ERROR_MESSAGES } from '@shared/constants/messages.constants';

export class ScheduleMedicationUseCase {
  constructor(
    private readonly medicationRepository: IMedicationRepository,
    private readonly petRepository: IPetRepository,
  ) {}

  async execute(data: CreateMedicationData): Promise<Medication> {
    const pet = await this.petRepository.findById(data.petId);
    if (!pet) {
      throw new NotFoundError('Pet', data.petId);
    }

    if (data.endDate && data.endDate < data.startDate) {
      throw new ValidationError(ERROR_MESSAGES.INVALID_DATE_RANGE);
    }

    return await this.medicationRepository.create(data);
  }
}
