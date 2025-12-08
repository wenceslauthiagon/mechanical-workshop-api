export enum PetType {
  DOG = 'DOG',
  CAT = 'CAT',
}

export enum PetGender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
}

export interface Pet {
  id: string;
  name: string;
  type: PetType;
  breed: string;
  gender: PetGender;
  birthDate: Date;
  weight: number;
  color: string;
  microchipNumber?: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}
