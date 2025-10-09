import { Module } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { WorkshopModule } from './workshop/workshop.module';
import { AuthModule } from './auth/auth.module';
import { AppConfigModule } from './shared/config/app-config.module';

@Module({
  imports: [AppConfigModule, WorkshopModule, AuthModule],
  controllers: [],
  providers: [PrismaService],
})
export class AppModule {}
