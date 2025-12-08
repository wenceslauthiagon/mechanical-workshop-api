import { Reminder } from '@domain/entities/Reminder';

export interface IReminderRepository {
  create(reminder: Omit<Reminder, 'id' | 'createdAt' | 'updatedAt'>): Promise<Reminder>;
  findById(id: string): Promise<Reminder | null>;
  findByPetId(petId: string): Promise<Reminder[]>;
  findPendingByPetId(petId: string): Promise<Reminder[]>;
  findUpcomingReminders(daysAhead: number): Promise<Reminder[]>;
  findOverdueReminders(): Promise<Reminder[]>;
  update(id: string, data: Partial<Reminder>): Promise<Reminder>;
  delete(id: string): Promise<void>;
  markAsCompleted(id: string): Promise<Reminder>;
  markAsSent(id: string): Promise<Reminder>;
}
