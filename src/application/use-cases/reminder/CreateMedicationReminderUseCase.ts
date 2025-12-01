import { IReminderRepository } from '@domain/repositories/IReminderRepository';
import { IMedicationRepository } from '@domain/repositories/IMedicationRepository';
import { Reminder, ReminderStatus, ReminderType } from '@domain/entities/Reminder';
import { NotFoundError } from '@shared/errors/DomainError';

export class CreateMedicationReminderUseCase {
  constructor(
    private readonly reminderRepository: IReminderRepository,
    private readonly medicationRepository: IMedicationRepository,
  ) {}

  async execute(medicationId: string): Promise<Reminder> {
    const medication = await this.medicationRepository.findById(medicationId);
    if (!medication) {
      throw new NotFoundError('Medication', medicationId);
    }

    // Determine reminder type based on medication type
    let reminderType = ReminderType.MEDICATION;
    if (medication.type === 'FLEA_TICK_CONTROL') {
      reminderType = ReminderType.FLEA_TICK_TREATMENT;
    } else if (medication.type === 'DEWORMER') {
      reminderType = ReminderType.DEWORMING;
    }

    // Create reminder for medication start date
    const reminder = await this.reminderRepository.create({
      petId: medication.petId,
      type: reminderType,
      title: `Medication: ${medication.name}`,
      description: `${medication.dosage} - ${medication.frequency}. ${medication.instructions || ''}`,
      dueDate: medication.startDate,
      status: ReminderStatus.PENDING,
      relatedEntityId: medicationId,
      notificationSent: false,
    });

    return reminder;
  }
}
