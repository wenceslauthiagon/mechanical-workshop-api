export enum VaccineStatus {
  SCHEDULED = 'SCHEDULED',
  APPLIED = 'APPLIED',
  OVERDUE = 'OVERDUE',
  CANCELED = 'CANCELED',
}

export interface Vaccine {
  id: string;
  petId: string;
  name: string;
  description?: string;
  applicationDate?: Date;
  scheduledDate: Date;
  nextDoseDate?: Date;
  veterinarianName?: string;
  clinicName?: string;
  batchNumber?: string;
  status: VaccineStatus;
  observations?: string;
  createdAt: Date;
  updatedAt: Date;
}
