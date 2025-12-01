import { MedicationDose } from '../entities/MedicationDose';

export interface CreateMedicationDoseData {
  medicationId: string;
  scheduledTime: Date;
  administered: boolean;
  administeredTime?: Date;
  observations?: string;
}

export interface UpdateMedicationDoseData {
  administered?: boolean;
  administeredTime?: Date;
  observations?: string;
}

export interface IMedicationDoseRepository {
  create(data: CreateMedicationDoseData): Promise<MedicationDose>;
  findById(id: string): Promise<MedicationDose | null>;
  findByMedicationId(medicationId: string): Promise<MedicationDose[]>;
  update(id: string, data: UpdateMedicationDoseData): Promise<MedicationDose>;
  delete(id: string): Promise<void>;
  findPendingDoses(medicationId: string): Promise<MedicationDose[]>;
}
