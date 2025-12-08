import { faker } from '@faker-js/faker/locale/pt_BR';
import { Test, TestingModule } from '@nestjs/testing';
import { v4 as uuidv4 } from 'uuid';
import { UserRole } from '@prisma/client';

import { AuthController } from '../../../src/auth/controllers/auth.controller';
import { AuthService } from '../../../src/auth/services/auth.service';
import { UserService } from '../../../src/auth/services/user.service';
import { LoginDto } from '../../../src/auth/dto/login.dto';
import { CreateUserDto } from '../../../src/auth/dto/create-user.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;
  let userService: jest.Mocked<UserService>;

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

  const mockLoginDto: LoginDto = {
    username: mockUsername,
    password: mockPassword,
  };

  const mockCreateUserDto: CreateUserDto = {
    username: faker.internet.username(),
    email: faker.internet.email(),
    password: mockPassword,
    confirmPassword: mockPassword,
    role: UserRole.EMPLOYEE,
  };

  const mockLoginResponse = {
    access_token: faker.string.alphanumeric(100),
    user: {
      id: mockUser.id,
      username: mockUser.username,
      email: mockUser.email,
      role: mockUser.role,
    },
  };

  beforeEach(async () => {
    const mockAuthService = {
      login: jest.fn(),
      validateUser: jest.fn(),
      validateJwtPayload: jest.fn(),
    };

    const mockUserService = {
      create: jest.fn(),
      createFirstAdmin: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      findByUsername: jest.fn(),
      findByEmail: jest.fn(),
      validatePassword: jest.fn(),
      update: jest.fn(),
      deactivate: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<jest.Mocked<AuthService>>(AuthService);
    userService = module.get<jest.Mocked<UserService>>(UserService);
  });

  it('Should be defined', () => {
    expect(controller).toBeDefined();
    expect(controller).toBeInstanceOf(AuthController);
  });

  it('Should instantiate with service dependencies', () => {
    const testController = new AuthController(authService, userService);
    expect(testController).toBeDefined();
  });

  describe('login', () => {
    it('TC0001 - Should login successfully', async () => {
      authService.login.mockResolvedValue(mockLoginResponse);

      const result = await controller.login(mockLoginDto);

      expect(authService.login).toHaveBeenCalledWith(mockLoginDto);
      expect(result).toEqual(mockLoginResponse);
    });

    it('TC0002 - Should handle login error', async () => {
      const mockError = new Error('Credenciais inválidas');
      authService.login.mockRejectedValue(mockError);

      await expect(controller.login(mockLoginDto)).rejects.toThrow(mockError);
      expect(authService.login).toHaveBeenCalledWith(mockLoginDto);
    });
  });

  describe('createFirstAdmin', () => {
    it('TC0001 - Should create first admin successfully', async () => {
      const adminUser = { ...mockUser, role: UserRole.ADMIN };
      userService.createFirstAdmin.mockResolvedValue(adminUser);

      const result = await controller.createFirstAdmin(mockCreateUserDto);

      const expectedUserData = {
        username: mockCreateUserDto.username,
        email: mockCreateUserDto.email,
        password: mockCreateUserDto.password,
        role: mockCreateUserDto.role,
      };

      expect(userService.createFirstAdmin).toHaveBeenCalledWith(
        expectedUserData,
      );
      expect(result).toEqual(adminUser);
    });

    it('TC0002 - Should handle first admin creation error', async () => {
      const mockError = new Error('Já existem usuários no sistema');
      userService.createFirstAdmin.mockRejectedValue(mockError);

      await expect(
        controller.createFirstAdmin(mockCreateUserDto),
      ).rejects.toThrow(mockError);
    });
  });

  describe('createUser', () => {
    it('TC0001 - Should create user successfully', async () => {
      userService.create.mockResolvedValue(mockUser);

      const result = await controller.createUser(mockCreateUserDto);

      const expectedUserData = {
        username: mockCreateUserDto.username,
        email: mockCreateUserDto.email,
        password: mockCreateUserDto.password,
        role: mockCreateUserDto.role,
      };

      expect(userService.create).toHaveBeenCalledWith(expectedUserData);
      expect(result).toEqual(mockUser);
    });

    it('TC0002 - Should handle user creation error', async () => {
      const mockError = new Error('Usuário já existe');
      userService.create.mockRejectedValue(mockError);

      await expect(controller.createUser(mockCreateUserDto)).rejects.toThrow(
        mockError,
      );
    });
  });

  describe('getProfile', () => {
    it('TC0001 - Should return user profile without password', async () => {
      const mockRequest = {
        user: {
          ...mockUser,
          passwordHash: 'hashed_password',
        },
      };

      const result = await controller.getProfile(mockRequest);

      const expectedProfile = {
        id: mockUser.id,
        username: mockUser.username,
        email: mockUser.email,
        role: mockUser.role,
        isActive: mockUser.isActive,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      };

      expect(result).toEqual(expectedProfile);
      expect(result).not.toHaveProperty('passwordHash');
    });
  });

  describe('getUsers', () => {
    it('TC0001 - Should return all users', async () => {
      const mockUsers = [
        {
          id: mockUser.id,
          username: mockUser.username,
          email: mockUser.email,
          role: mockUser.role,
          isActive: mockUser.isActive,
          createdAt: mockUser.createdAt,
          updatedAt: mockUser.updatedAt,
        },
      ];
      userService.findAll.mockResolvedValue(mockUsers);

      const result = await controller.getUsers();

      expect(userService.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockUsers);
    });

    it('TC0002 - Should handle get users error', async () => {
      const mockError = new Error('Erro ao buscar usuários');
      userService.findAll.mockRejectedValue(mockError);

      await expect(controller.getUsers()).rejects.toThrow(mockError);
      expect(userService.findAll).toHaveBeenCalled();
    });
  });
});
