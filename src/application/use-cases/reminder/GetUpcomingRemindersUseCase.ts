import { Reminder } from '@domain/entities/Reminder';
import { IReminderRepository } from '@domain/repositories/IReminderRepository';

export class GetUpcomingRemindersUseCase {
  constructor(private readonly reminderRepository: IReminderRepository) {}

  async execute(daysAhead: number = 7): Promise<Reminder[]> {
    return await this.reminderRepository.findUpcomingReminders(daysAhead);
  }
}
