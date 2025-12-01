export enum AllergyType {
  MEDICATION = 'MEDICATION',
  FOOD = 'FOOD',
  ENVIRONMENTAL = 'ENVIRONMENTAL',
  OTHER = 'OTHER',
}

export enum AllergySeverity {
  MILD = 'MILD',
  MODERATE = 'MODERATE',
  SEVERE = 'SEVERE',
  LIFE_THREATENING = 'LIFE_THREATENING',
}

export interface Allergy {
  id: string;
  petId: string;
  allergen: string;
  type: AllergyType;
  severity: AllergySeverity;
  symptoms?: string;
  diagnosedDate?: Date;
  diagnosedBy?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
