import { Request, Response } from 'express';
import { ScheduleMedicationUseCase } from '@application/use-cases/medication/ScheduleMedicationUseCase';
import { ListMedicationsByPetUseCase } from '@application/use-cases/medication/ListMedicationsByPetUseCase';
import { GetActiveMedicationsUseCase } from '@application/use-cases/medication/GetActiveMedicationsUseCase';
import { CreateMedicationDTO } from '../dtos/MedicationDTO';

export class MedicationController {
  constructor(
    private readonly scheduleMedicationUseCase: ScheduleMedicationUseCase,
    private readonly listMedicationsByPetUseCase: ListMedicationsByPetUseCase,
    private readonly getActiveMedicationsUseCase: GetActiveMedicationsUseCase,
  ) {}

  create = async (req: Request, res: Response): Promise<void> => {
    const data = req.body as CreateMedicationDTO;
    const parsedData = {
      ...data,
      startDate: new Date(data.startDate),
      endDate: data.endDate ? new Date(data.endDate) : undefined,
    };
    const medication = await this.scheduleMedicationUseCase.execute(parsedData);
    res.status(201).json(medication);
  };

  listByPet = async (req: Request, res: Response): Promise<void> => {
    const { petId } = req.params;
    const medications = await this.listMedicationsByPetUseCase.execute(petId);
    res.status(200).json(medications);
  };

  getActive = async (req: Request, res: Response): Promise<void> => {
    const { petId } = req.params;
    const medications = await this.getActiveMedicationsUseCase.execute(petId);
    res.status(200).json(medications);
  };
}
