import express from 'express';
import { connectRabbitMQ, publishEvent, subscribeEvent } from './infra/rabbitmq';
import { ExecutionService } from './execution.service';

export async function createApp() {
  const app = express();
  app.use(express.json());

  // Conectar event bus
  await connectRabbitMQ();

  const service = new ExecutionService((topic: string, payload: any) => {
    publishEvent(topic, payload).catch(() => undefined);
  });

  // Subscrever comandos do OS
  await subscribeEvent('command.execution.start', async (payload: any) => {
    const { orderId } = payload;
    try {
      const record = service.start(orderId);
      
      // Simular execução (1-3 segundos)
      const executionTime = Math.random() * 2000 + 1000;
      setTimeout(async () => {
        service.updateStatus(record.id, 'COMPLETED', 'Diagnosis and repair completed');
        
        // Emitir sucesso
        publishEvent('event.execution.completed', {
          orderId,
          executionId: record.id,
          completedAt: new Date().toISOString()
        }).catch(() => undefined);
      }, executionTime);
      
    } catch (error) {
      // Emitir falha
      publishEvent('event.execution.failed', {
        orderId,
        reason: (error as Error).message,
      }).catch(() => undefined);
    }
  });

  app.post('/execution/start', (req, res) => {
    const { orderId } = req.body;
    const record = service.start(orderId);
    res.status(201).json(record);
  });

  app.patch('/execution/:id/status', (req, res) => {
    const { status, note } = req.body;
    try {
      const record = service.updateStatus(req.params.id, status, note);
      res.json(record);
    } catch {
      res.status(404).json({ message: 'Execution not found' });
    }
  });

  app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  return { app, service };
}
