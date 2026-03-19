import { test } from '@playwright/test';
import * as allure from 'allure-js-commons';
import { API_ROUTES } from '../../support/api.routes';
import RequestWrapper from '../../Actions/api/request.wrapper';
import ResponseValidator from '../../utils/response.validator';
import SchemaValidator from '../../utils/schema.validator';
import TokenManager from '../../Actions/api/token.manager';

let wrapper: RequestWrapper;
let userId: string | number;

test.describe('Auth API', () => {
  test.beforeAll(async () => {
    wrapper = new RequestWrapper();
    await wrapper.init();
    const tokens = await TokenManager.getTokens();
    userId = tokens.user_id;
  });

  test.afterAll(async () => {
    TokenManager.clearTokens();
    await wrapper.dispose();
  });

  test('POST /api/login — valid credentials returns token', async () => {
    await allure.epic('Authentication');
    await allure.feature('Login');
    await allure.story('User logs in with valid credentials');
    await allure.severity('critical');
    await allure.owner('Pranav');
    await allure.tags('auth', 'login', 'smoke', 'positive');
    await allure.description(`
      Verifies that a valid username and password returns:
      - HTTP 200
      - token (string)
      - user_id (number)
    `);

    const response = await allure.step(
      'POST login with valid credentials',
      async () => {
        return await wrapper.post({
          endpoint: API_ROUTES.login.route,
          body: {
            username: process.env.TEST_USERNAME!,
            password: process.env.TEST_PASSWORD!,
          },
        });
      }
    );

    const body = await allure.step(
      'Validate status 200 and required fields',
      async () => {
        return await ResponseValidator.validate(response, {
          status: 200,
          requiredFields: ['token', 'user_id'],
        });
      }
    );

    await allure.step('Validate response schema', async () => {
      SchemaValidator.validate(body, {
        token: { type: 'string', required: true },
        user_id: { type: 'number', required: true },
      });
    });
  });

  test('POST /api/login — invalid credentials returns 401', async () => {
    await allure.epic('Authentication');
    await allure.feature('Login');
    await allure.story('User logs in with invalid credentials');
    await allure.severity('critical');
    await allure.owner('Pranav');
    await allure.tags('auth', 'login', 'negative', 'regression');
    await allure.description(`
      Verifies that wrong username and password returns:
      - HTTP 403 Forbidden
      Backend must reject invalid credentials correctly.
    `);

    const response = await allure.step(
      'POST login with invalid credentials',
      async () => {
        return await wrapper.post({
          endpoint: API_ROUTES.login.route,
          body: {
            username: 'invalid_user',
            password: 'wrong_password',
          },
        });
      }
    );

    await allure.step('Validate status 403 Forbidden', async () => {
      await ResponseValidator.validate(response, { status: 403 });
    });
  });

  test('GET /api/users — authenticated user returns correct schema', async () => {
    await allure.epic('Authentication');
    await allure.feature('User Profile');
    await allure.story('Authenticated user fetches their profile');
    await allure.severity('normal');
    await allure.owner('Pranav');
    await allure.tags('auth', 'user', 'profile', 'smoke');
    await allure.description(`
      Verifies that an authenticated user can fetch their profile and response contains:
      - HTTP 200
      - data.attributes.username (string)
      - data.attributes.email (string)
      - data.attributes.lang (string)
    `);

    const tokens = await TokenManager.getTokens();

    const testWrapper = new RequestWrapper();
    await testWrapper.init();

    const response = await allure.step(
      `GET /api/users/${tokens.user_id}`,
      async () => {
        return await testWrapper.get({
          endpoint: `/api/users/${tokens.user_id}`,
        });
      }
    );

    const body = await allure.step(
      'Validate status 200 and required fields',
      async () => {
        return await ResponseValidator.validate(response, {
          status: 200,
          requiredFields: ['data'],
        });
      }
    );

    await allure.step('Validate user attributes schema', async () => {
      const data = body.data as Record<string, unknown>;
      const attributes = data.attributes as Record<string, unknown>;

      SchemaValidator.validate(attributes, {
        username: { type: 'string', required: true },
        email: { type: 'string', required: true },
        lang: { type: 'string', required: true },
      });
    });

    await testWrapper.dispose();
  });
});
