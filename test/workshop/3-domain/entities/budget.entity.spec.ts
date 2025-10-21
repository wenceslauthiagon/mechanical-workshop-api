import { faker } from '@faker-js/faker/locale/pt_BR';
import {
  BudgetEntity,
  BudgetItem,
  BudgetStatus,
} from '../../../../src/workshop/3-domain/entities/budget.entity';
import { BUDGET_CONSTANTS } from '../../../../src/shared/constants/budget.constants';

describe('BudgetEntity', () => {
  const createBudgetItem = (): BudgetItem => ({
    id: faker.string.uuid(),
    type: 'SERVICE',
    serviceId: faker.string.uuid(),
    description: faker.commerce.productDescription(),
    quantity: 1,
    unitPrice: 100,
    total: 100,
  });

  describe('constructor', () => {
    it('TC0001 - Should create budget with all properties', () => {
      const id = faker.string.uuid();
      const serviceOrderId = faker.string.uuid();
      const customerId = faker.string.uuid();
      const items = [createBudgetItem()];
      const subtotal = 100;
      const taxes = 10;
      const discount = 0;
      const total = 110;
      const validUntil = new Date();
      const status = BudgetStatus.RASCUNHO;
      const createdAt = new Date();
      const updatedAt = new Date();

      const budget = new BudgetEntity(
        id,
        serviceOrderId,
        customerId,
        items,
        subtotal,
        taxes,
        discount,
        total,
        validUntil,
        status,
        undefined,
        undefined,
        undefined,
        createdAt,
        updatedAt,
      );

      expect(budget.id).toBe(id);
      expect(budget.serviceOrderId).toBe(serviceOrderId);
      expect(budget.customerId).toBe(customerId);
      expect(budget.items).toEqual(items);
      expect(budget.subtotal).toBe(subtotal);
      expect(budget.taxes).toBe(taxes);
      expect(budget.discount).toBe(discount);
      expect(budget.total).toBe(total);
      expect(budget.validUntil).toBe(validUntil);
      expect(budget.status).toBe(status);
      expect(budget.createdAt).toBe(createdAt);
      expect(budget.updatedAt).toBe(updatedAt);
    });
  });

  describe('create', () => {
    it('TC0001 - Should create budget with default values', () => {
      const serviceOrderId = faker.string.uuid();
      const customerId = faker.string.uuid();
      const items = [createBudgetItem()];

      const budget = BudgetEntity.create({
        serviceOrderId,
        customerId,
        items,
      });

      expect(budget.serviceOrderId).toBe(serviceOrderId);
      expect(budget.customerId).toBe(customerId);
      expect(budget.items).toEqual(items);
      expect(budget.subtotal).toBe(100);
      expect(budget.taxes).toBe(10);
      expect(budget.discount).toBe(0);
      expect(budget.total).toBe(110);
      expect(budget.status).toBe(BudgetStatus.RASCUNHO);
    });

    it('TC0002 - Should calculate subtotal from multiple items', () => {
      const item1 = createBudgetItem();
      const item2 = { ...createBudgetItem(), total: 200 };
      const items = [item1, item2];

      const budget = BudgetEntity.create({
        serviceOrderId: faker.string.uuid(),
        customerId: faker.string.uuid(),
        items,
      });

      expect(budget.subtotal).toBe(300);
    });

    it('TC0003 - Should calculate taxes based on subtotal', () => {
      const items = [createBudgetItem()];

      const budget = BudgetEntity.create({
        serviceOrderId: faker.string.uuid(),
        customerId: faker.string.uuid(),
        items,
      });

      expect(budget.taxes).toBe(10);
    });

    it('TC0004 - Should set default discount', () => {
      const items = [createBudgetItem()];

      const budget = BudgetEntity.create({
        serviceOrderId: faker.string.uuid(),
        customerId: faker.string.uuid(),
        items,
      });

      expect(budget.discount).toBe(BUDGET_CONSTANTS.DEFAULT_VALUES.DISCOUNT);
    });

    it('TC0005 - Should calculate total correctly', () => {
      const items = [createBudgetItem()];

      const budget = BudgetEntity.create({
        serviceOrderId: faker.string.uuid(),
        customerId: faker.string.uuid(),
        items,
      });

      expect(budget.total).toBe(110);
    });

    it('TC0006 - Should set validUntil with default days', () => {
      const items = [createBudgetItem()];
      const beforeCreation = new Date();

      const budget = BudgetEntity.create({
        serviceOrderId: faker.string.uuid(),
        customerId: faker.string.uuid(),
        items,
      });

      const expectedDate = new Date(beforeCreation);
      expectedDate.setDate(
        expectedDate.getDate() + BUDGET_CONSTANTS.DEFAULT_VALUES.VALID_DAYS,
      );

      expect(budget.validUntil.getDate()).toBe(expectedDate.getDate());
    });

    it('TC0007 - Should set validUntil with custom days', () => {
      const items = [createBudgetItem()];
      const validDays = 30;
      const beforeCreation = new Date();

      const budget = BudgetEntity.create({
        serviceOrderId: faker.string.uuid(),
        customerId: faker.string.uuid(),
        items,
        validDays,
      });

      const expectedDate = new Date(beforeCreation);
      expectedDate.setDate(expectedDate.getDate() + validDays);

      expect(budget.validUntil.getDate()).toBe(expectedDate.getDate());
    });

    it('TC0008 - Should generate unique id', () => {
      const items = [createBudgetItem()];

      const budget = BudgetEntity.create({
        serviceOrderId: faker.string.uuid(),
        customerId: faker.string.uuid(),
        items,
      });

      expect(budget.id).toContain('budget_');
    });
  });

  describe('approve', () => {
    it('TC0001 - Should approve budget when status is ENVIADO', () => {
      const validUntil = new Date();
      validUntil.setDate(validUntil.getDate() + 10);

      const budget = new BudgetEntity(
        faker.string.uuid(),
        faker.string.uuid(),
        faker.string.uuid(),
        [createBudgetItem()],
        100,
        10,
        0,
        110,
        validUntil,
        BudgetStatus.ENVIADO,
        new Date(),
      );

      const result = budget.approve();

      expect(result.status).toBe(BudgetStatus.APROVADO);
      expect(result.approvedAt).toBeDefined();
    });

    it('TC0002 - Should throw error when status is not ENVIADO', () => {
      const budget = new BudgetEntity(
        faker.string.uuid(),
        faker.string.uuid(),
        faker.string.uuid(),
        [createBudgetItem()],
        100,
        10,
        0,
        110,
        new Date(),
        BudgetStatus.RASCUNHO,
      );

      expect(() => budget.approve()).toThrow(
        BUDGET_CONSTANTS.MESSAGES.ONLY_SENT_CAN_BE_APPROVED,
      );
    });

    it('TC0003 - Should throw error when budget is expired', () => {
      const validUntil = new Date();
      validUntil.setDate(validUntil.getDate() - 1);

      const budget = new BudgetEntity(
        faker.string.uuid(),
        faker.string.uuid(),
        faker.string.uuid(),
        [createBudgetItem()],
        100,
        10,
        0,
        110,
        validUntil,
        BudgetStatus.ENVIADO,
        new Date(),
      );

      expect(() => budget.approve()).toThrow(
        BUDGET_CONSTANTS.MESSAGES.EXPIRED_CANNOT_BE_APPROVED,
      );
    });
  });

  describe('reject', () => {
    it('TC0001 - Should reject budget when status is ENVIADO', () => {
      const budget = new BudgetEntity(
        faker.string.uuid(),
        faker.string.uuid(),
        faker.string.uuid(),
        [createBudgetItem()],
        100,
        10,
        0,
        110,
        new Date(),
        BudgetStatus.ENVIADO,
        new Date(),
      );

      const result = budget.reject();

      expect(result.status).toBe(BudgetStatus.REJEITADO);
      expect(result.rejectedAt).toBeDefined();
    });

    it('TC0002 - Should throw error when status is not ENVIADO', () => {
      const budget = new BudgetEntity(
        faker.string.uuid(),
        faker.string.uuid(),
        faker.string.uuid(),
        [createBudgetItem()],
        100,
        10,
        0,
        110,
        new Date(),
        BudgetStatus.RASCUNHO,
      );

      expect(() => budget.reject()).toThrow(
        BUDGET_CONSTANTS.MESSAGES.ONLY_SENT_CAN_BE_REJECTED,
      );
    });
  });

  describe('send', () => {
    it('TC0001 - Should send budget when status is RASCUNHO', () => {
      const budget = new BudgetEntity(
        faker.string.uuid(),
        faker.string.uuid(),
        faker.string.uuid(),
        [createBudgetItem()],
        100,
        10,
        0,
        110,
        new Date(),
        BudgetStatus.RASCUNHO,
      );

      const result = budget.send();

      expect(result.status).toBe(BudgetStatus.ENVIADO);
      expect(result.sentAt).toBeDefined();
    });

    it('TC0002 - Should throw error when status is not RASCUNHO', () => {
      const budget = new BudgetEntity(
        faker.string.uuid(),
        faker.string.uuid(),
        faker.string.uuid(),
        [createBudgetItem()],
        100,
        10,
        0,
        110,
        new Date(),
        BudgetStatus.ENVIADO,
      );

      expect(() => budget.send()).toThrow(
        BUDGET_CONSTANTS.MESSAGES.ONLY_DRAFT_CAN_BE_SENT,
      );
    });
  });

  describe('isExpired', () => {
    it('TC0001 - Should return true when budget is expired', () => {
      const validUntil = new Date();
      validUntil.setDate(validUntil.getDate() - 1);

      const budget = new BudgetEntity(
        faker.string.uuid(),
        faker.string.uuid(),
        faker.string.uuid(),
        [createBudgetItem()],
        100,
        10,
        0,
        110,
        validUntil,
        BudgetStatus.ENVIADO,
      );

      expect(budget.isExpired()).toBe(true);
    });

    it('TC0002 - Should return false when budget is not expired', () => {
      const validUntil = new Date();
      validUntil.setDate(validUntil.getDate() + 10);

      const budget = new BudgetEntity(
        faker.string.uuid(),
        faker.string.uuid(),
        faker.string.uuid(),
        [createBudgetItem()],
        100,
        10,
        0,
        110,
        validUntil,
        BudgetStatus.ENVIADO,
      );

      expect(budget.isExpired()).toBe(false);
    });
  });

  describe('canBeModified', () => {
    it('TC0001 - Should return true when status is RASCUNHO', () => {
      const budget = new BudgetEntity(
        faker.string.uuid(),
        faker.string.uuid(),
        faker.string.uuid(),
        [createBudgetItem()],
        100,
        10,
        0,
        110,
        new Date(),
        BudgetStatus.RASCUNHO,
      );

      expect(budget.canBeModified()).toBe(true);
    });

    it('TC0002 - Should return false when status is not RASCUNHO', () => {
      const budget = new BudgetEntity(
        faker.string.uuid(),
        faker.string.uuid(),
        faker.string.uuid(),
        [createBudgetItem()],
        100,
        10,
        0,
        110,
        new Date(),
        BudgetStatus.ENVIADO,
      );

      expect(budget.canBeModified()).toBe(false);
    });
  });
});
