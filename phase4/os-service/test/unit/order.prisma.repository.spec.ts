import { OrderPrismaRepository } from '../../src/infra/order.prisma.repository';

describe('OrderPrismaRepository', () => {
  let db: any;
  let repo: OrderPrismaRepository;

  beforeEach(() => {
    db = {
      serviceOrder: {
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      serviceOrderHistory: {
        create: jest.fn(),
      },
    };

    repo = new OrderPrismaRepository(db);
  });

  it('TC0001 - Should create order and history entries', async () => {
    db.serviceOrder.create.mockResolvedValue({
      id: 'o1',
      customerId: 'c1',
      vehicleId: 'v1',
      description: 'desc',
      status: 'OPENED',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    db.serviceOrderHistory.create.mockResolvedValue({});

    const order = {
      id: 'o1',
      customerId: 'c1',
      vehicleId: 'v1',
      description: 'desc',
      status: 'OPENED' as const,
      history: [{ status: 'OPENED' as const, at: new Date().toISOString() }],
    };

    const result = await repo.create(order);

    expect(db.serviceOrder.create).toHaveBeenCalled();
    expect(db.serviceOrderHistory.create).toHaveBeenCalledWith({
      data: { orderId: 'o1', status: 'OPENED', reason: null },
    });
    expect(result.id).toBe('o1');
    expect(result.history).toEqual([]);
  });

  it('TC0002 - Should find order by id and map history', async () => {
    db.serviceOrder.findUnique.mockResolvedValue({
      id: 'o2',
      customerId: 'c2',
      vehicleId: 'v2',
      description: 'desc2',
      status: 'COMPLETED',
      createdAt: new Date(),
      updatedAt: new Date(),
      history: [
        { id: 'h1', orderId: 'o2', status: 'OPENED', reason: null, createdAt: new Date('2026-01-01') },
      ],
    });

    const found = await repo.findById('o2');

    expect(found?.status).toBe('COMPLETED');
    expect(found?.history[0].status).toBe('OPENED');
    expect(found?.history[0].reason).toBeUndefined();
  });

  it('TC0003 - Should return undefined when order is not found', async () => {
    db.serviceOrder.findUnique.mockResolvedValue(null);

    const found = await repo.findById('missing');

    expect(found).toBeUndefined();
  });

  it('TC0004 - Should save status and create last history entry', async () => {
    db.serviceOrder.update.mockResolvedValue({});
    db.serviceOrderHistory.create.mockResolvedValue({});

    await repo.save({
      id: 'o3',
      customerId: 'c3',
      vehicleId: 'v3',
      description: 'desc3',
      status: 'CANCELLED',
      history: [
        { status: 'OPENED', at: new Date().toISOString() },
        { status: 'CANCELLED', at: new Date().toISOString(), reason: 'failed' },
      ],
    });

    expect(db.serviceOrder.update).toHaveBeenCalledWith({ where: { id: 'o3' }, data: { status: 'CANCELLED' } });
    expect(db.serviceOrderHistory.create).toHaveBeenCalledWith({
      data: { orderId: 'o3', status: 'CANCELLED', reason: 'failed' },
    });
  });

  it('TC0005 - Should save status without creating history when empty', async () => {
    db.serviceOrder.update.mockResolvedValue({});

    await repo.save({
      id: 'o4',
      customerId: 'c4',
      vehicleId: 'v4',
      description: 'desc4',
      status: 'OPENED',
      history: [],
    });

    expect(db.serviceOrder.update).toHaveBeenCalled();
    expect(db.serviceOrderHistory.create).not.toHaveBeenCalled();
  });
});
