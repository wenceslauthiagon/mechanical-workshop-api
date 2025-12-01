import { Request, Response } from 'express';
import { RegisterOwnerUseCase } from '@application/use-cases/owner/RegisterOwnerUseCase';
import { GetOwnerByIdUseCase } from '@application/use-cases/owner/GetOwnerByIdUseCase';
import { CreateOwnerDTO } from '../dtos/OwnerDTO';

export class OwnerController {
  constructor(
    private readonly registerOwnerUseCase: RegisterOwnerUseCase,
    private readonly getOwnerByIdUseCase: GetOwnerByIdUseCase,
  ) {}

  create = async (req: Request, res: Response): Promise<void> => {
    const data = req.body as CreateOwnerDTO;
    const owner = await this.registerOwnerUseCase.execute(data);
    res.status(201).json(owner);
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const owner = await this.getOwnerByIdUseCase.execute(id);
    res.status(200).json(owner);
  };
}
