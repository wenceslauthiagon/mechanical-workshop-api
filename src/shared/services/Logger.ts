import winston, { Logger as WinstonLogger, format } from 'winston';

interface LogConfig {
  levels: winston.config.AbstractConfigSetLevels;
  colors: Record<string, string>;
}

interface LogMetadata {
  context?: string;
  payload?: unknown;
  stack?: string;
  trace?: string;
}

const LOG_LEVELS: LogConfig = {
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3,
  },
  colors: {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    debug: 'blue',
  },
};

const LOG_CONFIG = {
  DEFAULT_LEVEL: 'info',
  TIMESTAMP_FORMAT: 'YYYY-MM-DD HH:mm:ss.SSS',
  FILE_NAME: 'logs/app.log',
  ERROR_FILE_NAME: 'logs/error.log',
  APP_LABEL: 'PET-MANAGEMENT-API',
};

export class Logger {
  private winstonLogger: WinstonLogger;

  constructor() {
    winston.addColors(LOG_LEVELS.colors);

    this.winstonLogger = winston.createLogger({
      levels: LOG_LEVELS.levels,
      level: process.env.LOG_LEVEL || LOG_CONFIG.DEFAULT_LEVEL,
      format: format.combine(
        format.errors({ stack: true }),
        format.timestamp({ format: LOG_CONFIG.TIMESTAMP_FORMAT }),
        format.json(),
      ),
      transports: [
        new winston.transports.Console({
          format: format.combine(
            format.label({ label: LOG_CONFIG.APP_LABEL }),
            format.timestamp({ format: LOG_CONFIG.TIMESTAMP_FORMAT }),
            format.errors({ stack: true }),
            format.printf(this.formatConsoleLog),
            format.colorize({ all: true }),
          ),
        }),
        new winston.transports.File({
          filename: LOG_CONFIG.FILE_NAME,
          level: 'debug',
        }),
        new winston.transports.File({
          filename: LOG_CONFIG.ERROR_FILE_NAME,
          level: 'error',
        }),
      ],
    });
  }

  private formatConsoleLog = (info: winston.Logform.TransformableInfo): string => {
    const { level, message, label, context, timestamp, payload, stack, trace } = info as {
      level: string;
      message: string;
      label: string;
      context?: string;
      timestamp: string;
      payload?: unknown;
      stack?: string;
      trace?: string;
    };

    const contextInfo = context ? `[${context}]` : '';
    const payloadInfo = payload ? `\npayload: ${JSON.stringify(payload, null, 2)}` : '';
    const stackInfo = stack ? `\n${stack}` : '';
    const traceInfo = trace ? `\n${trace}` : '';

    return `[${level}] [${label}] ${contextInfo} ${message} - ${timestamp}${payloadInfo}${stackInfo}${traceInfo}`;
  };

  error(message: string, stack?: string, context?: string): void {
    this.winstonLogger.error(message, { stack, context } as LogMetadata);
  }

  warn(message: string, context?: string, payload?: unknown): void {
    this.winstonLogger.warn(message, { context, payload } as LogMetadata);
  }

  info(message: string, context?: string, payload?: unknown): void {
    this.winstonLogger.info(message, { context, payload } as LogMetadata);
  }

  debug(message: string, context?: string, payload?: unknown): void {
    this.winstonLogger.debug(message, { context, payload } as LogMetadata);
  }

  log(message: string, context?: string): void {
    this.info(message, context);
  }
}

export const logger = new Logger();
