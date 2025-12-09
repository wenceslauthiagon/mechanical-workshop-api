import { Owner } from '../entities/Owner';

export interface CreateOwnerData {
  name: string;
  email: string;
  phone: string;
  address?: string;
}

export interface UpdateOwnerData {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface IOwnerRepository {
  create(data: CreateOwnerData): Promise<Owner>;
  findById(id: string): Promise<Owner | null>;
  findByEmail(email: string): Promise<Owner | null>;
  update(id: string, data: UpdateOwnerData): Promise<Owner>;
  delete(id: string): Promise<void>;
  findAll(): Promise<Owner[]>;
}
