import express from 'express';
import { connectRabbitMQ, publishEvent, subscribeEvent } from './infra/rabbitmq';
import { BillingService } from './billing.service';
import { processPayment } from './infra/mercadopago.client';
import { validateBudgetCreation, validatePaymentApproval, validateOrderId } from './infra/validators';
import { errorHandler } from './infra/error-handler';

export async function createApp() {
  const app = express();
  app.use(express.json());

  // Conectar event bus
  await connectRabbitMQ();

  const service = new BillingService((topic: string, payload: any) => {
    publishEvent(topic, payload).catch(() => undefined);
  });

  // Subscrever comandos do OS
  await subscribeEvent('command.billing.generate', async (payload: any) => {
    try {
      const budget = service.generateBudget(payload.orderId, payload.estimatedTotal || 1500);
      const gatewayPayment = await processPayment(
        budget.estimatedTotal,
        `OS ${payload.orderId} - orçamento mecânica`,
      );

      if (gatewayPayment.status !== 'approved') {
        throw new Error(`PAYMENT_NOT_APPROVED_${gatewayPayment.status.toUpperCase()}`);
      }

      const payment = service.approvePayment(budget.id, budget.estimatedTotal);
      publishEvent('event.billing.payment_confirmed', { 
        orderId: payload.orderId,
        budgetId: budget.id,
        paymentId: payment.id,
        mercadopagoId: gatewayPayment.id,
        amount: payment.amount 
      }).catch(() => undefined);
    } catch (error) {
      publishEvent('event.billing.payment_failed', {
        orderId: payload.orderId,
        reason: (error as Error).message,
      }).catch(() => undefined);
    }
  });

  // Subscrever pedidos de reembolso
  await subscribeEvent('command.billing.refund', async (payload: any) => {
    try {
      service.refund(payload.orderId, payload.reason);
      publishEvent('event.billing.refunded', { orderId: payload.orderId }).catch(() => {});
    } catch (error) {
      publishEvent('event.billing.refund_failed', {
        orderId: payload.orderId,
        reason: error instanceof Error ? error.message : 'REFUND_FAILED',
      }).catch(() => {});
    }
  });

  app.post('/billing/budget', (req, res) => {
    const error = validateBudgetCreation(req.body.orderId, req.body.estimatedTotal);
    if (error) {
      return res.status(400).json({ message: error });
    }

    const { orderId, estimatedTotal } = req.body;
    const budget = service.generateBudget(orderId, estimatedTotal);
    res.status(201).json(budget);
  });

  app.post('/billing/payment/approve', async (req, res) => {
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

      const payment = service.approvePayment(budgetId, amount);
      res.status(201).json({ ...payment, mercadopagoId: gatewayPayment.id });
    } catch (error) {
      res.status(404).json({
        message: error instanceof Error ? error.message : 'Budget not found',
      });
    }
  });

  app.get('/billing/order/:orderId', (req, res) => {
    const error = validateOrderId(req.params.orderId);
    if (error) {
      return res.status(400).json({ message: error });
    }

    try {
      const result = service.getOrderBilling(req.params.orderId);
      res.json(result);
    } catch (error) {
      res.status(404).json({
        message: error instanceof Error ? error.message : 'BUDGET_NOT_FOUND',
      });
    }
  });

  app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  app.use(errorHandler);

  return { app, service };
}
