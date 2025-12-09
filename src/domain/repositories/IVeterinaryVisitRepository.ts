import { VeterinaryVisit } from '../entities/VeterinaryVisit';

export interface CreateVeterinaryVisitData {
  petId: string;
  date: Date;
  type: VeterinaryVisit['type'];
  veterinarianName: string;
  clinicName: string;
  reason: string;
  diagnosis?: string;
  treatment?: string;
  prescriptions?: string;
  examResults?: string;
  cost?: number;
  nextVisitDate?: Date;
  observations?: string;
}

export interface UpdateVeterinaryVisitData {
  date?: Date;
  type?: VeterinaryVisit['type'];
  veterinarianName?: string;
  clinicName?: string;
  reason?: string;
  diagnosis?: string;
  treatment?: string;
  prescriptions?: string;
  examResults?: string;
  cost?: number;
  nextVisitDate?: Date;
  observations?: string;
}

export interface IVeterinaryVisitRepository {
  create(data: CreateVeterinaryVisitData): Promise<VeterinaryVisit>;
  findById(id: string): Promise<VeterinaryVisit | null>;
  findByPetId(petId: string): Promise<VeterinaryVisit[]>;
  update(id: string, data: UpdateVeterinaryVisitData): Promise<VeterinaryVisit>;
  delete(id: string): Promise<void>;
  findUpcomingVisits(petId: string): Promise<VeterinaryVisit[]>;
}
