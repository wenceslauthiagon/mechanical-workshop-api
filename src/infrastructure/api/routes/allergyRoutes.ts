import { Router } from 'express';
import { AllergyController } from '@infrastructure/api/controllers/AllergyController';
import { validateRequest } from '@infrastructure/api/middlewares/validateRequest';
import { registerAllergySchema } from '@infrastructure/api/dtos/AllergyDTO';

export function createAllergyRoutes(allergyController: AllergyController): Router {
  const router = Router();

  /**
   * @swagger
   * /api/allergies:
   *   post:
   *     summary: Register a pet allergy
   *     tags: [Allergies]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - allergen
   *               - severity
   *               - petId
   *             properties:
   *               allergen:
   *                 type: string
   *                 example: Frango
   *               severity:
   *                 type: string
   *                 enum: [MILD, MODERATE, SEVERE]
   *                 example: MODERATE
   *               symptoms:
   *                 type: string
   *                 example: Coceira e vermelhidão na pele
   *               diagnosedDate:
   *                 type: string
   *                 format: date
   *                 example: "2025-06-15"
   *               notes:
   *                 type: string
   *                 example: Evitar ração com frango
   *               petId:
   *                 type: string
   *                 format: uuid
   *     responses:
   *       201:
   *         description: Allergy registered successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Allergy'
   */
  router.post('/', validateRequest(registerAllergySchema), (req, res) =>
    allergyController.register(req, res),
  );

  /**
   * @swagger
   * /api/allergies/pet/{petId}:
   *   get:
   *     summary: List all allergies by pet
   *     tags: [Allergies]
   *     parameters:
   *       - in: path
   *         name: petId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     responses:
   *       200:
   *         description: List of allergies
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Allergy'
   */
  router.get('/pet/:petId', (req, res) => allergyController.listByPet(req, res));

  /**
   * @swagger
   * /api/allergies/pet/{petId}/severe:
   *   get:
   *     summary: Get severe allergies for a pet
   *     description: Returns only allergies with SEVERE severity level
   *     tags: [Allergies]
   *     parameters:
   *       - in: path
   *         name: petId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     responses:
   *       200:
   *         description: List of severe allergies
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Allergy'
   */
  router.get('/pet/:petId/severe', (req, res) => allergyController.getSevere(req, res));

  return router;
}
