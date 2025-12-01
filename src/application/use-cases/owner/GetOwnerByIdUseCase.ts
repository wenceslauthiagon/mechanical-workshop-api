import { Owner } from '@domain/entities/Owner';
import { IOwnerRepository } from '@domain/repositories/IOwnerRepository';
import { NotFoundError } from '@shared/errors/DomainError';

export class GetOwnerByIdUseCase {
  constructor(private readonly ownerRepository: IOwnerRepository) {}

  async execute(id: string): Promise<Owner> {
    const owner = await this.ownerRepository.findById(id);
    
    if (!owner) {
      throw new NotFoundError('Owner', id);
    }

    return owner;
  }
}
