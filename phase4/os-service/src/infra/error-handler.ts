import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  console.error('Error:', err.message);

  if (err.message === 'ORDER_NOT_FOUND') {
    return res.status(404).json({ message: 'Order not found', code: 'ORDER_NOT_FOUND' });
  }
  if (err.message === 'ORDER_INVALID_STATUS_TRANSITION') {
    return res.status(409).json({ message: 'Invalid status transition', code: 'ORDER_INVALID_STATUS_TRANSITION' });
  }

  return res.status(500).json({ message: 'Internal server error', code: 'INTERNAL_ERROR' });
}
