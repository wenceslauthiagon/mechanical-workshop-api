import { faker } from '@faker-js/faker/locale/pt_BR';
import { Test, TestingModule } from '@nestjs/testing';
import { v4 as uuidv4 } from 'uuid';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

import { UserService } from '../../../src/auth/services/user.service';
import { PrismaService } from '../../../src/prisma/prisma.service';
import { ErrorHandlerService } from '../../../src/shared/services/error-handler.service';

// Mock bcrypt
jest.mock('bcryptjs');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('UserService', () => {
  let service: UserService;
  let prismaService: jest.Mocked<PrismaService>;
  let errorHandler: jest.Mocked<ErrorHandlerService>;

  const mockUserId = uuidv4();
  const mockUsername = faker.internet.username();
  const mockEmail = faker.internet.email();
  const mockPassword = faker.internet.password();
  const mockHashedPassword = faker.string.alphanumeric(60);

  const mockUser = {
    id: mockUserId,
    username: mockUsername,
    email: mockEmail,
    role: UserRole.EMPLOYEE,
    isActive: true,
    passwordHash: mockHashedPassword,
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
  };

  const mockCreateUserData = {
    username: mockUsername,
    email: mockEmail,
    password: mockPassword,
    role: UserRole.EMPLOYEE,
  };

  const mockSafeUser = {
    id: mockUser.id,
    username: mockUser.username,
    email: mockUser.email,
    role: mockUser.role,
    isActive: mockUser.isActive,
    createdAt: mockUser.createdAt,
    updatedAt: mockUser.updatedAt,
  };

  beforeEach(async () => {
    const mockPrismaService = {
      user: {
        create: jest.fn().mockImplementation(() => Promise.resolve(mockUser)),
        findUnique: jest
          .fn()
          .mockImplementation(() => Promise.resolve(mockUser)),
        findFirst: jest.fn().mockImplementation(() => Promise.resolve(null)),
        findMany: jest.fn().mockImplementation(() => Promise.resolve([mockUser])),
        update: jest.fn().mockImplementation(() => Promise.resolve(mockUser)),
        count: jest.fn().mockImplementation(() => Promise.resolve(0)),
      },
    };

    const mockErrorHandler = {
      handleConflictError: jest.fn().mockImplementation((msg) => {
        throw new Error(msg);
      }),
      handleNotFoundError: jest.fn().mockImplementation((msg) => {
        throw new Error(msg);
      }),
      handleError: jest.fn().mockImplementation((err) => {
        throw err;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: ErrorHandlerService,
          useValue: mockErrorHandler,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    prismaService = module.get(PrismaService);
    errorHandler = module.get(ErrorHandlerService);
  });

  describe('createFirstAdmin', () => {
    it('TC0001 - Should create first admin when no users exist', async () => {
      const adminUser = { ...mockUser, role: UserRole.ADMIN };
      (prismaService.user.count as jest.Mock).mockResolvedValue(0);
      mockedBcrypt.hash.mockResolvedValue(mockHashedPassword as never);
      (prismaService.user.create as jest.Mock).mockResolvedValue(adminUser);

      const result = await service.createFirstAdmin(mockCreateUserData);

      expect(prismaService.user.count).toHaveBeenCalled();
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: {
          username: mockCreateUserData.username,
          email: mockCreateUserData.email,
          passwordHash: mockHashedPassword,
          role: UserRole.ADMIN,
        },
      });
      expect(result).toEqual(adminUser);
    });

    it('TC0002 - Should throw error when users already exist', async () => {
      (prismaService.user.count as jest.Mock).mockResolvedValue(1);
      errorHandler.handleConflictError.mockImplementation(() => {
        throw new Error('Usuários já existem');
      });

      await expect(
        service.createFirstAdmin(mockCreateUserData),
      ).rejects.toThrow('Usuários já existem');

      expect(prismaService.user.count).toHaveBeenCalled();
      expect(errorHandler.handleConflictError).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('TC0001 - Should create user successfully', async () => {
      mockedBcrypt.hash.mockResolvedValue(mockHashedPassword as never);
      (prismaService.user.findFirst as jest.Mock).mockResolvedValue(null);
      (prismaService.user.create as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.create(mockCreateUserData);

      expect(prismaService.user.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [
            { username: mockCreateUserData.username },
            { email: mockCreateUserData.email },
          ],
        },
      });
      expect(mockedBcrypt.hash).toHaveBeenCalledWith(mockCreateUserData.password, 10);
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: {
          username: mockCreateUserData.username,
          email: mockCreateUserData.email,
          passwordHash: mockHashedPassword,
          role: mockCreateUserData.role,
        },
      });
      expect(result).toEqual(mockUser);
    });

    it('TC0002 - Should throw error when username already exists', async () => {
      const existingUser = { ...mockUser, username: mockCreateUserData.username };
      (prismaService.user.findFirst as jest.Mock).mockResolvedValue(existingUser);
      errorHandler.handleConflictError.mockImplementation(() => {
        throw new Error('Nome de usuário já existe');
      });

      await expect(service.create(mockCreateUserData)).rejects.toThrow(
        'Nome de usuário já existe',
      );

      expect(prismaService.user.findFirst).toHaveBeenCalled();
      expect(errorHandler.handleConflictError).toHaveBeenCalled();
    });

    it('TC0003 - Should throw error when email already exists', async () => {
      const existingUser = { ...mockUser, email: mockCreateUserData.email, username: 'different' };
      (prismaService.user.findFirst as jest.Mock).mockResolvedValue(existingUser);
      errorHandler.handleConflictError.mockImplementation(() => {
        throw new Error('E-mail já cadastrado');
      });

      await expect(service.create(mockCreateUserData)).rejects.toThrow(
        'E-mail já cadastrado',
      );

      expect(prismaService.user.findFirst).toHaveBeenCalled();
      expect(errorHandler.handleConflictError).toHaveBeenCalled();
    });

    it('TC0004 - Should handle P2002 unique constraint error', async () => {
      mockedBcrypt.hash.mockResolvedValue(mockHashedPassword as never);
      (prismaService.user.findFirst as jest.Mock).mockResolvedValue(null);
      const prismaError = {
        code: 'P2002',
        meta: { target: ['username'] },
      };
      (prismaService.user.create as jest.Mock).mockRejectedValue(prismaError);
      errorHandler.handleConflictError.mockImplementation(() => {
        throw new Error('username já existe');
      });

      await expect(service.create(mockCreateUserData)).rejects.toThrow(
        'username já existe',
      );

      expect(errorHandler.handleConflictError).toHaveBeenCalled();
    });
  });

  describe('findByUsername', () => {
    it('TC0001 - Should find user by username', async () => {
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.findByUsername(mockUsername);

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { username: mockUsername },
      });
      expect(result).toEqual(mockUser);
    });

    it('TC0002 - Should return null when user not found', async () => {
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await service.findByUsername(mockUsername);

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { username: mockUsername },
      });
      expect(result).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('TC0001 - Should find user by email', async () => {
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.findByEmail(mockEmail);

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: mockEmail },
      });
      expect(result).toEqual(mockUser);
    });
  });

  describe('findById', () => {
    it('TC0001 - Should find user by ID', async () => {
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.findById(mockUserId);

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockUserId },
      });
      expect(result).toEqual(mockUser);
    });
  });

  describe('validatePassword', () => {
    it('TC0001 - Should validate password successfully', async () => {
      mockedBcrypt.compare.mockResolvedValue(true as never);

      const result = await service.validatePassword(mockUser, mockPassword);

      expect(mockedBcrypt.compare).toHaveBeenCalledWith(
        mockPassword,
        mockUser.passwordHash,
      );
      expect(result).toBe(true);
    });

    it('TC0002 - Should return false for invalid password', async () => {
      mockedBcrypt.compare.mockResolvedValue(false as never);

      const result = await service.validatePassword(mockUser, 'wrongpassword');

      expect(mockedBcrypt.compare).toHaveBeenCalledWith(
        'wrongpassword',
        mockUser.passwordHash,
      );
      expect(result).toBe(false);
    });
  });

  describe('findAll', () => {
    it('TC0001 - Should return all active users without password', async () => {
      const mockUsers = [mockSafeUser];
      (prismaService.user.findMany as jest.Mock).mockResolvedValue(mockUsers);

      const result = await service.findAll();

      expect(prismaService.user.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          passwordHash: false,
        },
      });
      expect(result).toEqual(mockUsers);
    });
  });

  describe('update', () => {
    it('TC0001 - Should update user successfully', async () => {
      const updateData = { username: 'newusername' };
      (prismaService.user.update as jest.Mock).mockResolvedValue(mockSafeUser);

      const result = await service.update(mockUserId, updateData);

      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: mockUserId },
        data: updateData,
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          passwordHash: false,
        },
      });
      expect(result).toEqual(mockSafeUser);
    });

    it('TC0002 - Should update user password and hash it', async () => {
      const updateData = { password: 'newpassword' };
      const expectedData = { passwordHash: mockHashedPassword };
      mockedBcrypt.hash.mockResolvedValue(mockHashedPassword as never);
      (prismaService.user.update as jest.Mock).mockResolvedValue(mockSafeUser);

      await service.update(mockUserId, updateData);

      expect(mockedBcrypt.hash).toHaveBeenCalledWith('newpassword', 10);
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: mockUserId },
        data: expectedData,
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          passwordHash: false,
        },
      });
    });
  });

  describe('deactivate', () => {
    it('TC0001 - Should deactivate user successfully', async () => {
      const deactivatedUser = { ...mockSafeUser, isActive: false };
      (prismaService.user.update as jest.Mock).mockResolvedValue(
        deactivatedUser,
      );

      const result = await service.deactivate(mockUserId);

      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: mockUserId },
        data: { isActive: false },
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          passwordHash: false,
        },
      });
      expect(result).toEqual(deactivatedUser);
    });
  });
});
