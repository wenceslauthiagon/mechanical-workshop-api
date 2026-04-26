import express from 'express';
import { connectRabbitMQ, publishEvent, subscribeEvent } from './infra/rabbitmq';
import { OrderRepository } from './infra/order.repository';
import { OrderService } from './application/order.service';
import { OrderPrismaRepository } from './infra/order.prisma.repository';
import { connectDatabase, prisma } from './infra/prisma.client';
import { OrderRepositoryPort } from './application/order-repository.port';

export async function createApp() {
  const app = express();
  app.use(express.json());

  // Conectar event bus
  await connectRabbitMQ();

  let repo: OrderRepositoryPort = new OrderRepository();
  const usePrismaRepo = process.env.OS_USE_PRISMA_REPO === 'true';
  if (usePrismaRepo && process.env.DATABASE_URL) {
    await connectDatabase();
    repo = new OrderPrismaRepository(prisma as unknown as any);
  }
  const service = new OrderService(repo);

  const transitionIfNeeded = async (orderId: string, status: 'PAYMENT_CONFIRMED' | 'CANCELLED' | 'COMPLETED', reason?: string) => {
    try {
      const current = await service.get(orderId);
      if (current.status === status) {
        return false;
      }
      await service.mark(orderId, status, reason);
      return true;
    } catch {
      return false;
    }
  };

  // Subscrever eventos dos outros serviços
  await subscribeEvent('event.billing.payment_confirmed', async ({ orderId }) => {
    const changed = await transitionIfNeeded(orderId, 'PAYMENT_CONFIRMED');
    if (changed) {
      publishEvent('command.execution.start', { orderId });
    }
  });

  await subscribeEvent('event.billing.payment_failed', async ({ orderId, reason }) => {
    await transitionIfNeeded(orderId, 'CANCELLED', reason);
  });

  await subscribeEvent('event.execution.completed', async ({ orderId }) => {
    await transitionIfNeeded(orderId, 'COMPLETED');
  });

  await subscribeEvent('event.execution.failed', async ({ orderId, reason }) => {
    const changed = await transitionIfNeeded(orderId, 'CANCELLED', reason);
    if (changed) {
      publishEvent('command.billing.refund', { orderId, reason: 'execution_failed' });
    }
  });

  // Endpoints
  app.post('/orders', async (req, res) => {
    const { customerId, vehicleId, description } = req.body;
    const order = await service.open(customerId, vehicleId, description);
    return res.status(201).json(order);
  });

  app.get('/orders/:id', async (req, res) => {
    try {
      return res.json(await service.get(req.params.id));
    } catch {
      return res.status(404).json({ message: 'Order not found' });
    }
  });

  app.patch('/orders/:id/status', async (req, res) => {
    try {
      const updated = await service.mark(req.params.id, req.body.status, req.body.reason);
      return res.json(updated);
    } catch (error) {
      if (error instanceof Error && error.message === 'ORDER_INVALID_STATUS_TRANSITION') {
        return res.status(409).json({ message: 'Invalid status transition' });
      }
      return res.status(404).json({ message: 'Order not found' });
    }
  });

  app.get('/orders/:id/history', async (req, res) => {
    try {
      const order = await service.get(req.params.id);
      return res.json({ orderId: order.id, history: order.history });
    } catch {
      return res.status(404).json({ message: 'Order not found' });
    }
  });

  app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  return { app, service, repo };
}
