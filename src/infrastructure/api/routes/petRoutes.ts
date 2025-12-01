import { Router } from 'express';
import { PetController } from '../controllers/PetController';
import { validateRequest } from '../middlewares/validateRequest';
import { createPetSchema, updatePetSchema } from '../dtos/PetDTO';

export const createPetRoutes = (petController: PetController): Router => {
  const router = Router();

  /**
   * @swagger
   * /api/pets:
   *   post:
   *     summary: Create a new pet
   *     tags: [Pets]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - name
   *               - species
   *               - breed
   *               - birthDate
   *               - ownerId
   *             properties:
   *               name:
   *                 type: string
   *                 example: Rex
   *               species:
   *                 type: string
   *                 example: Cachorro
   *               breed:
   *                 type: string
   *                 example: Golden Retriever
   *               birthDate:
   *                 type: string
   *                 format: date
   *                 example: "2020-05-15"
   *               gender:
   *                 type: string
   *                 enum: [MALE, FEMALE]
   *                 example: MALE
   *               color:
   *                 type: string
   *                 example: Dourado
   *               weight:
   *                 type: number
   *                 example: 30.5
   *               microchipNumber:
   *                 type: string
   *                 example: "123456789012345"
   *               specialNeeds:
   *                 type: string
   *                 example: Alergia a frango
   *               ownerId:
   *                 type: string
   *                 format: uuid
   *     responses:
   *       201:
   *         description: Pet created successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Pet'
   */
  router.post('/', validateRequest(createPetSchema), (req, res, next) => {
    petController.create(req, res).catch(next);
  });

  /**
   * @swagger
   * /api/pets/{id}:
   *   get:
   *     summary: Get pet by ID
   *     tags: [Pets]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     responses:
   *       200:
   *         description: Pet found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Pet'
   *       404:
   *         description: Pet not found
   */
  router.get('/:id', (req, res, next) => {
    petController.getById(req, res).catch(next);
  });

  /**
   * @swagger
   * /api/pets/owner/{ownerId}:
   *   get:
   *     summary: List all pets by owner
   *     tags: [Pets]
   *     parameters:
   *       - in: path
   *         name: ownerId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     responses:
   *       200:
   *         description: List of pets
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Pet'
   */
  router.get('/owner/:ownerId', (req, res, next) => {
    petController.listByOwner(req, res).catch(next);
  });

  /**
   * @swagger
   * /api/pets/{id}:
   *   put:
   *     summary: Update pet
   *     tags: [Pets]
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
   *               name:
   *                 type: string
   *               weight:
   *                 type: number
   *               specialNeeds:
   *                 type: string
   *     responses:
   *       200:
   *         description: Pet updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Pet'
   */
  router.put('/:id', validateRequest(updatePetSchema), (req, res, next) => {
    petController.update(req, res).catch(next);
  });

  /**
   * @swagger
   * /api/pets/{id}:
   *   delete:
   *     summary: Delete pet
   *     tags: [Pets]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     responses:
   *       204:
   *         description: Pet deleted successfully
   *       404:
   *         description: Pet not found
   */
  router.delete('/:id', (req, res, next) => {
    petController.delete(req, res).catch(next);
  });

  return router;
};
