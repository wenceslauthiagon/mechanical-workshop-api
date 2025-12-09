import { IServiceOrderRepository } from '../../../domain/repositories/ServiceOrderRepository';

export class ApproveBudgetUseCase {
  constructor(private repo: IServiceOrderRepository) {}

  async execute(id: string, approved: boolean) {
    const so = await this.repo.approveBudget(id, approved);
    return so;
  }
}
