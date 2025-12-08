import { Medication } from '@domain/entities/Medication';
import { IMedicationRepository } from '@domain/repositories/IMedicationRepository';

export class GetActiveMedicationsUseCase {
  constructor(private readonly medicationRepository: IMedicationRepository) {}

  async execute(petId: string): Promise<Medication[]> {
    return await this.medicationRepository.findActiveMedications(petId);
  }
}
