import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { faker } from '@faker-js/faker/locale/pt_BR';
import { UserRole } from '@prisma/client';

import { JwtStrategy } from '../../../src/auth/strategies/jwt.strategy';
import { AuthService } from '../../../src/auth/services/auth.service';
import { ErrorHandlerService } from '../../../src/shared/services/error-handler.service';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let authService: jest.Mocked<AuthService>;
  let configService: jest.Mocked<ConfigService>;
  let errorHandler: jest.Mocked<ErrorHandlerService>;

  const mockUser = {
    id: faker.string.uuid(),
    username: faker.internet.username(),
    email: faker.internet.email(),
    role: UserRole.EMPLOYEE,
    isActive: true,
    passwordHash: faker.string.alphanumeric(60),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
  };

  const mockJwtPayload = {
    sub: mockUser.id,
    username: mockUser.username,
    email: mockUser.email,
    role: mockUser.role,
  };

  const mockJwtSecret = faker.string.alphanumeric(32);

  beforeEach(async () => {
    const mockAuthService = {
      login: jest.fn(),
      validateUser: jest.fn(),
      validateJwtPayload: jest.fn(),
    };

    const mockConfigService = {
      get: jest.fn(),
    };

    const mockErrorHandler = {
      generateException: jest.fn(),
      handleError: jest.fn(),
      handleConflictError: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: ErrorHandlerService,
          useValue: mockErrorHandler,
        },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
    authService = module.get<jest.Mocked<AuthService>>(AuthService);
    configService = module.get<jest.Mocked<ConfigService>>(ConfigService);
    errorHandler =
      module.get<jest.Mocked<ErrorHandlerService>>(ErrorHandlerService);
  });

  it('Should be defined', () => {
    expect(strategy).toBeDefined();
    expect(strategy).toBeInstanceOf(JwtStrategy);
  });

  it('Should instantiate with service dependencies', () => {
    configService.get.mockReturnValue(mockJwtSecret);
    const testStrategy = new JwtStrategy(
      authService,
      configService,
      errorHandler,
    );
    expect(testStrategy).toBeDefined();
  });

  describe('validate', () => {
    it('TC0001 - Should validate JWT payload and return user', async () => {
      authService.validateJwtPayload.mockResolvedValue(mockUser);

      const result = await strategy.validate(mockJwtPayload);

      expect(authService.validateJwtPayload).toHaveBeenCalledWith(
        mockJwtPayload,
      );
      expect(result).toEqual(mockUser);
    });

    it('TC0002 - Should handle invalid JWT payload', async () => {
      authService.validateJwtPayload.mockResolvedValue(null);
      errorHandler.handleError.mockImplementation(() => {
        throw new Error('Token inválido');
      });

      await expect(strategy.validate(mockJwtPayload)).rejects.toThrow(
        'Token inválido',
      );

      expect(authService.validateJwtPayload).toHaveBeenCalledWith(
        mockJwtPayload,
      );
      expect(errorHandler.handleError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Token inválido',
        }),
      );
    });

    it('TC0003 - Should handle service error during validation', async () => {
      const mockError = new Error('Database connection error');
      authService.validateJwtPayload.mockRejectedValue(mockError);

      await expect(strategy.validate(mockJwtPayload)).rejects.toThrow(
        mockError,
      );

      expect(authService.validateJwtPayload).toHaveBeenCalledWith(
        mockJwtPayload,
      );
    });
  });

  describe('constructor', () => {
    it('TC0001 - Should use JWT secret from config service', () => {
      const mockConfig = {
        get: jest.fn().mockReturnValue(mockJwtSecret),
      };

      const testStrategy = new JwtStrategy(
        authService,
        mockConfig as any,
        errorHandler,
      );

      expect(mockConfig.get).toHaveBeenCalledWith('JWT_SECRET');
      expect(testStrategy).toBeDefined();
    });

    it('TC0002 - Should use default JWT secret when config not available', () => {
      const mockConfig = {
        get: jest.fn().mockReturnValue(undefined),
      };

      const testStrategy = new JwtStrategy(
        authService,
        mockConfig as any,
        errorHandler,
      );

      expect(mockConfig.get).toHaveBeenCalledWith('JWT_SECRET');
      expect(testStrategy).toBeDefined();
    });
  });
});
