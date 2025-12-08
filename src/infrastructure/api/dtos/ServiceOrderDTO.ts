import { z } from 'zod';

export const createServiceOrderSchema = z.object({
  clientName: z.string().min(1),
  clientContact: z.string().min(1),
  vehicle: z.any(),
  services: z.any(),
  parts: z.any(),
});

export type CreateServiceOrderInput = z.infer<typeof createServiceOrderSchema>;
