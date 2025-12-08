import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ErrorHandlerService } from '../../shared/services/error-handler.service';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly errorHandler: ErrorHandlerService) {
    super();
  }

  canActivate(context: ExecutionContext) {
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
