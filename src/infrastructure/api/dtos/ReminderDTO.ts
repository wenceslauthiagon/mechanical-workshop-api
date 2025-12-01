import { z } from 'zod';

export const createReminderSchema = z.object({
  petId: z.string().uuid(),
  type: z.enum([
    'VACCINE',
    'MEDICATION',
    'VETERINARY_VISIT',
    'DEWORMING',
    'FLEA_TICK_TREATMENT',
    'WEIGHT_CHECK',
    'GROOMING',
    'WALK',
    'EXERCISE',
    'OTHER',
  ]),
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  dueDate: z.string().datetime().or(z.date()),
  relatedEntityId: z.string().uuid().optional(),
});

export type CreateReminderDTO = z.infer<typeof createReminderSchema>;

export const completeReminderSchema = z.object({
  reminderId: z.string().uuid(),
});

export type CompleteReminderDTO = z.infer<typeof completeReminderSchema>;

export const getUpcomingRemindersSchema = z.object({
  daysAhead: z.number().int().positive().optional().default(7),
});

export type GetUpcomingRemindersDTO = z.infer<typeof getUpcomingRemindersSchema>;

export const scheduleWalkRemindersSchema = z.object({
  petId: z.string().uuid(),
  frequency: z.enum(['DAILY', 'WEEKLY', 'CUSTOM']),
  time: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/), // HH:MM format
  daysOfWeek: z.array(z.number().int().min(0).max(6)).optional(),
  customDates: z.array(z.string().datetime().or(z.date())).optional(),
  title: z.string().optional(),
  description: z.string().optional(),
});

export type ScheduleWalkRemindersDTO = z.infer<typeof scheduleWalkRemindersSchema>;

export const createVaccineReminderSchema = z.object({
  vaccineId: z.string().uuid(),
});

export type CreateVaccineReminderDTO = z.infer<typeof createVaccineReminderSchema>;

export const createMedicationReminderSchema = z.object({
  medicationId: z.string().uuid(),
});

export type CreateMedicationReminderDTO = z.infer<typeof createMedicationReminderSchema>;
