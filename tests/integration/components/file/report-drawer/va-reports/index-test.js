import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, render, waitFor, findAll } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { serializer } from 'irene/tests/test-utils';
import { Response } from 'miragejs';
import Service from '@ember/service';

class NotificationsStub extends Service {
  errorMsg = null;
  successMsg = null;

  error(msg) {
    this.errorMsg = msg;
  }

  success(msg) {
    this.successMsg = msg;
  }
}

module(
  'Integration | Component | file/report-drawer/va-reports',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks);

    hooks.beforeEach(async function () {
      this.owner.register('service:notifications', NotificationsStub);

      const store = this.owner.lookup('service:store');

      const project = store.createRecord('project', {
        id: 1,
        uuid: '1-123-33-1-12345',
      });

      const file = this.server.create('file', {
        id: 1,
        project: project.id,
        is_api_done: false,
        is_static_done: true,
        is_manual_done: true,
        is_dynamic_done: true,
      });

      this.set('file', store.push(store.normalize('file', file.toJSON())));

      this.server.get('/v2/files/:id', () => {
        return { id: file.id, ...file.toJSON() };
      });
    });

    test('it renders loading state and generate button when reports list is empty and file can generate report', async function (assert) {
      this.server.get(
        'v2/files/:fileId/reports',
        () => {
          return { count: 0, next: null, previous: null, result: [] };
        },
        { timing: 500 }
      );

      this.file.canGenerateReport = true;
      this.file.isStaticDone = true;

      render(hbs`<File::ReportDrawer::VaReports @file={{this.file}} />`);

      await waitFor('[data-test-fileReportDrawer-vaReports]', { timeout: 500 });

      assert.dom('[data-test-fileReportDrawer-vaReports]').exists();
      assert.dom('[data-test-vaReports-reportsLoader]').exists();

      await waitFor('[data-test-vaReports-generateReport-CTA]', {
        timeout: 500,
      });

      assert.dom('[data-test-vaReports-generateReport-CTA]').exists();

      assert.dom('[data-test-vaReports-generateReportCTA-vector]').exists();

      assert
        .dom('[data-test-vaReports-generateReportCTA-directiveText]')
        .exists()
        .hasText(t('fileReport.generateReportCTAText'));

      assert
        .dom('[data-test-vaReports-generateReportCTA-btn]')
        .exists()
        .hasText(t('generateReport'));

      assert
        .dom('[data-test-vaReports-generateReportProgress-container]')
        .doesNotExist();
    });

    test('it triggers a report generation when the generate button is clicked', async function (assert) {
      this.set('hasGeneratedReport', false);

      this.server.get('/v2/files/:id/reports', (schema) =>
        serializer(schema.fileReports.all(), true)
      );

      this.server.get('/v2/files/:id', (schema, req) => {
        const file = schema.files.find(`${req.params.id}`)?.toJSON();

        if (this.hasGeneratedReport) {
          file.can_generate_report = false;
        }

        return file;
      });

      this.server.post(
        '/v2/files/:fileId/reports',
        () => {
          const fileReport = this.server.create('file-report', {
            id: 1,
            progress: 10, // Sets the generate status to "in-progress"
          });

          this.hasGeneratedReport = true;

          return fileReport.toJSON();
        },
        { timing: 100 }
      );

      this.file.canGenerateReport = true;
      this.file.isStaticDone = true;

      await render(hbs`<File::ReportDrawer::VaReports @file={{this.file}} />`);

      assert.dom('[data-test-vaReports-generateReportCTA-btn]').exists();

      click('[data-test-vaReports-generateReportCTA-btn]');

      await waitFor(
        '[data-test-vaReports-generateReportCTA-btn] [data-test-ak-button-loader]',
        {
          timeout: 100,
        }
      );

      assert
        .dom('[data-test-vaReports-generateReportCTA-btn]')
        .exists()
        .hasText(t('generatingReport'))
        .hasAttribute('disabled');

      await waitFor('[data-test-vaReports-reportList]', {
        timeout: 200,
      });

      const notifyService = this.owner.lookup('service:notifications');

      assert.strictEqual(
        notifyService.successMsg,
        t('reportIsGettingGenerated')
      );

      assert.dom('[data-test-vaReports-reportList]').exists();

      const reportItems = findAll(
        '[data-test-vaReports-reportList-reportItem]'
      );

      // Reports are generated the "pdf", "xlsx", and "csv" formats.
      const reportTypes = [
        ['pdf', t('generating')],
        ['xlsx', t('fileReport.noPasswordRequired')],
        ['csv', t('fileReport.noPasswordRequired')],
      ];

      assert.strictEqual(
        reportItems.length,
        reportTypes.length,
        'reports for "pdf", "xlsx", "csv" were added successfully'
      );

      const store = this.owner.lookup('service:store');
      const fileReport = store.peekRecord('file-report', 1);

      reportTypes.forEach(([type, secondaryText]) => {
        assert
          .dom(`[data-test-vaReports-reportList-Item='${type}']`)
          .exists()
          .containsText(secondaryText)
          .containsText(`${fileReport.generatedOnDateTime}`);
      });
    });

    test('it renders generate report loader when report is generating', async function (assert) {
      this.set('hasGeneratedReport', false);
      this.set('fileReport', null);

      this.server.get('/v2/files/:id/reports', (schema) =>
        serializer(schema.fileReports.all(), true)
      );

      this.server.get('/v2/files/:id', (schema, req) => {
        const file = schema.files.find(`${req.params.id}`)?.toJSON();

        if (this.hasGeneratedReport) {
          file.can_generate_report = false;
        }

        return file;
      });

      this.server.post(
        '/v2/files/:fileId/reports',
        () => {
          const fileReport = this.server.create('file-report', {
            id: 1,
            progress: 10, // Sets the generate status to "in-progress"
          });

          this.fileReport = fileReport;
          this.hasGeneratedReport = true;

          return fileReport.toJSON();
        },
        { timing: 100 }
      );

      this.file.canGenerateReport = true;
      this.file.isStaticDone = true;

      await render(hbs`<File::ReportDrawer::VaReports @file={{this.file}} />`);

      assert.dom('[data-test-vaReports-generateReportCTA-btn]').exists();

      click('[data-test-vaReports-generateReportCTA-btn]');

      await waitFor(
        '[data-test-vaReports-generateReportCTA-btn] [data-test-ak-button-loader]',
        {
          timeout: 100,
        }
      );

      assert
        .dom('[data-test-vaReports-generateReportCTA-btn]')
        .exists()
        .hasText(t('generatingReport'))
        .hasAttribute('disabled');

      await waitFor('[data-test-vaReports-reportList]', {
        timeout: 200,
      });

      const notifyService = this.owner.lookup('service:notifications');

      assert.strictEqual(
        notifyService.successMsg,
        t('reportIsGettingGenerated')
      );

      assert.dom('[data-test-vaReports-reportList]').exists();

      assert
        .dom('[data-test-vaReports-generateReportProgress-container]')
        .exists();

      assert
        .dom('[data-test-vaReports-generateReportProgress-text]')
        .exists()
        .hasText(`${t('fileReport.generateReportLoaderText')}...`);

      assert
        .dom('[data-test-vaReports-generateReportProgress-loader]')
        .exists();

      assert
        .dom(
          `[data-test-ak-loader-linear-progress="${this.fileReport.progress}"]`
        )
        .exists();

      assert
        .dom('[data-test-vaReports-generateReportProgress-percent]')
        .exists()
        .hasText(`${this.fileReport.progress}%`);
    });

    test('it renders the previous, summary, and current reports if at least two reports have been generated', async function (assert) {
      // Creates two file-reports
      this.server.createList('file-report', 2, {
        progress: 100, // Sets the generate status of the previous and current reports to "completed"
      });

      this.server.get('v2/files/:fileId/reports', (schema) =>
        serializer(schema.fileReports.all(), true)
      );

      this.file.canGenerateReport = false;
      this.file.isStaticDone = true;

      await render(hbs`<File::ReportDrawer::VaReports @file={{this.file}} />`);

      assert.dom('[data-test-vaReports-generateReport-CTA]').doesNotExist();

      const reportItems = findAll(
        '[data-test-vaReports-reportList-reportItem]'
      );

      // Displays 'pdf', 'xlsx', 'csv' types for the current report and only "pdf" type for the previous report
      const reportTypes = ['pdf', 'xlsx', 'csv', 'pdf'];

      assert.strictEqual(
        reportItems.length,
        reportTypes.length,
        'correct number of reports for "pdf", "xlsx", "csv" were rendered successfully'
      );

      const currentReport = reportItems[0];
      const summaryReports = reportItems.slice(1, reportItems.length - 1);
      const previousReport = reportItems[reportItems.length - 1];

      assert
        .dom(currentReport)
        .exists()
        .hasText(new RegExp(t('fileReport.detailedReport')))
        .containsText(this.file.project.get('pdfPassword'));

      assert
        .dom(previousReport)
        .exists()
        .hasText(new RegExp(t('fileReport.previousReport')))
        .containsText(this.file.project.get('pdfPassword'));

      summaryReports.forEach((report) => {
        assert
          .dom(report)
          .exists()
          .hasText(new RegExp(t('fileReport.summaryReport')))
          .hasText(new RegExp(t('fileReport.noPasswordRequired')));
      });
    });

    test('it should show error when report generation is failed', async function (assert) {
      this.server.get('/v2/files/:id/reports', (schema) =>
        serializer(schema.fileReports.all(), true)
      );

      this.server.post('/v2/files/:fileId/reports', () => {
        return new Response(
          400,
          { some: 'header' },
          { errors: [t('reportGenerateError')] }
        );
      });

      this.file.canGenerateReport = true;
      this.file.isStaticDone = true;

      await render(hbs`<File::ReportDrawer::VaReports @file={{this.file}} />`);

      await click(`[data-test-vaReports-generateReportCTA-btn]`);

      const notifyService = this.owner.lookup('service:notifications');

      assert.strictEqual(notifyService.errorMsg, t('reportGenerateError'));
    });
  }
);
