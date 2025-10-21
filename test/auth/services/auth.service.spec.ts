import { faker } from '@faker-js/faker/locale/pt_BR';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';
import { UserRole } from '@prisma/client';

import { AuthService } from '../../../src/auth/services/auth.service';
import { UserService } from '../../../src/auth/services/user.service';
import { ErrorHandlerService } from '../../../src/shared/services/error-handler.service';

describe('AuthService', () => {
  let service: AuthService;
  let userService: jest.Mocked<UserService>;
  let jwtService: jest.Mocked<JwtService>;
  let errorHandler: jest.Mocked<ErrorHandlerService>;

  const mockUserId = uuidv4();
  const mockUsername = faker.internet.username();
  const mockEmail = faker.internet.email();
  const mockPassword = faker.internet.password();

  const mockUser = {
    id: mockUserId,
    username: mockUsername,
    email: mockEmail,
    role: UserRole.EMPLOYEE,
    isActive: true,
    passwordHash: faker.string.alphanumeric(60),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
  };

  const mockLoginDto = {
    username: mockUsername,
    password: mockPassword,
  };

  const mockToken = faker.string.alphanumeric(100);

  beforeEach(async () => {
    const mockUserService = {
      findByUsername: jest.fn(),
      findById: jest.fn(),
      validatePassword: jest.fn(),
      create: jest.fn(),
      createFirstAdmin: jest.fn(),
      findAll: jest.fn(),
      findByEmail: jest.fn(),
      update: jest.fn(),
      deactivate: jest.fn(),
    };

    const mockJwtService = {
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
        AuthService,
        {
          provide: UserService,
          useValue: mockUserService,
        },
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

    service = module.get<AuthService>(AuthService);
    userService = module.get<jest.Mocked<UserService>>(UserService);
    jwtService = module.get<jest.Mocked<JwtService>>(JwtService);
    errorHandler =
      module.get<jest.Mocked<ErrorHandlerService>>(ErrorHandlerService);
  });

  it('Should be defined', () => {
    expect(service).toBeDefined();
    expect(service).toBeInstanceOf(AuthService);
  });

  it('Should instantiate with service dependencies', () => {
    const testService = new AuthService(userService, jwtService, errorHandler);
    expect(testService).toBeDefined();
  });

  describe('validateUser', () => {
    it('TC0001 - Should validate user successfully', async () => {
      userService.findByUsername.mockResolvedValue(mockUser);
      userService.validatePassword.mockResolvedValue(true);

      const result = await service.validateUser(mockUsername, mockPassword);

      expect(userService.findByUsername).toHaveBeenCalledWith(mockUsername);
      expect(userService.validatePassword).toHaveBeenCalledWith(
        mockUser,
        mockPassword,
      );
      expect(result).toEqual(mockUser);
    });

    it('TC0002 - Should return null when user not found', async () => {
      userService.findByUsername.mockResolvedValue(null);

      const result = await service.validateUser(mockUsername, mockPassword);

      expect(userService.findByUsername).toHaveBeenCalledWith(mockUsername);
      expect(result).toBeNull();
    });

    it('TC0003 - Should return null when user is inactive', async () => {
      const inactiveUser = { ...mockUser, isActive: false };
      userService.findByUsername.mockResolvedValue(inactiveUser);

      const result = await service.validateUser(mockUsername, mockPassword);

      expect(userService.findByUsername).toHaveBeenCalledWith(mockUsername);
      expect(result).toBeNull();
    });

    it('TC0004 - Should return null when password is invalid', async () => {
      userService.findByUsername.mockResolvedValue(mockUser);
      userService.validatePassword.mockResolvedValue(false);

      const result = await service.validateUser(mockUsername, mockPassword);

      expect(userService.findByUsername).toHaveBeenCalledWith(mockUsername);
      expect(userService.validatePassword).toHaveBeenCalledWith(
        mockUser,
        mockPassword,
      );
      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('TC0001 - Should login successfully', async () => {
      userService.findByUsername.mockResolvedValue(mockUser);
      userService.validatePassword.mockResolvedValue(true);
      jwtService.sign.mockReturnValue(mockToken);

      const result = await service.login(mockLoginDto);

      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: mockUser.id,
        username: mockUser.username,
        email: mockUser.email,
        role: mockUser.role,
      });

      expect(result).toEqual({
        access_token: mockToken,
        user: {
          id: mockUser.id,
          username: mockUser.username,
          email: mockUser.email,
          role: mockUser.role,
        },
      });
    });

    it('TC0002 - Should handle login with invalid credentials', async () => {
      userService.findByUsername.mockResolvedValue(null);
      const mockError = new Error('Credenciais inválidas');
      errorHandler.generateException.mockImplementation(() => {
        throw mockError;
      });
      errorHandler.handleError.mockImplementation(() => {
        throw mockError;
      });

      await expect(service.login(mockLoginDto)).rejects.toThrow(mockError);

      expect(errorHandler.generateException).toHaveBeenCalled();
      expect(errorHandler.handleError).toHaveBeenCalledWith(mockError);
    });

    it('TC0003 - Should handle login error', async () => {
      const mockError = new Error('Database error');
      userService.findByUsername.mockRejectedValue(mockError);
      errorHandler.handleError.mockImplementation(() => {
        throw mockError;
      });

      await expect(service.login(mockLoginDto)).rejects.toThrow(mockError);

      expect(errorHandler.handleError).toHaveBeenCalledWith(mockError);
    });
  });

  describe('validateJwtPayload', () => {
    const mockPayload = {
      sub: mockUserId,
      username: mockUsername,
      email: mockEmail,
      role: UserRole.EMPLOYEE,
    };

    it('TC0001 - Should validate JWT payload successfully', async () => {
      userService.findById.mockResolvedValue(mockUser);

      const result = await service.validateJwtPayload(mockPayload);

      expect(userService.findById).toHaveBeenCalledWith(mockPayload.sub);
      expect(result).toEqual(mockUser);
    });

    it('TC0002 - Should return null when user not found', async () => {
      userService.findById.mockResolvedValue(null);

      const result = await service.validateJwtPayload(mockPayload);

      expect(userService.findById).toHaveBeenCalledWith(mockPayload.sub);
      expect(result).toBeNull();
    });

    it('TC0003 - Should return null when user is inactive', async () => {
      const inactiveUser = { ...mockUser, isActive: false };
      userService.findById.mockResolvedValue(inactiveUser);

      const result = await service.validateJwtPayload(mockPayload);

      expect(userService.findById).toHaveBeenCalledWith(mockPayload.sub);
      expect(result).toBeNull();
    });
  });
});
