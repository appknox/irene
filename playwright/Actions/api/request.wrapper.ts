import { APIResponse } from '@playwright/test';
import ApiClient from './api-client';
import TokenManager from './token.manager';

export interface RequestOptions {
  endpoint: string;
  body?: object;
  requiresAuth?: boolean;
}

export default class RequestWrapper {
  private client: ApiClient;

  constructor() {
    this.client = new ApiClient();
  }

  /**
   * Initialize client and attach auth token
   */
  async init(): Promise<void> {
    await this.client.init();

    const { token, user_id } = await TokenManager.getTokens();
    this.client.setToken(token, user_id);
  }

  /**
   * GET request with logging
   */
  async get(opts: RequestOptions): Promise<APIResponse> {
    console.log(`[GET] ${opts.endpoint}`);

    const response = await this.client.get(opts.endpoint);

    console.log(`[GET] ${opts.endpoint} → ${response.status()}`);

    return response;
  }

  /**
   * POST request with logging
   */
  async post(opts: RequestOptions): Promise<APIResponse> {
    console.log(`[POST] ${opts.endpoint}`);

    const response = await this.client.post(opts.endpoint, opts.body);

    console.log(`[POST] ${opts.endpoint} → ${response.status()}`);

    return response;
  }

  /**
   * PUT request with logging
   */
  async put(opts: RequestOptions): Promise<APIResponse> {
    console.log(`[PUT] ${opts.endpoint}`);

    const response = await this.client.put(opts.endpoint, opts.body);

    console.log(`[PUT] ${opts.endpoint} → ${response.status()}`);

    return response;
  }

  /**
   * DELETE request with logging
   */
  async delete(opts: RequestOptions): Promise<APIResponse> {
    console.log(`[DELETE] ${opts.endpoint}`);

    const response = await this.client.delete(opts.endpoint, opts.body);

    console.log(`[DELETE] ${opts.endpoint} → ${response.status()}`);

    return response;
  }

  /**
   * Dispose client after tests
   */
  async dispose(): Promise<void> {
    await this.client.dispose();
  }
}
