import { Injectable, Logger } from '@nestjs/common';
import { NOTIFICATION_CONSTANTS } from '../../../../shared/constants/notification.constants';
import type {
  ISmsProvider,
  SmsData,
} from '../../../3-domain/interfaces/notification.interface';

@Injectable()
export class MockSmsProvider implements ISmsProvider {
  private readonly logger = new Logger(MockSmsProvider.name);

  async sendSms(data: SmsData): Promise<void> {
    try {
      this.logger.log(
        `${NOTIFICATION_CONSTANTS.MESSAGES.MOCK_SMS_PREFIX} Would send SMS to ${data.phone}`,
        {
          phone: data.phone,
          message: data.message,
          provider: NOTIFICATION_CONSTANTS.SMS.PROVIDER,
        },
      );

      await new Promise((resolve) =>
        setTimeout(resolve, NOTIFICATION_CONSTANTS.SMS.MOCK_DELAY),
      );

      this.logger.log(
        `${NOTIFICATION_CONSTANTS.MESSAGES.MOCK_SMS_PREFIX} ${NOTIFICATION_CONSTANTS.MESSAGES.SMS_SENT_SUCCESS} to ${data.phone}`,
      );
    } catch (error) {
      this.logger.error(
        `${NOTIFICATION_CONSTANTS.MESSAGES.MOCK_SMS_PREFIX} ${NOTIFICATION_CONSTANTS.MESSAGES.SMS_SENT_ERROR} to ${data.phone}`,
        {
          error: error.message,
          phone: data.phone,
          message: data.message,
        },
      );
      throw new Error(
        `${NOTIFICATION_CONSTANTS.MESSAGES.SMS_SENT_ERROR}: ${error.message}`,
      );
    }
  }

  async verifyConnection(): Promise<boolean> {
    this.logger.log(
      `${NOTIFICATION_CONSTANTS.MESSAGES.MOCK_SMS_PREFIX} ${NOTIFICATION_CONSTANTS.MESSAGES.MOCK_SMS_CONNECTION}`,
    );
    return true;
  }
}
