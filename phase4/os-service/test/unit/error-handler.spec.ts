import { errorHandler } from '../../src/infra/error-handler';

describe('errorHandler', () => {
  it('TC0001 - Should return 404 for order not found', () => {
    const status = jest.fn().mockReturnThis();
    const json = jest.fn();
    const res = { status, json } as any;

    errorHandler(new Error('ORDER_NOT_FOUND'), {} as any, res, {} as any);

    expect(status).toHaveBeenCalledWith(404);
    expect(json).toHaveBeenCalledWith({ message: 'Order not found', code: 'ORDER_NOT_FOUND' });
  });

  it('TC0002 - Should return 409 for invalid status transition', () => {
    const status = jest.fn().mockReturnThis();
    const json = jest.fn();
    const res = { status, json } as any;

    errorHandler(new Error('ORDER_INVALID_STATUS_TRANSITION'), {} as any, res, {} as any);

    expect(status).toHaveBeenCalledWith(409);
    expect(json).toHaveBeenCalledWith({ message: 'Invalid status transition', code: 'ORDER_INVALID_STATUS_TRANSITION' });
  });

  it('TC0003 - Should return 500 for unknown error', () => {
    const status = jest.fn().mockReturnThis();
    const json = jest.fn();
    const res = { status, json } as any;

    errorHandler(new Error('UNKNOWN'), {} as any, res, {} as any);

    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith({ message: 'Internal server error', code: 'INTERNAL_ERROR' });
  });
});
