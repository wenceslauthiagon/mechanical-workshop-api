import express from 'express';
import { connectRabbitMQ, publishEvent, subscribeEvent } from './infra/rabbitmq';
import { BillingService } from './billing.service';

export async function createApp() {
  const app = express();
  app.use(express.json());

  // Conectar event bus
  await connectRabbitMQ();

  const service = new BillingService((topic: string, payload: any) => {
    publishEvent(topic, payload).catch(console.error);
  });

  // Subscrever comandos do OS
  await subscribeEvent('command.billing.generate', async (payload: any) => {
    try {
      const budget = service.generateBudget(payload.orderId, payload.estimatedTotal || 1500);
      const payment = service.approvePayment(budget.id, budget.amount);
      publishEvent('event.billing.payment_confirmed', { 
        orderId: payload.orderId,
        budgetId: budget.id,
        paymentId: payment.id,
        amount: payment.amount 
      }).catch(console.error);
    } catch (error) {
      publishEvent('event.billing.payment_failed', {
        orderId: payload.orderId,
        reason: (error as Error).message,
      }).catch(console.error);
    }
  });

  // Subscrever pedidos de reembolso
  await subscribeEvent('command.billing.refund', async (payload: any) => {
    try {
      service.refund(payload.orderId, payload.reason);
      publishEvent('event.billing.refunded', { orderId: payload.orderId }).catch(console.error);
    } catch (error) {
      console.error('Refund failed:', error);
    }
  });

  app.post('/billing/budget', (req, res) => {
    const { orderId, estimatedTotal } = req.body;
    const budget = service.generateBudget(orderId, estimatedTotal);
    res.status(201).json(budget);
  });

  app.post('/billing/payment/approve', (req, res) => {
    const { budgetId, amount } = req.body;
    try {
      const payment = service.approvePayment(budgetId, amount);
      res.status(201).json(payment);
    } catch (err) {
      res.status(404).json({ message: 'Budget not found' });
    }
  });

  app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  return { app, service };
}
