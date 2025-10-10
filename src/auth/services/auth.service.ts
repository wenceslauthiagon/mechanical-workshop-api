import { Injectable, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from './user.service';
import { User } from '@prisma/client';
import { ERROR_MESSAGES } from '../../shared/constants/messages.constants';
import { ErrorHandlerService } from '../../shared/services/error-handler.service';

export interface LoginDto {
  username: string;
  password: string;
}

export interface JwtPayload {
  sub: string;
  username: string;
  email: string;
  role: string;
}

export interface LoginResponse {
  access_token: string;
  user: {
    id: string;
    username: string;
    email: string;
    role: string;
  };
}

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly errorHandler: ErrorHandlerService,
  ) {}

  async validateUser(username: string, password: string): Promise<User | null> {
    const user = await this.userService.findByUsername(username);

    if (user && user.isActive) {
      const isPasswordValid = await this.userService.validatePassword(
        user,
        password,
      );
      if (isPasswordValid) {
        return user;
      }
    }

    return null;
  }

  async login(loginDto: LoginDto): Promise<LoginResponse> {
    try {
      const user = await this.validateUser(
        loginDto.username,
        loginDto.password,
      );

      if (!user) {
        this.errorHandler.generateException(
          ERROR_MESSAGES.INVALID_CREDENTIALS,
          HttpStatus.UNAUTHORIZED,
        );
      }

      const payload: JwtPayload = {
        sub: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      };

      return {
        access_token: this.jwtService.sign(payload),
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
      };
    } catch (error) {
      this.errorHandler.handleError(error);
    }
  }

  async validateJwtPayload(payload: JwtPayload): Promise<User | null> {
    const user = await this.userService.findById(payload.sub);

    if (user && user.isActive) {
      return user;
    }

    return null;
  }
}
