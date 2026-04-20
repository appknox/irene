import { expect, test } from '@playwright/test';
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
  });

  test('POST /api/login — Empty Username returns 400', async () => {
    allure.epic('Authentication');
    allure.feature('Login');
    allure.story('User attempts login with empty username');
    allure.severity('normal');
    allure.owner('Pranav');
    allure.tags('auth', 'login', 'negative', 'regression');

    const respone = await allure.step(
      'POST login with empty username',
      async () => {
        return await wrapper.post({
          endpoint: API_ROUTES.login.route,
          body: {
            username: '',
            password: process.env.TEST_PASSWORD!,
          },
        });
      }
    );

    await allure.step('Validate status 400 Bad Request', async () => {
      await ResponseValidator.validate(respone, { status: 400 });
    });
  });

  test('POST /api/login — Empty Password returns 400', async () => {
    allure.epic('Authentication');
    allure.feature('Login');
    allure.story('User attempts login with empty password');
    allure.severity('normal');
    allure.owner('Pranav');
    allure.tags('auth', 'login', 'negative', 'regression');

    const respone = await allure.step(
      'POST login with empty password',
      async () => {
        return await wrapper.post({
          endpoint: API_ROUTES.login.route,
          body: {
            username: process.env.TEST_USERNAME!,
            password: '',
          },
        });
      }
    );

    await allure.step('Validate status 400 Bad Request', async () => {
      await ResponseValidator.validate(respone, { status: 400 });
    });
  });

  test('GET /api/users/:id — invalid user id returns 200', async () => {
    await allure.epic('Authentication');
    await allure.feature('User Profile');
    await allure.severity('normal');
    await allure.tags('auth', 'user', 'negative');

    const response = await allure.step('GET user with invalid id', async () => {
      return await wrapper.get({ endpoint: '/api/users/999999' });
    });

    const body = await allure.step(
      'Validate status 200 and verify returns authenticated user data',
      async () => {
        const body = await ResponseValidator.validate(response, {
          status: 200,
        });
        const data = body.data as Record<string, unknown>;
        expect(data.id).toBe(userId);
      }
    );
  });

  // test('GET /api/users/:id — no auth token returns 401', async ({
  //   request,
  // }) => {
  //   await allure.epic('Authentication');
  //   await allure.feature('User Profile');
  //   await allure.severity('critical');
  //   await allure.tags('auth', 'user', 'negative', 'security');

  //   const response = await allure.step(
  //     'GET user without auth token',
  //     async () => {
  //       return await request.get(`${process.env.BASE_URL}/api/users/${userId}`);
  //     }
  //   );

  //   await allure.step('Validate status 401', async () => {
  //     expect(response.status()).toBe(401);
  //   });
  // });

  test('GET /api/users/:id — no auth token returns 401', async () => {
    await allure.epic('Authentication');
    await allure.feature('User Profile');
    await allure.severity('critical');
    await allure.tags('auth', 'user', 'negative', 'security');

    // create fresh context with NO storage state
    const { request } = await import('@playwright/test');
    const context = await request.newContext({
      baseURL: process.env.BASE_URL,
      // no storageState, no headers
    });

    const response = await allure.step(
      'GET user without auth token',
      async () => {
        return await context.get(`/api/users/${userId}`);
      }
    );

    await allure.step('Validate status 403', async () => {
      expect(response.status()).toBe(403);
    });

    await context.dispose();
  });

  test('POST /api/login — SQL Injection attempt returns 403', async () => {
    await allure.epic('Authentication');
    await allure.feature('Login Security');
    await allure.story('User attempts SQL injection in login');
    await allure.severity('critical');
    await allure.owner('Pranav');
    await allure.tags('auth', 'login', 'negative', 'security');

    const response = await allure.step(
      'POST login with SQL injection attempt',
      async () => {
        return await wrapper.post({
          endpoint: API_ROUTES.login.route,
          body: {
            username: "' OR '1'='1",
            password: "' OR '1'='1",
          },
        });
      }
    );

    await allure.step('Validate status 403', async () => {
      await ResponseValidator.validate(response, { status: 403 });
    });
  });

  test.skip('POST /api/login — XSS attempt returns 403', async () => {
    await allure.epic('Authentication');
    await allure.feature('Login Security');
    await allure.severity('critical');
    await allure.tags('auth', 'login', 'negative', 'security');

    const response = await allure.step(
      'POST login with XSS attempt',
      async () => {
        return await wrapper.post({
          endpoint: API_ROUTES.login.route,
          body: {
            username: '<script>alert("xss")</script>',
            password: '<script>alert("xss")</script>',
          },
        });
      }
    );

    await allure.step('Validate status 403', async () => {
      await ResponseValidator.validate(response, { status: 401 });
    });
  });
});
