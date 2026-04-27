import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  console.error('Error:', err.message);

  if (err.message === 'BUDGET_NOT_FOUND') {
    return res.status(404).json({ message: 'Budget not found', code: 'BUDGET_NOT_FOUND' });
  }
  if (err.message === 'PAYMENT_NOT_FOUND') {
    return res.status(404).json({ message: 'Payment not found', code: 'PAYMENT_NOT_FOUND' });
  }

  return res.status(500).json({ message: 'Internal server error', code: 'INTERNAL_ERROR' });
}
