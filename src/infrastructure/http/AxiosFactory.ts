import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import * as http from 'http';
import * as https from 'https';

export class AxiosFactory {
  private static instance: AxiosInstance | null = null;

  static getInstance(config?: AxiosRequestConfig): AxiosInstance {
    if (!this.instance) {
      this.instance = axios.create({
        timeout: 60000,
        maxContentLength: 50000000,
        maxRedirects: 10,
        headers: {
          'Content-Type': 'application/json',
        },
        httpAgent: new http.Agent({ keepAlive: true }),
        httpsAgent: new https.Agent({ keepAlive: true }),
        ...config,
      });

      // Request interceptor
      this.instance.interceptors.request.use(
        (config) => {
          return config;
        },
        (error) => {
          return Promise.reject(error);
        },
      );

      // Response interceptor
      this.instance.interceptors.response.use(
        (response) => {
          return response;
        },
        (error) => {
          return Promise.reject(error);
        },
      );
    }
    return this.instance;
  }

  static create(config?: AxiosRequestConfig): AxiosInstance {
    return axios.create({
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
      ...config,
    });
  }

  static createWithAuth(token: string, config?: AxiosRequestConfig): AxiosInstance {
    return axios.create({
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      ...config,
    });
  }
}
