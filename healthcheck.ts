import * as http from 'http';
import { APP_CONSTANTS, ENV_KEYS } from './src/shared/constants/app.constants';

interface HealthCheckOptions {
  url: string;
  timeout: number;
  retries: number;
  retryDelay: number;
}

class HealthChecker {
  private readonly options: HealthCheckOptions;

  constructor(options: Partial<HealthCheckOptions> = {}) {
    this.options = {
      url:
        process.env[ENV_KEYS.HEALTH_CHECK_URL] ||
        APP_CONSTANTS.DEFAULT_HEALTH_URL,
      timeout: parseInt(
        process.env[ENV_KEYS.HEALTH_CHECK_TIMEOUT] ||
          APP_CONSTANTS.DEFAULT_HEALTH_TIMEOUT.toString(),
        APP_CONSTANTS.RADIX_BASE_10,
      ),
      retries: parseInt(
        process.env[ENV_KEYS.HEALTH_CHECK_RETRIES] ||
          APP_CONSTANTS.DEFAULT_HEALTH_RETRIES.toString(),
        APP_CONSTANTS.RADIX_BASE_10,
      ),
      retryDelay: parseInt(
        process.env[ENV_KEYS.HEALTH_CHECK_RETRY_DELAY] ||
          APP_CONSTANTS.DEFAULT_HEALTH_RETRY_DELAY.toString(),
        APP_CONSTANTS.RADIX_BASE_10,
      ),
      ...options,
    };
  }

  async check(): Promise<void> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.options.retries; attempt++) {
      try {
        await this.performHealthCheck();
        return;
      } catch (error) {
        lastError = error as Error;
        console.warn(
          `Health check failed on attempt ${attempt}/${this.options.retries}: ${lastError.message}`,
        );

        if (attempt < this.options.retries) {
          await this.sleep(this.options.retryDelay);
        }
      }
    }

    console.error(`Last error: ${lastError?.message || 'Unknown error'}`);
    throw new Error(
      `Health check failed after ${this.options.retries} attempts`,
    );
  }

  private async performHealthCheck(): Promise<void> {
    return new Promise((resolve, reject) => {
      const url = new URL(this.options.url);

      const requestOptions: http.RequestOptions = {
        hostname: url.hostname,
        port: url.port || (url.protocol === 'https:' ? 443 : 80),
        path: url.pathname + url.search,
        method: 'GET',
        timeout: this.options.timeout,
        headers: {
          'User-Agent': 'HealthChecker/1.0',
          Accept: 'application/json',
        },
      };

      const request = http.request(requestOptions, (response) => {
        let data = '';

        response.on('data', (chunk) => {
          data += chunk;
        });

        response.on('end', () => {
          if (response.statusCode === 200) {
            try {
              JSON.parse(data) as { status?: string };
              resolve();
            } catch {
              resolve();
            }
          } else {
            reject(
              new Error(
                `HTTP ${response.statusCode}: ${response.statusMessage || 'Unknown error'}`,
              ),
            );
          }
        });
      });

      request.on('error', (error) => {
        reject(new Error(`Network error: ${error.message}`));
      });

      request.on('timeout', () => {
        request.destroy();
        reject(new Error(`Request timeout after ${this.options.timeout}ms`));
      });

      request.end();
    });
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }
}

if (require.main === module) {
  const checker = new HealthChecker();
  checker.check().catch((error) => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });
}
