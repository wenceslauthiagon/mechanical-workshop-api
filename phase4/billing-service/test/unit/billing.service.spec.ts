import { BillingService } from '../../src/billing.service';

describe('BillingService', () => {
  it('should approve payment and emit event', () => {
    let emitted = false;
    const service = new BillingService((topic) => {
      if (topic === 'event.billing.payment_confirmed') emitted = true;
    });

    const budget = service.generateBudget('o1', 500);
    service.approvePayment(budget.id, 500);

    expect(emitted).toBe(true);
  });
});
