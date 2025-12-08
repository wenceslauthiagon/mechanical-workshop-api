import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { faker } from '@faker-js/faker/locale/pt_BR';
import { NotificationService } from '../../../../src/workshop/2-application/services/notification.service';
import { NOTIFICATION_CONSTANTS } from '../../../../src/shared/constants/notification.constants';
import { BudgetStatus } from '../../../../src/workshop/3-domain/entities/budget.entity';

describe('NotificationService', () => {
  let service: NotificationService;
  let emailProvider: any;
  let smsProvider: any;

  const mockBudget = {
    id: faker.string.uuid(),
    serviceOrderId: faker.string.uuid(),
    customerId: faker.string.uuid(),
    subtotal: Number(faker.finance.amount({ min: 500, max: 3000, dec: 2 })),
    taxes: Number(faker.finance.amount({ min: 50, max: 300, dec: 2 })),
    discount: Number(faker.finance.amount({ min: 0, max: 200, dec: 2 })),
    total: Number(faker.finance.amount({ min: 800, max: 3500, dec: 2 })),
    validUntil: faker.date.future(),
    status: BudgetStatus.ENVIADO,
    items: [],
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
  };

  const customerEmail = faker.internet.email();
  const customerName = faker.person.fullName();
  const customerPhone = `11${faker.string.numeric(9)}`;

  beforeEach(async () => {
    const mockEmailProvider = {
      sendEmail: jest.fn().mockResolvedValue(undefined),
    };

    const mockSmsProvider = {
      sendSms: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        { provide: 'IEmailProvider', useValue: mockEmailProvider },
        { provide: 'ISmsProvider', useValue: mockSmsProvider },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
    emailProvider = module.get('IEmailProvider');
    smsProvider = module.get('ISmsProvider');

    // Mock logger to avoid console output
    jest.spyOn(Logger.prototype, 'log').mockImplementation();
    jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('Should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendBudgetReadyNotification', () => {
    it('TC0001 - Should send email successfully and log', async () => {
      await service.sendBudgetReadyNotification(
        mockBudget,
        customerEmail,
        customerName,
        customerPhone,
      );

      expect(emailProvider.sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: customerEmail,
          subject: expect.stringContaining(mockBudget.id.substring(0, 8)),
        }),
      );
      expect(Logger.prototype.log).toHaveBeenCalledWith(
        NOTIFICATION_CONSTANTS.MESSAGES.BUDGET_READY_SUCCESS,
        expect.any(Object),
      );
    });

    it('TC0002 - Should send only email when phone is not provided', async () => {
      await service.sendBudgetReadyNotification(
        mockBudget,
        customerEmail,
        customerName,
      );

      expect(emailProvider.sendEmail).toHaveBeenCalled();
      expect(smsProvider.sendSms).not.toHaveBeenCalled();
    });

    it('TC0003 - Should send email and SMS when SMS is enabled', async () => {
      // Temporarily enable SMS
      const originalEnabled = (NOTIFICATION_CONSTANTS.SMS as any).ENABLED;
      (NOTIFICATION_CONSTANTS.SMS as any).ENABLED = true;

      await service.sendBudgetReadyNotification(
        mockBudget,
        customerEmail,
        customerName,
        customerPhone,
      );

      expect(emailProvider.sendEmail).toHaveBeenCalled();
      expect(smsProvider.sendSms).toHaveBeenCalledWith(
        expect.objectContaining({
          phone: customerPhone,
          message: expect.any(String),
        }),
      );

      // Restore original value
      (NOTIFICATION_CONSTANTS.SMS as any).ENABLED = originalEnabled;
    });

    it('TC0004 - Should throw error and log when email fails', async () => {
      const error = new Error('Email service error');
      emailProvider.sendEmail.mockRejectedValue(error);

      await expect(
        service.sendBudgetReadyNotification(
          mockBudget,
          customerEmail,
          customerName,
        ),
      ).rejects.toThrow('Email service error');

      expect(Logger.prototype.error).toHaveBeenCalledWith(
        NOTIFICATION_CONSTANTS.MESSAGES.BUDGET_READY_ERROR,
        expect.objectContaining({
          error: error.message,
          budgetId: mockBudget.id,
          customerEmail,
        }),
      );
    });
  });

  describe('sendBudgetApprovedNotification', () => {
    it('TC0001 - Should send budget approved email successfully', async () => {
      await service.sendBudgetApprovedNotification(
        mockBudget,
        customerEmail,
        customerName,
      );

      expect(emailProvider.sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: customerEmail,
          subject: expect.stringContaining(
            NOTIFICATION_CONSTANTS.TEMPLATES.BUDGET_APPROVED,
          ),
        }),
      );
      expect(Logger.prototype.log).toHaveBeenCalledWith(
        NOTIFICATION_CONSTANTS.MESSAGES.BUDGET_APPROVED_SUCCESS,
        expect.objectContaining({
          budgetId: mockBudget.id,
          customerEmail,
        }),
      );
    });

    it('TC0002 - Should throw error and log when email fails', async () => {
      const error = new Error('Email service error');
      emailProvider.sendEmail.mockRejectedValue(error);

      await expect(
        service.sendBudgetApprovedNotification(
          mockBudget,
          customerEmail,
          customerName,
        ),
      ).rejects.toThrow('Email service error');

      expect(Logger.prototype.error).toHaveBeenCalledWith(
        NOTIFICATION_CONSTANTS.MESSAGES.BUDGET_APPROVED_ERROR,
        expect.objectContaining({
          error: error.message,
          budgetId: mockBudget.id,
          customerEmail,
        }),
      );
    });
  });

  describe('sendBudgetRejectedNotification', () => {
    it('TC0001 - Should send budget rejected email successfully', async () => {
      await service.sendBudgetRejectedNotification(
        mockBudget,
        customerEmail,
        customerName,
      );

      expect(emailProvider.sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: customerEmail,
          subject: expect.stringContaining(
            NOTIFICATION_CONSTANTS.TEMPLATES.BUDGET_REJECTED,
          ),
        }),
      );
      expect(Logger.prototype.log).toHaveBeenCalledWith(
        NOTIFICATION_CONSTANTS.MESSAGES.BUDGET_REJECTED_SUCCESS,
        expect.objectContaining({
          budgetId: mockBudget.id,
          customerEmail,
        }),
      );
    });

    it('TC0002 - Should throw error and log when email fails', async () => {
      const error = new Error('Email service error');
      emailProvider.sendEmail.mockRejectedValue(error);

      await expect(
        service.sendBudgetRejectedNotification(
          mockBudget,
          customerEmail,
          customerName,
        ),
      ).rejects.toThrow('Email service error');

      expect(Logger.prototype.error).toHaveBeenCalledWith(
        NOTIFICATION_CONSTANTS.MESSAGES.BUDGET_REJECTED_ERROR,
        expect.objectContaining({
          error: error.message,
          budgetId: mockBudget.id,
          customerEmail,
        }),
      );
    });
  });

  describe('sendServiceOrderStatusNotification', () => {
    const serviceOrderId = 'order-789';
    const orderNumber = 'OS-2025-001';
    const status = 'EM_EXECUCAO';
    const vehicleInfo = 'Toyota Corolla 2020';

    it('TC0001 - Should send email successfully with phone parameter', async () => {
      await service.sendServiceOrderStatusNotification(
        serviceOrderId,
        orderNumber,
        status,
        customerEmail,
        customerName,
        vehicleInfo,
        customerPhone,
      );

      expect(emailProvider.sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: customerEmail,
          subject: expect.stringContaining(orderNumber),
        }),
      );
      expect(Logger.prototype.log).toHaveBeenCalledWith(
        NOTIFICATION_CONSTANTS.MESSAGES.SERVICE_ORDER_SUCCESS,
        expect.any(Object),
      );
    });

    it('TC0002 - Should send only email when phone is not provided', async () => {
      await service.sendServiceOrderStatusNotification(
        serviceOrderId,
        orderNumber,
        status,
        customerEmail,
        customerName,
        vehicleInfo,
      );

      expect(emailProvider.sendEmail).toHaveBeenCalled();
      expect(smsProvider.sendSms).not.toHaveBeenCalled();
    });

    it('TC0003 - Should send email and SMS when SMS is enabled', async () => {
      // Temporarily enable SMS
      const originalEnabled = (NOTIFICATION_CONSTANTS.SMS as any).ENABLED;
      (NOTIFICATION_CONSTANTS.SMS as any).ENABLED = true;

      await service.sendServiceOrderStatusNotification(
        serviceOrderId,
        orderNumber,
        status,
        customerEmail,
        customerName,
        vehicleInfo,
        customerPhone,
      );

      expect(emailProvider.sendEmail).toHaveBeenCalled();
      expect(smsProvider.sendSms).toHaveBeenCalledWith(
        expect.objectContaining({
          phone: customerPhone,
          message: expect.any(String),
        }),
      );

      // Restore original value
      (NOTIFICATION_CONSTANTS.SMS as any).ENABLED = originalEnabled;
    });

    it('TC0004 - Should use status message from constants when available', async () => {
      await service.sendServiceOrderStatusNotification(
        serviceOrderId,
        orderNumber,
        'EM_EXECUCAO',
        customerEmail,
        customerName,
        vehicleInfo,
      );

      expect(emailProvider.sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.any(String),
        }),
      );
    });

    it('TC0005 - Should use default message when status not in constants', async () => {
      const unknownStatus = 'UNKNOWN_STATUS';

      await service.sendServiceOrderStatusNotification(
        serviceOrderId,
        orderNumber,
        unknownStatus,
        customerEmail,
        customerName,
        vehicleInfo,
      );

      expect(emailProvider.sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.any(String),
        }),
      );
    });

    it('TC0006 - Should throw error and log when email fails', async () => {
      const error = new Error('Email service error');
      emailProvider.sendEmail.mockRejectedValue(error);

      await expect(
        service.sendServiceOrderStatusNotification(
          serviceOrderId,
          orderNumber,
          status,
          customerEmail,
          customerName,
          vehicleInfo,
        ),
      ).rejects.toThrow('Email service error');

      expect(Logger.prototype.error).toHaveBeenCalledWith(
        NOTIFICATION_CONSTANTS.MESSAGES.SERVICE_ORDER_ERROR,
        expect.objectContaining({
          error: error.message,
          serviceOrderId,
          orderNumber,
          status,
          customerEmail,
        }),
      );
    });
  });
});
