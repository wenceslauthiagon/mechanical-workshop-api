import { IPetRepository } from '@domain/repositories/IPetRepository';
import { NotFoundError } from '@shared/errors/DomainError';

export class DeletePetUseCase {
  constructor(private readonly petRepository: IPetRepository) {}

  async execute(id: string): Promise<void> {
    const pet = await this.petRepository.findById(id);
    
    if (!pet) {
      throw new NotFoundError('Pet', id);
    }

    await this.petRepository.delete(id);
  }
}
