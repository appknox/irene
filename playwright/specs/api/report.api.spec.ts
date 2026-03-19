import { test, expect } from '@playwright/test';
import * as allure from 'allure-js-commons';
import RequestWrapper from '../../Actions/api/request.wrapper';
import ResponseValidator from '../../utils/response.validator';
import SchemaValidator from '../../utils/schema.validator';
import TokenManager from '../../Actions/api/token.manager';
import { API_ROUTES, resolveRoute } from '../../support/api.routes';
import state from '../../support/test-state';

let wrapper: RequestWrapper;

test.describe('Report API', () => {
  test.beforeAll(async () => {
    wrapper = new RequestWrapper();
    await wrapper.init();
  });

  test.afterAll(async () => {
    TokenManager.clearTokens();
    await wrapper.dispose();
  });

  test('GET can_generate_report — returns boolean', async () => {
    await allure.epic('Reports');
    await allure.feature('Report Generation');
    await allure.story('User checks if report can be generated');
    await allure.severity('critical');
    await allure.tags('report', 'smoke');

    const response = await allure.step('GET can_generate_report', async () => {
      return await wrapper.get({
        endpoint: resolveRoute(
          API_ROUTES.canGenerateReport.route,
          state.fileId
        ),
      });
    });

    const body = await allure.step(
      'Validate status 200 and schema',
      async () => {
        return await ResponseValidator.validate(response, {
          status: 200,
          requiredFields: ['can_generate_report'],
        });
      }
    );

    await allure.step('Validate schema', async () => {
      SchemaValidator.validate(body, {
        can_generate_report: { type: 'boolean', required: true },
      });
    });
  });

  test('GET reports — returns report list', async () => {
    await allure.epic('Reports');
    await allure.feature('VA Report');
    await allure.story('User views generated reports');
    await allure.severity('normal');
    await allure.tags('report', 'regression');

    const response = await allure.step('GET reports list', async () => {
      return await wrapper.get({
        endpoint: `${resolveRoute(API_ROUTES.reports.route, state.fileId)}?fileId=${state.fileId}&limit=2`,
      });
    });

    const body = await allure.step('Validate paginated response', async () => {
      return await ResponseValidator.validatePaginated(response);
    });

    await allure.step('Verify at least one report exists', async () => {
      expect(body.count as number).toBeGreaterThan(0);
    });
  });

  test('GET report PDF — returns S3 download URL', async () => {
    await allure.epic('Reports');
    await allure.feature('Report Download');
    await allure.story('User downloads PDF report');
    await allure.severity('critical');
    await allure.tags('report', 'pdf', 'smoke');

    const response = await allure.step('GET report PDF URL', async () => {
      return await wrapper.get({
        endpoint: resolveRoute(API_ROUTES.reportPdf.route, state.reportId),
      });
    });

    const body = await allure.step('Validate status 200 and URL', async () => {
      return await ResponseValidator.validate(response, {
        status: 200,
        requiredFields: ['url'],
      });
    });

    await allure.step('Verify S3 URL', async () => {
      expect(body.url as string).toContain('s3.amazonaws.com');
    });
  });

  test('GET report Excel — returns S3 download URL', async () => {
    await allure.epic('Reports');
    await allure.feature('Report Download');
    await allure.story('User downloads Excel report');
    await allure.severity('normal');
    await allure.tags('report', 'excel', 'regression');

    const response = await allure.step('GET report Excel URL', async () => {
      return await wrapper.get({
        endpoint: resolveRoute(API_ROUTES.reportExcel.route, state.reportId),
      });
    });

    const body = await allure.step('Validate status 200 and URL', async () => {
      return await ResponseValidator.validate(response, {
        status: 200,
        requiredFields: ['url'],
      });
    });

    await allure.step('Verify S3 URL', async () => {
      expect(body.url as string).toContain('summary_excel_download');
    });
  });

  test('GET report CSV — returns S3 download URL', async () => {
    await allure.epic('Reports');
    await allure.feature('Report Download');
    await allure.story('User downloads CSV report');
    await allure.severity('normal');
    await allure.tags('report', 'csv', 'regression');

    const response = await allure.step('GET report CSV URL', async () => {
      return await wrapper.get({
        endpoint: resolveRoute(API_ROUTES.reportCsv.route, state.reportId),
      });
    });

    const body = await allure.step('Validate status 200 and URL', async () => {
      return await ResponseValidator.validate(response, {
        status: 200,
        requiredFields: ['url'],
      });
    });

    await allure.step('Verify S3 URL', async () => {
      expect(body.url as string).toContain('summary_csv_download');
    });
  });

test.describe.serial('Privacy Report', () => {
  test.beforeAll(async () => {
    if (!wrapper) {
      wrapper = new RequestWrapper();
      await wrapper.init();
    }
  });
  test('POST privacy report — generate PDF', async () => {
    await allure.epic('Reports');
    await allure.feature('Privacy Shield Report');
    await allure.story('User generates privacy report PDF');
    await allure.severity('critical');
    await allure.owner('Pranav');
    await allure.tags('report', 'privacy', 'smoke');

    const response = await allure.step('POST generate privacy PDF', async () => {
      return await wrapper.post({
        endpoint: resolveRoute(
          API_ROUTES.privacyReportGenerate.route,
          state.privacyReportId
        ),
      });
    });

    await allure.step('Validate success response', async () => {
      const body = await ResponseValidator.validate(response, { status: 201 });
      expect(body.success as boolean).toBe(true);
    });
  });

  test('GET privacy report status — pdf_status is generated', async () => {
    await allure.epic('Reports');
    await allure.feature('Privacy Shield Report');
    await allure.story('Privacy report PDF generation completes');
    await allure.severity('critical');
    await allure.owner('Pranav');
    await allure.tags('report', 'privacy', 'regression');

    let body: Record<string, unknown> = {};
    const startTime = Date.now();
    const TIMEOUT = 300000; // 5 minutes

    await allure.step('Poll until pdf_status > 0', async () => {
      while (true) {
        const response = await wrapper.get({
          endpoint: resolveRoute(
            API_ROUTES.privacyReportById.route,
            state.privacyReportId
          ),
        });
        body = await response.json();

        if ((body.pdf_status as number) === 4) break;

        if (Date.now() - startTime > TIMEOUT) {
          throw new Error('Privacy report PDF timed out after 5 minutes');
        }

        console.log('[Test] Privacy PDF not ready yet... waiting 10s');
        await new Promise((r) => setTimeout(r, 10000));
      }
    });

    await allure.step('Validate privacy report schema', async () => {
      SchemaValidator.validate(body, {
        id: { type: 'number', required: true },
        file: { type: 'number', required: true },
        language: { type: 'string', required: true },
        pdf_status: { type: 'number', required: true },
        pdf_progress: { type: 'number', required: true },
        report_password: { type: 'string', required: true },
      });
    });

    await allure.step('Verify pdf_status is greater than 0', async () => {
      expect(body.pdf_status as number).toBe(4);
    });
  });

  test('GET privacy report download URL — returns S3 URL', async () => {
    await allure.epic('Reports');
    await allure.feature('Privacy Shield Report');
    await allure.story('User downloads privacy report PDF');
    await allure.severity('critical');
    await allure.owner('Pranav');
    await allure.tags('report', 'privacy', 'smoke');

    const response = await allure.step(
      'GET privacy report download URL',
      async () => {
        return await wrapper.get({
          endpoint: resolveRoute(
            API_ROUTES.privacyReportDownload.route,
            state.privacyReportId
          ),
        });
      }
    );

    const body = await allure.step('Validate status 200 and URL', async () => {
      return await ResponseValidator.validate(response, {
        status: 200,
        requiredFields: ['url'],
      });
    });

    await allure.step('Verify S3 URL', async () => {
      expect(body.url as string).toContain('s3.amazonaws.com');
    });
  });
});

});
