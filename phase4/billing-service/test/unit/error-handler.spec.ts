import { errorHandler } from '../../src/infra/error-handler';

describe('errorHandler', () => {
  it('TC0001 - Should return 404 for budget not found', () => {
    const status = jest.fn().mockReturnThis();
    const json = jest.fn();
    const res = { status, json } as any;

    errorHandler(new Error('BUDGET_NOT_FOUND'), {} as any, res, {} as any);

    expect(status).toHaveBeenCalledWith(404);
    expect(json).toHaveBeenCalledWith({ message: 'Budget not found', code: 'BUDGET_NOT_FOUND' });
  });

  it('TC0002 - Should return 404 for payment not found', () => {
    const status = jest.fn().mockReturnThis();
    const json = jest.fn();
    const res = { status, json } as any;

    errorHandler(new Error('PAYMENT_NOT_FOUND'), {} as any, res, {} as any);

    expect(status).toHaveBeenCalledWith(404);
    expect(json).toHaveBeenCalledWith({ message: 'Payment not found', code: 'PAYMENT_NOT_FOUND' });
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
