import { BillingPrismaRepository } from '../../src/infra/budget.prisma.repository';

describe('BillingPrismaRepository', () => {
  const budgetRaw = {
    id: 'b1',
    orderId: 'o1',
    estimatedTotal: 1500,
    status: 'SENT',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const paymentRaw = {
    id: 'p1',
    budgetId: 'b1',
    amount: 1500,
    status: 'CONFIRMED',
    mercadopagoId: null,
    createdAt: new Date(),
  };

  let db: any;
  let repo: BillingPrismaRepository;

  beforeEach(() => {
    db = {
      budget: {
        create: jest.fn(),
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      payment: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
      },
    };

    repo = new BillingPrismaRepository(db);
  });

  it('TC0001 - Should create budget and map to domain', async () => {
    db.budget.create.mockResolvedValue(budgetRaw);

    const result = await repo.createBudget({ id: 'b1', orderId: 'o1', estimatedTotal: 1500, status: 'SENT' });

    expect(db.budget.create).toHaveBeenCalledWith({
      data: { id: 'b1', orderId: 'o1', estimatedTotal: 1500, status: 'SENT' },
    });
    expect(result).toEqual({ id: 'b1', orderId: 'o1', estimatedTotal: 1500, status: 'SENT' });
  });

  it('TC0002 - Should find budget by order id and return undefined when not found', async () => {
    db.budget.findFirst.mockResolvedValueOnce(budgetRaw).mockResolvedValueOnce(null);

    const found = await repo.findBudgetByOrderId('o1');
    const missing = await repo.findBudgetByOrderId('o2');

    expect(found).toEqual({ id: 'b1', orderId: 'o1', estimatedTotal: 1500, status: 'SENT' });
    expect(missing).toBeUndefined();
  });

  it('TC0003 - Should find budget by id and return undefined when not found', async () => {
    db.budget.findUnique.mockResolvedValueOnce(budgetRaw).mockResolvedValueOnce(null);

    const found = await repo.findBudgetById('b1');
    const missing = await repo.findBudgetById('b2');

    expect(found?.id).toBe('b1');
    expect(missing).toBeUndefined();
  });

  it('TC0004 - Should create payment and map null mercadopagoId to undefined', async () => {
    db.payment.create.mockResolvedValue(paymentRaw);

    const result = await repo.createPayment({
      id: 'p1',
      budgetId: 'b1',
      amount: 1500,
      status: 'CONFIRMED',
    });

    expect(db.payment.create).toHaveBeenCalledWith({
      data: {
        id: 'p1',
        budgetId: 'b1',
        amount: 1500,
        status: 'CONFIRMED',
        mercadopagoId: null,
      },
    });
    expect(result).toEqual({
      id: 'p1',
      budgetId: 'b1',
      amount: 1500,
      status: 'CONFIRMED',
      mercadopagoId: undefined,
    });
  });

  it('TC0005 - Should update payment status', async () => {
    db.payment.update.mockResolvedValue(paymentRaw);

    await repo.updatePayment('p1', 'FAILED');

    expect(db.payment.update).toHaveBeenCalledWith({ where: { id: 'p1' }, data: { status: 'FAILED' } });
  });

  it('TC0006 - Should find payment by budget id and return undefined when not found', async () => {
    db.payment.findFirst.mockResolvedValueOnce(paymentRaw).mockResolvedValueOnce(null);

    const found = await repo.findPaymentByBudgetId('b1');
    const missing = await repo.findPaymentByBudgetId('b2');

    expect(found).toEqual({
      id: 'p1',
      budgetId: 'b1',
      amount: 1500,
      status: 'CONFIRMED',
      mercadopagoId: undefined,
    });
    expect(missing).toBeUndefined();
  });
});
