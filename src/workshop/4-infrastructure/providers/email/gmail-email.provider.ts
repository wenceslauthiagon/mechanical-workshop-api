import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { NOTIFICATION_CONFIG } from '../../../../shared/config/notification.config';
import { NOTIFICATION_CONSTANTS } from '../../../../shared/constants/notification.constants';
import type {
  IEmailProvider,
  EmailData,
} from '../../../3-domain/interfaces/notification.interface';

@Injectable()
export class GmailEmailProvider implements IEmailProvider {
  private readonly logger = new Logger(GmailEmailProvider.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter(): void {
    try {
      this.transporter = nodemailer.createTransport({
        host: NOTIFICATION_CONFIG.GMAIL.HOST,
        port: NOTIFICATION_CONFIG.GMAIL.PORT,
        secure: NOTIFICATION_CONFIG.GMAIL.SECURE,
        auth: {
          user: NOTIFICATION_CONFIG.GMAIL.USER,
          pass: NOTIFICATION_CONFIG.GMAIL.PASS,
        },
        tls: {
          rejectUnauthorized: false,
        },
      });

      this.logger.log(NOTIFICATION_CONSTANTS.MESSAGES.TRANSPORTER_INITIALIZED);
    } catch (error) {
      this.logger.error(
        NOTIFICATION_CONSTANTS.MESSAGES.TRANSPORTER_FAILED,
        error,
      );
    }
  }

  async sendEmail(data: EmailData): Promise<void> {
    try {
      if (!this.transporter) {
        throw new Error(
          NOTIFICATION_CONSTANTS.MESSAGES.TRANSPORTER_NOT_INITIALIZED,
        );
      }

      const mailOptions = {
        from: `${NOTIFICATION_CONFIG.COMPANY.NAME} <${NOTIFICATION_CONFIG.COMPANY.EMAIL}>`,
        to: data.to,
        subject: data.subject,
        html: data.html,
        text: data.text,
        attachments: data.attachments,
      };

      const result = await this.transporter.sendMail(mailOptions);

      this.logger.log(
        `${NOTIFICATION_CONSTANTS.MESSAGES.EMAIL_SENT_SUCCESS} to ${data.to}`,
        {
          messageId: result.messageId,
          to: data.to,
          subject: data.subject,
        },
      );
    } catch (error) {
      this.logger.error(
        `${NOTIFICATION_CONSTANTS.MESSAGES.EMAIL_SENT_ERROR} to ${data.to}`,
        {
          error: error.message,
          to: data.to,
          subject: data.subject,
        },
      );
      throw new Error(
        `${NOTIFICATION_CONSTANTS.MESSAGES.EMAIL_SENT_ERROR}: ${error.message}`,
      );
    }
  }

  async verifyConnection(): Promise<boolean> {
    try {
      if (!this.transporter) {
        return false;
      }

      await this.transporter.verify();
      this.logger.log(NOTIFICATION_CONSTANTS.MESSAGES.CONNECTION_VERIFIED);
      return true;
    } catch (error) {
      this.logger.error(
        NOTIFICATION_CONSTANTS.MESSAGES.CONNECTION_FAILED,
        error,
      );
      return false;
    }
  }
}
