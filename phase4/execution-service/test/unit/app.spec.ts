import request from 'supertest';
import { randomUUID } from 'node:crypto';
import { createApp } from '../../src/app';
import { connectRabbitMQ, publishEvent, subscribeEvent } from '../../src/infra/rabbitmq';

const handlers = new Map<string, (payload: any) => Promise<void>>();

const mockService = {
  start: jest.fn(),
  updateStatus: jest.fn(),
  getById: jest.fn(),
  getByOrderId: jest.fn(),
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
  let executionId: string;
  let orderId: string;

  beforeEach(() => {
    jest.clearAllMocks();
    handlers.clear();

    (connectRabbitMQ as jest.Mock).mockResolvedValue(undefined);
    (publishEvent as jest.Mock).mockResolvedValue(undefined);

    executionId = randomUUID();
    orderId = randomUUID();

    mockService.start.mockResolvedValue({ id: executionId, orderId, status: 'QUEUED', notes: [] });
    mockService.updateStatus.mockResolvedValue({ id: executionId, orderId, status: 'COMPLETED', notes: [] });
    mockService.getById.mockResolvedValue({ id: executionId, orderId, status: 'COMPLETED', notes: [] });
    mockService.getByOrderId.mockResolvedValue({ id: executionId, orderId, status: 'COMPLETED', notes: [] });
  });

  it('TC0001 - Should subscribe to command.execution.start on bootstrap', async () => {
    await createApp();

    expect(subscribeEvent).toHaveBeenCalledWith('command.execution.start', expect.any(Function));
  });

  it('TC0002 - Should publish execution.completed when command handler succeeds', async () => {
    const randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0);
    const timeoutSpy = jest.spyOn(globalThis, 'setTimeout').mockImplementation(((cb: any) => {
      cb();
      return 0 as any;
    }) as any);

    await createApp();

    const handler = handlers.get('command.execution.start');
    await handler?.({ orderId });

    expect(mockService.start).toHaveBeenCalledWith(orderId);
    expect(mockService.updateStatus).toHaveBeenCalledWith(executionId, 'COMPLETED', 'Diagnosis and repair completed');
    expect(publishEvent).toHaveBeenCalledWith(
      'event.execution.completed',
      expect.objectContaining({ orderId, executionId }),
    );

    randomSpy.mockRestore();
    timeoutSpy.mockRestore();
  });

  it('TC0003 - Should publish execution.failed when command handler throws', async () => {
    const failedOrderId = randomUUID();
    mockService.start.mockImplementation(async () => {
      throw new Error('START_FAILED');
    });

    await createApp();

    const handler = handlers.get('command.execution.start');
    await handler?.({ orderId: failedOrderId });

    expect(publishEvent).toHaveBeenCalledWith(
      'event.execution.failed',
      expect.objectContaining({ orderId: failedOrderId, reason: 'START_FAILED' }),
    );
  });

  it('TC0003A - Should swallow publish failure after completion event', async () => {
    const timeoutSpy = jest.spyOn(globalThis, 'setTimeout').mockImplementation(((cb: any) => {
      cb();
      return 0 as any;
    }) as any);
    (publishEvent as jest.Mock).mockRejectedValueOnce(new Error('EVENT_PUBLISH_FAILED'));

    await createApp();

    const handler = handlers.get('command.execution.start');
    await expect(handler?.({ orderId })).resolves.toBeUndefined();

    timeoutSpy.mockRestore();
  });

  it('TC0003B - Should swallow publish failure after failed execution event', async () => {
    mockService.start.mockImplementation(async () => {
      throw new Error('START_FAILED');
    });
    (publishEvent as jest.Mock).mockRejectedValueOnce(new Error('EVENT_PUBLISH_FAILED'));

    await createApp();

    const handler = handlers.get('command.execution.start');
    await expect(handler?.({ orderId })).resolves.toBeUndefined();
  });

  it('TC0003C - Should publish execution.failed when async completion update fails', async () => {
    const timeoutSpy = jest.spyOn(globalThis, 'setTimeout').mockImplementation(((cb: any) => {
      cb();
      return 0 as any;
    }) as any);

    mockService.updateStatus.mockImplementation(async () => {
      throw new Error('UPDATE_FAILED');
    });

    await createApp();

    const handler = handlers.get('command.execution.start');
    await handler?.({ orderId });

    expect(publishEvent).toHaveBeenCalledWith(
      'event.execution.failed',
      expect.objectContaining({ orderId, reason: 'UPDATE_FAILED' }),
    );

    timeoutSpy.mockRestore();
  });

  it('TC0004 - Should create execution via endpoint', async () => {
    const endpointOrderId = randomUUID();
    const { app } = await createApp();

    const response = await request(app)
      .post('/execution/start')
      .send({ orderId: endpointOrderId })
      .expect(201);

    expect(mockService.start).toHaveBeenCalledWith(endpointOrderId);
    expect(response.body).toHaveProperty('id', executionId);
  });

  it('TC0005 - Should return 404 when update status endpoint fails', async () => {
    const missingExecutionId = randomUUID();
    mockService.updateStatus.mockImplementation(async () => {
      throw new Error('EXECUTION_NOT_FOUND');
    });

    const { app } = await createApp();

    const response = await request(app)
      .patch(`/execution/${missingExecutionId}/status`)
      .send({ status: 'COMPLETED' })
      .expect(404);

    expect(response.body).toEqual({ message: 'Execution not found' });
  });

  it('TC0005A - Should return 500 when update status endpoint fails with unknown error', async () => {
    mockService.updateStatus.mockImplementation(async () => {
      throw new Error('UPDATE_FAILED');
    });

    const { app } = await createApp();

    const response = await request(app)
      .patch(`/execution/${executionId}/status`)
      .send({ status: 'COMPLETED' })
      .expect(500);

    expect(response.body).toEqual({ message: 'Internal server error', code: 'INTERNAL_ERROR' });
  });

  it('TC0006 - Should return 400 when start endpoint receives invalid order id', async () => {
    const { app } = await createApp();

    const response = await request(app)
      .post('/execution/start')
      .send({ orderId: 'invalid-id' })
      .expect(400);

    expect(response.body).toEqual({ message: 'orderId must be a valid UUID' });
  });

  it('TC0007 - Should return 400 when status endpoint receives invalid payload', async () => {
    const { app } = await createApp();

    const response = await request(app)
      .patch(`/execution/${executionId}/status`)
      .send({ status: 'INVALID_STATUS' })
      .expect(400);

    expect(response.body).toEqual({ message: 'status must be one of: QUEUED, IN_PROGRESS, COMPLETED, FAILED' });
  });

  it('TC0008 - Should return execution by id', async () => {
    const { app } = await createApp();

    const response = await request(app)
      .get(`/execution/${executionId}`)
      .expect(200);

    expect(mockService.getById).toHaveBeenCalledWith(executionId);
    expect(response.body).toHaveProperty('id', executionId);
  });

  it('TC0009 - Should return 400 when get by id receives invalid execution id', async () => {
    const { app } = await createApp();

    const response = await request(app)
      .get('/execution/invalid-id')
      .expect(400);

    expect(response.body).toEqual({ message: 'executionId must be a valid UUID' });
  });

  it('TC0010 - Should return 404 when get by id fails', async () => {
    mockService.getById.mockImplementation(async () => {
      throw new Error('EXECUTION_NOT_FOUND');
    });

    const { app } = await createApp();

    const response = await request(app)
      .get(`/execution/${executionId}`)
      .expect(404);

    expect(response.body).toEqual({ message: 'Execution not found' });
  });

  it('TC0010A - Should return 500 when get by id fails with unknown error', async () => {
    mockService.getById.mockImplementation(async () => {
      throw new Error('DB_UNAVAILABLE');
    });

    const { app } = await createApp();

    const response = await request(app)
      .get(`/execution/${executionId}`)
      .expect(500);

    expect(response.body).toEqual({ message: 'Internal server error', code: 'INTERNAL_ERROR' });
  });

  it('TC0011 - Should return execution by order id', async () => {
    const { app } = await createApp();

    const response = await request(app)
      .get(`/execution/order/${orderId}`)
      .expect(200);

    expect(mockService.getByOrderId).toHaveBeenCalledWith(orderId);
    expect(response.body).toHaveProperty('orderId', orderId);
  });

  it('TC0012 - Should return 400 when get by order id receives invalid order id', async () => {
    const { app } = await createApp();

    const response = await request(app)
      .get('/execution/order/invalid-id')
      .expect(400);

    expect(response.body).toEqual({ message: 'orderId must be a valid UUID' });
  });

  it('TC0013 - Should return 404 when get by order id fails', async () => {
    mockService.getByOrderId.mockImplementation(async () => {
      throw new Error('EXECUTION_NOT_FOUND');
    });

    const { app } = await createApp();

    const response = await request(app)
      .get(`/execution/order/${orderId}`)
      .expect(404);

    expect(response.body).toEqual({ message: 'Execution not found' });
  });

  it('TC0013A - Should return 500 when get by order id fails with unknown error', async () => {
    mockService.getByOrderId.mockImplementation(async () => {
      throw new Error('DB_UNAVAILABLE');
    });

    const { app } = await createApp();

    const response = await request(app)
      .get(`/execution/order/${orderId}`)
      .expect(500);

    expect(response.body).toEqual({ message: 'Internal server error', code: 'INTERNAL_ERROR' });
  });
});
