#!/usr/bin/env node

import { AxiosError, AxiosResponse, AxiosInstance } from 'axios';
import { AxiosFactory } from '../../infrastructure/http/AxiosFactory';
import { APP_CONSTANTS, ENV_KEYS } from '../constants/app.constants';
import { HEALTH_CHECK_MESSAGES } from '../constants/messages.constants';

interface HealthCheckOptions {
  url: string;
  timeout: number;
  retries: number;
  retryDelay: number;
  expectedStatus?: number;
  userAgent?: string;
}

interface HealthResponse {
  status: string;
  timestamp: string;
  uptime?: number;
  service?: string;
  version?: string;
  environment?: string;
}

class HealthChecker {
  private readonly options: HealthCheckOptions;
  private readonly axiosInstance: AxiosInstance;

  constructor(options: Partial<HealthCheckOptions> = {}) {
    const host = process.env[ENV_KEYS.HOST] || APP_CONSTANTS.DEFAULT_HOST;
    const port = process.env[ENV_KEYS.PORT] || APP_CONSTANTS.DEFAULT_PORT;
    const displayHost = host === '0.0.0.0' ? 'localhost' : host;
    const defaultHealthUrl = `http://${displayHost}:${port}/health`;

    this.options = {
      url: process.env[ENV_KEYS.HEALTH_CHECK_URL] || defaultHealthUrl,
      timeout: parseInt(
        process.env[ENV_KEYS.HEALTH_CHECK_TIMEOUT] ||
          APP_CONSTANTS.DEFAULT_HEALTH_TIMEOUT.toString(),
        10,
      ),
      retries: parseInt(
        process.env[ENV_KEYS.HEALTH_CHECK_RETRIES] ||
          APP_CONSTANTS.DEFAULT_HEALTH_RETRIES.toString(),
        10,
      ),
      retryDelay: parseInt(
        process.env[ENV_KEYS.HEALTH_CHECK_RETRY_DELAY] ||
          APP_CONSTANTS.DEFAULT_HEALTH_RETRY_DELAY.toString(),
        10,
      ),
      expectedStatus: 200,
      userAgent: `HealthChecker/2.0 (${APP_CONSTANTS.APP_NAME})`,
      ...options,
    };

    this.axiosInstance = AxiosFactory.getInstance();
  }

  async check(): Promise<void> {
    for (let attempt = 1; attempt <= this.options.retries; attempt++) {
      try {
        await this.performHealthCheck();
        process.exit(0);
      } catch {
        if (attempt < this.options.retries) {
          await this.sleep(this.options.retryDelay);
        }
      }
    }

    process.exit(1);
  }

  private async performHealthCheck(): Promise<AxiosResponse<HealthResponse>> {
    try {
      const response = await this.axiosInstance.get<HealthResponse>(
        this.options.url,
        {
          timeout: this.options.timeout,
          headers: {
            'User-Agent': this.options.userAgent,
            Accept: 'application/json',
            'Cache-Control': 'no-cache',
            Connection: 'close',
          },
          validateStatus: (status) => status === this.options.expectedStatus,
          maxRedirects: 0,
        },
      );

      if (response.data && typeof response.data === 'object') {
        const healthData = response.data;

        if (healthData.status && healthData.status !== 'ok') {
          throw new Error(
            `${HEALTH_CHECK_MESSAGES.HEALTH_STATUS_NOT_OK}: ${healthData.status}`,
          );
        }
      }

      return response;
    } catch (error) {
      if (error instanceof AxiosError) {
        const axiosError = error as AxiosError;

        if (axiosError.code === 'ECONNREFUSED') {
          throw new Error(HEALTH_CHECK_MESSAGES.CONNECTION_REFUSED);
        }

        if (axiosError.code === 'ETIMEDOUT') {
          throw new Error(
            `${HEALTH_CHECK_MESSAGES.REQUEST_TIMEOUT} ${this.options.timeout}ms`,
          );
        }

        if (axiosError.response) {
          throw new Error(
            `${HEALTH_CHECK_MESSAGES.HTTP_ERROR} ${axiosError.response.status}: ${axiosError.response.statusText}`,
          );
        }

        throw new Error(
          `${HEALTH_CHECK_MESSAGES.NETWORK_ERROR}: ${axiosError.message}`,
        );
      }

      throw error;
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }
}

if (require.main === module) {
  const checker = new HealthChecker();
  checker.check().catch(() => {
    process.exit(1);
  });
}

export default HealthChecker;
