import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  console.error('Error:', err.message);

  if (err.message === 'EXECUTION_NOT_FOUND') {
    return res.status(404).json({ message: 'Execution not found', code: 'EXECUTION_NOT_FOUND' });
  }

  return res.status(500).json({ message: 'Internal server error', code: 'INTERNAL_ERROR' });
}
