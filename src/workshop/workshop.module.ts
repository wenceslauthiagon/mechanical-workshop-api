import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WorkshopController } from './1-presentation/workshop.controller';
import { ServiceOrderController } from './1-presentation/controllers/service-order.controller';
import { VehicleController } from './1-presentation/controllers/vehicle.controller';
import { ServiceController } from './1-presentation/controllers/service.controller';
import { PartController } from './1-presentation/controllers/part.controller';
import { CustomerController } from './1-presentation/controllers/customer.controller';
import { PublicServiceOrderController } from './1-presentation/controllers/public-service-order.controller';
import { CreateOrderService } from './2-application/create-order.service';
import { ServiceOrderService } from './2-application/services/service-order.service';
import { VehicleService } from './2-application/services/vehicle.service';
import { ServiceService } from './2-application/services/service.service';
import { PartService } from './2-application/services/part.service';
import { CustomerService } from './2-application/services/customer.service';
import { CustomerRepository } from './4-infrastructure/repositories/customer.repository';
import { ServiceOrderRepository } from './4-infrastructure/repositories/service-order.repository';
import { VehicleRepository } from './4-infrastructure/repositories/vehicle.repository';
import { ServiceRepository } from './4-infrastructure/repositories/service.repository';
import { PartRepository } from './4-infrastructure/repositories/part.repository';

@Module({
  controllers: [
    WorkshopController,
    ServiceOrderController,
    VehicleController,
    ServiceController,
    PartController,
    CustomerController,
    PublicServiceOrderController,
  ],
  providers: [
    PrismaService,
    CreateOrderService,
    ServiceOrderService,
    VehicleService,
    ServiceService,
    PartService,
    CustomerService,
    CustomerRepository,
    ServiceOrderRepository,
    VehicleRepository,
    ServiceRepository,
    PartRepository,
  ],
  exports: [
    CreateOrderService,
    ServiceOrderService,
    VehicleService,
    ServiceService,
    PartService,
  ],
})
export class WorkshopModule {}
