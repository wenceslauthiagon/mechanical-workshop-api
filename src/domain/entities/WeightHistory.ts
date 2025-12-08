export interface WeightHistory {
  id: string;
  petId: string;
  weight: number;
  measurementDate: Date;
  observations?: string;
  recordedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}
