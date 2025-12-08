import { Reminder } from '@domain/entities/Reminder';
import { IReminderRepository } from '@domain/repositories/IReminderRepository';

export class GetOverdueRemindersUseCase {
  constructor(private readonly reminderRepository: IReminderRepository) {}

  async execute(): Promise<Reminder[]> {
    return await this.reminderRepository.findOverdueReminders();
  }
}
