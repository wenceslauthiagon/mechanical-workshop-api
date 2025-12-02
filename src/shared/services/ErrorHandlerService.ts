import { ERROR_MESSAGES } from '../constants/messages.constants';
import { logger } from './Logger';

export interface ErrorDetails {
  message: string;
  statusCode: number;
  timestamp: string;
  error?: string;
}

export class HttpException extends Error {
  constructor(
    public readonly message: string,
    public readonly statusCode: number,
  ) {
    super(message);
    this.name = 'HttpException';
  }
}

export class BadRequestException extends HttpException {
  constructor(message: string) {
    super(message, 400);
    this.name = 'BadRequestException';
  }
}

export class UnauthorizedException extends HttpException {
  constructor(message: string) {
    super(message, 401);
    this.name = 'UnauthorizedException';
  }
}

export class ForbiddenException extends HttpException {
  constructor(message: string) {
    super(message, 403);
    this.name = 'ForbiddenException';
  }
}

export class NotFoundException extends HttpException {
  constructor(message: string) {
    super(message, 404);
    this.name = 'NotFoundException';
  }
}

export class ConflictException extends HttpException {
  constructor(message: string) {
    super(message, 409);
    this.name = 'ConflictException';
  }
}

export class InternalServerErrorException extends HttpException {
  constructor(message: string) {
    super(message, 500);
    this.name = 'InternalServerErrorException';
  }
}

export class ErrorHandlerService {
  private readonly statusCodes = {
    BadRequest: 400,
    Unauthorized: 401,
    Forbidden: 403,
    NotFound: 404,
    Conflict: 409,
    InternalServerError: 500,
  };

  handleError(error: any): never {
    if (error instanceof HttpException) {
      throw error;
    }

    if (this.isPrismaConstraintError(error)) {
      const message = this.extractPrismaConstraintMessage(error);
      throw new ConflictException(message);
    }

    const message = this.extractErrorMessage(error);
    const statusCode = this.extractStatusCode(error);

    logger.error(`[${statusCode}] ${message}`, error?.stack, 'ErrorHandler');

    this.throwAppropriateException(message, statusCode);
  }

  generateException(message: string, statusCode: number): never {
    logger.error(`[${statusCode}] ${message}`, undefined, 'ErrorHandler');
    this.throwAppropriateException(message, statusCode);
  }

  private extractErrorMessage(error: any): string {
    return (
      error?.message ||
      error?.response?.message ||
      ERROR_MESSAGES.UNEXPECTED_ERROR
    );
  }

  private extractStatusCode(error: any): number {
    return (
      error?.status ||
      error?.response?.status ||
      error?.statusCode ||
      this.statusCodes.InternalServerError
    );
  }

  private throwAppropriateException(message: string, statusCode: number): never {
    switch (statusCode) {
      case this.statusCodes.BadRequest:
        throw new BadRequestException(message);

      case this.statusCodes.Unauthorized:
        throw new UnauthorizedException(message);

      case this.statusCodes.Forbidden:
        throw new ForbiddenException(message);

      case this.statusCodes.NotFound:
        throw new NotFoundException(message);

      case this.statusCodes.Conflict:
        throw new ConflictException(message);

      case this.statusCodes.InternalServerError:
      default:
        throw new InternalServerErrorException(message);
    }
  }

  handleValueObjectError(error: any, defaultMessage: string): never {
    const message = error?.message || defaultMessage;
    this.generateException(message, this.statusCodes.BadRequest);
  }

  handleAuthError(error: any): never {
    const message = error?.message || ERROR_MESSAGES.TOKEN_EXPIRED;
    this.generateException(message, this.statusCodes.Unauthorized);
  }

  handleNotFoundError(message: string): never {
    this.generateException(message, this.statusCodes.NotFound);
  }

  handleConflictError(message: string): never {
    this.generateException(message, this.statusCodes.Conflict);
  }

  handleForbiddenError(message: string): never {
    this.generateException(message, this.statusCodes.Forbidden);
  }

  private isPrismaConstraintError(error: any): boolean {
    return (
      error?.code === 'P2002' ||
      error?.code === 'P2003' ||
      error?.message?.includes('Unique constraint failed') ||
      error?.message?.includes('Foreign key constraint failed')
    );
  }

  private extractPrismaConstraintMessage(error: any): string {
    if (error?.message?.includes('email')) {
      return ERROR_MESSAGES.EMAIL_ALREADY_REGISTERED;
    }
    if (error?.message?.includes('microchip')) {
      return ERROR_MESSAGES.MICROCHIP_ALREADY_EXISTS;
    }
    if (error?.message?.includes('phone')) {
      return ERROR_MESSAGES.PHONE_ALREADY_EXISTS;
    }

    return ERROR_MESSAGES.CONSTRAINT_VIOLATION;
  }
}
