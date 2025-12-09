import { Router } from 'express';
import { validateRequest } from '../middlewares/validateRequest';
import { createServiceOrderSchema } from '../dtos/ServiceOrderDTO';
import { PrismaServiceOrderRepository } from '@infrastructure/database/repositories/PrismaServiceOrderRepository';
import { CreateServiceOrderUseCase } from '../../../application/use-cases/service-order/CreateServiceOrderUseCase';
import { GetServiceOrderStatusUseCase } from '../../../application/use-cases/service-order/GetServiceOrderStatusUseCase';
import { ApproveBudgetUseCase } from '../../../application/use-cases/service-order/ApproveBudgetUseCase';
import { ListServiceOrdersUseCase } from '../../../application/use-cases/service-order/ListServiceOrdersUseCase';
import { ServiceOrderController } from '../controllers/ServiceOrderController';

const repo = new PrismaServiceOrderRepository();
const router = Router();

const controller = new ServiceOrderController(
  new CreateServiceOrderUseCase(repo),
  new GetServiceOrderStatusUseCase(repo),
  new ApproveBudgetUseCase(repo),
  new ListServiceOrdersUseCase(repo)
);

router.post('/', validateRequest(createServiceOrderSchema), (req, res) => controller.create(req, res));
router.get('/:id/status', (req, res) => controller.status(req, res));
router.post('/:id/approve', (req, res) => controller.approve(req, res));
router.get('/', (req, res) => controller.list(req, res));

export default router;
