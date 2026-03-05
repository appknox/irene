import { APIRequestContext, request } from '@playwright/test';

export default class ApiClient {
  private context!: APIRequestContext;
  private baseURL: string;
  private token: string | null = null;

  constructor() {
    this.baseURL = process.env.BASE_URL!;
  }

  /**
   * Initialize API context
   * Call in beforeAll
   */
  async init(): Promise<void> {
    this.context = await request.newContext({
      baseURL: this.baseURL,
      extraHTTPHeaders: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Set auth token for all subsequent requests
   * Call after successful login to set token for API calls
   */
  setToken(token: string): void {
    this.token = token;
  }

  /**
   * Get auth headers
   */
  private getAuthHeaders(): Record<string, string> {
    if (!this.token) return {};
    return {
      Authorization: `Basic ${this.token}`,
    };
  }

  /**
   * GET request
   */
  async get(endpoint: string) {
    const response = await this.context.get(endpoint, {
      headers: this.getAuthHeaders(),
    });
    return response;
  }

  /**
   * POST request
   */
  async post(endpoint: string, body?: object) {
    const response = await this.context.post(endpoint, {
      headers: this.getAuthHeaders(),
      data: body,
    });
    return response;
  }

  /**
   * PUT request
   */
  async put(endpoint: string, body?: object) {
    const response = await this.context.put(endpoint, {
      headers: this.getAuthHeaders(),
      data: body,
    });
    return response;
  }

  /**
   * DELETE request
   */
  async delete(endpoint: string) {
    const response = await this.context.delete(endpoint, {
      headers: this.getAuthHeaders(),
    });
    return response;
  }

  /**
   * Dispose context after tests
   * Call in afterAll
   */
  async dispose(): Promise<void> {
    await this.context.dispose();
  }
}
