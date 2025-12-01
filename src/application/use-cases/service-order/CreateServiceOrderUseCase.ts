import { IServiceOrderRepository } from '../../../domain/repositories/ServiceOrderRepository';

export class CreateServiceOrderUseCase {
  constructor(private repo: IServiceOrderRepository) {}

  async execute(payload: any) {
    const so = await this.repo.create(payload);
    return so;
  }
}
