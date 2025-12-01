import { Router } from 'express';
import { VeterinaryVisitController } from '../controllers/VeterinaryVisitController';
import { validateRequest } from '../middlewares/validateRequest';
import { createVeterinaryVisitSchema } from '../dtos/VeterinaryVisitDTO';

export const createVeterinaryVisitRoutes = (
  visitController: VeterinaryVisitController,
): Router => {
  const router = Router();

  /**
   * @swagger
   * /api/veterinary-visits:
   *   post:
   *     summary: Register a veterinary visit
   *     tags: [Veterinary Visits]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - visitDate
   *               - reason
   *               - veterinarianName
   *               - petId
   *             properties:
   *               visitDate:
   *                 type: string
   *                 format: date-time
   *                 example: "2025-11-08T14:30:00Z"
   *               reason:
   *                 type: string
   *                 example: Consulta de rotina
   *               diagnosis:
   *                 type: string
   *                 example: Animal saudável
   *               treatment:
   *                 type: string
   *                 example: Recomendado suplemento vitamínico
   *               veterinarianName:
   *                 type: string
   *                 example: Dra. Ana Costa
   *               clinic:
   *                 type: string
   *                 example: Clínica Veterinária Amigo Fiel
   *               cost:
   *                 type: number
   *                 example: 150.00
   *               notes:
   *                 type: string
   *               petId:
   *                 type: string
   *                 format: uuid
   *     responses:
   *       201:
   *         description: Visit registered successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/VeterinaryVisit'
   */
  router.post('/', validateRequest(createVeterinaryVisitSchema), (req, res, next) => {
    visitController.create(req, res).catch(next);
  });

  /**
   * @swagger
   * /api/veterinary-visits/pet/{petId}:
   *   get:
   *     summary: List all veterinary visits by pet
   *     tags: [Veterinary Visits]
   *     parameters:
   *       - in: path
   *         name: petId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     responses:
   *       200:
   *         description: List of veterinary visits
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/VeterinaryVisit'
   */
  router.get('/pet/:petId', (req, res, next) => {
    visitController.listByPet(req, res).catch(next);
  });

  return router;
};
