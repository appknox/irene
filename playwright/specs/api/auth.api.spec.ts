import { test } from '@playwright/test';
import { API_ROUTES } from '../../support/api.routes';
import RequestWrapper from '../../Actions/api/request.wrapper';
import ResponseValidator from '../../utils/response.validator';
import SchemaValidator from '../../utils/schema.validator';
import TokenManager from '../../Actions/api/token.manager';

let wrapper: RequestWrapper;

test.describe('Auth API ', () => {
  test.beforeAll(async () => {
    wrapper = new RequestWrapper();
    await wrapper.init();
  });

  test.afterAll(async () => {
    TokenManager.clearTokens();
    await wrapper.dispose();
  });

  test('POST /api/login — valid credentials returns token', async () => {
    const response = await wrapper.post({
      endpoint: API_ROUTES.login.route,
      body: {
        username: process.env.TEST_USERNAME!,
        password: process.env.TEST_PASSWORD!,
      },
    });

    const body = await ResponseValidator.validate(response, {
      status: 200,
      requiredFields: ['token', 'user_id'],
    });

    SchemaValidator.validate(body, {
      token: { type: 'string', required: true },
      user_id: { type: 'number', required: true },
    });
  });

  test('POST /api/login — invalid credentials returns 403', async () => {
    const response = await wrapper.post({
      endpoint: API_ROUTES.login.route,
      body: {
        username: 'invalid_user',
        password: 'wrong_password',
      },
    });

    await ResponseValidator.validate(response, {
      status: 403,
    });
  });

  test('POST /api/v2/sso/check — valid username returns 200', async () => {
    const response = await wrapper.post({
      endpoint: API_ROUTES.check.route,
      body: {
        username: process.env.TEST_USERNAME!,
      },
    });

    await ResponseValidator.validate(response, {
      status: 200,
    });
  });
});
