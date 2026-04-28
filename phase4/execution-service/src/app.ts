import express from 'express';
import { connectRabbitMQ, publishEvent, subscribeEvent } from './infra/rabbitmq';
import { ExecutionService } from './execution.service';
import { ExecutionMongoRepository } from './infra/execution.mongo.repository';
import { connectMongo } from './infra/mongo.client';
import { validateExecutionStart, validateExecutionStatusUpdate, validateExecutionId } from './infra/validators';
import { errorHandler } from './infra/error-handler';

export async function createApp() {
  const app = express();
  app.use(express.json());

  // Conectar event bus
  await connectRabbitMQ();

  let service = new ExecutionService((topic: string, payload: any) => {
    publishEvent(topic, payload).catch(() => undefined);
  });

  if (process.env.MONGODB_URL) {
    const client = await connectMongo();
    service = new ExecutionService(
      (topic: string, payload: any) => {
        publishEvent(topic, payload).catch(() => undefined);
      },
      new ExecutionMongoRepository(client, process.env.MONGODB_DB_NAME ?? 'execution_db'),
    );
  }

  // Subscrever comandos do OS
  await subscribeEvent('command.execution.start', async (payload: any) => {
    const { orderId } = payload;
    try {
      const record = await service.start(orderId);
      
      // Simular execução (1-3 segundos)
      const executionTime = Math.random() * 2000 + 1000;
      setTimeout(async () => {
        try {
          await service.updateStatus(record.id, 'COMPLETED', 'Diagnosis and repair completed');

          // Emitir sucesso
          publishEvent('event.execution.completed', {
            orderId,
            executionId: record.id,
            completedAt: new Date().toISOString()
          }).catch(() => undefined);
        } catch (error) {
          publishEvent('event.execution.failed', {
            orderId,
            reason: (error as Error).message,
          }).catch(() => undefined);
        }
      }, executionTime);
      
    } catch (error) {
      // Emitir falha
      publishEvent('event.execution.failed', {
        orderId,
        reason: (error as Error).message,
      }).catch(() => undefined);
    }
  });

  app.post('/execution/start', async (req, res, next) => {
    const error = validateExecutionStart(req.body.orderId);
    if (error) {
      return res.status(400).json({ message: error });
    }

    const { orderId } = req.body;
    try {
      const record = await service.start(orderId);
      res.status(201).json(record);
    } catch {
      res.status(500).json({ message: 'Execution start failed' });
    }
  });

  app.patch('/execution/:id/status', async (req, res, next) => {
    const error = validateExecutionStatusUpdate(req.params.id, req.body.status);
    if (error) {
      return res.status(400).json({ message: error });
    }

    const { status, note } = req.body;
    try {
      const record = await service.updateStatus(req.params.id, status, note);
      res.json(record);
    } catch (caughtError) {
      if ((caughtError as Error).message === 'EXECUTION_NOT_FOUND') {
        return res.status(404).json({ message: 'Execution not found' });
      }
      next(caughtError);
    }
  });

  app.get('/execution/:id', async (req, res, next) => {
    const error = validateExecutionId(req.params.id);
    if (error) {
      return res.status(400).json({ message: error });
    }

    try {
      const record = await service.getById(req.params.id);
      res.json(record);
    } catch (caughtError) {
      if ((caughtError as Error).message === 'EXECUTION_NOT_FOUND') {
        return res.status(404).json({ message: 'Execution not found' });
      }
      next(caughtError);
    }
  });

  app.get('/execution/order/:orderId', async (req, res, next) => {
    const error = validateExecutionStart(req.params.orderId);
    if (error) {
      return res.status(400).json({ message: error });
    }

    try {
      const record = await service.getByOrderId(req.params.orderId);
      res.json(record);
    } catch (caughtError) {
      if ((caughtError as Error).message === 'EXECUTION_NOT_FOUND') {
        return res.status(404).json({ message: 'Execution not found' });
      }
      next(caughtError);
    }
  });

  app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  app.use(errorHandler);

  return { app, service };
}
