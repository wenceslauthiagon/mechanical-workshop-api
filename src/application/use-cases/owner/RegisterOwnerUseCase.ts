import { Owner } from '@domain/entities/Owner';
import { IOwnerRepository, CreateOwnerData } from '@domain/repositories/IOwnerRepository';
import { ConflictError, ValidationError } from '@shared/errors/DomainError';
import { ERROR_MESSAGES } from '@shared/constants/messages.constants';
import { VALIDATION_PATTERNS } from '@shared/constants/validation.constants';

export class RegisterOwnerUseCase {
  constructor(private readonly ownerRepository: IOwnerRepository) {}

  async execute(data: CreateOwnerData): Promise<Owner> {
    if (!VALIDATION_PATTERNS.EMAIL.test(data.email)) {
      throw new ValidationError(ERROR_MESSAGES.INVALID_EMAIL_FORMAT);
    }

    const existingOwner = await this.ownerRepository.findByEmail(data.email);
    if (existingOwner) {
      throw new ConflictError(ERROR_MESSAGES.EMAIL_ALREADY_EXISTS);
    }

    return await this.ownerRepository.create(data);
  }
}
