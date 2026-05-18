import { InMemoryBillingRepository } from '../../src/infra/billing.repository';

describe('InMemoryBillingRepository', () => {
  let repo: InMemoryBillingRepository;

  beforeEach(() => {
    repo = new InMemoryBillingRepository();
  });

  it('TC0001 - Should ignore updateBudget when budget does not exist', async () => {
    await expect(repo.updateBudget('missing', 'APPROVED')).resolves.toBeUndefined();
  });

  it('TC0002 - Should update existing budget status', async () => {
    await repo.createBudget({ id: 'b1', orderId: 'o1', estimatedTotal: 100, status: 'SENT' });

    await repo.updateBudget('b1', 'APPROVED');

    const budget = await repo.findBudgetById('b1');
    expect(budget?.status).toBe('APPROVED');
  });

  it('TC0003 - Should ignore updatePayment when payment does not exist', async () => {
    await expect(repo.updatePayment('missing', 'FAILED')).resolves.toBeUndefined();
  });

  it('TC0004 - Should update existing payment status and find by id', async () => {
    await repo.createPayment({ id: 'p1', budgetId: 'b1', amount: 100, status: 'CONFIRMED' });

    await repo.updatePayment('p1', 'FAILED');

    const payment = await repo.findPaymentById('p1');
    expect(payment?.status).toBe('FAILED');
  });
});
