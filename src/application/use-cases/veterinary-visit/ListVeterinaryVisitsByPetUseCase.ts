import { VeterinaryVisit } from '@domain/entities/VeterinaryVisit';
import { IVeterinaryVisitRepository } from '@domain/repositories/IVeterinaryVisitRepository';

export class ListVeterinaryVisitsByPetUseCase {
  constructor(private readonly visitRepository: IVeterinaryVisitRepository) {}

  async execute(petId: string): Promise<VeterinaryVisit[]> {
    return await this.visitRepository.findByPetId(petId);
  }
}
