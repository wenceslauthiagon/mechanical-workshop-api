import { Router } from 'express';
import { VaccineController } from '../controllers/VaccineController';
import { validateRequest } from '../middlewares/validateRequest';
import { createVaccineSchema, updateVaccineSchema } from '../dtos/VaccineDTO';

export const createVaccineRoutes = (vaccineController: VaccineController): Router => {
  const router = Router();

  /**
   * @swagger
   * /api/vaccines:
   *   post:
   *     summary: Register a vaccine application
   *     tags: [Vaccines]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - name
   *               - applicationDate
   *               - veterinarianName
   *               - petId
   *             properties:
   *               name:
   *                 type: string
   *                 example: V10
   *               applicationDate:
   *                 type: string
   *                 format: date
   *                 example: "2025-10-15"
   *               nextDoseDate:
   *                 type: string
   *                 format: date
   *                 example: "2026-10-15"
   *               veterinarianName:
   *                 type: string
   *                 example: Dr. Maria Santos
   *               clinic:
   *                 type: string
   *                 example: Clínica Veterinária Pet Care
   *               batch:
   *                 type: string
   *                 example: LOT123456
   *               notes:
   *                 type: string
   *               petId:
   *                 type: string
   *                 format: uuid
   *     responses:
   *       201:
   *         description: Vaccine registered successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Vaccine'
   */
  router.post('/', validateRequest(createVaccineSchema), (req, res, next) => {
    vaccineController.create(req, res).catch(next);
  });

  /**
   * @swagger
   * /api/vaccines/pet/{petId}:
   *   get:
   *     summary: List all vaccines by pet
   *     tags: [Vaccines]
   *     parameters:
   *       - in: path
   *         name: petId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     responses:
   *       200:
   *         description: List of vaccines
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Vaccine'
   */
  router.get('/pet/:petId', (req, res, next) => {
    vaccineController.listByPet(req, res).catch(next);
  });

  /**
   * @swagger
   * /api/vaccines/{id}:
   *   put:
   *     summary: Update vaccine information
   *     tags: [Vaccines]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               nextDoseDate:
   *                 type: string
   *                 format: date
   *               notes:
   *                 type: string
   *     responses:
   *       200:
   *         description: Vaccine updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Vaccine'
   */
  router.put('/:id', validateRequest(updateVaccineSchema), (req, res, next) => {
    vaccineController.update(req, res).catch(next);
  });

  return router;
};
