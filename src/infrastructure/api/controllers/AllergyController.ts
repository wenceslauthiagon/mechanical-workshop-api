import { Request, Response } from 'express';
import { RegisterAllergyUseCase } from '@application/use-cases/allergy/RegisterAllergyUseCase';
import { ListAllergiesByPetUseCase } from '@application/use-cases/allergy/ListAllergiesByPetUseCase';
import { GetSevereAllergiesUseCase } from '@application/use-cases/allergy/GetSevereAllergiesUseCase';
import { HTTP_STATUS } from '@shared/constants/http-status.constants';

export class AllergyController {
  constructor(
    private readonly registerAllergyUseCase: RegisterAllergyUseCase,
    private readonly listAllergiesByPetUseCase: ListAllergiesByPetUseCase,
    private readonly getSevereAllergiesUseCase: GetSevereAllergiesUseCase,
  ) {}

  async register(req: Request, res: Response): Promise<void> {
    const allergy = await this.registerAllergyUseCase.execute({
      ...req.body,
      diagnosedDate: req.body.diagnosedDate ? new Date(req.body.diagnosedDate) : undefined,
    });
    res.status(HTTP_STATUS.CREATED).json(allergy);
  }

  async listByPet(req: Request, res: Response): Promise<void> {
    const { petId } = req.params;
    const allergies = await this.listAllergiesByPetUseCase.execute(petId);
    res.status(HTTP_STATUS.OK).json(allergies);
  }

  async getSevere(req: Request, res: Response): Promise<void> {
    const { petId } = req.params;
    const allergies = await this.getSevereAllergiesUseCase.execute(petId);
    res.status(HTTP_STATUS.OK).json(allergies);
  }
}
