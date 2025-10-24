import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { User, UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { ERROR_MESSAGES } from '../../shared/constants/messages.constants';
import { ErrorHandlerService } from '../../shared/services/error-handler.service';

export interface CreateUserData {
  username: string;
  email: string;
  password: string;
  role?: UserRole;
}

export type SafeUser = Omit<User, 'passwordHash'>;

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly errorHandler: ErrorHandlerService,
  ) {}

  async create(data: CreateUserData): Promise<User> {
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ username: data.username }, { email: data.email }],
      },
    });

    if (existingUser) {
      if (existingUser.username === data.username) {
        this.errorHandler.handleConflictError(
          ERROR_MESSAGES.USERNAME_ALREADY_EXISTS,
        );
      }
      if (existingUser.email === data.email) {
        this.errorHandler.handleConflictError(
          ERROR_MESSAGES.EMAIL_USER_ALREADY_EXISTS,
        );
      }
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    try {
      return await this.prisma.user.create({
        data: {
          username: data.username,
          email: data.email,
          passwordHash: hashedPassword,
          role: data.role || UserRole.EMPLOYEE,
        },
      });
    } catch (error) {
      if (error.code === 'P2002') {
        const field = error.meta?.target?.[0] || 'field';
        this.errorHandler.handleConflictError(
          `${field} ${ERROR_MESSAGES.FIELD_ALREADY_EXISTS}`,
        );
      }
      throw error;
    }
  }

  async createFirstAdmin(data: CreateUserData): Promise<User> {
    // Check if there are already users in the system
    const userCount = await this.prisma.user.count();

    if (userCount > 0) {
      this.errorHandler.handleConflictError(ERROR_MESSAGES.USERS_ALREADY_EXIST);
    }

    // Force ADMIN role for first user
    const adminData = { ...data, role: UserRole.ADMIN };
    return this.create(adminData);
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { username },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async validatePassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.passwordHash);
  }

  async findAll(): Promise<SafeUser[]> {
    return this.prisma.user.findMany({
      where: { isActive: true },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        passwordHash: false, // Never return password
      },
    });
  }

  async update(id: string, data: Partial<CreateUserData>): Promise<SafeUser> {
    const updateData: any = { ...data };

    if (data.password) {
      updateData.passwordHash = await bcrypt.hash(data.password, 10);
      delete updateData.password;
    }

    return this.prisma.user.update({
      where: { id },
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
  }

  async deactivate(id: string): Promise<SafeUser> {
    return this.prisma.user.update({
      where: { id },
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
  }
}
