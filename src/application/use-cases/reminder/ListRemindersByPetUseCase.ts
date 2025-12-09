import { Reminder } from '@domain/entities/Reminder';
import { IReminderRepository } from '@domain/repositories/IReminderRepository';

export class ListRemindersByPetUseCase {
  constructor(private readonly reminderRepository: IReminderRepository) {}

  async execute(petId: string): Promise<Reminder[]> {
    return await this.reminderRepository.findByPetId(petId);
  }
}
