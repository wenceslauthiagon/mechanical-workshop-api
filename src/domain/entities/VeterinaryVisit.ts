export enum VisitType {
  ROUTINE_CHECKUP = 'ROUTINE_CHECKUP',
  VACCINATION = 'VACCINATION',
  EMERGENCY = 'EMERGENCY',
  SURGERY = 'SURGERY',
  DENTAL = 'DENTAL',
  CONSULTATION = 'CONSULTATION',
  EXAM = 'EXAM',
  OTHER = 'OTHER',
}

export interface VeterinaryVisit {
  id: string;
  petId: string;
  date: Date;
  type: VisitType;
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
  createdAt: Date;
  updatedAt: Date;
}
