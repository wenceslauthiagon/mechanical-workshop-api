import { Vaccine } from '@domain/entities/Vaccine';
import { IVaccineRepository, UpdateVaccineData } from '@domain/repositories/IVaccineRepository';
import { NotFoundError, ValidationError } from '@shared/errors/DomainError';
import { ERROR_MESSAGES } from '@shared/constants/messages.constants';

export class UpdateVaccineUseCase {
  constructor(private readonly vaccineRepository: IVaccineRepository) {}

  async execute(id: string, data: UpdateVaccineData): Promise<Vaccine> {
    const vaccine = await this.vaccineRepository.findById(id);
    
    if (!vaccine) {
      throw new NotFoundError('Vaccine', id);
    }

    if (data.applicationDate && data.applicationDate > new Date()) {
      throw new ValidationError(ERROR_MESSAGES.INVALID_APPLICATION_DATE);
    }

    if (data.nextDoseDate && data.nextDoseDate <= new Date()) {
      throw new ValidationError(ERROR_MESSAGES.INVALID_NEXT_DOSE_DATE);
    }

    return await this.vaccineRepository.update(id, data);
  }
}
