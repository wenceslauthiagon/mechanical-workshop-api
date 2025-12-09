import { z } from 'zod';
import { PetType, PetGender } from '@domain/entities/Pet';

export const createPetSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  type: z.nativeEnum(PetType),
  breed: z.string().min(1, 'Breed is required').max(100),
  gender: z.nativeEnum(PetGender),
  birthDate: z.string().datetime().or(z.date()),
  weight: z.number().positive('Weight must be positive'),
  color: z.string().min(1, 'Color is required').max(50),
  microchipNumber: z.string().optional(),
  ownerId: z.string().uuid('Invalid owner ID'),
});

export const updatePetSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  breed: z.string().min(1).max(100).optional(),
  weight: z.number().positive().optional(),
  color: z.string().min(1).max(50).optional(),
  microchipNumber: z.string().optional(),
});

export type CreatePetDTO = z.infer<typeof createPetSchema>;
export type UpdatePetDTO = z.infer<typeof updatePetSchema>;
