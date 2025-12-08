import { Pet } from '../entities/Pet';

export interface CreatePetData {
  name: string;
  type: Pet['type'];
  breed: string;
  gender: Pet['gender'];
  birthDate: Date;
  weight: number;
  color: string;
  microchipNumber?: string;
  ownerId: string;
}

export interface UpdatePetData {
  name?: string;
  breed?: string;
  weight?: number;
  color?: string;
  microchipNumber?: string;
}

export interface IPetRepository {
  create(data: CreatePetData): Promise<Pet>;
  findById(id: string): Promise<Pet | null>;
  findByOwnerId(ownerId: string): Promise<Pet[]>;
  update(id: string, data: UpdatePetData): Promise<Pet>;
  delete(id: string): Promise<void>;
  findAll(): Promise<Pet[]>;
}
