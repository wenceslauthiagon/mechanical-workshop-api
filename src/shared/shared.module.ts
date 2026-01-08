import { Module } from '@nestjs/common';
import { ErrorHandlerService } from './services/error-handler.service';
import { EmailService } from './services/email.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  providers: [ErrorHandlerService, EmailService, PrismaService],
  exports: [ErrorHandlerService, EmailService, PrismaService],
})
export class SharedModule {}
