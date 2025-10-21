import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext } from '@nestjs/common';
import { faker } from '@faker-js/faker/locale/pt_BR';

import { JwtAuthGuard } from '../../../src/auth/guards/jwt-auth.guard';
import { ErrorHandlerService } from '../../../src/shared/services/error-handler.service';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let errorHandler: jest.Mocked<ErrorHandlerService>;

  const mockExecutionContext = {
    switchToHttp: jest.fn().mockReturnValue({
      getRequest: jest.fn(),
    }),
    getHandler: jest.fn(),
    getClass: jest.fn(),
  } as unknown as ExecutionContext;

  const mockUser = {
    id: faker.string.uuid(),
    username: faker.internet.username(),
    email: faker.internet.email(),
    role: 'EMPLOYEE',
  };

  beforeEach(async () => {
    const mockErrorHandler = {
      generateException: jest.fn(),
      handleError: jest.fn(),
      handleConflictError: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtAuthGuard,
        {
          provide: ErrorHandlerService,
          useValue: mockErrorHandler,
        },
      ],
    }).compile();

    guard = module.get<JwtAuthGuard>(JwtAuthGuard);
    errorHandler =
      module.get<jest.Mocked<ErrorHandlerService>>(ErrorHandlerService);
  });

  it('Should be defined', () => {
    expect(guard).toBeDefined();
    expect(guard).toBeInstanceOf(JwtAuthGuard);
  });

  it('Should instantiate with service dependency', () => {
    const testGuard = new JwtAuthGuard(errorHandler);
    expect(testGuard).toBeDefined();
  });

  describe('canActivate', () => {
    it('TC0001 - Should call super.canActivate', () => {
      const superCanActivate = jest.spyOn(
        Object.getPrototypeOf(Object.getPrototypeOf(guard)),
        'canActivate',
      );
      superCanActivate.mockReturnValue(true);

      const result = guard.canActivate(mockExecutionContext);

      expect(superCanActivate).toHaveBeenCalledWith(mockExecutionContext);
      expect(result).toBe(true);

      superCanActivate.mockRestore();
    });
  });

  describe('handleRequest', () => {
    it('TC0001 - Should return user when no error and user exists', () => {
      const result = guard.handleRequest(null, mockUser);

      expect(result).toEqual(mockUser);
    });

    it('TC0002 - Should throw error when error is provided', () => {
      const mockError = new Error('JWT expired');

      expect(() => guard.handleRequest(mockError, mockUser)).toThrow(mockError);
    });

    it('TC0003 - Should handle error when no user provided', () => {
      errorHandler.handleError.mockImplementation(() => {
        throw new Error('Unauthorized');
      });

      expect(() => guard.handleRequest(null, null)).toThrow('Unauthorized');

      expect(errorHandler.handleError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Unauthorized',
          statusCode: 401,
        }),
      );
    });

    it('TC0004 - Should handle error when user is undefined', () => {
      errorHandler.handleError.mockImplementation(() => {
        throw new Error('Unauthorized');
      });

      expect(() => guard.handleRequest(null, undefined)).toThrow(
        'Unauthorized',
      );

      expect(errorHandler.handleError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Unauthorized',
          statusCode: 401,
        }),
      );
    });
  });
});
