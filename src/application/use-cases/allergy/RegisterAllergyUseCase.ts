import { Allergy } from '@domain/entities/Allergy';
import { IAllergyRepository } from '@domain/repositories/IAllergyRepository';
import { IPetRepository } from '@domain/repositories/IPetRepository';
import { NotFoundError } from '@shared/errors/DomainError';

interface RegisterAllergyInput {
  petId: string;
  allergen: string;
  type: string;
  severity: string;
  symptoms?: string;
  diagnosedDate?: Date;
  diagnosedBy?: string;
  notes?: string;
}

export class RegisterAllergyUseCase {
  constructor(
    private readonly allergyRepository: IAllergyRepository,
    private readonly petRepository: IPetRepository,
  ) {}

  async execute(input: RegisterAllergyInput): Promise<Allergy> {
    const pet = await this.petRepository.findById(input.petId);
    if (!pet) {
      throw new NotFoundError('Pet', input.petId);
    }

    const allergy = await this.allergyRepository.create({
      petId: input.petId,
      allergen: input.allergen,
      type: input.type as any,
      severity: input.severity as any,
      symptoms: input.symptoms,
      diagnosedDate: input.diagnosedDate,
      diagnosedBy: input.diagnosedBy,
      notes: input.notes,
    });

    return allergy;
  }
}
