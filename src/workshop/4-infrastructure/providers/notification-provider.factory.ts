import { Injectable } from '@nestjs/common';
import { NOTIFICATION_CONFIG } from '../../../shared/config/notification.config';
import { NOTIFICATION_CONSTANTS } from '../../../shared/constants/notification.constants';
import type {
  IEmailProvider,
  ISmsProvider,
} from '../../3-domain/interfaces/notification.interface';

import { GmailEmailProvider } from './email/gmail-email.provider';
import { MockSmsProvider } from './sms/mock-sms.provider';

@Injectable()
export class NotificationProviderFactory {
  createEmailProvider(): IEmailProvider {
    switch (NOTIFICATION_CONFIG.PROVIDERS.EMAIL) {
      case 'gmail':
        return new GmailEmailProvider();
      default:
        throw new Error(
          `${NOTIFICATION_CONSTANTS.MESSAGES.UNSUPPORTED_PROVIDER}: ${NOTIFICATION_CONFIG.PROVIDERS.EMAIL}`,
        );
    }
  }

  createSmsProvider(): ISmsProvider {
    switch (NOTIFICATION_CONFIG.PROVIDERS.SMS) {
      case 'mock':
        return new MockSmsProvider();
      default:
        throw new Error(
          `${NOTIFICATION_CONSTANTS.MESSAGES.UNSUPPORTED_PROVIDER}: ${NOTIFICATION_CONFIG.PROVIDERS.SMS}`,
        );
    }
  }
}
