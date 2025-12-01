import { Router } from 'express';
import { MedicationController } from '../controllers/MedicationController';
import { validateRequest } from '../middlewares/validateRequest';
import { createMedicationSchema } from '../dtos/MedicationDTO';

export const createMedicationRoutes = (medicationController: MedicationController): Router => {
  const router = Router();

  /**
   * @swagger
   * /api/medications:
   *   post:
   *     summary: Register a medication
   *     tags: [Medications]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - name
   *               - type
   *               - dosage
   *               - frequency
   *               - startDate
   *               - endDate
   *               - veterinarianName
   *               - petId
   *             properties:
   *               name:
   *                 type: string
   *                 example: Amoxicilina
   *               type:
   *                 type: string
   *                 enum: [ANTIBIOTIC, ANTI_INFLAMMATORY, ANALGESIC, ANTIPARASITIC, VITAMIN, FLEA_TICK_CONTROL, DEWORMER, OTHER]
   *                 example: ANTIBIOTIC
   *               dosage:
   *                 type: string
   *                 example: 250mg
   *               frequency:
   *                 type: string
   *                 example: 2x ao dia
   *               startDate:
   *                 type: string
   *                 format: date
   *                 example: "2025-11-01"
   *               endDate:
   *                 type: string
   *                 format: date
   *                 example: "2025-11-15"
   *               veterinarianName:
   *                 type: string
   *                 example: Dr. João Silva
   *               notes:
   *                 type: string
   *                 example: Administrar após as refeições
   *               petId:
   *                 type: string
   *                 format: uuid
   *     responses:
   *       201:
   *         description: Medication registered successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Medication'
   */
  router.post('/', validateRequest(createMedicationSchema), (req, res, next) => {
    medicationController.create(req, res).catch(next);
  });

  /**
   * @swagger
   * /api/medications/pet/{petId}:
   *   get:
   *     summary: List all medications by pet
   *     tags: [Medications]
   *     parameters:
   *       - in: path
   *         name: petId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     responses:
   *       200:
   *         description: List of medications
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Medication'
   */
  router.get('/pet/:petId', (req, res, next) => {
    medicationController.listByPet(req, res).catch(next);
  });

  /**
   * @swagger
   * /api/medications/pet/{petId}/active:
   *   get:
   *     summary: Get active medications for a pet
   *     description: Returns medications where current date is between startDate and endDate
   *     tags: [Medications]
   *     parameters:
   *       - in: path
   *         name: petId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     responses:
   *       200:
   *         description: List of active medications
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Medication'
   */
  router.get('/pet/:petId/active', (req, res, next) => {
    medicationController.getActive(req, res).catch(next);
  });

  return router;
};
