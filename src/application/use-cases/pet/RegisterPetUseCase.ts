import { Pet } from '@domain/entities/Pet';
import { IPetRepository, CreatePetData } from '@domain/repositories/IPetRepository';
import { IOwnerRepository } from '@domain/repositories/IOwnerRepository';
import { NotFoundError, ValidationError } from '@shared/errors/DomainError';
import { ERROR_MESSAGES } from '@shared/constants/messages.constants';

export class RegisterPetUseCase {
  constructor(
    private readonly petRepository: IPetRepository,
    private readonly ownerRepository: IOwnerRepository,
  ) {}

  async execute(data: CreatePetData): Promise<Pet> {
    const owner = await this.ownerRepository.findById(data.ownerId);
    if (!owner) {
      throw new NotFoundError('Owner', data.ownerId);
    }

    if (data.weight <= 0) {
      throw new ValidationError(ERROR_MESSAGES.INVALID_WEIGHT);
    }

    const today = new Date();
    if (data.birthDate > today) {
      throw new ValidationError(ERROR_MESSAGES.INVALID_BIRTH_DATE);
    }

    return await this.petRepository.create(data);
  }
}
