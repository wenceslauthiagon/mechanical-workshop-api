import { Injectable, ExecutionContext, Inject } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { ErrorHandlerService } from '../../shared/services/error-handler.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    @Inject(ErrorHandlerService)
    private readonly errorHandler: ErrorHandlerService,
    @Inject(Reflector)
    private readonly reflector: Reflector,
  ) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any) {
    if (err || !user) {
      if (err) {
        throw err;
      }
      const unauthorizedError = new Error('Unauthorized');
      (unauthorizedError as any).statusCode = 401;
      this.errorHandler.handleError(unauthorizedError);
    }
    return user;
  }
}
