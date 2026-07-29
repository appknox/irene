import { APIResponse } from '@playwright/test';
import { expect } from '@playwright/test';

export interface ValidationOptions {
  status: number;
  requiredFields?: string[];
}

export default class ResponseValidator {
  /**
   * Validate response status and required fields
   * Reusable across all API tests
   *
   * @example
   * await ResponseValidator.validate(response, {
   *   status: 200,
   *   requiredFields: ['token', 'b64token']
   * });
   */
  static async validate(
    response: APIResponse,
    opts: ValidationOptions
  ): Promise<Record<string, unknown>> {
    // Validate status code
    expect(
      response.status(),
      `Expected status ${opts.status} but got ${response.status()} for ${response.url()}`
    ).toBe(opts.status);

    // Parse response body
    const body = await response.json();

    // Validate required fields exist in response
    if (opts.requiredFields) {
      for (const field of opts.requiredFields) {
        expect(
          body,
          `Expected field '${field}' in response from ${response.url()}`
        ).toHaveProperty(field);
      }
    }

    return body;
  }

  /**
   * Validate paginated response structure
   *  Checks for 'count' and 'results' fields, and that 'results' is an array
   *  Can be extended to validate pagination links (next, previous) if needed
   */
  static async validatePaginated(
    response: APIResponse,
    opts: { status?: number } = {}
  ): Promise<Record<string, unknown>> {
    const body = await this.validate(response, {
      status: opts.status ?? 200,
      requiredFields: ['count', 'results'],
    });

    expect(Array.isArray(body.results)).toBe(true);

    return body;
  }
}
