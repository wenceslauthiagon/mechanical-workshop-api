import { Module } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { WorkshopModule } from './workshop/workshop.module';
import { AuthModule } from './auth/auth.module';
import { AppConfigModule } from './shared/config/app-config.module';
import { HealthCheckModule } from './shared/healthcheck/healthcheck.module';
import { AppController } from './app.controller';

@Module({
  imports: [AppConfigModule, WorkshopModule, AuthModule, HealthCheckModule],
  controllers: [AppController],
  providers: [PrismaService],
})
export class AppModule {}
