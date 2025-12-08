import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SharedModule } from '../shared/shared.module';
import { ServiceOrderController } from './1-presentation/controllers/service-order.controller';
import { VehicleController } from './1-presentation/controllers/vehicle.controller';
import { ServiceController } from './1-presentation/controllers/service.controller';
import { PartController } from './1-presentation/controllers/part.controller';
import { CustomerController } from './1-presentation/controllers/customer.controller';
import { PublicServiceOrderController } from './1-presentation/controllers/public-service-order.controller';
import { ServiceStatsController } from './1-presentation/controllers/service-stats.controller';
import { MechanicController } from './1-presentation/controllers/mechanic.controller';
import { BudgetController } from './1-presentation/controllers/budget.controller';
import { PublicBudgetController } from './1-presentation/controllers/public-budget.controller';
import { CreateOrderService } from './2-application/create-order.service';
import { ServiceOrderService } from './2-application/services/service-order.service';
import { VehicleService } from './2-application/services/vehicle.service';
import { ServiceService } from './2-application/services/service.service';
import { PartService } from './2-application/services/part.service';
import { CustomerService } from './2-application/services/customer.service';
import { ServiceStatsService } from './2-application/services/service-stats.service';
import { MechanicService } from './2-application/services/mechanic.service';
import { BudgetService } from './2-application/services/budget.service';
import { NotificationService } from './2-application/services/notification.service';
import { CustomerRepository } from './4-infrastructure/repositories/customer.repository';
import { ServiceOrderRepository } from './4-infrastructure/repositories/service-order.repository';
import { VehicleRepository } from './4-infrastructure/repositories/vehicle.repository';
import { ServiceRepository } from './4-infrastructure/repositories/service.repository';
import { PartRepository } from './4-infrastructure/repositories/part.repository';
import { MechanicRepository } from './4-infrastructure/repositories/mechanic.repository';
import { BudgetRepository } from './4-infrastructure/repositories/budget.repository';
import { NotificationProviderFactory } from './4-infrastructure/providers/notification-provider.factory';
import { GmailEmailProvider } from './4-infrastructure/providers/email/gmail-email.provider';
import { MockSmsProvider } from './4-infrastructure/providers/sms/mock-sms.provider';

@Module({
  imports: [SharedModule],
  controllers: [
    ServiceOrderController,
    VehicleController,
    ServiceController,
    PartController,
    CustomerController,
    PublicServiceOrderController,
    ServiceStatsController,
    MechanicController,
    BudgetController,
    PublicBudgetController,
  ],
  providers: [
    PrismaService,
    NotificationService,
    {
      provide: 'ICustomerRepository',
      useClass: CustomerRepository,
    },
    {
      provide: 'IServiceOrderRepository',
      useClass: ServiceOrderRepository,
    },
    {
      provide: 'IVehicleRepository',
      useClass: VehicleRepository,
    },
    {
      provide: 'IServiceRepository',
      useClass: ServiceRepository,
    },
    {
      provide: 'IPartRepository',
      useClass: PartRepository,
    },
    {
      provide: 'IMechanicRepository',
      useClass: MechanicRepository,
    },
    {
      provide: 'IBudgetRepository',
      useClass: BudgetRepository,
    },
    CreateOrderService,
    ServiceOrderService,
    VehicleService,
    ServiceService,
    PartService,
    CustomerService,
    ServiceStatsService,
    MechanicService,
    BudgetService,
    NotificationProviderFactory,
    {
      provide: 'IEmailProvider',
      useClass: GmailEmailProvider,
    },
    {
      provide: 'ISmsProvider',
      useClass: MockSmsProvider,
    },
  ],
  exports: [
    CreateOrderService,
    ServiceOrderService,
    VehicleService,
    ServiceService,
    PartService,
    MechanicService,
  ],
})
export class WorkshopModule {}
