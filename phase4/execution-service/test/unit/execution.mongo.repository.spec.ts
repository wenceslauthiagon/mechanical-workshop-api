import { ExecutionMongoRepository } from '../../src/infra/execution.mongo.repository';

describe('ExecutionMongoRepository', () => {
  let collection: any;
  let client: any;
  let repo: ExecutionMongoRepository;

  beforeEach(() => {
    collection = {
      insertOne: jest.fn(),
      findOne: jest.fn(),
      updateOne: jest.fn(),
    };

    client = {
      db: jest.fn().mockReturnValue({
        collection: jest.fn().mockReturnValue(collection),
      }),
    };

    repo = new ExecutionMongoRepository(client);
  });

  it('TC0001 - Should create execution record', async () => {
    collection.insertOne.mockResolvedValue({ insertedId: 'exec-1' });

    const record = {
      id: 'exec-1',
      orderId: 'order-1',
      status: 'QUEUED' as const,
      notes: [],
      startedAt: '2026-01-01T00:00:00.000Z',
    };

    const result = await repo.create(record);

    expect(collection.insertOne).toHaveBeenCalledWith({
      _id: 'exec-1',
      orderId: 'order-1',
      status: 'QUEUED',
      notes: [],
      startedAt: '2026-01-01T00:00:00.000Z',
    });
    expect(result).toEqual(record);
  });

  it('TC0002 - Should find by id and return undefined when not found', async () => {
    collection.findOne.mockResolvedValueOnce({
      _id: 'exec-1',
      orderId: 'order-1',
      status: 'IN_PROGRESS',
      notes: ['n1'],
      startedAt: 's',
      completedAt: 'c',
    });
    collection.findOne.mockResolvedValueOnce(null);

    const found = await repo.findById('exec-1');
    const missing = await repo.findById('exec-x');

    expect(found).toEqual({
      id: 'exec-1',
      orderId: 'order-1',
      status: 'IN_PROGRESS',
      notes: ['n1'],
      startedAt: 's',
      completedAt: 'c',
    });
    expect(missing).toBeUndefined();
  });

  it('TC0003 - Should find by order id and map _id', async () => {
    collection.findOne.mockResolvedValueOnce({
      _id: 'exec-2',
      orderId: 'order-2',
      status: 'FAILED',
      notes: [],
    });

    const result = await repo.findByOrderId('order-2');

    expect(collection.findOne).toHaveBeenCalledWith({ orderId: 'order-2' });
    expect(result?.id).toBe('exec-2');
  });

  it('TC0003A - Should return undefined when order lookup has no _id', async () => {
    collection.findOne.mockResolvedValueOnce({
      orderId: 'order-x',
      status: 'QUEUED',
      notes: [],
    });

    await expect(repo.findByOrderId('order-x')).resolves.toBeUndefined();
  });

  it('TC0004 - Should save execution status and completedAt', async () => {
    collection.updateOne.mockResolvedValue(undefined);

    await repo.save({
      id: 'exec-3',
      orderId: 'order-3',
      status: 'COMPLETED',
      notes: [],
      completedAt: 'done',
    });

    expect(collection.updateOne).toHaveBeenCalledWith(
      { _id: 'exec-3' },
      { $set: { status: 'COMPLETED', completedAt: 'done' } },
    );
  });

  it('TC0005 - Should add note to execution', async () => {
    collection.updateOne.mockResolvedValue(undefined);

    await repo.addNote('exec-4', 'new-note');

    expect(collection.updateOne).toHaveBeenCalledWith(
      { _id: 'exec-4' },
      { $push: { notes: 'new-note' } },
    );
  });
});
