import { processPayment } from '../../src/infra/mercadopago.client';

describe('MercadoPago client', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.restoreAllMocks();
    process.env = { ...originalEnv };
    delete process.env.MP_ACCESS_TOKEN;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('TC0001 - Should return approved mock payment when MP_ACCESS_TOKEN is not configured', async () => {
    const result = await processPayment(1500, 'Pagamento OS 100');

    expect(result.status).toBe('approved');
    expect(result.id.startsWith('mock-')).toBe(true);
  });

  it('TC0002 - Should call Mercado Pago API when MP_ACCESS_TOKEN is configured', async () => {
    process.env.MP_ACCESS_TOKEN = 'token-123';
    const fetchSpy = jest.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'mp-100', status: 'approved' }),
    } as Response);

    const result = await processPayment(2000, 'Pagamento OS 200');

    expect(fetchSpy).toHaveBeenCalledWith(
      'https://api.mercadopago.com/v1/payments',
      expect.objectContaining({ method: 'POST' }),
    );
    expect(result).toEqual({ id: 'mp-100', status: 'approved' });
  });

  it('TC0003 - Should normalize unknown status to rejected', async () => {
    process.env.MP_ACCESS_TOKEN = 'token-123';
    jest.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ id: 55, status: 'pending_review' }),
    } as Response);

    const result = await processPayment(750, 'Pagamento OS 300');

    expect(result).toEqual({ id: '55', status: 'rejected' });
  });

  it('TC0004 - Should throw when Mercado Pago API responds with error', async () => {
    process.env.MP_ACCESS_TOKEN = 'token-123';
    jest.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      status: 401,
      text: async () => 'unauthorized',
    } as Response);

    await expect(processPayment(500, 'Pagamento OS 400')).rejects.toThrow(
      'MERCADO_PAGO_ERROR: 401 unauthorized',
    );
  });
});
