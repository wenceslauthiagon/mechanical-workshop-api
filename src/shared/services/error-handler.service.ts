import {
  Injectable,
  HttpException,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ERROR_MESSAGES } from '../constants/messages.constants';

@Injectable()
export class ErrorHandlerService {
  private readonly statusCodes = {
    BadRequest: 400,
    Unauthorized: 401,
    Forbidden: 403,
    NotFound: 404,
    Conflict: 409,
    InternalServerError: 500,
  };

  /**
   * Trata qualquer erro e lança a exceção apropriada
   */
  handleError(error: any): never {
    // Se já é uma HttpException do NestJS, só re-lança
    if (error instanceof HttpException) {
      throw error;
    }

    const message = this.extractErrorMessage(error);
    const statusCode = this.extractStatusCode(error);

    console.error(`[${statusCode}] ${message}`, error.stack);

    this.throwAppropriateException(message, statusCode);
  }

  generateException(message: string, statusCode: number): never {
    console.error(`[${statusCode}] ${message}`);
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

  private throwAppropriateException(
    message: string,
    statusCode: number,
  ): never {
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

  /**
   * Utilitário para tratar erros de validação de Value Objects
   */
  handleValueObjectError(error: any, defaultMessage: string): never {
    const message = error?.message || defaultMessage;
    this.generateException(message, this.statusCodes.BadRequest);
  }

  /**
   * Utilitário para tratar erros de autenticação JWT
   */
  handleAuthError(error: any): never {
    const message = error?.message || ERROR_MESSAGES.TOKEN_EXPIRED;
    this.generateException(message, this.statusCodes.Unauthorized);
  }

  /**
   * Utilitário para erros de não encontrado (404)
   */
  handleNotFoundError(message: string): never {
    this.generateException(message, this.statusCodes.NotFound);
  }

  /**
   * Utilitário para erros de conflito (409)
   */
  handleConflictError(message: string): never {
    this.generateException(message, this.statusCodes.Conflict);
  }

  /**
   * Utilitário para erros de acesso negado (403)
   */
  handleForbiddenError(message: string): never {
    this.generateException(message, this.statusCodes.Forbidden);
  }
}
