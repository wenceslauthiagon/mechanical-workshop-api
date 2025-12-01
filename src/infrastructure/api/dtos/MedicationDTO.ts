import { z } from 'zod';
import { MedicationFrequency, MedicationStatus } from '@domain/entities/Medication';

export const createMedicationSchema = z.object({
  petId: z.string().uuid('Invalid pet ID'),
  name: z.string().min(1, 'Name is required').max(200),
  type: z.string().min(1, 'Type is required').max(100),
  dosage: z.string().min(1, 'Dosage is required').max(100),
  frequency: z.nativeEnum(MedicationFrequency),
  startDate: z.string().datetime().or(z.date()),
  endDate: z.string().datetime().or(z.date()).optional(),
  prescribedBy: z.string().max(200).optional(),
  reason: z.string().min(1, 'Reason is required').max(500),
  instructions: z.string().max(1000).optional(),
  status: z.nativeEnum(MedicationStatus),
  observations: z.string().max(1000).optional(),
});

export const updateMedicationSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  type: z.string().min(1).max(100).optional(),
  dosage: z.string().min(1).max(100).optional(),
  frequency: z.nativeEnum(MedicationFrequency).optional(),
  endDate: z.string().datetime().or(z.date()).optional(),
  prescribedBy: z.string().max(200).optional(),
  reason: z.string().min(1).max(500).optional(),
  instructions: z.string().max(1000).optional(),
  status: z.nativeEnum(MedicationStatus).optional(),
  observations: z.string().max(1000).optional(),
});

export type CreateMedicationDTO = z.infer<typeof createMedicationSchema>;
export type UpdateMedicationDTO = z.infer<typeof updateMedicationSchema>;
