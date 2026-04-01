import { Module } from '@nestjs/common';
import { AuthCheckController } from './auth-check.controller';

@Module({
  controllers: [AuthCheckController],
})
export class AuthCheckModule {}
