import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { ERROR_MESSAGES } from '../../shared/constants/messages.constants';
import { ErrorHandlerService } from '../../shared/services/error-handler.service';

interface JwtPayload {
  sub: string;
  username: string;
  iat?: number;
  exp?: number;
}

interface AuthenticatedRequest extends Request {
  user: JwtPayload;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly errorHandler: ErrorHandlerService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      this.errorHandler.handleError(
        new Error(ERROR_MESSAGES.ACCESS_TOKEN_NOT_FOUND),
      );
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token);
      request.user = payload;
    } catch {
      this.errorHandler.handleError(new Error(ERROR_MESSAGES.INVALID_TOKEN));
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const authHeader = request.headers.authorization;
    if (!authHeader) return undefined;

    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' ? token : undefined;
  }
}
