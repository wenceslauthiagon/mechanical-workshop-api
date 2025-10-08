import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';

import { PrismaService } from './prisma/prisma.service';
import { WorkshopModule } from './workshop/workshop.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    WorkshopModule,
  ],
  controllers: [AppController],
  providers: [PrismaService],
})
export class AppModule {}
