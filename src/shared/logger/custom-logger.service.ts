import { LoggerService } from '@nestjs/common';
import { format, createLogger, transports, Logger } from 'winston';

export class CustomLogger implements LoggerService {
  private logger: Logger;

  constructor() {
    this.logger = createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: format.combine(
        format.timestamp(),
        format.errors({ stack: true }),
        format.json(),
        format.prettyPrint(),
      ),
      defaultMeta: {
        service: 'mechanical-workshop-api',
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development',
      },
      transports: [
        new transports.Console({
          format: format.combine(
            format.colorize(),
            format.simple(),
            format.printf(({ timestamp, level, message, ...meta }) => {
              const metaStr = Object.keys(meta).length
                ? JSON.stringify(meta, null, 2)
                : '';
              return `${String(timestamp)} [${String(level)}]: ${String(message)} ${metaStr}`;
            }),
          ),
        }),
        new transports.File({
          filename: 'logs/error.log',
          level: 'error',
          format: format.json(),
        }),
        new transports.File({
          filename: 'logs/combined.log',
          format: format.json(),
        }),
      ],
      exceptionHandlers: [
        new transports.File({ filename: 'logs/exceptions.log' }),
      ],
      rejectionHandlers: [
        new transports.File({ filename: 'logs/rejections.log' }),
      ],
    });
  }

  log(message: string, context?: string) {
    this.logger.info(message, { context });
  }

  error(message: string, trace?: string, context?: string) {
    this.logger.error(message, { trace, context });
  }

  warn(message: string, context?: string) {
    this.logger.warn(message, { context });
  }

  debug(message: string, context?: string) {
    this.logger.debug(message, { context });
  }

  verbose(message: string, context?: string) {
    this.logger.verbose(message, { context });
  }
}
