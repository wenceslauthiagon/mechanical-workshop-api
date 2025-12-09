import { z } from 'zod';
import { VaccineStatus } from '@domain/entities/Vaccine';

export const createVaccineSchema = z.object({
  petId: z.string().uuid('Invalid pet ID'),
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().max(500).optional(),
  scheduledDate: z.string().datetime().or(z.date()),
  applicationDate: z.string().datetime().or(z.date()).optional(),
  nextDoseDate: z.string().datetime().or(z.date()).optional(),
  veterinarianName: z.string().max(200).optional(),
  clinicName: z.string().max(200).optional(),
  batchNumber: z.string().max(100).optional(),
  status: z.nativeEnum(VaccineStatus),
  observations: z.string().max(1000).optional(),
});

export const updateVaccineSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  scheduledDate: z.string().datetime().or(z.date()).optional(),
  applicationDate: z.string().datetime().or(z.date()).optional(),
  nextDoseDate: z.string().datetime().or(z.date()).optional(),
  veterinarianName: z.string().max(200).optional(),
  clinicName: z.string().max(200).optional(),
  batchNumber: z.string().max(100).optional(),
  status: z.nativeEnum(VaccineStatus).optional(),
  observations: z.string().max(1000).optional(),
});

export type CreateVaccineDTO = z.infer<typeof createVaccineSchema>;
export type UpdateVaccineDTO = z.infer<typeof updateVaccineSchema>;
