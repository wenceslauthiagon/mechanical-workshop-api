import express from 'express';
import { connectRabbitMQ, publishEvent, subscribeEvent } from './infra/rabbitmq';
import { OrderRepository } from './infra/order.repository';
import { OrderService } from './application/order.service';

export async function createApp() {
  const app = express();
  app.use(express.json());

  // Conectar event bus
  await connectRabbitMQ();

  const repo = new OrderRepository();
  const service = new OrderService(repo);

  // Subscrever eventos dos outros serviços
  await subscribeEvent('event.billing.payment_confirmed', ({ orderId }) => {
    service.mark(orderId, 'PAYMENT_CONFIRMED');
    publishEvent('command.execution.start', { orderId });
  });

  await subscribeEvent('event.billing.payment_failed', ({ orderId, reason }) => {
    service.mark(orderId, 'CANCELLED', reason);
  });

  await subscribeEvent('event.execution.completed', ({ orderId }) => {
    service.mark(orderId, 'COMPLETED');
  });

  await subscribeEvent('event.execution.failed', ({ orderId, reason }) => {
    service.mark(orderId, 'CANCELLED', reason);
    publishEvent('command.billing.refund', { orderId, reason: 'execution_failed' });
  });

  // Endpoints
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

  app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  return { app, service, repo };
}
