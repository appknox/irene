import { test, expect } from '@playwright/test';
import * as allure from 'allure-js-commons';
import RequestWrapper from '../../Actions/api/request.wrapper';
import ResponseValidator from '../../utils/response.validator';
import TokenManager from '../../Actions/api/token.manager';
import { API_ROUTES, resolveRoute } from '../../support/api.routes';
import state from '../../support/test-state';

let wrapper: RequestWrapper;

test.describe('Edit Analysis API', () => {
  test.beforeAll(async () => {
    wrapper = new RequestWrapper();
    await wrapper.init();
  });

  test.afterAll(async () => {
    TokenManager.clearTokens();
    await wrapper.dispose();
  });

  test.describe.serial('Edit Analysis Risk Flow', () => {
    test('PUT vulnerability_preferences — override risk to Medium', async () => {
      await allure.epic('Vulnerability');
      await allure.feature('Edit Analysis');
      await allure.story('User overrides vulnerability risk');
      await allure.severity('critical');
      await allure.tags('vulnerability', 'edit-analysis', 'smoke');

      const response = await allure.step(
        'PUT override risk to Medium',
        async () => {
          return await wrapper.put({
            endpoint: resolveRoute(
              API_ROUTES.editAnalysisRisk.route,
              state.fileId,
              state.vulnerabilityId
            ),
            body: {
              id: state.vulnerabilityId,
              risk: 2,
              comment: 'automated test override',
            },
          });
        }
      );

      const body = await allure.step('Validate status 200', async () => {
        return await ResponseValidator.validate(response, { status: 200 });
      });

      await allure.step('Verify override applied', async () => {
        expect(body.risk as number).toBe(2);
      });
    });

    test('GET analysis — verify overridden_risk is Medium', async () => {
      await allure.epic('Vulnerability');
      await allure.feature('Edit Analysis');
      await allure.story('Override is reflected in analysis');
      await allure.severity('critical');
      await allure.tags('vulnerability', 'edit-analysis', 'regression');

      const response = await allure.step('GET analysis details', async () => {
        return await wrapper.get({
          endpoint: resolveRoute(
            API_ROUTES.analysisById.route,
            state.analysisId
          ),
        });
      });

      const body = await allure.step('Validate status 200', async () => {
        return await ResponseValidator.validate(response, { status: 200 });
      });

      await allure.step('Verify overridden_risk === 2 (Medium)', async () => {
        expect(body.overridden_risk as number).toBe(2);
        expect(body.computed_risk as number).toBe(2);
        expect(body.override_criteria as string).toBe('current_file');
      });
    });

    test('DELETE vulnerability_preferences — reset override', async () => {
      await allure.epic('Vulnerability');
      await allure.feature('Edit Analysis');
      await allure.story('User resets vulnerability risk override');
      await allure.severity('critical');
      await allure.tags('vulnerability', 'edit-analysis', 'smoke');

      const response = await allure.step('DELETE override', async () => {
        return await wrapper.delete({
          endpoint: resolveRoute(
            API_ROUTES.editAnalysisRisk.route,
            state.fileId,
            state.vulnerabilityId
          ),
        });
      });

      await allure.step('Validate status 200', async () => {
        await ResponseValidator.validate(response, { status: 200 });
      });

      const verifyResponse = await allure.step(
        'GET analysis — verify reset',
        async () => {
          return await wrapper.get({
            endpoint: resolveRoute(
              API_ROUTES.analysisById.route,
              state.analysisId
            ),
          });
        }
      );

      const verifyBody = await allure.step(
        'Validate overridden_risk is null',
        async () => {
          return await ResponseValidator.validate(verifyResponse, {
            status: 200,
          });
        }
      );

      await allure.step('Verify override removed', async () => {
        expect(verifyBody.overridden_risk).toBeNull();
      });
    });
  });
});
