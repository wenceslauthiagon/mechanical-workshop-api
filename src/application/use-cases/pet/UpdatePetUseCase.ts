import { Pet } from '@domain/entities/Pet';
import { IPetRepository, UpdatePetData } from '@domain/repositories/IPetRepository';
import { NotFoundError, ValidationError } from '@shared/errors/DomainError';
import { ERROR_MESSAGES } from '@shared/constants/messages.constants';

export class UpdatePetUseCase {
  constructor(private readonly petRepository: IPetRepository) {}

  async execute(id: string, data: UpdatePetData): Promise<Pet> {
    const pet = await this.petRepository.findById(id);
    
    if (!pet) {
      throw new NotFoundError('Pet', id);
    }

    if (data.weight !== undefined && data.weight <= 0) {
      throw new ValidationError(ERROR_MESSAGES.INVALID_WEIGHT);
    }

    return await this.petRepository.update(id, data);
  }
}
