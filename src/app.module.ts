import { Module } from '@nestjs/common';
import { AppController } from './app.controller';

import { PrismaService } from './prisma/prisma.service';
import { WorkshopModule } from './workshop/workshop.module';
import { AuthModule } from './auth/auth.module';
import { AppConfigModule } from './shared/config/app-config.module';

@Module({
  imports: [AppConfigModule, WorkshopModule, AuthModule],
  controllers: [AppController],
  providers: [PrismaService],
})
export class AppModule {}
