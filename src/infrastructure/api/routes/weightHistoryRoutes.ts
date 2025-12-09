import { Router } from 'express';
import { WeightHistoryController } from '@infrastructure/api/controllers/WeightHistoryController';
import { validateRequest } from '@infrastructure/api/middlewares/validateRequest';
import { recordWeightSchema } from '@infrastructure/api/dtos/WeightHistoryDTO';

export function createWeightHistoryRoutes(weightHistoryController: WeightHistoryController): Router {
  const router = Router();

  /**
   * @swagger
   * /api/weight-history:
   *   post:
   *     summary: Record pet weight
   *     tags: [Weight History]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - weight
   *               - measurementDate
   *               - petId
   *             properties:
   *               weight:
   *                 type: number
   *                 example: 28.5
   *               measurementDate:
   *                 type: string
   *                 format: date
   *                 example: "2025-11-08"
   *               notes:
   *                 type: string
   *                 example: Peso após tratamento
   *               petId:
   *                 type: string
   *                 format: uuid
   *     responses:
   *       201:
   *         description: Weight recorded successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/WeightHistory'
   */
  router.post('/', validateRequest(recordWeightSchema), (req, res) =>
    weightHistoryController.record(req, res),
  );

  /**
   * @swagger
   * /api/weight-history/pet/{petId}:
   *   get:
   *     summary: Get weight history for a pet
   *     tags: [Weight History]
   *     parameters:
   *       - in: path
   *         name: petId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     responses:
   *       200:
   *         description: Weight history
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/WeightHistory'
   */
  router.get('/pet/:petId', (req, res) => weightHistoryController.getHistory(req, res));

  /**
   * @swagger
   * /api/weight-history/pet/{petId}/latest:
   *   get:
   *     summary: Get latest weight record for a pet
   *     tags: [Weight History]
   *     parameters:
   *       - in: path
   *         name: petId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     responses:
   *       200:
   *         description: Latest weight record
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/WeightHistory'
   *       404:
   *         description: No weight records found
   */
  router.get('/pet/:petId/latest', (req, res) => weightHistoryController.getLatest(req, res));

  return router;
}
