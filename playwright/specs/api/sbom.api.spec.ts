import { test, expect } from '@playwright/test';
import * as allure from 'allure-js-commons';
import RequestWrapper from '../../Actions/api/request.wrapper';
import ResponseValidator from '../../utils/response.validator';
import SchemaValidator from '../../utils/schema.validator';
import TokenManager from '../../Actions/api/token.manager';
import { API_ROUTES, resolveRoute } from '../../support/api.routes';
import state from '../../support/test-state';

let wrapper: RequestWrapper;

test.describe('SBOM API', () => {
  test.beforeAll(async () => {
    wrapper = new RequestWrapper();
    await wrapper.init();
  });

  test.afterAll(async () => {
    TokenManager.clearTokens();
    await wrapper.dispose();
  });

  test('GET sb_projects — returns SBOM project list', async () => {
    await allure.epic('SBOM');
    await allure.feature('SBOM Projects');
    await allure.story('User views SBOM project list');
    await allure.severity('critical');
    await allure.tags('sbom', 'smoke');

    const response = await allure.step('GET sb_projects', async () => {
      return await wrapper.get({
        endpoint: `${API_ROUTES.sbProjects.route}?limit=10`,
      });
    });

    const body = await allure.step(
      'Validate status 200 and paginated response',
      async () => {
        return await ResponseValidator.validatePaginated(response);
      }
    );

    await allure.step('Validate schema', async () => {
      const project = (body.results as Record<string, unknown>[])[0];
      SchemaValidator.validate(project, {
        id: { type: 'number', required: true },
        project: { type: 'number', required: true },
        latest_sb_file: { type: 'number', required: true },
      });
    });
  });

  test('GET sb_file — returns SBOM file details', async () => {
    await allure.epic('SBOM');
    await allure.feature('SBOM File');
    await allure.story('User views SBOM file details');
    await allure.severity('critical');
    await allure.tags('sbom', 'smoke');

    const response = await allure.step('GET sb_file', async () => {
      return await wrapper.get({
        endpoint: resolveRoute(API_ROUTES.sbFileById.route, state.sbFileId),
      });
    });

    const body = await allure.step(
      'Validate status 200 and schema',
      async () => {
        return await ResponseValidator.validate(response, {
          status: 200,
          requiredFields: ['id', 'file', 'status', 'sb_project'],
        });
      }
    );

    await allure.step('Validate sb_file schema', async () => {
      SchemaValidator.validate(body, {
        id: { type: 'number', required: true },
        file: { type: 'number', required: true },
        status: { type: 'number', required: true },
        sb_project: { type: 'number', required: true },
      });
    });

    await allure.step('Verify SBOM scan is complete', async () => {
      expect(body.status as number).toBe(3);
    });

    await allure.step(
      'Verify sb_file belongs to our uploaded file',
      async () => {
        expect(body.file as number).toBe(state.fileId);
      }
    );
  });

  test('GET sb_reports — returns SBOM report list', async () => {
    await allure.epic('SBOM');
    await allure.feature('SBOM Report');
    await allure.story('User views SBOM report list');
    await allure.severity('normal');
    await allure.tags('sbom', 'regression');

    const response = await allure.step('GET sb_reports', async () => {
      return await wrapper.get({
        endpoint: resolveRoute(API_ROUTES.sbReports.route, state.sbFileId),
      });
    });

    const body = await allure.step('Validate paginated response', async () => {
      return await ResponseValidator.validatePaginated(response);
    });

    await allure.step('Verify at least one report exists', async () => {
      expect(body.count as number).toBeGreaterThan(0);
    });
  });

  test.describe.serial('SBOM Report PDF Flow', () => {
    test.beforeAll(async () => {
      if (!wrapper) {
        wrapper = new RequestWrapper();
        await wrapper.init();
      }
    });

    test('POST sb_report — generate PDF', async () => {
      await allure.epic('SBOM');
      await allure.feature('SBOM Report');
      await allure.story('User generates SBOM report PDF');
      await allure.severity('critical');
      await allure.tags('sbom', 'smoke');

      const response = await allure.step('POST generate SBOM PDF', async () => {
        return await wrapper.post({
          endpoint: resolveRoute(
            API_ROUTES.sbReportGenerate.route,
            state.sbReportId
          ),
        });
      });

      await allure.step('Validate success response', async () => {
        const body = await ResponseValidator.validate(response, {
          status: 201,
        });
        expect(body.success as boolean).toBe(true);
      });
    });

    test('GET sb_report status — pdf_status is generated', async () => {
      await allure.epic('SBOM');
      await allure.feature('SBOM Report');
      await allure.story('SBOM report PDF generation completes');
      await allure.severity('critical');
      await allure.tags('sbom', 'regression');

      let body: Record<string, unknown> = {};
      const startTime = Date.now();
      const TIMEOUT = 300000;

      await allure.step('Poll until pdf_status === 4', async () => {
        while (true) {
          const response = await wrapper.get({
            endpoint: resolveRoute(
              API_ROUTES.sbReportById.route,
              state.sbReportId
            ),
          });
          body = await response.json();

          if ((body.pdf_status as number) === 4) break;

          if (Date.now() - startTime > TIMEOUT) {
            throw new Error('SBOM report PDF timed out after 5 minutes');
          }

          console.log('[Test] SBOM PDF not ready yet... waiting 10s');
          await new Promise((r) => setTimeout(r, 10000));
        }
      });

      await allure.step('Validate sb_report schema', async () => {
        SchemaValidator.validate(body, {
          id: { type: 'number', required: true },
          sb_file: { type: 'number', required: true },
          language: { type: 'string', required: true },
          pdf_status: { type: 'number', required: true },
          pdf_progress: { type: 'number', required: true },
          report_password: { type: 'string', required: true },
        });
      });

      await allure.step('Verify pdf_status === 4', async () => {
        expect(body.pdf_status as number).toBe(4);
      });
    });

    test('GET sb_report download URL — returns S3 URL', async () => {
      await allure.epic('SBOM');
      await allure.feature('SBOM Report');
      await allure.story('User downloads SBOM report PDF');
      await allure.severity('critical');
      await allure.tags('sbom', 'smoke');

      const response = await allure.step(
        'GET SBOM report download URL',
        async () => {
          return await wrapper.get({
            endpoint: resolveRoute(
              API_ROUTES.sbReportDownload.route,
              state.sbReportId
            ),
          });
        }
      );

      const body = await allure.step(
        'Validate status 200 and URL',
        async () => {
          return await ResponseValidator.validate(response, {
            status: 200,
            requiredFields: ['url'],
          });
        }
      );

      await allure.step('Verify S3 URL', async () => {
        expect(body.url as string).toContain('s3.amazonaws.com');
      });
    });

    test('GET sb_report CycloneDX JSON download URL — returns download URL', async () => {
      await allure.epic('SBOM');
      await allure.feature('SBOM Report');
      await allure.story('User downloads SBOM report CycloneDX JSON');
      await allure.severity('critical');
      await allure.tags('sbom', 'smoke');

      const response = await allure.step(
        'GET SBOM report CycloneDX JSON download URL',
        async () => {
          return await wrapper.get({
            endpoint: resolveRoute(
              API_ROUTES.sbReortCyclonedx.route,
              state.sbReportId
            ),
          });
        }
      );

      const body = await allure.step(
        'Validate status 200 and URL',
        async () => {
          return await ResponseValidator.validate(response, {
            status: 200,
            requiredFields: ['url'],
          });
        }
      );

      await allure.step('Verify download url', async () => {
        expect(body.url as string).toContain('cyclonedx_json_file');
      });
    });
  });
});
