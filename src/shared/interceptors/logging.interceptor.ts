import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  Logger,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('📡 HTTP-REQUEST');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    
    const { method, url } = request;
    const startTime = Date.now();
    const ip = request.ip || request.connection.remoteAddress;
    
    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - startTime;
        const status = response.statusCode;
        const statusEmoji = this.getStatusEmoji(status);
        
        this.logger.log(
          `${statusEmoji} [${status}] ${method.padEnd(6)} ${url} - ${duration}ms - IP: ${ip}`,
        );
      }),
    );
  }

  private getStatusEmoji(status: number): string {
    if (status < 400) return '✅';
    if (status < 500) return '⚠️';
    return '❌';
  }
}
