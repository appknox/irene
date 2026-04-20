import { request } from '@playwright/test';
import { API_ROUTES } from '../../support/api.routes';

export interface AuthTokens {
  token: string;
  user_id: number;
}

export default class TokenManager {
  private static tokens: AuthTokens | null = null;

  /**
   * Login and get tokens from real QA backend
   * Stores tokens for reuse across all API tests
   * Returns cached tokens if already fetched once
   */
  static async getTokens(): Promise<AuthTokens> {
    if (this.tokens) return this.tokens;

    const context = await request.newContext({
      baseURL: process.env.BASE_URL!,
    });

    const response = await context.post(API_ROUTES.login.route, {
      data: {
        username: process.env.TEST_USERNAME!,
        password: process.env.TEST_PASSWORD!,
      },
    });

    if (!response.ok()) {
      throw new Error(`Login failed with status ${response.status()}`);
    }

    const body = await response.json();
    this.tokens = {
      token: body.token,
      user_id: body.user_id,
    };

    await context.dispose();

    return this.tokens;
  }

  /**
   * Clear cached tokens
   */
  static clearTokens(): void {
    this.tokens = null;
  }
}
