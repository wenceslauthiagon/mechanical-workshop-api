import { Vaccine } from '@domain/entities/Vaccine';
import { IVaccineRepository, CreateVaccineData } from '@domain/repositories/IVaccineRepository';
import { IPetRepository } from '@domain/repositories/IPetRepository';
import { NotFoundError, ValidationError } from '@shared/errors/DomainError';
import { ERROR_MESSAGES } from '@shared/constants/messages.constants';

export class RecordVaccineUseCase {
  constructor(
    private readonly vaccineRepository: IVaccineRepository,
    private readonly petRepository: IPetRepository,
  ) {}

  async execute(data: CreateVaccineData): Promise<Vaccine> {
    const pet = await this.petRepository.findById(data.petId);
    if (!pet) {
      throw new NotFoundError('Pet', data.petId);
    }

    if (data.applicationDate && data.applicationDate > new Date()) {
      throw new ValidationError(ERROR_MESSAGES.INVALID_APPLICATION_DATE);
    }

    if (data.nextDoseDate && data.nextDoseDate <= new Date()) {
      throw new ValidationError(ERROR_MESSAGES.INVALID_NEXT_DOSE_DATE);
    }

    return await this.vaccineRepository.create(data);
  }
}
