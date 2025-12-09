import { IReminderRepository } from '@domain/repositories/IReminderRepository';
import { IVaccineRepository } from '@domain/repositories/IVaccineRepository';
import { Reminder, ReminderStatus, ReminderType } from '@domain/entities/Reminder';
import { NotFoundError } from '@shared/errors/DomainError';

export class CreateVaccineReminderUseCase {
  constructor(
    private readonly reminderRepository: IReminderRepository,
    private readonly vaccineRepository: IVaccineRepository,
  ) {}

  async execute(vaccineId: string): Promise<Reminder | null> {
    const vaccine = await this.vaccineRepository.findById(vaccineId);
    if (!vaccine) {
      throw new NotFoundError('Vaccine', vaccineId);
    }

    // Only create reminder if there's a next dose date
    if (!vaccine.nextDoseDate) {
      return null;
    }

    // Create reminder 3 days before the next dose
    const reminderDate = new Date(vaccine.nextDoseDate);
    reminderDate.setDate(reminderDate.getDate() - 3);

    const reminder = await this.reminderRepository.create({
      petId: vaccine.petId,
      type: ReminderType.VACCINE,
      title: `Vaccine: ${vaccine.name}`,
      description: `Next dose of ${vaccine.name} scheduled for ${vaccine.nextDoseDate.toLocaleDateString()}`,
      dueDate: reminderDate,
      status: ReminderStatus.PENDING,
      relatedEntityId: vaccineId,
      notificationSent: false,
    });

    return reminder;
  }
}
