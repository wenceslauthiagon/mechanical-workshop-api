import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { faker } from '@faker-js/faker/locale/pt_BR';

import { JwtAuthGuard } from '../../../src/infrastructure/auth/jwt-auth.guard';
import { ErrorHandlerService } from '../../../src/shared/services/error-handler.service';

describe('JwtAuthGuard (Infrastructure)', () => {
  let guard: JwtAuthGuard;
  let jwtService: jest.Mocked<JwtService>;
  let errorHandler: jest.Mocked<ErrorHandlerService>;

  const mockJwtPayload = {
    sub: faker.string.uuid(),
    username: faker.internet.username(),
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600,
  };

  const mockToken = faker.string.alphanumeric(100);

  const createMockRequest = (authHeader?: string) => ({
    headers: {
      authorization: authHeader,
    },
    user: undefined,
  });

  const createMockExecutionContext = (request: any): ExecutionContext =>
    ({
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue(request),
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    }) as unknown as ExecutionContext;

  beforeEach(async () => {
    const mockJwtService = {
      verifyAsync: jest.fn(),
      signAsync: jest.fn(),
      sign: jest.fn(),
      verify: jest.fn(),
    };

    const mockErrorHandler = {
      generateException: jest.fn(),
      handleError: jest.fn(),
      handleConflictError: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtAuthGuard,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ErrorHandlerService,
          useValue: mockErrorHandler,
        },
      ],
    }).compile();

    guard = module.get<JwtAuthGuard>(JwtAuthGuard);
    jwtService = module.get<jest.Mocked<JwtService>>(JwtService);
    errorHandler =
      module.get<jest.Mocked<ErrorHandlerService>>(ErrorHandlerService);
  });

  it('Should be defined', () => {
    expect(guard).toBeDefined();
    expect(guard).toBeInstanceOf(JwtAuthGuard);
  });

  it('Should instantiate with service dependencies', () => {
    const testGuard = new JwtAuthGuard(jwtService, errorHandler);
    expect(testGuard).toBeDefined();
  });

  describe('canActivate', () => {
    it('TC0001 - Should return true when valid token is provided', async () => {
      const request = createMockRequest(`Bearer ${mockToken}`);
      const context = createMockExecutionContext(request);

      jwtService.verifyAsync.mockResolvedValue(mockJwtPayload);

      const result = await guard.canActivate(context);

      expect(jwtService.verifyAsync).toHaveBeenCalledWith(mockToken);
      expect(request.user).toEqual(mockJwtPayload);
      expect(result).toBe(true);
    });

    it('TC0002 - Should handle error when no authorization header', async () => {
      const request = createMockRequest();
      const context = createMockExecutionContext(request);

      errorHandler.handleError.mockImplementation(() => {
        throw new Error('Access token not found');
      });

      await expect(guard.canActivate(context)).rejects.toThrow(
        'Access token not found',
      );

      expect(errorHandler.handleError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Access token not found',
        }),
      );
    });

    it('TC0003 - Should handle error when authorization header is malformed', async () => {
      const request = createMockRequest('InvalidHeader');
      const context = createMockExecutionContext(request);

      errorHandler.handleError.mockImplementation(() => {
        throw new Error('Access token not found');
      });

      await expect(guard.canActivate(context)).rejects.toThrow(
        'Access token not found',
      );

      expect(errorHandler.handleError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Access token not found',
        }),
      );
    });

    it('TC0004 - Should handle error when token type is not Bearer', async () => {
      const request = createMockRequest(`Basic ${mockToken}`);
      const context = createMockExecutionContext(request);

      errorHandler.handleError.mockImplementation(() => {
        throw new Error('Access token not found');
      });

      await expect(guard.canActivate(context)).rejects.toThrow(
        'Access token not found',
      );

      expect(errorHandler.handleError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Access token not found',
        }),
      );
    });

    it('TC0005 - Should handle invalid token', async () => {
      const request = createMockRequest(`Bearer invalid-token`);
      const context = createMockExecutionContext(request);

      jwtService.verifyAsync.mockRejectedValue(new Error('Invalid token'));
      errorHandler.handleError.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(guard.canActivate(context)).rejects.toThrow('Invalid token');

      expect(jwtService.verifyAsync).toHaveBeenCalledWith('invalid-token');
      expect(errorHandler.handleError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Token inválido',
        }),
      );
    });

    it('TC0006 - Should handle expired token', async () => {
      const request = createMockRequest(`Bearer ${mockToken}`);
      const context = createMockExecutionContext(request);

      jwtService.verifyAsync.mockRejectedValue(new Error('Token expired'));
      errorHandler.handleError.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(guard.canActivate(context)).rejects.toThrow('Invalid token');

      expect(jwtService.verifyAsync).toHaveBeenCalledWith(mockToken);
      expect(errorHandler.handleError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Token inválido',
        }),
      );
    });
  });

  describe('extractTokenFromHeader', () => {
    it('TC0001 - Should extract token from Bearer authorization header', () => {
      const request = createMockRequest(`Bearer ${mockToken}`);

      // Access private method through bracket notation for testing
      const token = (guard as any).extractTokenFromHeader(request);

      expect(token).toBe(mockToken);
    });

    it('TC0002 - Should return undefined when no authorization header', () => {
      const request = createMockRequest();

      const token = (guard as any).extractTokenFromHeader(request);

      expect(token).toBeUndefined();
    });

    it('TC0003 - Should return undefined for non-Bearer tokens', () => {
      const request = createMockRequest(`Basic ${mockToken}`);

      const token = (guard as any).extractTokenFromHeader(request);

      expect(token).toBeUndefined();
    });

    it('TC0004 - Should return undefined for malformed header', () => {
      const request = createMockRequest('InvalidHeader');

      const token = (guard as any).extractTokenFromHeader(request);

      expect(token).toBeUndefined();
    });
  });
});
