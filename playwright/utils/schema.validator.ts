import { expect } from '@playwright/test';

type SchemaType = 'string' | 'number' | 'boolean' | 'object' | 'array';

export interface SchemaField {
  type: SchemaType;
  required?: boolean;
}

export interface Schema {
  [field: string]: SchemaField;
}

export default class SchemaValidator {
  /**
   * Validates response body matches expected schema
   * Catches API contract breaks immediately
   *
   * @example
   * SchemaValidator.validate(body, {
   *   token: { type: 'string', required: true },
   *   b64token: { type: 'string', required: true },
   * });
   */
  static validate(body: Record<string, unknown>, schema: Schema): void {
    for (const [field, rules] of Object.entries(schema)) {
      // Check required fields exist
      if (rules.required) {
        expect(
          body,
          `Schema violation: required field '${field}' is missing`
        ).toHaveProperty(field);
      }

      // Skip type check if field not present and not required
      if (!(field in body)) continue;

      const value = body[field];

      // Check correct type
      if (rules.type === 'array') {
        expect(
          Array.isArray(value),
          `Schema violation: '${field}' should be array but got ${typeof value}`
        ).toBe(true);
      } else {
        expect(
          typeof value,
          `Schema violation: '${field}' should be ${rules.type} but got ${typeof value}`
        ).toBe(rules.type);
      }
    }
  }
}
