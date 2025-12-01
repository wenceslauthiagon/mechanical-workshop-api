export enum MedicationFrequency {
  ONCE = 'ONCE',
  DAILY = 'DAILY',
  TWICE_DAILY = 'TWICE_DAILY',
  THREE_TIMES_DAILY = 'THREE_TIMES_DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  AS_NEEDED = 'AS_NEEDED',
}

export enum MedicationStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  SUSPENDED = 'SUSPENDED',
}

export enum MedicationType {
  ANTIBIOTIC = 'ANTIBIOTIC',
  ANTI_INFLAMMATORY = 'ANTI_INFLAMMATORY',
  ANALGESIC = 'ANALGESIC',
  ANTIPARASITIC = 'ANTIPARASITIC',
  FLEA_TICK_CONTROL = 'FLEA_TICK_CONTROL',
  DEWORMER = 'DEWORMER',
  HEARTWORM_PREVENTION = 'HEARTWORM_PREVENTION',
  SUPPLEMENT = 'SUPPLEMENT',
  VACCINE = 'VACCINE',
  OTHER = 'OTHER',
}

export interface Medication {
  id: string;
  petId: string;
  name: string;
  type: MedicationType;
  dosage: string;
  frequency: MedicationFrequency;
  startDate: Date;
  endDate?: Date;
  prescribedBy?: string;
  reason: string;
  instructions?: string;
  status: MedicationStatus;
  observations?: string;
  createdAt: Date;
  updatedAt: Date;
}
