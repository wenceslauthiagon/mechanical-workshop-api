import { IServiceOrderRepository } from '../../../domain/repositories/ServiceOrderRepository';

export class GetServiceOrderStatusUseCase {
  constructor(private repo: IServiceOrderRepository) {}

  async execute(id: string) {
    const so = await this.repo.findById(id);
    if (!so) throw new Error('ServiceOrder not found');
    return { id: so.id, status: so.status };
  }
}
