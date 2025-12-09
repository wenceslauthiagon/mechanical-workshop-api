import { VeterinaryVisit } from '@domain/entities/VeterinaryVisit';
import { IVeterinaryVisitRepository, CreateVeterinaryVisitData } from '@domain/repositories/IVeterinaryVisitRepository';
import { IPetRepository } from '@domain/repositories/IPetRepository';
import { NotFoundError } from '@shared/errors/DomainError';

export class RecordVeterinaryVisitUseCase {
  constructor(
    private readonly visitRepository: IVeterinaryVisitRepository,
    private readonly petRepository: IPetRepository,
  ) {}

  async execute(data: CreateVeterinaryVisitData): Promise<VeterinaryVisit> {
    // Validar se o pet existe
    const pet = await this.petRepository.findById(data.petId);
    if (!pet) {
      throw new NotFoundError('Pet', data.petId);
    }

    return await this.visitRepository.create(data);
  }
}
