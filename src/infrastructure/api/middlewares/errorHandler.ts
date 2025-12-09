import { Request, Response, NextFunction } from 'express';
import { HttpException } from '@shared/services/ErrorHandlerService';
import { ERROR_MESSAGES } from '@shared/constants/messages.constants';
import { logger } from '@shared/services/Logger';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (err instanceof HttpException) {
    res.status(err.statusCode).json({
      error: err.name,
      message: err.message,
      timestamp: new Date().toISOString(),
    });
    return;
  }

  logger.error('Error Handler', `${ERROR_MESSAGES.INTERNAL_SERVER_ERROR} - ${err.stack}`, 'ErrorHandler');
  
  res.status(500).json({
    error: 'InternalServerErrorException',
    message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
    timestamp: new Date().toISOString(),
  });
};
