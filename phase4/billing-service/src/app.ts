import express from 'express';
import { connectRabbitMQ, publishEvent, subscribeEvent } from './infra/rabbitmq';
import { BillingService } from './billing.service';
import { BillingPrismaRepository } from './infra/budget.prisma.repository';
import { connectDatabase } from './infra/prisma.client';
import { processPayment } from './infra/mercadopago.client';
import { validateBudgetCreation, validatePaymentApproval, validateOrderId } from './infra/validators';
import { errorHandler } from './infra/error-handler';
import { BillingEventPayload, BillingTopicPayloadMap } from './infra/events';

export async function createApp() {
  const app = express();
  app.use(express.json());

  const emitEvent = (topic: string, payload: BillingEventPayload) => {
    publishEvent(topic, payload).catch(() => undefined);
  };

  // Conectar event bus
  await connectRabbitMQ();

  let service = new BillingService(emitEvent);

  if (process.env.DATABASE_URL) {
    const prisma = await connectDatabase();
    service = new BillingService(
      emitEvent,
      new BillingPrismaRepository(prisma),
    );
  }

  // Subscrever comandos do OS
  await subscribeEvent<'command.billing.generate'>('command.billing.generate', async (payload: BillingTopicPayloadMap['command.billing.generate']) => {
    try {
      await service.generateBudget(payload.orderId, payload.estimatedTotal || 1500);
    } catch (error) {
      emitEvent('event.billing.budget_generation_failed', {
        orderId: payload.orderId,
        reason: (error as Error).message,
      });
    }
  });

  await subscribeEvent<'command.billing.approve'>('command.billing.approve', async (payload: BillingTopicPayloadMap['command.billing.approve']) => {
    try {
      const { budget } = await service.getOrderBilling(payload.orderId);
      const gatewayPayment = await processPayment(
        budget.estimatedTotal,
        `OS ${payload.orderId} - aprovação de orçamento mecânica`,
      );

      if (gatewayPayment.status !== 'approved') {
        throw new Error(`PAYMENT_NOT_APPROVED_${gatewayPayment.status.toUpperCase()}`);
      }

      await service.approveOrderPayment(payload.orderId, gatewayPayment.id);
    } catch (error) {
      emitEvent('event.billing.payment_failed', {
        orderId: payload.orderId,
        reason: (error as Error).message,
      });
    }
  });

  // Subscrever pedidos de reembolso
  await subscribeEvent<'command.billing.refund'>('command.billing.refund', async (payload: BillingTopicPayloadMap['command.billing.refund']) => {
    try {
      await service.refund(payload.orderId, payload.reason);
      emitEvent('event.billing.refunded', { orderId: payload.orderId });
    } catch (error) {
      emitEvent('event.billing.refund_failed', {
        orderId: payload.orderId,
        reason: error instanceof Error ? error.message : 'REFUND_FAILED',
      });
    }
  });

  app.post('/billing/budget', async (req, res, next) => {
    const error = validateBudgetCreation(req.body.orderId, req.body.estimatedTotal);
    if (error) {
      return res.status(400).json({ message: error });
    }

    try {
      const { orderId, estimatedTotal } = req.body;
      const budget = await service.generateBudget(orderId, estimatedTotal);
      res.status(201).json(budget);
    } catch (caughtError) {
      next(caughtError);
    }
  });

  app.post('/billing/payment/approve', async (req, res, next) => {
    const error = validatePaymentApproval(req.body.budgetId, req.body.amount);
    if (error) {
      return res.status(400).json({ message: error });
    }

    const { budgetId, amount } = req.body;
    try {
      const gatewayPayment = await processPayment(amount, `Aprovação de pagamento do orçamento ${budgetId}`);
      if (gatewayPayment.status !== 'approved') {
        return res.status(402).json({
          message: `Payment not approved: ${gatewayPayment.status}`,
        });
      }

      const payment = await service.approvePayment(budgetId, amount, gatewayPayment.id);
      res.status(201).json({ ...payment, mercadopagoId: gatewayPayment.id });
    } catch (caughtError) {
      if ((caughtError as Error).message === 'BUDGET_NOT_FOUND') {
        return res.status(404).json({
          message: 'BUDGET_NOT_FOUND',
        });
      }
      next(caughtError);
    }
  });

  app.get('/billing/order/:orderId', async (req, res, next) => {
    const error = validateOrderId(req.params.orderId);
    if (error) {
      return res.status(400).json({ message: error });
    }

    try {
      const result = await service.getOrderBilling(req.params.orderId);
      res.json(result);
    } catch (caughtError) {
      if ((caughtError as Error).message === 'BUDGET_NOT_FOUND') {
        return res.status(404).json({
          message: 'BUDGET_NOT_FOUND',
        });
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
