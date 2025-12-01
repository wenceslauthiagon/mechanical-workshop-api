import { Reminder } from '@domain/entities/Reminder';
import { IReminderRepository } from '@domain/repositories/IReminderRepository';
import { NotFoundError } from '@shared/errors/DomainError';

export class CompleteReminderUseCase {
  constructor(private readonly reminderRepository: IReminderRepository) {}

  async execute(reminderId: string): Promise<Reminder> {
    const reminder = await this.reminderRepository.findById(reminderId);
    if (!reminder) {
      throw new NotFoundError('Reminder', reminderId);
    }

    return await this.reminderRepository.markAsCompleted(reminderId);
  }
}
