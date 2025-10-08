import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WorkshopController } from './1-presentation/workshop.controller';
import { CreateOrderService } from './2-application/create-order.service';
import { CustomerRepository } from './4-infrastructure/repositories/customer.repository';

@Module({
  controllers: [WorkshopController],
  providers: [PrismaService, CreateOrderService, CustomerRepository],
  exports: [CreateOrderService],
})
export class WorkshopModule {}
