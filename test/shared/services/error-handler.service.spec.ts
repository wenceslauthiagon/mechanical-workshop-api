import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';

import { ErrorHandlerService } from '../../../src/shared/services/error-handler.service';

describe('ErrorHandlerService', () => {
  let service: ErrorHandlerService;
  let consoleSpy: jest.SpyInstance;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ErrorHandlerService],
    }).compile();

    service = module.get<ErrorHandlerService>(ErrorHandlerService);
    consoleSpy = jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it('Should be defined', () => {
    expect(service).toBeDefined();
    expect(service).toBeInstanceOf(ErrorHandlerService);
  });

  it('Should instantiate with service dependency', () => {
    const testService = new ErrorHandlerService();
    expect(testService).toBeDefined();
  });

  describe('handleError', () => {
    it('TC0001 - Should re-throw HttpException', () => {
      const httpError = new BadRequestException('Test error');
      expect(() => service.handleError(httpError)).toThrow(BadRequestException);
    });

    it('TC0002 - Should handle Prisma constraint error', () => {
      const prismaError = {
        code: 'P2002',
        message: 'Unique constraint failed on email',
      };
      expect(() => service.handleError(prismaError)).toThrow(ConflictException);
    });

    it('TC0003 - Should handle all status codes', () => {
      expect(() =>
        service.handleError({ statusCode: 400, message: 'Bad request' }),
      ).toThrow(BadRequestException);
      expect(() =>
        service.handleError({ status: 401, message: 'Unauthorized' }),
      ).toThrow(UnauthorizedException);
      expect(() =>
        service.handleError({
          response: { status: 403 },
          message: 'Forbidden',
        }),
      ).toThrow(ForbiddenException);
      expect(() =>
        service.handleError({ statusCode: 404, message: 'Not found' }),
      ).toThrow(NotFoundException);
      expect(() =>
        service.handleError({ statusCode: 409, message: 'Conflict' }),
      ).toThrow(ConflictException);
      expect(() =>
        service.handleError({ statusCode: 500, message: 'Internal error' }),
      ).toThrow(InternalServerErrorException);
      expect(() =>
        service.handleError({ statusCode: 999, message: 'Unknown error' }),
      ).toThrow(InternalServerErrorException);
    });

    it('TC0004 - Should extract message from response', () => {
      const error = { response: { message: 'Response message', status: 400 } };
      expect(() => service.handleError(error)).toThrow('Response message');
    });

    it('TC0005 - Should use default message when none provided', () => {
      expect(() => service.handleError({ statusCode: 500 })).toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('generateException', () => {
    it('TC0001 - Should generate all exception types', () => {
      expect(() => service.generateException('Bad request', 400)).toThrow(
        BadRequestException,
      );
      expect(() => service.generateException('Unauthorized', 401)).toThrow(
        UnauthorizedException,
      );
      expect(() => service.generateException('Forbidden', 403)).toThrow(
        ForbiddenException,
      );
      expect(() => service.generateException('Not found', 404)).toThrow(
        NotFoundException,
      );
      expect(() => service.generateException('Conflict', 409)).toThrow(
        ConflictException,
      );
      expect(() => service.generateException('Internal error', 500)).toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('utility methods', () => {
    it('TC0001 - Should handle value object error', () => {
      expect(() =>
        service.handleValueObjectError({ message: 'Invalid' }, 'Default'),
      ).toThrow('Invalid');
      expect(() => service.handleValueObjectError({}, 'Default')).toThrow(
        'Default',
      );
    });

    it('TC0002 - Should handle auth error', () => {
      expect(() =>
        service.handleAuthError({ message: 'Token expired' }),
      ).toThrow('Token expired');
      expect(() => service.handleAuthError({})).toThrow(UnauthorizedException);
    });

    it('TC0003 - Should handle specific error types', () => {
      expect(() => service.handleNotFoundError('Not found')).toThrow(
        NotFoundException,
      );
      expect(() => service.handleConflictError('Conflict')).toThrow(
        ConflictException,
      );
      expect(() => service.handleForbiddenError('Forbidden')).toThrow(
        ForbiddenException,
      );
    });
  });

  describe('Prisma constraint messages', () => {
    it('TC0001 - Should handle all constraint types', () => {
      expect(() =>
        service.handleError({ code: 'P2002', message: 'service_order_id' }),
      ).toThrow(ConflictException);
      expect(() =>
        service.handleError({ code: 'P2002', message: 'part_number' }),
      ).toThrow('Já existe uma peça com este número');
      expect(() =>
        service.handleError({ code: 'P2002', message: 'document' }),
      ).toThrow('Já existe um cliente com este documento');
      expect(() =>
        service.handleError({ code: 'P2002', message: 'license_plate' }),
      ).toThrow('Já existe um veículo com esta placa');
      expect(() =>
        service.handleError({ code: 'P2002', message: 'email' }),
      ).toThrow('Já existe um usuário com este email');
      expect(() =>
        service.handleError({ code: 'P2002', message: 'username' }),
      ).toThrow('Já existe um usuário com este nome de usuário');
      expect(() =>
        service.handleError({ code: 'P2002', message: 'unknown_field' }),
      ).toThrow('Dados duplicados encontrados. Verifique os campos únicos.');
    });
  });
});
