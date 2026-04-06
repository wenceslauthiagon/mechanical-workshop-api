import express from 'express';
import { BillingService } from './billing.service';

export function createApp(eventEmitter: (topic: string, payload: any) => void) {
  const app = express();
  app.use(express.json());

  const service = new BillingService(eventEmitter);

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

  return { app, service };
}
