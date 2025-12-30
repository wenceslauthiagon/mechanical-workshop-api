import { faker } from '@faker-js/faker/locale/pt_BR';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

import { AuthService } from '../../../src/auth/services/auth.service';
import { PrismaService } from '../../../src/prisma/prisma.service';

// Mock bcrypt
jest.mock('bcryptjs');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: jest.Mocked<JwtService>;
  let prismaService: any;

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

  const mockToken = faker.string.alphanumeric(100);

  beforeEach(async () => {
    prismaService = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
    };

    const mockJwtService = {
      sign: jest.fn(),
      verify: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: prismaService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<jest.Mocked<JwtService>>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Should be defined', () => {
    expect(service).toBeDefined();
    expect(service).toBeInstanceOf(AuthService);
  });

  describe('validateUser', () => {
    it('TC0001 - Should validate user successfully', async () => {
      prismaService.user.findUnique.mockResolvedValue(mockUser);
      jest.spyOn(mockedBcrypt, 'compare').mockResolvedValue(true as never);

      const result = await service.validateUser(mockUsername, mockPassword);

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { username: mockUsername },
      });
      expect(mockedBcrypt.compare).toHaveBeenCalledWith(mockPassword, mockUser.passwordHash);
      expect(result).toBeDefined();
      expect(result.id).toBe(mockUser.id);
      expect(result.passwordHash).toBeUndefined();
    });

    it('TC0002 - Should return null when user not found', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.validateUser(mockUsername, mockPassword);

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { username: mockUsername },
      });
      expect(result).toBeNull();
    });

    it('TC0003 - Should return null when password is invalid', async () => {
      prismaService.user.findUnique.mockResolvedValue(mockUser);
      jest.spyOn(mockedBcrypt, 'compare').mockResolvedValue(false as never);

      const result = await service.validateUser(mockUsername, mockPassword);

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { username: mockUsername },
      });
      expect(mockedBcrypt.compare).toHaveBeenCalledWith(mockPassword, mockUser.passwordHash);
      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('TC0001 - Should login successfully', async () => {
      jwtService.sign.mockReturnValue(mockToken);

      const userObj = {
        id: mockUser.id,
        username: mockUser.username,
        role: mockUser.role,
      };
      const result = await service.login(userObj);

      expect(jwtService.sign).toHaveBeenCalledWith({
        username: userObj.username,
        sub: userObj.id,
        role: userObj.role,
      });

      expect(result).toEqual({
        access_token: mockToken,
      });
    });
  });

  describe('createUser', () => {
    it('TC0001 - Should create user successfully', async () => {
      const hashedPassword = faker.string.alphanumeric(60);
      jest.spyOn(mockedBcrypt, 'hash').mockResolvedValue(hashedPassword as never);
      
      const userData = {
        username: mockUsername,
        password: mockPassword,
        email: mockEmail,
        role: 'EMPLOYEE',
      };

      const createdUser = {
        ...mockUser,
        passwordHash: hashedPassword,
      };

      prismaService.user.create.mockResolvedValue(createdUser);

      const result = await service.createUser(userData);

      expect(mockedBcrypt.hash).toHaveBeenCalledWith(mockPassword, 10);
      expect(prismaService.user.create).toHaveBeenCalled();
      expect(result).toBeDefined();
      expect(result.id).toBe(createdUser.id);
    });
  });

  describe('validateJwtPayload', () => {
    it('TC0001 - Should validate JWT payload and return user', async () => {
      const payload = {
        sub: mockUser.id,
        username: mockUser.username,
        role: mockUser.role,
      };

      prismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.validateJwtPayload(payload);

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: payload.sub },
      });
      expect(result).toBeDefined();
      expect(result).not.toBeNull();
      if (result) {
        expect(result.id).toBe(mockUser.id);
        expect(result.username).toBe(mockUser.username);
        expect((result as any).passwordHash).toBeUndefined();
      }
    });

    it('TC0002 - Should return null when user not found', async () => {
      const payload = {
        sub: faker.string.uuid(),
        username: mockUser.username,
        role: mockUser.role,
      };

      prismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.validateJwtPayload(payload);

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: payload.sub },
      });
      expect(result).toBeNull();
    });

    it('TC0003 - Should return null when user is not active', async () => {
      const inactiveUser = { ...mockUser, isActive: false };
      const payload = {
        sub: mockUser.id,
        username: mockUser.username,
        role: mockUser.role,
      };

      prismaService.user.findUnique.mockResolvedValue(inactiveUser);

      const result = await service.validateJwtPayload(payload);

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: payload.sub },
      });
      expect(result).toBeNull();
    });
  });
});
