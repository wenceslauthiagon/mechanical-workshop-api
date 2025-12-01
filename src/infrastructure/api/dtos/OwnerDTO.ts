import { z } from 'zod';

export const createOwnerSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  email: z.string().email('Invalid email format'),
  phone: z.string().min(8, 'Phone must have at least 8 characters').max(20),
  address: z.string().max(500).optional(),
});

export const updateOwnerSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  email: z.string().email().optional(),
  phone: z.string().min(8).max(20).optional(),
  address: z.string().max(500).optional(),
});

export type CreateOwnerDTO = z.infer<typeof createOwnerSchema>;
export type UpdateOwnerDTO = z.infer<typeof updateOwnerSchema>;
