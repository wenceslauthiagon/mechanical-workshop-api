import { IReminderRepository } from '@domain/repositories/IReminderRepository';
import { IPetRepository } from '@domain/repositories/IPetRepository';
import { Reminder, ReminderStatus, ReminderType } from '@domain/entities/Reminder';
import { NotFoundError, ValidationError } from '@shared/errors/DomainError';

interface ScheduleWalkRemindersInput {
  petId: string;
  frequency: 'DAILY' | 'WEEKLY' | 'CUSTOM';
  time: string; // HH:MM format
  daysOfWeek?: number[]; // 0=Sunday, 1=Monday, etc. (for WEEKLY)
  customDates?: Date[]; // For CUSTOM frequency
  title?: string;
  description?: string;
}

export class ScheduleWalkRemindersUseCase {
  constructor(
    private readonly reminderRepository: IReminderRepository,
    private readonly petRepository: IPetRepository,
  ) {}

  async execute(input: ScheduleWalkRemindersInput): Promise<Reminder[]> {
    const pet = await this.petRepository.findById(input.petId);
    if (!pet) {
      throw new NotFoundError('Pet', input.petId);
    }

    const reminders: Reminder[] = [];
    const [hours, minutes] = input.time.split(':').map(Number);

    if (input.frequency === 'DAILY') {
      // Create reminders for next 30 days
      for (let i = 0; i < 30; i++) {
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + i);
        dueDate.setHours(hours, minutes, 0, 0);

        const reminder = await this.reminderRepository.create({
          petId: input.petId,
          type: ReminderType.WALK,
          title: input.title || `Walk ${pet.name}`,
          description: input.description || `Daily walk time for ${pet.name}`,
          dueDate,
          status: ReminderStatus.PENDING,
          notificationSent: false,
        });
        reminders.push(reminder);
      }
    } else if (input.frequency === 'WEEKLY' && input.daysOfWeek) {
      // Create reminders for next 12 weeks on specified days
      for (let week = 0; week < 12; week++) {
        for (const dayOfWeek of input.daysOfWeek) {
          const dueDate = new Date();
          dueDate.setDate(dueDate.getDate() + (week * 7) + (dayOfWeek - dueDate.getDay()));
          dueDate.setHours(hours, minutes, 0, 0);

          if (dueDate > new Date()) {
            const reminder = await this.reminderRepository.create({
              petId: input.petId,
              type: ReminderType.WALK,
              title: input.title || `Walk ${pet.name}`,
              description: input.description || `Weekly walk for ${pet.name}`,
              dueDate,
              status: ReminderStatus.PENDING,
              notificationSent: false,
            });
            reminders.push(reminder);
          }
        }
      }
    } else if (input.frequency === 'CUSTOM' && input.customDates) {
      // Create reminders for specific dates
      for (const date of input.customDates) {
        const dueDate = new Date(date);
        dueDate.setHours(hours, minutes, 0, 0);

        const reminder = await this.reminderRepository.create({
          petId: input.petId,
          type: ReminderType.WALK,
          title: input.title || `Walk ${pet.name}`,
          description: input.description || `Scheduled walk for ${pet.name}`,
          dueDate,
          status: ReminderStatus.PENDING,
          notificationSent: false,
        });
        reminders.push(reminder);
      }
    } else {
      throw new ValidationError('Invalid frequency or missing required parameters');
    }

    return reminders;
  }
}
