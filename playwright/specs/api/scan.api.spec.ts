import { test } from '@playwright/test';
import * as allure from 'allure-js-commons';
import RequestWrapper from '../../Actions/api/request.wrapper';
import ResponseValidator from '../../utils/response.validator';
import SchemaValidator from '../../utils/schema.validator';
import TokenManager from '../../Actions/api/token.manager';
import { API_ROUTES, resolveRoute } from '../../support/api.routes';
import state from '../../support/test-state';

let wrapper: RequestWrapper;

test.describe('Scan API', () => {
  test.beforeAll(async () => {
    wrapper = new RequestWrapper();
    await wrapper.init();
  });

  test.afterAll(async () => {
    TokenManager.clearTokens();
    await wrapper.dispose();
  });

  test('GET /api/v3/files/:id — returns file details', async () => {
    await allure.epic('Scanning');
    await allure.feature('File Details');
    await allure.story('User views file scan details');
    await allure.severity('critical');
    await allure.tags('scan', 'file', 'smoke');

    const response = await allure.step('GET file details', async () => {
      return await wrapper.get({
        endpoint: resolveRoute(API_ROUTES.fileById.route, state.fileId),
      });
    });

    const body = await allure.step(
      'Validate status 200 and required fields',
      async () => {
        return await ResponseValidator.validate(response, {
          status: 200,
          requiredFields: [
            'id',
            'project',
            'static_scan_progress',
            'is_static_done',
          ],
        });
      }
    );

    await allure.step('Validate file schema', async () => {
      SchemaValidator.validate(body, {
        id: { type: 'number', required: true },
        project: { type: 'number', required: true },
        version: { type: 'string', required: true },
        static_scan_progress: { type: 'number', required: true },
        is_static_done: { type: 'boolean', required: true },
        is_dynamic_done: { type: 'boolean', required: true },
        is_manual_done: { type: 'boolean', required: true },
      });
    });
  });

  test('GET /api/v3/files/:id — static scan is completed', async () => {
    await allure.epic('Scanning');
    await allure.feature('Static Scan');
    await allure.story('Static scan completes after upload');
    await allure.severity('critical');
    await allure.tags('scan', 'static', 'smoke');

    const response = await allure.step('GET file details', async () => {
      return await wrapper.get({
        endpoint: resolveRoute(API_ROUTES.fileById.route, state.fileId),
      });
    });

    const body = await allure.step('Validate status 200', async () => {
      return await ResponseValidator.validate(response, { status: 200 });
    });

    await allure.step('Verify static scan is done', async () => {
      const { expect } = await import('@playwright/test');
      expect(body.static_scan_progress as number).toBe(100);
      expect(body.is_static_done as boolean).toBe(true);
    });
  });

  test('GET /api/v3/files/:id/risk — returns risk data', async () => {
    await allure.epic('Scanning');
    await allure.feature('Risk Analysis');
    await allure.story('User views risk analysis for a file');
    await allure.severity('normal');
    await allure.tags('scan', 'risk', 'regression');

    const response = await allure.step('GET file risk', async () => {
      return await wrapper.get({
        endpoint: resolveRoute(API_ROUTES.fileRisk.route, state.fileId),
      });
    });
    const body = await allure.step(
      'Validate status 200 and schema',
      async () => {
        return await ResponseValidator.validate(response, {
          status: 200,
          requiredFields: [
            'file',
            'rating',
            'risk_count_critical',
            'risk_count_high',
            'risk_count_medium',
            'risk_count_low',
          ],
        });
      }
    );
    await allure.step('Validate risk schema', async () => {
      SchemaValidator.validate(body, {
        file: { type: 'number', required: true },
        rating: { type: 'string', required: true },
        risk_count_critical: { type: 'number', required: true },
        risk_count_high: { type: 'number', required: true },
        risk_count_medium: { type: 'number', required: true },
        risk_count_low: { type: 'number', required: true },
        risk_count_passed: { type: 'number', required: true },
      });
    });
  });

  test('GET /api/v3/files/:id/previous_file — returns previous file', async () => {
    await allure.epic('Scanning');
    await allure.feature('File Details');
    await allure.story('User views previous file version');
    await allure.severity('normal');
    await allure.tags('scan', 'file', 'regression');

    const response = await allure.step('GET previous file', async () => {
      return await wrapper.get({
        endpoint: resolveRoute(API_ROUTES.previousFile.route, state.fileId),
      });
    });

    const body = await allure.step(
      'Validate status 200 and schema',
      async () => {
        return await ResponseValidator.validate(response, {
          status: 200,
          requiredFields: ['id', 'project', 'version', 'static_scan_progress'],
        });
      }
    );

    await allure.step('Validate previous file schema', async () => {
      SchemaValidator.validate(body, {
        id: { type: 'number', required: true },
        project: { type: 'number', required: true },
        version: { type: 'string', required: true },
        is_static_done: { type: 'boolean', required: true },
      });
    });
  });
});
