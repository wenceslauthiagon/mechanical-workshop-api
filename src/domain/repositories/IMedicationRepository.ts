import { Medication } from '../entities/Medication';

export interface CreateMedicationData {
  petId: string;
  name: string;
  type: string;
  dosage: string;
  frequency: Medication['frequency'];
  startDate: Date;
  endDate?: Date;
  prescribedBy?: string;
  reason: string;
  instructions?: string;
  status: Medication['status'];
  observations?: string;
}

export interface UpdateMedicationData {
  name?: string;
  type?: string;
  dosage?: string;
  frequency?: Medication['frequency'];
  endDate?: Date;
  prescribedBy?: string;
  reason?: string;
  instructions?: string;
  status?: Medication['status'];
  observations?: string;
}

export interface IMedicationRepository {
  create(data: CreateMedicationData): Promise<Medication>;
  findById(id: string): Promise<Medication | null>;
  findByPetId(petId: string): Promise<Medication[]>;
  findActiveMedications(petId: string): Promise<Medication[]>;
  update(id: string, data: UpdateMedicationData): Promise<Medication>;
  delete(id: string): Promise<void>;
}
