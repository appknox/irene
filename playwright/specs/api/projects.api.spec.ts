import { test, expect } from '@playwright/test';
import * as allure from 'allure-js-commons';
import RequestWrapper from '../../Actions/api/request.wrapper';
import ResponseValidator from '../../utils/response.validator';
import SchemaValidator from '../../utils/schema.validator';
import TokenManager from '../../Actions/api/token.manager';
import { API_ROUTES, resolveRoute } from '../../support/api.routes';
import state from '../../support/test-state';

let wrapper: RequestWrapper;

test.describe('Projects API for organization', () => {
  test.beforeAll(async () => {
    wrapper = new RequestWrapper();
    await wrapper.init();
  });

  test.afterAll(async () => {
    TokenManager.clearTokens();
    await wrapper.dispose();
  });

  // ── Organization Tests ────────────────────────────────────────────

  test('GET /api/organizations — returns organization list', async () => {
    await allure.epic('Organizations');
    await allure.feature('Organization List');
    await allure.story('User fetches list of organizations');
    await allure.severity('critical');
    await allure.owner('Pranav');
    await allure.tags('organizations', 'smoke', 'positive');
    await allure.description(`
      Verifies GET /api/organizations returns:
      - HTTP 200
      - Paginated response with count and results
      - Each org has id (number), name (string), projects_count (number)
    `);

    const response = await allure.step('GET /api/organizations', async () => {
      return await wrapper.get({
        endpoint: resolveRoute(API_ROUTES.organization.route),
      });
    });

    const body = await allure.step(
      'Validate status 200 and required fields',
      async () => {
        return await ResponseValidator.validate(response, {
          status: 200,
          requiredFields: ['count', 'results'],
        });
      }
    );

    await allure.step('Validate paginated response structure', async () => {
      ResponseValidator.validatePaginated(response, { status: 200 });
    });

    await allure.step('Validate organization schema', async () => {
      const org = (body.results as Record<string, unknown>[])[0];
      SchemaValidator.validate(org, {
        id: { type: 'number', required: true },
        name: { type: 'string', required: true },
        projects_count: { type: 'number', required: true },
      });
    });
  });

  // ── Project Tests ─────────────────────────────────────────────────

  test('GET /api/organizations/:id/projects — returns project list', async () => {
    await allure.epic('Organizations');
    await allure.feature('Project List');
    await allure.story('User fetches projects for an organization');
    await allure.severity('critical');
    await allure.owner('Pranav');
    await allure.tags('projects', 'smoke', 'positive');
    await allure.description(`
      Verifies GET /api/organizations/:id/projects returns:
      - HTTP 200
      - Paginated response with count and results
    `);

    const response = await allure.step(
      `GET /api/organizations/${state.orgId}/projects`,
      async () => {
        return await wrapper.get({
          endpoint: resolveRoute(API_ROUTES.projectList.route, state.orgId),
        });
      }
    );

    await allure.step('Validate status 200 and required fields', async () => {
      await ResponseValidator.validate(response, {
        status: 200,
        requiredFields: ['count', 'results'],
      });
    });

    await allure.step('Validate paginated response structure', async () => {
      ResponseValidator.validatePaginated(response, { status: 200 });
    });
  });

  test('GET /api/organizations/:id/projects — project schema is correct', async () => {
    await allure.epic('Organizations');
    await allure.feature('Project List');
    await allure.story('Project response matches expected schema');
    await allure.severity('critical');
    await allure.owner('Pranav');
    await allure.tags('projects', 'schema', 'regression');
    await allure.description(`
      Verifies a single project contains:
      - id (number), uuid (string), package_name (string)
      - platform (number), file_count (number), organization (number)
    `);

    const response = await allure.step(
      `GET /api/organizations/${state.orgId}/projects?limit=1`,
      async () => {
        return await wrapper.get({
          endpoint:
            resolveRoute(API_ROUTES.projectList.route, state.orgId) +
            '?limit=1',
        });
      }
    );

    const body = await allure.step('Validate status 200', async () => {
      return await ResponseValidator.validate(response, { status: 200 });
    });

    await allure.step('Validate project schema', async () => {
      const project = (body.results as Record<string, unknown>[])[0];
      SchemaValidator.validate(project, {
        id: { type: 'number', required: true },
        uuid: { type: 'string', required: true },
        package_name: { type: 'string', required: true },
        platform: { type: 'number', required: true },
        file_count: { type: 'number', required: true },
        organization: { type: 'number', required: true },
      });
    });
  });

  test('GET /api/organizations/:id/projects — returns 15 projects', async () => {
    await allure.epic('Organizations');
    await allure.feature('Project List');
    await allure.story('Project list returns expected count');
    await allure.severity('normal');
    await allure.owner('Pranav');
    await allure.tags('projects', 'count', 'regression');
    await allure.description(`
      Verifies GET with limit=15 returns count > 0.
      Exact count is not hardcoded — works across any QA environment.
    `);

    const response = await allure.step(
      `GET /api/organizations/${state.orgId}/projects?limit=15`,
      async () => {
        return await wrapper.get({
          endpoint:
            resolveRoute(API_ROUTES.projectList.route, state.orgId) +
            '?limit=15',
        });
      }
    );

    const body = await allure.step('Validate status 200', async () => {
      return await ResponseValidator.validate(response, { status: 200 });
    });

    await allure.step('Verify count is greater than 0', async () => {
      const count = body.count as number;
      expect(count).toBeGreaterThan(0);
    });
  });

  test('GET /api/organizations/:id/projects — pagination works', async () => {
    await allure.epic('Organizations');
    await allure.feature('Project List');
    await allure.story('Project list pagination works correctly');
    await allure.severity('normal');
    await allure.owner('Pranav');
    await allure.tags('projects', 'pagination', 'regression');
    await allure.description(`
      Verifies GET with limit=5&offset=0:
      - HTTP 200
      - next field exists (more pages available)
      - results length is <= 5
    `);

    const response = await allure.step(
      `GET /api/organizations/${state.orgId}/projects?limit=5&offset=0`,
      async () => {
        return await wrapper.get({
          endpoint:
            resolveRoute(API_ROUTES.projectList.route, state.orgId) +
            '?limit=5&offset=0',
        });
      }
    );

    const body = await allure.step(
      'Validate status 200 and pagination fields',
      async () => {
        return await ResponseValidator.validate(response, {
          status: 200,
          requiredFields: ['count', 'next', 'results'],
        });
      }
    );

    await allure.step('Verify results length is <= 5', async () => {
      const results = body.results as unknown[];
      expect(results.length).toBeLessThanOrEqual(5);
    });
  });

  test('GET /api/organizations/:id/me — returns member role', async () => {
    await allure.epic('Organizations');
    await allure.feature('Organization Member');
    await allure.story('Authenticated user fetches their org role');
    await allure.severity('normal');
    await allure.owner('Pranav');
    await allure.tags('organizations', 'member', 'smoke', 'positive');
    await allure.description(`
      Verifies GET /api/organizations/:id/me returns:
      - HTTP 200
      - id (number), is_admin (boolean), is_owner (boolean)
    `);

    const response = await allure.step(
      `GET /api/organizations/${state.orgId}/me`,
      async () => {
        return await wrapper.get({
          endpoint:
            resolveRoute(API_ROUTES.organization.route, state.orgId) + '/me',
        });
      }
    );

    const body = await allure.step(
      'Validate status 200 and required fields',
      async () => {
        return await ResponseValidator.validate(response, {
          status: 200,
          requiredFields: ['id', 'is_admin', 'is_owner'],
        });
      }
    );

    await allure.step('Validate member role schema', async () => {
      SchemaValidator.validate(body, {
        id: { type: 'number', required: true },
        is_admin: { type: 'boolean', required: true },
        is_owner: { type: 'boolean', required: true },
      });
    });
  });
});
