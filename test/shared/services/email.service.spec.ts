import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { faker } from '@faker-js/faker/locale/pt_BR';
import { ServiceOrderStatus } from '@prisma/client';
import { EmailService } from '../../../src/shared/services/email.service';

describe('EmailService', () => {
  let service: EmailService;
  let loggerLogSpy: jest.SpyInstance;
  let loggerDebugSpy: jest.SpyInstance;
  let loggerErrorSpy: jest.SpyInstance;

  const createMockEmailOptions = () => ({
    to: faker.internet.email(),
    subject: faker.lorem.sentence(),
    text: faker.lorem.paragraph(),
    html: `<p>${faker.lorem.paragraph()}</p>`,
  });

  const createMockStatusChangeData = () => ({
    customerName: faker.person.fullName(),
    customerEmail: faker.internet.email(),
    orderNumber: `OS-${faker.string.numeric(3)}`,
    newStatus: faker.helpers.arrayElement([
      ServiceOrderStatus.RECEBIDA,
      ServiceOrderStatus.EM_DIAGNOSTICO,
      ServiceOrderStatus.AGUARDANDO_APROVACAO,
      ServiceOrderStatus.EM_EXECUCAO,
      ServiceOrderStatus.FINALIZADA,
      ServiceOrderStatus.ENTREGUE,
    ]),
    statusMessage: faker.lorem.sentence(),
    orderLink: faker.internet.url(),
  });

  const createMockBudgetData = () => ({
    customerName: faker.person.fullName(),
    customerEmail: faker.internet.email(),
    orderNumber: `OS-${faker.string.numeric(3)}`,
    budgetId: faker.string.uuid(),
    totalValue: faker.number.float({ min: 100, max: 5000, fractionDigits: 2 }),
    approvalLink: faker.internet.url(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmailService],
    }).compile();

    service = module.get<EmailService>(EmailService);

    loggerLogSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();
    loggerDebugSpy = jest.spyOn(Logger.prototype, 'debug').mockImplementation();
    loggerErrorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('sendEmail', () => {
    it('TC0001 - Should send email successfully', async () => {
      const options = createMockEmailOptions();

      const result = await service.sendEmail(options);

      expect(result).toBe(true);
      expect(loggerLogSpy).toHaveBeenCalledWith(
        `Sending email to ${options.to}: ${options.subject}`,
      );
      expect(loggerDebugSpy).toHaveBeenCalledWith(
        `Email content: ${options.text}`,
      );
    });

    it('TC0002 - Should send email without html', async () => {
      const options = {
        to: faker.internet.email(),
        subject: faker.lorem.sentence(),
        text: faker.lorem.paragraph(),
      };

      const result = await service.sendEmail(options);

      expect(result).toBe(true);
      expect(loggerLogSpy).toHaveBeenCalled();
    });

    it('TC0003 - Should handle email sending error', async () => {
      loggerLogSpy.mockImplementation(() => {
        throw new Error('Email sending failed');
      });

      const options = createMockEmailOptions();

      const result = await service.sendEmail(options);

      expect(result).toBe(false);
      expect(loggerErrorSpy).toHaveBeenCalled();
    });
  });

  describe('sendStatusChangeNotification', () => {
    it('TC0001 - Should send notification for RECEBIDA status', async () => {
      const data = {
        ...createMockStatusChangeData(),
        newStatus: ServiceOrderStatus.RECEBIDA,
      };

      const sendEmailSpy = jest.spyOn(service, 'sendEmail');

      const result = await service.sendStatusChangeNotification(data);

      expect(result).toBe(true);
      expect(sendEmailSpy).toHaveBeenCalledWith({
        to: data.customerEmail,
        subject: `Atualização da Ordem de Serviço ${data.orderNumber}`,
        text: expect.stringContaining(data.customerName),
        html: expect.stringContaining(data.customerName),
      });
      expect(sendEmailSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          text: expect.stringContaining('recebida e aguardando diagnóstico'),
          html: expect.stringContaining('recebida e aguardando diagnóstico'),
        }),
      );
    });

    it('TC0002 - Should send notification for EM_DIAGNOSTICO status', async () => {
      const data = {
        ...createMockStatusChangeData(),
        newStatus: ServiceOrderStatus.EM_DIAGNOSTICO,
      };

      const sendEmailSpy = jest.spyOn(service, 'sendEmail');

      const result = await service.sendStatusChangeNotification(data);

      expect(result).toBe(true);
      expect(sendEmailSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          text: expect.stringContaining('em diagnóstico'),
          html: expect.stringContaining('em diagnóstico'),
        }),
      );
    });

    it('TC0003 - Should send notification for AGUARDANDO_APROVACAO status', async () => {
      const data = {
        ...createMockStatusChangeData(),
        newStatus: ServiceOrderStatus.AGUARDANDO_APROVACAO,
      };

      const result = await service.sendStatusChangeNotification(data);

      expect(result).toBe(true);
    });

    it('TC0004 - Should send notification for EM_EXECUCAO status', async () => {
      const data = {
        ...createMockStatusChangeData(),
        newStatus: ServiceOrderStatus.EM_EXECUCAO,
      };

      const result = await service.sendStatusChangeNotification(data);

      expect(result).toBe(true);
    });

    it('TC0005 - Should send notification for FINALIZADA status', async () => {
      const data = {
        ...createMockStatusChangeData(),
        newStatus: ServiceOrderStatus.FINALIZADA,
      };

      const result = await service.sendStatusChangeNotification(data);

      expect(result).toBe(true);
    });

    it('TC0006 - Should send notification for ENTREGUE status', async () => {
      const data = {
        ...createMockStatusChangeData(),
        newStatus: ServiceOrderStatus.ENTREGUE,
      };

      const result = await service.sendStatusChangeNotification(data);

      expect(result).toBe(true);
    });

    it('TC0007 - Should send notification without orderLink', async () => {
      const { orderLink, ...dataWithoutLink } = createMockStatusChangeData();

      const sendEmailSpy = jest.spyOn(service, 'sendEmail');

      const result = await service.sendStatusChangeNotification(dataWithoutLink);

      expect(result).toBe(true);
      expect(sendEmailSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          text: expect.not.stringContaining('Acompanhe sua ordem'),
        }),
      );
    });

    it('TC0008 - Should use statusMessage when status not in predefined list', async () => {
      const data = {
        ...createMockStatusChangeData(),
        newStatus: 'CUSTOM_STATUS' as ServiceOrderStatus,
        statusMessage: faker.lorem.sentence(),
      };

      const sendEmailSpy = jest.spyOn(service, 'sendEmail');

      const result = await service.sendStatusChangeNotification(data);

      expect(result).toBe(true);
      expect(sendEmailSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          text: expect.stringContaining(data.statusMessage),
          html: expect.stringContaining(data.statusMessage),
        }),
      );
    });
  });

  describe('sendBudgetApprovalRequest', () => {
    it('TC0001 - Should send budget approval request successfully', async () => {
      const data = createMockBudgetData();

      const sendEmailSpy = jest.spyOn(service, 'sendEmail');

      const result = await service.sendBudgetApprovalRequest(data);

      expect(result).toBe(true);
      expect(sendEmailSpy).toHaveBeenCalledWith({
        to: data.customerEmail,
        subject: `Orçamento Disponível - OS ${data.orderNumber}`,
        text: expect.stringContaining(data.customerName),
        html: expect.stringContaining(data.customerName),
      });
      expect(sendEmailSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          text: expect.stringContaining(`R$ ${data.totalValue.toFixed(2)}`),
          html: expect.stringContaining(`R$ ${data.totalValue.toFixed(2)}`),
        }),
      );
      expect(sendEmailSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          text: expect.stringContaining(data.approvalLink),
          html: expect.stringContaining(data.approvalLink),
        }),
      );
    });

    it('TC0002 - Should send budget approval request with integer value', async () => {
      const data = {
        ...createMockBudgetData(),
        totalValue: 2000,
      };

      const sendEmailSpy = jest.spyOn(service, 'sendEmail');

      const result = await service.sendBudgetApprovalRequest(data);

      expect(result).toBe(true);
      expect(sendEmailSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          text: expect.stringContaining('R$ 2000.00'),
          html: expect.stringContaining('R$ 2000.00'),
        }),
      );
    });

    it('TC0003 - Should format total value with 2 decimal places', async () => {
      const data = {
        ...createMockBudgetData(),
        totalValue: 999.9,
      };

      const sendEmailSpy = jest.spyOn(service, 'sendEmail');

      const result = await service.sendBudgetApprovalRequest(data);

      expect(result).toBe(true);
      expect(sendEmailSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          text: expect.stringContaining('R$ 999.90'),
          html: expect.stringContaining('R$ 999.90'),
        }),
      );
    });

    it('TC0004 - Should include order number in subject', async () => {
      const data = createMockBudgetData();

      const sendEmailSpy = jest.spyOn(service, 'sendEmail');

      await service.sendBudgetApprovalRequest(data);

      expect(sendEmailSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: `Orçamento Disponível - OS ${data.orderNumber}`,
        }),
      );
    });

    it('TC0005 - Should include approval link in both text and html', async () => {
      const data = createMockBudgetData();

      const sendEmailSpy = jest.spyOn(service, 'sendEmail');

      await service.sendBudgetApprovalRequest(data);

      expect(sendEmailSpy).toHaveBeenCalledWith({
        to: data.customerEmail,
        subject: expect.any(String),
        text: expect.stringContaining(data.approvalLink),
        html: expect.stringContaining(data.approvalLink),
      });
    });
  });
});
