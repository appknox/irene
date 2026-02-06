/**
 * Shared API client for both Ember and React apps
 * Wraps axios with authentication, error handling, and rate limiting
 */

import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import { sessionManager } from '../auth/session';
import type { APIError } from '../../types/api';

export interface APIClientConfig {
  baseURL: string;
  timeout?: number;
  onRateLimit?: (retryAfter: number) => void;
  onUnauthorized?: () => void;
}

export class APIClient {
  private client: AxiosInstance;
  private config: APIClientConfig;

  constructor(config: APIClientConfig) {
    this.config = {
      timeout: 30000,
      ...config,
    };

    this.client = axios.create({
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor - add authentication header
    this.client.interceptors.request.use(
      (config) => {
        const session = sessionManager.getSession();

        if (session?.b64token) {
          config.headers.Authorization = `Basic ${session.b64token}`;
        }

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor - handle errors
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError<APIError>) => {
        // Handle 401 Unauthorized
        if (error.response?.status === 401) {
          sessionManager.clearSession();

          if (this.config.onUnauthorized) {
            this.config.onUnauthorized();
          } else {
            // Redirect to login
            window.location.href = '/login';
          }
        }

        // Handle 429 Rate Limit
        if (error.response?.status === 429) {
          const retryAfter = parseInt(
            error.response.headers['retry-after'] || '60',
            10
          );

          if (this.config.onRateLimit) {
            this.config.onRateLimit(retryAfter);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  /**
   * GET request
   */
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  /**
   * POST request
   */
  async post<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  /**
   * PUT request
   */
  async put<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  /**
   * PATCH request
   */
  async patch<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.client.patch<T>(url, data, config);
    return response.data;
  }

  /**
   * DELETE request
   */
  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }

  /**
   * Get the underlying axios instance
   */
  getAxiosInstance(): AxiosInstance {
    return this.client;
  }
}

// Create default client instance
export const apiClient = new APIClient({
  baseURL: import.meta.env.VITE_API_HOST || 'http://localhost:8000',
  onRateLimit: (retryAfter) => {
    console.warn(`Rate limited. Retry after ${retryAfter} seconds`);
  },
});
