import { z } from 'zod';
import { VisitType } from '@domain/entities/VeterinaryVisit';

export const createVeterinaryVisitSchema = z.object({
  petId: z.string().uuid('Invalid pet ID'),
  date: z.string().datetime().or(z.date()),
  type: z.nativeEnum(VisitType),
  veterinarianName: z.string().min(1, 'Veterinarian name is required').max(200),
  clinicName: z.string().min(1, 'Clinic name is required').max(200),
  reason: z.string().min(1, 'Reason is required').max(500),
  diagnosis: z.string().max(1000).optional(),
  treatment: z.string().max(1000).optional(),
  prescriptions: z.string().max(1000).optional(),
  examResults: z.string().max(2000).optional(),
  cost: z.number().nonnegative().optional(),
  nextVisitDate: z.string().datetime().or(z.date()).optional(),
  observations: z.string().max(1000).optional(),
});

export const updateVeterinaryVisitSchema = z.object({
  date: z.string().datetime().or(z.date()).optional(),
  type: z.nativeEnum(VisitType).optional(),
  veterinarianName: z.string().min(1).max(200).optional(),
  clinicName: z.string().min(1).max(200).optional(),
  reason: z.string().min(1).max(500).optional(),
  diagnosis: z.string().max(1000).optional(),
  treatment: z.string().max(1000).optional(),
  prescriptions: z.string().max(1000).optional(),
  examResults: z.string().max(2000).optional(),
  cost: z.number().nonnegative().optional(),
  nextVisitDate: z.string().datetime().or(z.date()).optional(),
  observations: z.string().max(1000).optional(),
});

export type CreateVeterinaryVisitDTO = z.infer<typeof createVeterinaryVisitSchema>;
export type UpdateVeterinaryVisitDTO = z.infer<typeof updateVeterinaryVisitSchema>;
