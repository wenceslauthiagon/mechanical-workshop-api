import { Pet } from '@domain/entities/Pet';
import { IPetRepository } from '@domain/repositories/IPetRepository';
import { NotFoundError } from '@shared/errors/DomainError';

export class GetPetByIdUseCase {
  constructor(private readonly petRepository: IPetRepository) {}

  async execute(id: string): Promise<Pet> {
    const pet = await this.petRepository.findById(id);
    
    if (!pet) {
      throw new NotFoundError('Pet', id);
    }

    return pet;
  }
}
