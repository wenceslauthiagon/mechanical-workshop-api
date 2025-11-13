import { Module } from '@nestjs/common';
import { ErrorHandlerService } from './services/error-handler.service';
import { EmailService } from './services/email.service';

@Module({
  providers: [ErrorHandlerService, EmailService],
  exports: [ErrorHandlerService, EmailService],
})
export class SharedModule {}
