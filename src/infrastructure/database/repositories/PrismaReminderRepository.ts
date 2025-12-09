import { PrismaClient } from '@prisma/client';
import { Reminder } from '@domain/entities/Reminder';
import { IReminderRepository } from '@domain/repositories/IReminderRepository';

export class PrismaReminderRepository implements IReminderRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(reminder: Omit<Reminder, 'id' | 'createdAt' | 'updatedAt'>): Promise<Reminder> {
    const created = await this.prisma.reminder.create({
      data: reminder,
    });
    return this.toDomain(created);
  }

  async findById(id: string): Promise<Reminder | null> {
    const reminder = await this.prisma.reminder.findUnique({
      where: { id },
    });
    return reminder ? this.toDomain(reminder) : null;
  }

  async findByPetId(petId: string): Promise<Reminder[]> {
    const reminders = await this.prisma.reminder.findMany({
      where: { petId },
      orderBy: { dueDate: 'asc' },
    });
    return reminders.map(this.toDomain);
  }

  async findPendingByPetId(petId: string): Promise<Reminder[]> {
    const reminders = await this.prisma.reminder.findMany({
      where: {
        petId,
        status: 'PENDING',
      },
      orderBy: { dueDate: 'asc' },
    });
    return reminders.map(this.toDomain);
  }

  async findUpcomingReminders(daysAhead: number): Promise<Reminder[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);

    const reminders = await this.prisma.reminder.findMany({
      where: {
        status: 'PENDING',
        dueDate: {
          gte: new Date(),
          lte: futureDate,
        },
      },
      orderBy: { dueDate: 'asc' },
    });
    return reminders.map(this.toDomain);
  }

  async findOverdueReminders(): Promise<Reminder[]> {
    const reminders = await this.prisma.reminder.findMany({
      where: {
        status: 'PENDING',
        dueDate: {
          lt: new Date(),
        },
      },
      orderBy: { dueDate: 'asc' },
    });
    return reminders.map(this.toDomain);
  }

  async update(id: string, data: Partial<Reminder>): Promise<Reminder> {
    const updated = await this.prisma.reminder.update({
      where: { id },
      data,
    });
    return this.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.reminder.delete({
      where: { id },
    });
  }

  async markAsCompleted(id: string): Promise<Reminder> {
    const updated = await this.prisma.reminder.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    });
    return this.toDomain(updated);
  }

  async markAsSent(id: string): Promise<Reminder> {
    const updated = await this.prisma.reminder.update({
      where: { id },
      data: {
        notificationSent: true,
        notificationSentAt: new Date(),
        status: 'SENT',
      },
    });
    return this.toDomain(updated);
  }

  private toDomain(prismaReminder: any): Reminder {
    return {
      id: prismaReminder.id,
      petId: prismaReminder.petId,
      type: prismaReminder.type,
      title: prismaReminder.title,
      description: prismaReminder.description,
      dueDate: prismaReminder.dueDate,
      status: prismaReminder.status,
      relatedEntityId: prismaReminder.relatedEntityId,
      notificationSent: prismaReminder.notificationSent,
      notificationSentAt: prismaReminder.notificationSentAt,
      completedAt: prismaReminder.completedAt,
      createdAt: prismaReminder.createdAt,
      updatedAt: prismaReminder.updatedAt,
    };
  }
}
