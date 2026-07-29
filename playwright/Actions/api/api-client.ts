import { APIRequestContext, request } from '@playwright/test';

export default class ApiClient {
  private context!: APIRequestContext;
  private baseURL: string;
  private token: string | null = null;
  private userId: string | number | null = null;

  constructor() {
    this.baseURL = process.env.BASE_URL!;
  }

  async init(): Promise<void> {
    this.context = await request.newContext({
      baseURL: this.baseURL,
      extraHTTPHeaders: {
        'Content-Type': 'application/json',
      },
    });
  }

  setToken(token: string, userId: string | number): void {
    this.token = token;
    this.userId = userId;
  }

  private getAuthHeaders(): Record<string, string> {
    if (!this.token) return {};
    const b64 = Buffer.from(`${this.userId}:${this.token}`).toString('base64');
    return {
      Authorization: `Basic ${b64}`,
    };
  }
  async get(endpoint: string) {
    return this.context.get(endpoint, {
      headers: this.getAuthHeaders(),
    });
  }

  async post(endpoint: string, body?: object) {
    return this.context.post(endpoint, {
      headers: this.getAuthHeaders(),
      ...(body && Object.keys(body).length > 0 ? { data: body } : {}), // ← only send data if body has content
    });
  }

  async put(endpoint: string, body?: object) {
    return this.context.put(endpoint, {
      headers: this.getAuthHeaders(),
      data: body,
    });
  }

  async delete(endpoint: string, body?: object) {
    return this.context.delete(endpoint, {
      headers: this.getAuthHeaders(),
      data: body,
    });
  }

  async dispose(): Promise<void> {
    await this.context.dispose();
  }
}
