import { Router } from 'express';
import { ReminderController } from '@infrastructure/api/controllers/ReminderController';
import { validateRequest } from '@infrastructure/api/middlewares/validateRequest';
import {
  createReminderSchema,
  createVaccineReminderSchema,
  createMedicationReminderSchema,
  scheduleWalkRemindersSchema,
} from '@infrastructure/api/dtos/ReminderDTO';

export function createReminderRoutes(reminderController: ReminderController): Router {
  const router = Router();

  /**
   * @swagger
   * /api/reminders:
   *   post:
   *     summary: Create a new reminder
   *     tags: [Reminders]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - title
   *               - dueDate
   *               - type
   *               - petId
   *             properties:
   *               title:
   *                 type: string
   *                 example: Aplicar vacina antirrábica
   *               description:
   *                 type: string
   *                 example: Levar na clínica veterinária
   *               dueDate:
   *                 type: string
   *                 format: date-time
   *                 example: "2025-12-15T10:00:00Z"
   *               type:
   *                 type: string
   *                 enum: [VACCINE, MEDICATION, VETERINARY_VISIT, DEWORMING, FLEA_TICK_TREATMENT, WEIGHT_CHECK, GROOMING, WALK, EXERCISE, OTHER]
   *               petId:
   *                 type: string
   *                 format: uuid
   *               relatedEntityId:
   *                 type: string
   *                 format: uuid
   *     responses:
   *       201:
   *         description: Reminder created successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Reminder'
   */
  router.post('/', validateRequest(createReminderSchema), (req, res) =>
    reminderController.create(req, res),
  );

  /**
   * @swagger
   * /api/reminders/vaccine-reminder:
   *   post:
   *     summary: Create automatic vaccine reminder
   *     description: Automatically creates a reminder 3 days before the vaccine next dose date
   *     tags: [Reminders]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - vaccineId
   *             properties:
   *               vaccineId:
   *                 type: string
   *                 format: uuid
   *                 description: ID of the vaccine that needs a reminder
   *     responses:
   *       201:
   *         description: Vaccine reminder created successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Reminder'
   *       404:
   *         description: Vaccine not found or no next dose date
   */
  router.post(
    '/vaccine-reminder',
    validateRequest(createVaccineReminderSchema),
    (req, res) => reminderController.createVaccineReminder(req, res),
  );

  /**
   * @swagger
   * /api/reminders/medication-reminder:
   *   post:
   *     summary: Create automatic medication reminder
   *     description: Creates a reminder based on medication type (FLEA_TICK_CONTROL → FLEA_TICK_TREATMENT, DEWORMER → DEWORMING)
   *     tags: [Reminders]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - medicationId
   *             properties:
   *               medicationId:
   *                 type: string
   *                 format: uuid
   *     responses:
   *       201:
   *         description: Medication reminder created successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Reminder'
   */
  router.post(
    '/medication-reminder',
    validateRequest(createMedicationReminderSchema),
    (req, res) => reminderController.createMedicationReminder(req, res),
  );

  /**
   * @swagger
   * /api/reminders/schedule-walks:
   *   post:
   *     summary: Schedule walk reminders
   *     description: Create recurring walk reminders with DAILY, WEEKLY, or CUSTOM frequency
   *     tags: [Reminders]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - petId
   *               - frequency
   *               - time
   *             properties:
   *               petId:
   *                 type: string
   *                 format: uuid
   *               frequency:
   *                 type: string
   *                 enum: [DAILY, WEEKLY, CUSTOM]
   *                 example: DAILY
   *               time:
   *                 type: string
   *                 pattern: "^([0-1][0-9]|2[0-3]):[0-5][0-9]$"
   *                 example: "08:00"
   *               daysOfWeek:
   *                 type: array
   *                 items:
   *                   type: number
   *                   minimum: 0
   *                   maximum: 6
   *                 example: [1, 3, 5]
   *                 description: Days of week (0=Sunday, 6=Saturday) - required for WEEKLY
   *               customDates:
   *                 type: array
   *                 items:
   *                   type: string
   *                   format: date
   *                 example: ["2025-12-01", "2025-12-05", "2025-12-10"]
   *                 description: Specific dates - required for CUSTOM
   *               description:
   *                 type: string
   *                 example: Passeio matinal no parque
   *     responses:
   *       201:
   *         description: Walk reminders scheduled successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Reminder'
   */
  router.post(
    '/schedule-walks',
    validateRequest(scheduleWalkRemindersSchema),
    (req, res) => reminderController.scheduleWalkReminders(req, res),
  );

  /**
   * @swagger
   * /api/reminders/upcoming:
   *   get:
   *     summary: Get upcoming reminders
   *     description: Get all pending reminders for the next 7 days
   *     tags: [Reminders]
   *     responses:
   *       200:
   *         description: List of upcoming reminders
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Reminder'
   */
  router.get('/upcoming', (req, res) => reminderController.getUpcoming(req, res));

  /**
   * @swagger
   * /api/reminders/overdue:
   *   get:
   *     summary: Get overdue reminders
   *     description: Get all pending reminders that are past their due date
   *     tags: [Reminders]
   *     responses:
   *       200:
   *         description: List of overdue reminders
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Reminder'
   */
  router.get('/overdue', (req, res) => reminderController.getOverdue(req, res));

  /**
   * @swagger
   * /api/reminders/pet/{petId}:
   *   get:
   *     summary: List reminders by pet
   *     tags: [Reminders]
   *     parameters:
   *       - in: path
   *         name: petId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     responses:
   *       200:
   *         description: List of pet reminders
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Reminder'
   */
  router.get('/pet/:petId', (req, res) => reminderController.listByPet(req, res));

  /**
   * @swagger
   * /api/reminders/pet/{petId}/filter:
   *   get:
   *     summary: Get pet reminders with filters
   *     description: Advanced filtering by type, status, and date range
   *     tags: [Reminders]
   *     parameters:
   *       - in: path
   *         name: petId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *       - in: query
   *         name: type
   *         schema:
   *           type: string
   *           enum: [VACCINE, MEDICATION, VETERINARY_VISIT, DEWORMING, FLEA_TICK_TREATMENT, WEIGHT_CHECK, GROOMING, WALK, EXERCISE, OTHER]
   *       - in: query
   *         name: status
   *         schema:
   *           type: string
   *           enum: [PENDING, SENT, COMPLETED, CANCELLED]
   *       - in: query
   *         name: startDate
   *         schema:
   *           type: string
   *           format: date
   *         example: "2025-11-01"
   *       - in: query
   *         name: endDate
   *         schema:
   *           type: string
   *           format: date
   *         example: "2025-12-31"
   *     responses:
   *       200:
   *         description: Filtered reminders
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Reminder'
   */
  router.get('/pet/:petId/filter', (req, res) =>
    reminderController.getPetRemindersWithFilters(req, res),
  );

  /**
   * @swagger
   * /api/reminders/{id}/complete:
   *   patch:
   *     summary: Mark reminder as completed
   *     tags: [Reminders]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     responses:
   *       200:
   *         description: Reminder marked as completed
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Reminder'
   */
  router.patch('/:id/complete', (req, res) => reminderController.complete(req, res));

  return router;
}
