import { Vaccine } from '@domain/entities/Vaccine';
import { IVaccineRepository } from '@domain/repositories/IVaccineRepository';

export class ListVaccinesByPetUseCase {
  constructor(private readonly vaccineRepository: IVaccineRepository) {}

  async execute(petId: string): Promise<Vaccine[]> {
    return await this.vaccineRepository.findByPetId(petId);
  }
}
