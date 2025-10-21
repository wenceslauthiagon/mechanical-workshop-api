import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { faker } from '@faker-js/faker/locale/pt_BR';
import { UserRole } from '@prisma/client';

import { RolesGuard } from '../../../src/auth/guards/roles.guard';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: jest.Mocked<Reflector>;

  const mockUser = {
    id: faker.string.uuid(),
    username: faker.internet.username(),
    email: faker.internet.email(),
    role: UserRole.EMPLOYEE,
  };

  const mockAdminUser = {
    id: faker.string.uuid(),
    username: faker.internet.username(),
    email: faker.internet.email(),
    role: UserRole.ADMIN,
  };

  const mockRequest = {
    user: mockUser,
  };

  const mockExecutionContext = {
    switchToHttp: jest.fn().mockReturnValue({
      getRequest: jest.fn().mockReturnValue(mockRequest),
    }),
    getHandler: jest.fn(),
    getClass: jest.fn(),
  } as unknown as ExecutionContext;

  beforeEach(async () => {
    const mockReflector = {
      getAllAndOverride: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesGuard,
        {
          provide: Reflector,
          useValue: mockReflector,
        },
      ],
    }).compile();

    guard = module.get<RolesGuard>(RolesGuard);
    reflector = module.get<jest.Mocked<Reflector>>(Reflector);
  });

  it('Should be defined', () => {
    expect(guard).toBeDefined();
    expect(guard).toBeInstanceOf(RolesGuard);
  });

  it('Should instantiate with reflector dependency', () => {
    const testGuard = new RolesGuard(reflector);
    expect(testGuard).toBeDefined();
  });

  describe('canActivate', () => {
    it('TC0001 - Should return true when no roles are required', () => {
      reflector.getAllAndOverride.mockReturnValue(null);

      const result = guard.canActivate(mockExecutionContext);

      expect(reflector.getAllAndOverride).toHaveBeenCalledWith('roles', [
        mockExecutionContext.getHandler(),
        mockExecutionContext.getClass(),
      ]);
      expect(result).toBe(true);
    });

    it('TC0002 - Should return true when user has required role', () => {
      reflector.getAllAndOverride.mockReturnValue([UserRole.EMPLOYEE]);

      const result = guard.canActivate(mockExecutionContext);

      expect(reflector.getAllAndOverride).toHaveBeenCalledWith('roles', [
        mockExecutionContext.getHandler(),
        mockExecutionContext.getClass(),
      ]);
      expect(result).toBe(true);
    });

    it('TC0003 - Should return false when user does not have required role', () => {
      reflector.getAllAndOverride.mockReturnValue([UserRole.ADMIN]);

      const result = guard.canActivate(mockExecutionContext);

      expect(reflector.getAllAndOverride).toHaveBeenCalledWith('roles', [
        mockExecutionContext.getHandler(),
        mockExecutionContext.getClass(),
      ]);
      expect(result).toBe(false);
    });

    it('TC0004 - Should return true when user has one of multiple required roles', () => {
      reflector.getAllAndOverride.mockReturnValue([
        UserRole.ADMIN,
        UserRole.EMPLOYEE,
      ]);

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
    });

    it('TC0005 - Should return false when user is null', () => {
      const mockContextWithoutUser = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({ user: null }),
        }),
        getHandler: jest.fn(),
        getClass: jest.fn(),
      } as unknown as ExecutionContext;

      reflector.getAllAndOverride.mockReturnValue([UserRole.EMPLOYEE]);

      const result = guard.canActivate(mockContextWithoutUser);

      expect(result).toBe(false);
    });

    it('TC0006 - Should return false when user is undefined', () => {
      const mockContextWithoutUser = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({}),
        }),
        getHandler: jest.fn(),
        getClass: jest.fn(),
      } as unknown as ExecutionContext;

      reflector.getAllAndOverride.mockReturnValue([UserRole.EMPLOYEE]);

      const result = guard.canActivate(mockContextWithoutUser);

      expect(result).toBe(false);
    });

    it('TC0007 - Should return true when admin user accesses admin-only resource', () => {
      const mockContextWithAdmin = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({ user: mockAdminUser }),
        }),
        getHandler: jest.fn(),
        getClass: jest.fn(),
      } as unknown as ExecutionContext;

      reflector.getAllAndOverride.mockReturnValue([UserRole.ADMIN]);

      const result = guard.canActivate(mockContextWithAdmin);

      expect(result).toBe(true);
    });
  });
});
