#!/usr/bin/env node

import { AxiosError, AxiosResponse, AxiosInstance } from 'axios';
import { AxiosFactory } from '../../infrastructure/http/AxiosFactory';
import { APP_CONSTANTS, ENV_KEYS } from '../constants/app.constants';

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

    // Use the professional AxiosFactory instead of raw axios
    this.axiosInstance = AxiosFactory.getInstance();
  }

  async check(): Promise<void> {
    const startTime = Date.now();
    let lastError: Error | null = null;

    console.log(`Starting health check for: ${this.options.url}`);

    for (let attempt = 1; attempt <= this.options.retries; attempt++) {
      try {
        const response = await this.performHealthCheck();
        const duration = Date.now() - startTime;

        console.log(`Health check passed on attempt ${attempt}`);
        console.log(`Response time: ${duration}ms`);
        console.log(`Response: ${JSON.stringify(response.data, null, 2)}`);

        process.exit(0);
      } catch (error) {
        lastError = error as Error;
        const duration = Date.now() - startTime;

        console.warn(
          `Health check failed on attempt ${attempt}/${this.options.retries} (${duration}ms)`,
        );
        console.warn(`Error: ${lastError.message}`);

        if (attempt < this.options.retries) {
          console.log(`Retrying in ${this.options.retryDelay}ms...`);
          await this.sleep(this.options.retryDelay);
        }
      }
    }

    const totalDuration = Date.now() - startTime;
    console.error(
      `Health check failed after ${this.options.retries} attempts (${totalDuration}ms)`,
    );
    console.error(`Final error: ${lastError?.message || 'Unknown error'}`);

    if (lastError instanceof AxiosError) {
      console.error(`Status: ${lastError.response?.status || 'No response'}`);
      console.error(
        `Response: ${JSON.stringify(lastError.response?.data || 'No data', null, 2)}`,
      );
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
          maxRedirects: 0, // Don't follow redirects in health checks
        },
      );

      // Validate response structure if it's JSON
      if (response.data && typeof response.data === 'object') {
        const healthData = response.data;

        // Basic validation of health response
        if (healthData.status && healthData.status !== 'ok') {
          throw new Error(`Health status is not ok: ${healthData.status}`);
        }
      }

      return response;
    } catch (error) {
      if (error instanceof AxiosError) {
        const axiosError = error as AxiosError;

        if (axiosError.code === 'ECONNREFUSED') {
          throw new Error('Connection refused - service may be down');
        }

        if (axiosError.code === 'ETIMEDOUT') {
          throw new Error(`Request timeout after ${this.options.timeout}ms`);
        }

        if (axiosError.response) {
          throw new Error(
            `HTTP ${axiosError.response.status}: ${axiosError.response.statusText}`,
          );
        }

        throw new Error(`Network error: ${axiosError.message}`);
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

// Execute health check if this file is run directly
if (require.main === module) {
  const checker = new HealthChecker();
  checker.check().catch((error) => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });
}

export default HealthChecker;
