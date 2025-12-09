import { Allergy } from '@domain/entities/Allergy';
import { IAllergyRepository } from '@domain/repositories/IAllergyRepository';

export class ListAllergiesByPetUseCase {
  constructor(private readonly allergyRepository: IAllergyRepository) {}

  async execute(petId: string): Promise<Allergy[]> {
    return await this.allergyRepository.findByPetId(petId);
  }
}
