import { Request, Response } from 'express';
import { RecordVaccineUseCase } from '@application/use-cases/vaccine/RecordVaccineUseCase';
import { ListVaccinesByPetUseCase } from '@application/use-cases/vaccine/ListVaccinesByPetUseCase';
import { UpdateVaccineUseCase } from '@application/use-cases/vaccine/UpdateVaccineUseCase';
import { CreateVaccineDTO, UpdateVaccineDTO } from '../dtos/VaccineDTO';

export class VaccineController {
  constructor(
    private readonly recordVaccineUseCase: RecordVaccineUseCase,
    private readonly listVaccinesByPetUseCase: ListVaccinesByPetUseCase,
    private readonly updateVaccineUseCase: UpdateVaccineUseCase,
  ) {}

  create = async (req: Request, res: Response): Promise<void> => {
    const data = req.body as CreateVaccineDTO;
    const parsedData = {
      ...data,
      scheduledDate: new Date(data.scheduledDate),
      applicationDate: data.applicationDate ? new Date(data.applicationDate) : undefined,
      nextDoseDate: data.nextDoseDate ? new Date(data.nextDoseDate) : undefined,
    };
    const vaccine = await this.recordVaccineUseCase.execute(parsedData);
    res.status(201).json(vaccine);
  };

  listByPet = async (req: Request, res: Response): Promise<void> => {
    const { petId } = req.params;
    const vaccines = await this.listVaccinesByPetUseCase.execute(petId);
    res.status(200).json(vaccines);
  };

  update = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const data = req.body as UpdateVaccineDTO;
    const parsedData = {
      ...data,
      scheduledDate: data.scheduledDate ? new Date(data.scheduledDate) : undefined,
      applicationDate: data.applicationDate ? new Date(data.applicationDate) : undefined,
      nextDoseDate: data.nextDoseDate ? new Date(data.nextDoseDate) : undefined,
    };
    const vaccine = await this.updateVaccineUseCase.execute(id, parsedData);
    res.status(200).json(vaccine);
  };
}
