const randomUUID = () =>
  `${Date.now().toString(16)}-${Math.random().toString(16).slice(2, 10)}-${Math.random()
    .toString(16)
    .slice(2, 10)}`;

export interface MercadoPagoResult {
  id: string;
  status: 'approved' | 'rejected' | 'in_process';
}

/**
 * Integração com Mercado Pago.
 * - Com MP_ACCESS_TOKEN definido, chama API real.
 * - Sem token (dev/test), utiliza fallback mock para não quebrar fluxo local.
 */
export async function processPayment(amount: number, description: string): Promise<MercadoPagoResult> {
  const accessToken = process.env.MP_ACCESS_TOKEN;

  if (!accessToken) {
    return {
      id: `mock-${randomUUID()}`,
      status: 'approved',
    };
  }

  const response = await fetch('https://api.mercadopago.com/v1/payments', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Idempotency-Key': randomUUID(),
    },
    body: JSON.stringify({
      transaction_amount: amount,
      description,
      payment_method_id: 'pix',
      payer: {
        email: process.env.MP_PAYER_EMAIL ?? 'buyer@example.com',
      },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`MERCADO_PAGO_ERROR: ${response.status} ${errorBody}`);
  }

  const data = (await response.json()) as { id: string | number; status: string };
  const normalizedStatus =
    data.status === 'approved' || data.status === 'rejected' || data.status === 'in_process'
      ? data.status
      : 'rejected';

  return {
    id: String(data.id),
    status: normalizedStatus,
  };
}
