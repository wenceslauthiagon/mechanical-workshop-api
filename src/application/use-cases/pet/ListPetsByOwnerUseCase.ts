import { Pet } from '@domain/entities/Pet';
import { IPetRepository } from '@domain/repositories/IPetRepository';

export class ListPetsByOwnerUseCase {
  constructor(private readonly petRepository: IPetRepository) {}

  async execute(ownerId: string): Promise<Pet[]> {
    return await this.petRepository.findByOwnerId(ownerId);
  }
}
