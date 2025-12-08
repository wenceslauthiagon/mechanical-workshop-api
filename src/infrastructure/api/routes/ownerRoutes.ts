import { Router } from 'express';
import { OwnerController } from '../controllers/OwnerController';
import { validateRequest } from '../middlewares/validateRequest';
import { createOwnerSchema } from '../dtos/OwnerDTO';

export const createOwnerRoutes = (ownerController: OwnerController): Router => {
  const router = Router();

  /**
   * @swagger
   * /api/owners:
   *   post:
   *     summary: Create a new owner
   *     tags: [Owners]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - name
   *               - email
   *             properties:
   *               name:
   *                 type: string
   *                 example: João Silva
   *               email:
   *                 type: string
   *                 format: email
   *                 example: joao@example.com
   *               phone:
   *                 type: string
   *                 example: "(11) 98765-4321"
   *               address:
   *                 type: string
   *                 example: Rua das Flores, 123
   *     responses:
   *       201:
   *         description: Owner created successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Owner'
   *       400:
   *         description: Invalid input
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  router.post('/', validateRequest(createOwnerSchema), (req, res, next) => {
    ownerController.create(req, res).catch(next);
  });

  /**
   * @swagger
   * /api/owners/{id}:
   *   get:
   *     summary: Get owner by ID
   *     tags: [Owners]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Owner ID
   *     responses:
   *       200:
   *         description: Owner found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Owner'
   *       404:
   *         description: Owner not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  router.get('/:id', (req, res, next) => {
    ownerController.getById(req, res).catch(next);
  });

  return router;
};
