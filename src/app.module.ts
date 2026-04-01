import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './prisma/prisma.service';
import { WorkshopModule } from './workshop/workshop.module';
import { AuthModule } from './auth/auth.module';
import { AuthCheckModule } from './auth-check/auth-check.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    WorkshopModule,
    AuthModule,
    AuthCheckModule,
  ],
  controllers: [AppController],
  providers: [PrismaService],
})
export class AppModule {}
