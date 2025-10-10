import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { ErrorHandlerService } from '../services/error-handler.service';
import { ERROR_MESSAGES } from '../constants/messages.constants';
import { Logger } from '@nestjs/common';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  constructor(private readonly errorHandler: ErrorHandlerService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    // Log detalhado do erro para debug
    this.logger.error(
      `[${request.method}] ${request.url} - ${ERROR_MESSAGES.EXCEPTION_CAUGHT}:`,
      exception instanceof Error ? exception.stack : exception,
    );

    try {
      if (exception instanceof HttpException) {
        const status = exception.getStatus();
        const message = exception.getResponse();

        this.logger.warn(
          `HttpException [${status}]: ${JSON.stringify(message)}`,
        );

        return response.status(status).json({
          statusCode: status,
          message: typeof message === 'string' ? message : message,
          timestamp: new Date().toISOString(),
        });
      }

      this.errorHandler.handleError(exception);
    } catch (handledException) {
      this.logger.error(
        ERROR_MESSAGES.ERROR_HANDLER_THREW_EXCEPTION,
        handledException,
      );

      if (handledException instanceof HttpException) {
        const status = handledException.getStatus();
        const message = handledException.getResponse();

        this.logger.warn(
          `Handled exception [${status}]: ${JSON.stringify(message)}`,
        );

        return response.status(status).json({
          statusCode: status,
          message: typeof message === 'string' ? message : message,
          timestamp: new Date().toISOString(),
        });
      }

      // Fallback para erro 500
      this.logger.error(ERROR_MESSAGES.FALLBACK_TO_500_ERROR);
      return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: ERROR_MESSAGES.UNEXPECTED_ERROR,
        timestamp: new Date().toISOString(),
      });
    }
  }
}
