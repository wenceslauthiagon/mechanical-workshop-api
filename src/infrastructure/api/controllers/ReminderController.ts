import { Request, Response } from 'express';
import { CreateReminderUseCase } from '@application/use-cases/reminder/CreateReminderUseCase';
import { GetUpcomingRemindersUseCase } from '@application/use-cases/reminder/GetUpcomingRemindersUseCase';
import { GetOverdueRemindersUseCase } from '@application/use-cases/reminder/GetOverdueRemindersUseCase';
import { ListRemindersByPetUseCase } from '@application/use-cases/reminder/ListRemindersByPetUseCase';
import { CompleteReminderUseCase } from '@application/use-cases/reminder/CompleteReminderUseCase';
import { CreateVaccineReminderUseCase } from '@application/use-cases/reminder/CreateVaccineReminderUseCase';
import { CreateMedicationReminderUseCase } from '@application/use-cases/reminder/CreateMedicationReminderUseCase';
import { ScheduleWalkRemindersUseCase } from '@application/use-cases/reminder/ScheduleWalkRemindersUseCase';
import { GetPetRemindersWithFiltersUseCase } from '@application/use-cases/reminder/GetPetRemindersWithFiltersUseCase';
import { HTTP_STATUS } from '@shared/constants/http-status.constants';

export class ReminderController {
  constructor(
    private readonly createReminderUseCase: CreateReminderUseCase,
    private readonly getUpcomingRemindersUseCase: GetUpcomingRemindersUseCase,
    private readonly getOverdueRemindersUseCase: GetOverdueRemindersUseCase,
    private readonly listRemindersByPetUseCase: ListRemindersByPetUseCase,
    private readonly completeReminderUseCase: CompleteReminderUseCase,
    private readonly createVaccineReminderUseCase: CreateVaccineReminderUseCase,
    private readonly createMedicationReminderUseCase: CreateMedicationReminderUseCase,
    private readonly scheduleWalkRemindersUseCase: ScheduleWalkRemindersUseCase,
    private readonly getPetRemindersWithFiltersUseCase: GetPetRemindersWithFiltersUseCase,
  ) {}

  async create(req: Request, res: Response): Promise<void> {
    const reminder = await this.createReminderUseCase.execute({
      ...req.body,
      dueDate: new Date(req.body.dueDate),
    });
    res.status(HTTP_STATUS.CREATED).json(reminder);
  }

  async getUpcoming(req: Request, res: Response): Promise<void> {
    const daysAhead = req.query.daysAhead ? parseInt(req.query.daysAhead as string) : 7;
    const reminders = await this.getUpcomingRemindersUseCase.execute(daysAhead);
    res.status(HTTP_STATUS.OK).json(reminders);
  }

  async getOverdue(_req: Request, res: Response): Promise<void> {
    const reminders = await this.getOverdueRemindersUseCase.execute();
    res.status(HTTP_STATUS.OK).json(reminders);
  }

  async listByPet(req: Request, res: Response): Promise<void> {
    const { petId } = req.params;
    const reminders = await this.listRemindersByPetUseCase.execute(petId);
    res.status(HTTP_STATUS.OK).json(reminders);
  }

  async complete(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const reminder = await this.completeReminderUseCase.execute(id);
    res.status(HTTP_STATUS.OK).json(reminder);
  }

  async createVaccineReminder(req: Request, res: Response): Promise<void> {
    const { vaccineId } = req.body;
    const reminder = await this.createVaccineReminderUseCase.execute(vaccineId);
    res.status(HTTP_STATUS.CREATED).json(reminder);
  }

  async createMedicationReminder(req: Request, res: Response): Promise<void> {
    const { medicationId } = req.body;
    const reminder = await this.createMedicationReminderUseCase.execute(medicationId);
    res.status(HTTP_STATUS.CREATED).json(reminder);
  }

  async scheduleWalkReminders(req: Request, res: Response): Promise<void> {
    const reminders = await this.scheduleWalkRemindersUseCase.execute({
      ...req.body,
      customDates: req.body.customDates?.map((d: string) => new Date(d)),
    });
    res.status(HTTP_STATUS.CREATED).json(reminders);
  }

  async getPetRemindersWithFilters(req: Request, res: Response): Promise<void> {
    const { petId } = req.params;
    const { type, status, startDate, endDate } = req.query;

    const reminders = await this.getPetRemindersWithFiltersUseCase.execute({
      petId,
      type: type as string | undefined,
      status: status as string | undefined,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
    });
    res.status(HTTP_STATUS.OK).json(reminders);
  }
}
