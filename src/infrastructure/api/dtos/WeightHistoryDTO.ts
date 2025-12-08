import { z } from 'zod';

export const recordWeightSchema = z.object({
  petId: z.string().uuid(),
  weight: z.number().positive(),
  measurementDate: z.string().datetime().or(z.date()),
  observations: z.string().optional(),
  recordedBy: z.string().optional(),
});

export type RecordWeightDTO = z.infer<typeof recordWeightSchema>;
