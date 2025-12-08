import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { validateRequest } from '../middlewares/validateRequest';
import { registerSchema, loginSchema } from '../dtos/AuthDTO';

export const createAuthRoutes = (authController: AuthController): Router => {
  const router = Router();

  /**
   * @swagger
   * /api/auth/register:
   *   post:
   *     summary: Register a new owner
   *     tags: [Auth]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - name
   *               - email
   *               - password
   *               - confirmPassword
   *               - phone
   *             properties:
   *               name:
   *                 type: string
   *                 example: João Silva
   *               email:
   *                 type: string
   *                 format: email
   *                 example: joao@example.com
   *               password:
   *                 type: string
   *                 format: password
   *                 minLength: 6
   *                 example: senha123
   *               confirmPassword:
   *                 type: string
   *                 format: password
   *                 minLength: 6
   *                 example: senha123
   *               phone:
   *                 type: string
   *                 example: "(11) 98765-4321"
   *               address:
   *                 type: string
   *                 example: Rua das Flores, 123
   *     responses:
   *       201:
   *         description: Owner registered successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 id:
   *                   type: string
   *                   format: uuid
   *                 name:
   *                   type: string
   *                 email:
   *                   type: string
   *                 phone:
   *                   type: string
   *                 address:
   *                   type: string
   *                 token:
   *                   type: string
   *                   description: JWT token válido por 3 horas
   *       400:
   *         description: Invalid input or email already registered
   */
  router.post('/register', validateRequest(registerSchema), (req, res, next) => {
    authController.register(req, res).catch(next);
  });

  /**
   * @swagger
   * /api/auth/login:
   *   post:
   *     summary: Login with email and password
   *     tags: [Auth]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - email
   *               - password
   *             properties:
   *               email:
   *                 type: string
   *                 format: email
   *                 example: joao@example.com
   *               password:
   *                 type: string
   *                 format: password
   *                 example: senha123
   *     responses:
   *       200:
   *         description: Login successful
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 id:
   *                   type: string
   *                   format: uuid
   *                 name:
   *                   type: string
   *                 email:
   *                   type: string
   *                 phone:
   *                   type: string
   *                 address:
   *                   type: string
   *                 token:
   *                   type: string
   *                   description: JWT token válido por 3 horas
   *       401:
   *         description: Invalid credentials
   */
  router.post('/login', validateRequest(loginSchema), (req, res, next) => {
    authController.login(req, res).catch(next);
  });

  return router;
};
