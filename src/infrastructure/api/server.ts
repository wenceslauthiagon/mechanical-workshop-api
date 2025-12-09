import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import { connectDatabase } from '../database/prisma';
import { container } from './container';
import { createOwnerRoutes } from './routes/ownerRoutes';
import { createPetRoutes } from './routes/petRoutes';
import { createVaccineRoutes } from './routes/vaccineRoutes';
import { createMedicationRoutes } from './routes/medicationRoutes';
import { createVeterinaryVisitRoutes } from './routes/veterinaryVisitRoutes';
import { createReminderRoutes } from './routes/reminderRoutes';
import { createWeightHistoryRoutes } from './routes/weightHistoryRoutes';
import { createAllergyRoutes } from './routes/allergyRoutes';
import { createAuthRoutes } from './routes/authRoutes';
import { errorHandler } from './middlewares/errorHandler';
import { logger } from '@shared/services/Logger';
import { swaggerSpec } from './config/swagger';

dotenv.config();

const DEFAULT_PORT = 3000;
const PORT = process.env.PORT ?? DEFAULT_PORT;

const API_ROUTES = {
  AUTH: '/api/auth',
  OWNERS: '/api/owners',
  PETS: '/api/pets',
  VACCINES: '/api/vaccines',
  MEDICATIONS: '/api/medications',
  VETERINARY_VISITS: '/api/veterinary-visits',
  REMINDERS: '/api/reminders',
  WEIGHT_HISTORY: '/api/weight-history',
  ALLERGIES: '/api/allergies',
  SERVICE_ORDERS: '/api/service-orders',
  HEALTH: '/health',
  DOCS: '/api-docs',
};

const SERVER_CONTEXT = 'ServerStartup';

const SERVER_MESSAGES = {
  RUNNING: (port: string | number): string => `Running on http://localhost:${port}`,
  HEALTH_CHECK: (port: string | number): string => `Health check: http://localhost:${port}${API_ROUTES.HEALTH}`,
  API_BASE: (port: string | number): string => `API Base: http://localhost:${port}/api`,
  API_DOCS: (port: string | number): string => `API Docs: http://localhost:${port}${API_ROUTES.DOCS}`,
  STARTUP_FAILED: 'Failed to start',
};

const HTTP_STATUS_OK = 200;

const app: Express = express();

app.use(cors());
app.use(express.json());

// Swagger Documentation
app.use(API_ROUTES.DOCS, swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Pet Management API Docs',
}));

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API is running
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
app.get(API_ROUTES.HEALTH, (_req: Request, res: Response) => {
  res.status(HTTP_STATUS_OK).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString() 
  });
});

app.use(API_ROUTES.AUTH, createAuthRoutes(container.authController));
app.use(API_ROUTES.OWNERS, createOwnerRoutes(container.ownerController));
app.use(API_ROUTES.PETS, createPetRoutes(container.petController));
app.use(API_ROUTES.VACCINES, createVaccineRoutes(container.vaccineController));
app.use(API_ROUTES.MEDICATIONS, createMedicationRoutes(container.medicationController));
app.use(API_ROUTES.VETERINARY_VISITS, createVeterinaryVisitRoutes(container.veterinaryVisitController));
app.use(API_ROUTES.REMINDERS, createReminderRoutes(container.reminderController));
app.use(API_ROUTES.WEIGHT_HISTORY, createWeightHistoryRoutes(container.weightHistoryController));
app.use(API_ROUTES.ALLERGIES, createAllergyRoutes(container.allergyController));
// Service Orders (OS)
import serviceOrderRoutes from './routes/serviceOrderRoutes';
app.use(API_ROUTES.SERVICE_ORDERS, serviceOrderRoutes);

app.use(errorHandler);

const EXIT_CODE_ERROR = 1;

const startServer = async (): Promise<void> => {
  try {
    await connectDatabase();

    app.listen(PORT, () => {
      logger.info(SERVER_MESSAGES.RUNNING(PORT), SERVER_CONTEXT);
      logger.info(SERVER_MESSAGES.HEALTH_CHECK(PORT), SERVER_CONTEXT);
      logger.info(SERVER_MESSAGES.API_BASE(PORT), SERVER_CONTEXT);
      logger.info(SERVER_MESSAGES.API_DOCS(PORT), SERVER_CONTEXT);
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(SERVER_MESSAGES.STARTUP_FAILED, errorMessage, SERVER_CONTEXT);
    process.exit(EXIT_CODE_ERROR);
  }
};

if (process.env.NODE_ENV !== 'test') {
  startServer().catch((error: Error) => {
    logger.error('Unhandled error during startup', error.stack, SERVER_CONTEXT);
  });
}

export default app;
