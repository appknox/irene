import { test, expect } from '@playwright/test';
import * as allure from 'allure-js-commons';
import RequestWrapper from '../../Actions/api/request.wrapper';
import ResponseValidator from '../../utils/response.validator';
import TokenManager from '../../Actions/api/token.manager';
import { API_ROUTES, resolveRoute } from '../../support/api.routes';
import state from '../../support/test-state';

let wrapper: RequestWrapper;

/**Risk Analysis Levels:
0 = Passed
1 = Low
2 = Medium
3 = High
4 = Critical
*/

test.describe.serial('Edit Analysis API', () => {
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

  test.describe.serial('Edit Analysis -- Ignore vulnerability', () => {
    test('POST vulnerability_preferences/ignore — ignore vulnerability', async () => {
      await allure.epic('Vulnerability');
      await allure.feature('Edit Analysis');
      await allure.story('User ignores a vulnerability');
      await allure.severity('critical');
      await allure.tags('vulnerability', 'edit-analysis', 'smoke');

      const response = await allure.step(
        'POST ignore vulnerability',
        async () => {
          return await wrapper.put({
            endpoint: resolveRoute(
              API_ROUTES.editAnalysisRisk.route,
              state.fileId,
              state.vulnerabilityId
            ),
            body: {
              id: state.vulnerabilityId,
              risk: 0,
              comment: 'automated test ignore',
            },
          });
        }
      );
      const body = await allure.step('Validate status 200', async () => {
        return await ResponseValidator.validate(response, { status: 200 });
      });

      await allure.step('Verify vulnerability ignored', async () => {
        expect(body.risk as number).toBe(0);
      });
    });

    test('GET analysis — verify vulnerability is ignored', async () => {
      await allure.epic('Vulnerability');
      await allure.feature('Edit Analysis');
      await allure.story('Ignored vulnerability is reflected in analysis');
      await allure.severity('critical');
      await allure.tags('vulnerability', 'edit-analysis', 'regression');

      await allure.step('GET analysis details', async () => {
        const response = await wrapper.get({
          endpoint: resolveRoute(
            API_ROUTES.analysisById.route,
            state.analysisId
          ),
        });
        const body = await ResponseValidator.validate(response, {
          status: 200,
        });
        expect(body.overridden_risk as number).toBe(0);
        expect(body.computed_risk as number).toBe(0);
        expect(body.override_criteria as string).toBe('current_file');
      });
    });

    test('DELETE vulnerability_preferences — reset ignore', async () => {
      await allure.epic('Vulnerability');
      await allure.feature('Edit Analysis');
      await allure.story('User resets vulnerability ignore');
      await allure.severity('critical');
      await allure.tags('vulnerability', 'edit-analysis', 'smoke');

      await allure.step('DELETE ignore', async () => {
        const response = await wrapper.delete({
          endpoint: resolveRoute(
            API_ROUTES.editAnalysisRisk.route,
            state.fileId,
            state.vulnerabilityId
          ),
        });

        await ResponseValidator.validate(response, { status: 200 });
      });
      await allure.step('GET analysis — verify reset', async () => {
        const response = await wrapper.get({
          endpoint: resolveRoute(
            API_ROUTES.analysisById.route,
            state.analysisId
          ),
        });
        const body = await ResponseValidator.validate(response, {
          status: 200,
        });
        expect(body.overridden_risk).toBeNull();
      });
    });
  });

  test.describe.serial('Edit Analysis -- Override All future uploads', () => {
    test('PUT -- override risk to high for all future uploads', async () => {
      await allure.epic('Vulnerability');
      await allure.feature('Edit Analysis');
      await allure.story('User overrides risk for all future uploads');
      await allure.severity('critical');
      await allure.tags('vulnerability', 'edit-analysis', 'smoke');
      const response = await allure.step(
        'PUT override risk to High for all future uploads',
        async () => {
          return await wrapper.put({
            endpoint: resolveRoute(
              API_ROUTES.editAnalysisRisk.route,
              state.fileId,
              state.vulnerabilityId
            ),
            body: {
              id: state.vulnerabilityId,
              risk: 3,
              comment: 'automated all future uploads override',
              all: true,
            },
          });
        }
      );
      const body = await allure.step('Validate status 200', async () => {
        return await ResponseValidator.validate(response, { status: 200 });
      });

      await allure.step('Verify override applied', async () => {
        expect(body.risk as number).toBe(3);
      });
    });

    test('GET analysis — verify overridden_risk is High for all future uploads', async () => {
      await allure.epic('Vulnerability');
      await allure.feature('Edit Analysis');
      await allure.story(
        'Override for all future uploads is reflected in analysis'
      );
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
      await allure.step('Verify overridden_risk is High', async () => {
        expect(body.overridden_risk as number).toBe(3);
      });
      await allure.step(
        'Verify override_criteria is "all_future_uploads"',
        async () => {
          expect(body.override_criteria as string).toBe('all_future_upload');
        }
      );

      await allure.step('Verify computed_risk is High', async () => {
        expect(body.computed_risk as number).toBe(3);
      });
    });

    test('DELETE vulnerability_preferences — reset all future uploads override', async () => {
      await allure.epic('Vulnerability');
      await allure.feature('Edit Analysis');
      await allure.story('User resets all future uploads override');
      await allure.severity('critical');
      await allure.tags('vulnerability', 'edit-analysis', 'smoke');
      const response = await allure.step(
        'DELETE override for all future uploads',
        async () => {
          return await wrapper.delete({
            endpoint: resolveRoute(
              API_ROUTES.editAnalysisRisk.route,
              state.fileId,
              state.vulnerabilityId
            ),
            body: {
              all: true,
            },
          });
        }
      );
      const body = await allure.step('Validate status 200', async () => {
        return await ResponseValidator.validate(response, { status: 200 });
      });
      await allure.step('GET analysis — verify reset', async () => {
        const response = await wrapper.get({
          endpoint: resolveRoute(
            API_ROUTES.analysisById.route,
            state.analysisId
          ),
        });

        const body = await ResponseValidator.validate(response, {
          status: 200,
        });
        expect(body.overridden_risk).toBeNull();
      });
    });
  });

  test.describe.serial('Edit Analysis -- Ignore All future uploads', () => {
    test('PUT — ignore vulnerability for all future uploads', async () => {
      await allure.epic('Vulnerability');
      await allure.feature('Edit Analysis');
      await allure.story('User ignores all future uploads of a vulnerability');
      await allure.severity('critical');
      await allure.tags('vulnerability', 'edit-analysis', 'smoke');

      const response = await allure.step(
        'PUT ignore for all future uploads',
        async () => {
          return await wrapper.put({
            endpoint: resolveRoute(
              API_ROUTES.editAnalysisRisk.route,
              state.fileId,
              state.vulnerabilityId
            ),
            body: {
              id: state.vulnerabilityId,
              risk: 0,
              comment: 'automated ignore for all future uploads',
              all: true,
            },
          });
        }
      );

      const body = await allure.step('Validate status 200', async () => {
        return await ResponseValidator.validate(response, { status: 200 });
      });

      await allure.step('Verify vulnerability ignored', async () => {
        expect(body.risk as number).toBe(0);
      });
    });

    test('GET analysis — verify ignored for all future uploads', async () => {
      await allure.epic('Vulnerability');
      await allure.feature('Edit Analysis');
      await allure.story(
        'Ignored vulnerability for all future uploads is reflected'
      );
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

      await allure.step('Verify override applied', async () => {
        expect(body.overridden_risk as number).toBe(0);
        expect(body.computed_risk as number).toBe(0);
        expect(body.override_criteria as string).toBe('all_future_upload');
      });
    });

    test('DELETE — reset ignore for all future uploads', async () => {
      await allure.epic('Vulnerability');
      await allure.feature('Edit Analysis');
      await allure.story('User resets ignore for all future uploads');
      await allure.severity('critical');
      await allure.tags('vulnerability', 'edit-analysis', 'smoke');

      const response = await allure.step(
        'DELETE ignore for all future uploads',
        async () => {
          return await wrapper.delete({
            endpoint: resolveRoute(
              API_ROUTES.editAnalysisRisk.route,
              state.fileId,
              state.vulnerabilityId
            ),
            body: { all: true },
          });
        }
      );

      await allure.step('Validate status 200', async () => {
        await ResponseValidator.validate(response, { status: 200 });
      });

      await allure.step('GET analysis — verify reset', async () => {
        const verifyResponse = await wrapper.get({
          endpoint: resolveRoute(
            API_ROUTES.analysisById.route,
            state.analysisId
          ),
        });
        const verifyBody = await ResponseValidator.validate(verifyResponse, {
          status: 200,
        });
        expect(verifyBody.overridden_risk).toBeNull();
      });
    });
  });

  test('PUT — override with missing risk field returns 400', async () => {
    await allure.epic('Vulnerability');
    await allure.feature('Edit Analysis');
    await allure.story('Override fails when risk field is missing');
    await allure.severity('normal');
    await allure.tags('vulnerability', 'edit-analysis', 'negative');

    const response = await allure.step('PUT without risk field', async () => {
      return await wrapper.put({
        endpoint: resolveRoute(
          API_ROUTES.editAnalysisRisk.route,
          state.fileId,
          state.vulnerabilityId
        ),
        body: {
          id: state.vulnerabilityId,
          comment: 'missing risk field',
        },
      });
    });

    await allure.step('Validate status 400', async () => {
      await ResponseValidator.validate(response, { status: 400 });
    });
  });
  test('PUT — override with invalid risk value returns 400', async () => {
    await allure.epic('Vulnerability');
    await allure.feature('Edit Analysis');
    await allure.story('Override fails with invalid risk value');
    await allure.severity('normal');
    await allure.tags('vulnerability', 'edit-analysis', 'negative');

    const response = await allure.step(
      'PUT with invalid risk value',
      async () => {
        return await wrapper.put({
          endpoint: resolveRoute(
            API_ROUTES.editAnalysisRisk.route,
            state.fileId,
            state.vulnerabilityId
          ),
          body: {
            id: state.vulnerabilityId,
            risk: 99,
            comment: 'invalid risk value',
          },
        });
      }
    );

    await allure.step('Validate status 400', async () => {
      await ResponseValidator.validate(response, { status: 400 });
    });
  });
});
