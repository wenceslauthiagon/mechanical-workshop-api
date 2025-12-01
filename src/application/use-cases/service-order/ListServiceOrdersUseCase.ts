import { IServiceOrderRepository } from '../../../domain/repositories/ServiceOrderRepository';

const statusPriority = ['EXECUCAO', 'AGUARDANDO_APROVACAO', 'DIAGNOSTICO', 'RECEBIDA'];

export class ListServiceOrdersUseCase {
  constructor(private repo: IServiceOrderRepository) {}

  async execute() {
    // repository returns ordered by status asc and createdAt asc; we apply custom ordering
    const all = await this.repo.list({ excludeFinished: true });
    all.sort((a: any, b: any) => {
      const sa = statusPriority.indexOf(a.status as string);
      const sb = statusPriority.indexOf(b.status as string);
      if (sa !== sb) return sa - sb;
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
    return all;
  }
}
