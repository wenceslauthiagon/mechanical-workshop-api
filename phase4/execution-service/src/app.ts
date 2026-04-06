import express from 'express';
import { ExecutionService } from './execution.service';

export function createApp(eventEmitter: (topic: string, payload: any) => void) {
  const app = express();
  app.use(express.json());

  const service = new ExecutionService(eventEmitter);

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

  return { app, service };
}
