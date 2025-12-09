import { IReminderRepository } from '@domain/repositories/IReminderRepository';
import { Reminder } from '@domain/entities/Reminder';

interface GetPetRemindersFilters {
  petId: string;
  type?: string;
  status?: string;
  startDate?: Date;
  endDate?: Date;
}

export class GetPetRemindersWithFiltersUseCase {
  constructor(private readonly reminderRepository: IReminderRepository) {}

  async execute(filters: GetPetRemindersFilters): Promise<Reminder[]> {
    const allReminders = await this.reminderRepository.findByPetId(filters.petId);

    let filtered = allReminders;

    if (filters.type) {
      filtered = filtered.filter((r) => r.type === filters.type);
    }

    if (filters.status) {
      filtered = filtered.filter((r) => r.status === filters.status);
    }

    if (filters.startDate) {
      filtered = filtered.filter((r) => r.dueDate >= filters.startDate!);
    }

    if (filters.endDate) {
      filtered = filtered.filter((r) => r.dueDate <= filters.endDate!);
    }

    return filtered;
  }
}
