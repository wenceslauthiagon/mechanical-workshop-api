export enum ReminderType {
  VACCINE = 'VACCINE',
  MEDICATION = 'MEDICATION',
  VETERINARY_VISIT = 'VETERINARY_VISIT',
  DEWORMING = 'DEWORMING',
  FLEA_TICK_TREATMENT = 'FLEA_TICK_TREATMENT',
  WEIGHT_CHECK = 'WEIGHT_CHECK',
  GROOMING = 'GROOMING',
  WALK = 'WALK',
  EXERCISE = 'EXERCISE',
  OTHER = 'OTHER',
}

export enum ReminderStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  COMPLETED = 'COMPLETED',
  CANCELED = 'CANCELED',
}

export interface Reminder {
  id: string;
  petId: string;
  type: ReminderType;
  title: string;
  description?: string;
  dueDate: Date;
  status: ReminderStatus;
  relatedEntityId?: string;
  notificationSent: boolean;
  notificationSentAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
