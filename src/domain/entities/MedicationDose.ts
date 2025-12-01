export interface MedicationDose {
  id: string;
  medicationId: string;
  scheduledTime: Date;
  administeredTime?: Date;
  administered: boolean;
  observations?: string;
  createdAt: Date;
  updatedAt: Date;
}
