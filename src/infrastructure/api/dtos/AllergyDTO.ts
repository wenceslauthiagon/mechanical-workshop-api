import { z } from 'zod';

export const registerAllergySchema = z.object({
  petId: z.string().uuid(),
  allergen: z.string().min(1).max(255),
  type: z.enum(['MEDICATION', 'FOOD', 'ENVIRONMENTAL', 'OTHER']),
  severity: z.enum(['MILD', 'MODERATE', 'SEVERE', 'LIFE_THREATENING']),
  symptoms: z.string().optional(),
  diagnosedDate: z.string().datetime().or(z.date()).optional(),
  diagnosedBy: z.string().optional(),
  notes: z.string().optional(),
});

export type RegisterAllergyDTO = z.infer<typeof registerAllergySchema>;

export const updateAllergySchema = z.object({
  allergen: z.string().min(1).max(255).optional(),
  type: z.enum(['MEDICATION', 'FOOD', 'ENVIRONMENTAL', 'OTHER']).optional(),
  severity: z.enum(['MILD', 'MODERATE', 'SEVERE', 'LIFE_THREATENING']).optional(),
  symptoms: z.string().optional(),
  diagnosedDate: z.string().datetime().or(z.date()).optional(),
  diagnosedBy: z.string().optional(),
  notes: z.string().optional(),
});

export type UpdateAllergyDTO = z.infer<typeof updateAllergySchema>;
