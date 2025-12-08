import { Request, Response } from 'express';
import { RecordVeterinaryVisitUseCase } from '@application/use-cases/veterinary-visit/RecordVeterinaryVisitUseCase';
import { ListVeterinaryVisitsByPetUseCase } from '@application/use-cases/veterinary-visit/ListVeterinaryVisitsByPetUseCase';
import { CreateVeterinaryVisitDTO } from '../dtos/VeterinaryVisitDTO';

export class VeterinaryVisitController {
  constructor(
    private readonly recordVeterinaryVisitUseCase: RecordVeterinaryVisitUseCase,
    private readonly listVeterinaryVisitsByPetUseCase: ListVeterinaryVisitsByPetUseCase,
  ) {}

  create = async (req: Request, res: Response): Promise<void> => {
    const data = req.body as CreateVeterinaryVisitDTO;
    const parsedData = {
      ...data,
      date: new Date(data.date),
      nextVisitDate: data.nextVisitDate ? new Date(data.nextVisitDate) : undefined,
    };
    const visit = await this.recordVeterinaryVisitUseCase.execute(parsedData);
    res.status(201).json(visit);
  };

  listByPet = async (req: Request, res: Response): Promise<void> => {
    const { petId } = req.params;
    const visits = await this.listVeterinaryVisitsByPetUseCase.execute(petId);
    res.status(200).json(visits);
  };
}
