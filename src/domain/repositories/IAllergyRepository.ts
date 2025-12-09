import { Allergy } from '@domain/entities/Allergy';

export interface IAllergyRepository {
  create(allergy: Omit<Allergy, 'id' | 'createdAt' | 'updatedAt'>): Promise<Allergy>;
  findById(id: string): Promise<Allergy | null>;
  findByPetId(petId: string): Promise<Allergy[]>;
  findSevereAllergiesByPetId(petId: string): Promise<Allergy[]>;
  update(id: string, data: Partial<Allergy>): Promise<Allergy>;
  delete(id: string): Promise<void>;
}
