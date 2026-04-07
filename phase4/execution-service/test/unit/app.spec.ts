import request from 'supertest';
import { createApp } from '../../src/app';
import { connectRabbitMQ, publishEvent, subscribeEvent } from '../../src/infra/rabbitmq';

const handlers = new Map<string, (payload: any) => Promise<void>>();

const mockService = {
  start: jest.fn(),
  updateStatus: jest.fn(),
};

jest.mock('../../src/infra/rabbitmq', () => ({
  connectRabbitMQ: jest.fn(),
  publishEvent: jest.fn(),
  subscribeEvent: jest.fn(async (topic: string, handler: (payload: any) => Promise<void>) => {
    handlers.set(topic, handler);
  }),
}));

jest.mock('../../src/execution.service', () => ({
  ExecutionService: jest.fn().mockImplementation(() => mockService),
}));

describe('App', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    handlers.clear();

    (connectRabbitMQ as jest.Mock).mockResolvedValue(undefined);
    (publishEvent as jest.Mock).mockResolvedValue(undefined);

    mockService.start.mockReturnValue({ id: 'exec-1', orderId: 'order-1', status: 'QUEUED', notes: [] });
    mockService.updateStatus.mockReturnValue({ id: 'exec-1', orderId: 'order-1', status: 'COMPLETED', notes: [] });
  });

  it('TC0001 - Should subscribe to command.execution.start on bootstrap', async () => {
    await createApp();

    expect(subscribeEvent).toHaveBeenCalledWith('command.execution.start', expect.any(Function));
  });

  it('TC0002 - Should publish execution.completed when command handler succeeds', async () => {
    const randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0);
    const timeoutSpy = jest.spyOn(global, 'setTimeout').mockImplementation(((cb: any) => {
      cb();
      return 0 as any;
    }) as any);

    await createApp();

    const handler = handlers.get('command.execution.start');
    await handler?.({ orderId: 'order-1' });

    expect(mockService.start).toHaveBeenCalledWith('order-1');
    expect(mockService.updateStatus).toHaveBeenCalledWith('exec-1', 'COMPLETED', 'Diagnosis and repair completed');
    expect(publishEvent).toHaveBeenCalledWith(
      'event.execution.completed',
      expect.objectContaining({ orderId: 'order-1', executionId: 'exec-1' }),
    );

    randomSpy.mockRestore();
    timeoutSpy.mockRestore();
  });

  it('TC0003 - Should publish execution.failed when command handler throws', async () => {
    mockService.start.mockImplementation(() => {
      throw new Error('START_FAILED');
    });

    await createApp();

    const handler = handlers.get('command.execution.start');
    await handler?.({ orderId: 'order-2' });

    expect(publishEvent).toHaveBeenCalledWith(
      'event.execution.failed',
      expect.objectContaining({ orderId: 'order-2', reason: 'START_FAILED' }),
    );
  });

  it('TC0004 - Should create execution via endpoint', async () => {
    const { app } = await createApp();

    const response = await request(app)
      .post('/execution/start')
      .send({ orderId: 'order-9' })
      .expect(201);

    expect(mockService.start).toHaveBeenCalledWith('order-9');
    expect(response.body).toHaveProperty('id', 'exec-1');
  });

  it('TC0005 - Should return 404 when update status endpoint fails', async () => {
    mockService.updateStatus.mockImplementation(() => {
      throw new Error('EXECUTION_NOT_FOUND');
    });

    const { app } = await createApp();

    const response = await request(app)
      .patch('/execution/missing/status')
      .send({ status: 'COMPLETED' })
      .expect(404);

    expect(response.body).toEqual({ message: 'Execution not found' });
  });
});
