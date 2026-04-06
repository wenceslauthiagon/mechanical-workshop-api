import express from 'express';
import { EventBus } from './infra/event-bus';
import { OrderRepository } from './infra/order.repository';
import { OrderService } from './application/order.service';

export function createApp() {
  const app = express();
  app.use(express.json());

  const bus = new EventBus();
  const repo = new OrderRepository();
  const service = new OrderService(repo, bus);

  bus.on('event.billing.payment_confirmed', ({ orderId }) => {
    service.mark(orderId, 'PAYMENT_CONFIRMED');
    bus.emit('command.execution.start', { orderId });
  });

  bus.on('event.billing.payment_failed', ({ orderId, reason }) => {
    service.mark(orderId, 'CANCELLED', reason);
  });

  bus.on('event.execution.completed', ({ orderId }) => {
    service.mark(orderId, 'COMPLETED');
  });

  bus.on('event.execution.failed', ({ orderId, reason }) => {
    service.mark(orderId, 'CANCELLED', reason);
    bus.emit('command.billing.refund', { orderId, reason: 'execution_failed' });
  });

  app.post('/orders', (req, res) => {
    const { customerId, vehicleId, description } = req.body;
    const order = service.open(customerId, vehicleId, description);
    res.status(201).json(order);
  });

  app.get('/orders/:id', (req, res) => {
    try {
      res.json(service.get(req.params.id));
    } catch {
      res.status(404).json({ message: 'Order not found' });
    }
  });

  app.patch('/orders/:id/status', (req, res) => {
    try {
      const updated = service.mark(req.params.id, req.body.status, req.body.reason);
      res.json(updated);
    } catch {
      res.status(404).json({ message: 'Order not found' });
    }
  });

  return { app, bus, service };
}
