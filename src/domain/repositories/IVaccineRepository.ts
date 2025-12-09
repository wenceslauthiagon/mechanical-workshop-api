import { Vaccine } from '../entities/Vaccine';

export interface CreateVaccineData {
  petId: string;
  name: string;
  description?: string;
  scheduledDate: Date;
  applicationDate?: Date;
  nextDoseDate?: Date;
  veterinarianName?: string;
  clinicName?: string;
  batchNumber?: string;
  status: Vaccine['status'];
  observations?: string;
}

export interface UpdateVaccineData {
  name?: string;
  description?: string;
  applicationDate?: Date;
  scheduledDate?: Date;
  nextDoseDate?: Date;
  veterinarianName?: string;
  clinicName?: string;
  batchNumber?: string;
  status?: Vaccine['status'];
  observations?: string;
}

export interface IVaccineRepository {
  create(data: CreateVaccineData): Promise<Vaccine>;
  findById(id: string): Promise<Vaccine | null>;
  findByPetId(petId: string): Promise<Vaccine[]>;
  update(id: string, data: UpdateVaccineData): Promise<Vaccine>;
  delete(id: string): Promise<void>;
  findUpcoming(petId: string): Promise<Vaccine[]>;
  findOverdue(petId: string): Promise<Vaccine[]>;
}
