import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { faker } from '@faker-js/faker/locale/pt_BR';
import * as bcrypt from 'bcrypt';

import { AuthService } from '../../../src/infrastructure/auth/auth.service';

// Mock bcrypt
jest.mock('bcrypt');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('AuthService (Infrastructure)', () => {
  let service: AuthService;
  let jwtService: jest.Mocked<JwtService>;

  const mockPassword = faker.internet.password();
  const mockHashedPassword = faker.string.alphanumeric(60);
  const mockToken = faker.string.alphanumeric(100);

  const mockJwtPayload = {
    sub: faker.string.uuid(),
    username: faker.internet.username(),
    email: faker.internet.email(),
    role: 'EMPLOYEE',
  };

  beforeEach(async () => {
    const mockJwtService = {
      signAsync: jest.fn(),
      verifyAsync: jest.fn(),
      sign: jest.fn(),
      verify: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<jest.Mocked<JwtService>>(JwtService);

    // Reset bcrypt mocks
    mockedBcrypt.hash.mockReset();
    mockedBcrypt.compare.mockReset();
  });

  it('Should be defined', () => {
    expect(service).toBeDefined();
    expect(service).toBeInstanceOf(AuthService);
  });

  it('Should instantiate with service dependency', () => {
    const testService = new AuthService(jwtService);
    expect(testService).toBeDefined();
  });

  describe('hashPassword', () => {
    it('TC0001 - Should hash password successfully', async () => {
      mockedBcrypt.hash.mockResolvedValue(mockHashedPassword as never);

      const result = await service.hashPassword(mockPassword);

      expect(mockedBcrypt.hash).toHaveBeenCalledWith(mockPassword, 10);
      expect(result).toBe(mockHashedPassword);
    });

    it('TC0002 - Should handle bcrypt error', async () => {
      const mockError = new Error('Bcrypt error');
      mockedBcrypt.hash.mockRejectedValue(mockError as never);

      await expect(service.hashPassword(mockPassword)).rejects.toThrow(
        mockError,
      );

      expect(mockedBcrypt.hash).toHaveBeenCalledWith(mockPassword, 10);
    });
  });

  describe('comparePassword', () => {
    it('TC0001 - Should return true for matching passwords', async () => {
      mockedBcrypt.compare.mockResolvedValue(true as never);

      const result = await service.comparePassword(
        mockPassword,
        mockHashedPassword,
      );

      expect(mockedBcrypt.compare).toHaveBeenCalledWith(
        mockPassword,
        mockHashedPassword,
      );
      expect(result).toBe(true);
    });

    it('TC0002 - Should return false for non-matching passwords', async () => {
      mockedBcrypt.compare.mockResolvedValue(false as never);

      const result = await service.comparePassword(
        'wrongpassword',
        mockHashedPassword,
      );

      expect(mockedBcrypt.compare).toHaveBeenCalledWith(
        'wrongpassword',
        mockHashedPassword,
      );
      expect(result).toBe(false);
    });

    it('TC0003 - Should handle bcrypt compare error', async () => {
      const mockError = new Error('Bcrypt compare error');
      mockedBcrypt.compare.mockRejectedValue(mockError as never);

      await expect(
        service.comparePassword(mockPassword, mockHashedPassword),
      ).rejects.toThrow(mockError);

      expect(mockedBcrypt.compare).toHaveBeenCalledWith(
        mockPassword,
        mockHashedPassword,
      );
    });
  });

  describe('generateJwtToken', () => {
    it('TC0001 - Should generate JWT token successfully', async () => {
      jwtService.signAsync.mockResolvedValue(mockToken);

      const result = await service.generateJwtToken(mockJwtPayload);

      expect(jwtService.signAsync).toHaveBeenCalledWith(mockJwtPayload);
      expect(result).toBe(mockToken);
    });

    it('TC0002 - Should handle JWT generation error', async () => {
      const mockError = new Error('JWT generation error');
      jwtService.signAsync.mockRejectedValue(mockError);

      await expect(service.generateJwtToken(mockJwtPayload)).rejects.toThrow(
        mockError,
      );

      expect(jwtService.signAsync).toHaveBeenCalledWith(mockJwtPayload);
    });
  });

  describe('verifyJwtToken', () => {
    it('TC0001 - Should verify JWT token successfully', async () => {
      jwtService.verifyAsync.mockResolvedValue(mockJwtPayload);

      const result = await service.verifyJwtToken(mockToken);

      expect(jwtService.verifyAsync).toHaveBeenCalledWith(mockToken);
      expect(result).toEqual(mockJwtPayload);
    });

    it('TC0002 - Should handle JWT verification error', async () => {
      const mockError = new Error('Invalid token');
      jwtService.verifyAsync.mockRejectedValue(mockError);

      await expect(service.verifyJwtToken('invalid-token')).rejects.toThrow(
        mockError,
      );

      expect(jwtService.verifyAsync).toHaveBeenCalledWith('invalid-token');
    });

    it('TC0003 - Should handle expired token', async () => {
      const expiredError = new Error('Token expired');
      jwtService.verifyAsync.mockRejectedValue(expiredError);

      await expect(service.verifyJwtToken(mockToken)).rejects.toThrow(
        expiredError,
      );

      expect(jwtService.verifyAsync).toHaveBeenCalledWith(mockToken);
    });
  });
});
