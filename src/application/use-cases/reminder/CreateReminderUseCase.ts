import { Reminder, ReminderStatus } from '@domain/entities/Reminder';
import { IReminderRepository } from '@domain/repositories/IReminderRepository';
import { IPetRepository } from '@domain/repositories/IPetRepository';
import { NotFoundError } from '@shared/errors/DomainError';

interface CreateReminderInput {
  petId: string;
  type: string;
  title: string;
  description?: string;
  dueDate: Date;
  relatedEntityId?: string;
}

export class CreateReminderUseCase {
  constructor(
    private readonly reminderRepository: IReminderRepository,
    private readonly petRepository: IPetRepository,
  ) {}

  async execute(input: CreateReminderInput): Promise<Reminder> {
    const pet = await this.petRepository.findById(input.petId);
    if (!pet) {
      throw new NotFoundError('Pet', input.petId);
    }

    const reminder = await this.reminderRepository.create({
      petId: input.petId,
      type: input.type as any,
      title: input.title,
      description: input.description,
      dueDate: input.dueDate,
      status: ReminderStatus.PENDING,
      relatedEntityId: input.relatedEntityId,
      notificationSent: false,
    });

    return reminder;
  }
}
