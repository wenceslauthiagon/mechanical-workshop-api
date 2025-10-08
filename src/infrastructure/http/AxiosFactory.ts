import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import http from 'http';
import https from 'https';

@Injectable()
export class AxiosFactory {
  private static instance: AxiosFactory | null = null;
  private axiosInstance: AxiosInstance;

  private constructor() {
    this.axiosInstance = axios.create({
      timeout: 60000, // Request timeout ps: this prevents ECONNRESET errors by timeout
      headers: {
        'Content-Type': 'application/json',
      },
      maxRedirects: 10,
      maxContentLength: 50 * 1000 * 1000,
      /**
       * The following options (httpAgent and httpsAgent) are used to prevent ECONNRESET errors
       * Reference: https://www.squash.io/how-to-fix-error-econnreset-in-nodejs/#:~:text=If%20you%20are%20running%20a%20Node.js%20server%20and%20encountering
       * */
      httpAgent: new http.Agent({ keepAlive: true }),
      httpsAgent: new https.Agent({ keepAlive: true }),
    });

    // Add any request or response interceptors here
    this.axiosInstance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        // Modify request config if needed
        return config;
      },
      (error) => {
        return Promise.reject(
          error instanceof Error ? error : new Error(String(error)),
        );
      },
    );

    this.axiosInstance.interceptors.response.use(
      (response) => {
        // Modify response data if needed
        return response;
      },
      (error) => {
        return Promise.reject(
          error instanceof Error ? error : new Error(String(error)),
        );
      },
    );
  }

  public static getInstance(): AxiosInstance {
    if (!AxiosFactory.instance) {
      AxiosFactory.instance = new AxiosFactory();
    }

    return AxiosFactory.instance.axiosInstance;
  }
}
