import { Request, Response } from 'express';
import { RegisterPetUseCase } from '@application/use-cases/pet/RegisterPetUseCase';
import { GetPetByIdUseCase } from '@application/use-cases/pet/GetPetByIdUseCase';
import { ListPetsByOwnerUseCase } from '@application/use-cases/pet/ListPetsByOwnerUseCase';
import { UpdatePetUseCase } from '@application/use-cases/pet/UpdatePetUseCase';
import { DeletePetUseCase } from '@application/use-cases/pet/DeletePetUseCase';
import { CreatePetDTO, UpdatePetDTO } from '../dtos/PetDTO';

export class PetController {
  constructor(
    private readonly registerPetUseCase: RegisterPetUseCase,
    private readonly getPetByIdUseCase: GetPetByIdUseCase,
    private readonly listPetsByOwnerUseCase: ListPetsByOwnerUseCase,
    private readonly updatePetUseCase: UpdatePetUseCase,
    private readonly deletePetUseCase: DeletePetUseCase,
  ) {}

  create = async (req: Request, res: Response): Promise<void> => {
    const data = req.body as CreatePetDTO;
    const parsedData = {
      ...data,
      birthDate: new Date(data.birthDate),
    };
    const pet = await this.registerPetUseCase.execute(parsedData);
    res.status(201).json(pet);
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const pet = await this.getPetByIdUseCase.execute(id);
    res.status(200).json(pet);
  };

  listByOwner = async (req: Request, res: Response): Promise<void> => {
    const { ownerId } = req.params;
    const pets = await this.listPetsByOwnerUseCase.execute(ownerId);
    res.status(200).json(pets);
  };

  update = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const data = req.body as UpdatePetDTO;
    const pet = await this.updatePetUseCase.execute(id, data);
    res.status(200).json(pet);
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    await this.deletePetUseCase.execute(id);
    res.status(204).send();
  };
}
