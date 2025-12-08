import { Request, Response } from 'express';
import { CreateServiceOrderUseCase } from '../../../application/use-cases/service-order/CreateServiceOrderUseCase';
import { GetServiceOrderStatusUseCase } from '../../../application/use-cases/service-order/GetServiceOrderStatusUseCase';
import { ApproveBudgetUseCase } from '../../../application/use-cases/service-order/ApproveBudgetUseCase';
import { ListServiceOrdersUseCase } from '../../../application/use-cases/service-order/ListServiceOrdersUseCase';

export class ServiceOrderController {
  constructor(
    private createUseCase: CreateServiceOrderUseCase,
    private getStatusUseCase: GetServiceOrderStatusUseCase,
    private approveUseCase: ApproveBudgetUseCase,
    private listUseCase: ListServiceOrdersUseCase
  ) {}

  async create(req: Request, res: Response) {
    const payload = req.body;
    const so = await this.createUseCase.execute(payload);
    res.status(201).json(so);
  }

  async status(req: Request, res: Response) {
    const { id } = req.params;
    const result = await this.getStatusUseCase.execute(id);
    res.json(result);
  }

  async approve(req: Request, res: Response) {
    const { id } = req.params;
    const { approved } = req.body;
    const updated = await this.approveUseCase.execute(id, !!approved);
    res.json(updated);
  }

  async list(req: Request, res: Response) {
    const data = await this.listUseCase.execute();
    res.json(data);
  }
}
