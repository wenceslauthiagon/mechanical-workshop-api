import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { APP_CONSTANTS, ENV_KEYS } from '../constants/app.constants';

export interface DatabaseConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  url: string;
}

export interface JwtConfig {
  secret: string;
  expiresIn: string;
  refreshExpiresIn: string;
}

export interface ServerConfig {
  port: number;
  host: string;
  nodeEnv: string;
}

export interface AdminUserConfig {
  username: string;
  email: string;
  password: string;
}

export interface HealthCheckConfig {
  url: string;
  timeout: number;
  retries: number;
  retryDelay: number;
}

export interface SwaggerConfig {
  title: string;
  description: string;
  version: string;
  path: string;
}

@Injectable()
export class AppConfigService {
  constructor(private readonly configService: ConfigService) {}

  get database(): DatabaseConfig {
    const url = this.configService.get<string>(ENV_KEYS.DATABASE_URL);
    if (!url) {
      throw new Error(`${ENV_KEYS.DATABASE_URL} is required`);
    }

    return {
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'mechanical_workshop',
      url,
    };
  }

  get jwt(): JwtConfig {
    const secret = this.configService.get<string>(ENV_KEYS.JWT_SECRET);
    if (!secret) {
      throw new Error(`${ENV_KEYS.JWT_SECRET} is required`);
    }

    return {
      secret,
      expiresIn: this.configService.get<string>(
        ENV_KEYS.JWT_EXPIRES_IN,
        APP_CONSTANTS.DEFAULT_JWT_EXPIRES_IN,
      ),
      refreshExpiresIn: this.configService.get<string>(
        'JWT_REFRESH_EXPIRES_IN',
        '7d',
      ),
    };
  }

  get server(): ServerConfig {
    return {
      port: this.configService.get<number>(
        ENV_KEYS.PORT,
        APP_CONSTANTS.DEFAULT_PORT,
      ),
      host: this.configService.get<string>(
        ENV_KEYS.HOST,
        APP_CONSTANTS.DEFAULT_HOST,
      ),
      nodeEnv: this.configService.get<string>(ENV_KEYS.NODE_ENV, 'development'),
    };
  }

  get adminUser(): AdminUserConfig {
    return {
      username: this.configService.get<string>(
        ENV_KEYS.ADMIN_USERNAME,
        APP_CONSTANTS.DEV_ADMIN.USERNAME,
      ),
      email: this.configService.get<string>(
        ENV_KEYS.ADMIN_EMAIL,
        APP_CONSTANTS.DEV_ADMIN.EMAIL,
      ),
      password: this.configService.get<string>(
        ENV_KEYS.ADMIN_PASSWORD,
        'ChangeMe123!',
      ),
    };
  }

  get healthCheck(): HealthCheckConfig {
    const { port, host } = this.server;
    const displayHost = host === '0.0.0.0' ? 'localhost' : host;
    const defaultUrl = `http://${displayHost}:${port}/health`;

    return {
      url: this.configService.get<string>(
        ENV_KEYS.HEALTH_CHECK_URL,
        defaultUrl,
      ),
      timeout: this.configService.get<number>(
        ENV_KEYS.HEALTH_CHECK_TIMEOUT,
        APP_CONSTANTS.DEFAULT_HEALTH_TIMEOUT,
      ),
      retries: this.configService.get<number>(
        ENV_KEYS.HEALTH_CHECK_RETRIES,
        APP_CONSTANTS.DEFAULT_HEALTH_RETRIES,
      ),
      retryDelay: this.configService.get<number>(
        ENV_KEYS.HEALTH_CHECK_RETRY_DELAY,
        APP_CONSTANTS.DEFAULT_HEALTH_RETRY_DELAY,
      ),
    };
  }

  get swagger(): SwaggerConfig {
    return {
      title: this.configService.get<string>(
        ENV_KEYS.SWAGGER_TITLE,
        APP_CONSTANTS.APP_NAME,
      ),
      description: this.configService.get<string>(
        ENV_KEYS.SWAGGER_DESCRIPTION,
        APP_CONSTANTS.APP_DESCRIPTION,
      ),
      version: this.configService.get<string>(
        ENV_KEYS.SWAGGER_VERSION,
        APP_CONSTANTS.APP_VERSION,
      ),
      path: this.configService.get<string>(
        ENV_KEYS.SWAGGER_PATH,
        APP_CONSTANTS.DEFAULT_SWAGGER_PATH,
      ),
    };
  }

  get isDevelopment(): boolean {
    return this.server.nodeEnv === 'development';
  }

  get isProduction(): boolean {
    return this.server.nodeEnv === 'production';
  }

  get isTest(): boolean {
    return this.server.nodeEnv === 'test';
  }

  private getDatabaseUrl(): string {
    const dbConfig = this.configService.get<string>('DATABASE_URL');
    if (dbConfig) {
      return dbConfig;
    }

    const { host, port, username, password, database } = this.database;
    return `postgresql://${username}:${password}@${host}:${port}/${database}?schema=public`;
  }

  validateConfig(): void {
    const requiredVars = [ENV_KEYS.JWT_SECRET];

    const missingVars = requiredVars.filter(
      (varName) => !this.configService.get(varName),
    );

    if (missingVars.length > 0) {
      throw new Error(
        `Missing required environment variables: ${missingVars.join(', ')}`,
      );
    }

    if (this.isProduction) {
      const jwtSecret = this.jwt.secret;
      if (
        !jwtSecret ||
        jwtSecret.length < APP_CONSTANTS.MIN_JWT_SECRET_LENGTH
      ) {
        throw new Error(
          `${ENV_KEYS.JWT_SECRET} must be at least ${APP_CONSTANTS.MIN_JWT_SECRET_LENGTH} characters long in production`,
        );
      }
    }
  }
}
