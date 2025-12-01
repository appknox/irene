import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { Response } from 'miragejs';
import Service from '@ember/service';

import {
  click,
  render,
  waitFor,
  findAll,
  waitUntil,
  find,
} from '@ember/test-helpers';

import ENUMS from 'irene/enums';

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
  'Integration | Component | file-details/dynamic-scan/results/capis-report-drawer',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en');

    hooks.beforeEach(async function () {
      this.owner.register('service:notifications', NotificationsStub);

      const store = this.owner.lookup('service:store');

      const project = store.createRecord('project', {
        uuid: '1-123-33-1-12345',
      });

      const file = this.server.create('file', {
        project: project.id,
        is_dynamic_done: true,
      });

      this.server.get('/v3/files/:id', (schema, req) => {
        return schema.files.find(`${req.params.id}`)?.toJSON();
      });

      this.server.get('/v2/files/:id/capi_reports', (schema) => {
        const fileReports = schema.fileCapiReports.all().models;

        return {
          count: fileReports.length,
          next: null,
          previous: null,
          results: fileReports,
        };
      });

      this.setProperties({
        store,
        file: store.push(store.normalize('file', file.toJSON())),
        closeDrawer: () => {},
      });
    });

    test('it renders loading state and generate files CTA when reports list is empty and file can generate report', async function (assert) {
      this.server.get(
        'v2/files/:id/capi_reports',
        () => {
          return { count: 0, next: null, previous: null, results: [] };
        },
        { timing: 500 }
      );

      render(
        hbs`<FileDetails::DynamicScan::Results::CapisReportDrawer @file={{this.file}} @closeDrawer={{this.closeDrawer}} />`
      );

      await waitFor('[data-test-fileDetailsDynamicScan-capis-reportsDrawer]', {
        timeout: 500,
      });

      assert
        .dom('[data-test-fileDetailsDynamicScan-capis-reportsDrawer-title]')
        .hasText(t('apiScanModule.capisReportDownloadPreDownloadDesc'));

      assert
        .dom('[data-test-fileDetailsDynamicScan-capis-reportsDrawer]')
        .exists();

      assert
        .dom('[data-test-fileDetailsDynamicScan-capis-reportsLoader]')
        .exists();

      await waitUntil(
        () =>
          find('[data-test-fileDetailsDynamicScan-capis-generateReportCTA]'),
        { timeout: 500 }
      );

      assert
        .dom('[data-test-fileDetailsDynamicScan-capis-generateReportCTA]')
        .exists();

      assert
        .dom(
          '[data-test-fileDetailsDynamicScan-capis-generateReportCTA-vector]'
        )
        .exists();

      assert
        .dom(
          '[data-test-fileDetailsDynamicScan-capis-generateReportCTA-directiveText]'
        )
        .hasText(t('apiScanModule.capiGenerateInstruction'));

      assert
        .dom('[data-test-fileDetailsDynamicScan-capis-generateReportCTA-btn]')
        .exists()
        .hasText(t('apiScanModule.generateFiles'));

      assert
        .dom(
          '[data-test-fileDetailsDynamicScan-capis-generateReportProgress-container]'
        )
        .doesNotExist();
    });

    test('it triggers report files generation when the generate button is clicked', async function (assert) {
      this.set('hasGeneratedReport', false);

      this.server.get('/v2/files/:id/capi_reports', (schema) => {
        const fileReports = schema.fileCapiReports.all().models;

        return {
          count: fileReports.length,
          next: null,
          previous: null,
          results: fileReports,
        };
      });

      this.server.post(
        '/v2/files/:id/capi_reports',
        (schema, req) => {
          const fileId = req.params.id;

          const harReport = this.server.create('file-capi-report', {
            file: fileId,
            file_type: 'har',
            status: ENUMS.FILE_CAPI_REPORT_STATUS.STARTED,
            is_outdated: false,
          });

          const jsonReport = this.server.create('file-capi-report', {
            file: fileId,
            file_type: 'json',
            status: ENUMS.FILE_CAPI_REPORT_STATUS.STARTED,
            is_outdated: false,
          });

          this.set('hasGeneratedReport', true);
          this.set('generatedReports', [harReport, jsonReport]);

          return { reports: schema.fileCapiReports.all().models };
        },
        { timing: 100 }
      );

      await render(
        hbs`<FileDetails::DynamicScan::Results::CapisReportDrawer @file={{this.file}} @closeDrawer={{this.closeDrawer}} />`
      );

      assert
        .dom('[data-test-fileDetailsDynamicScan-capis-generateReportCTA-btn]')
        .isNotDisabled()
        .hasText(t('apiScanModule.generateFiles'));

      click('[data-test-fileDetailsDynamicScan-capis-generateReportCTA-btn]');

      await waitFor('[data-test-fileDetailsDynamicScan-capis-reportsLoader]', {
        timeout: 100,
      });

      assert
        .dom('[data-test-fileDetailsDynamicScan-capis-generateReportCTA]')
        .doesNotExist();

      await waitFor('[data-test-fileDetailsDynamicScan-capis-reportList]', {
        timeout: 100,
      });

      assert
        .dom(
          '[data-test-fileDetailsDynamicScan-capis-generateReportProgress-container]'
        )
        .exists();

      assert
        .dom(
          '[data-test-fileDetailsDynamicScan-capis-generateReportProgress-text]'
        )
        .hasText(t('apiScanModule.generatingCapisReportFiles'));

      assert
        .dom(
          '[data-test-fileDetailsDynamicScan-capis-generateReportProgress-loader]'
        )
        .exists();

      assert
        .dom('[data-test-fileDetailsDynamicScan-capis-reportList]')
        .exists();

      // Check the progress of the generated reports
      const latestReportsProgress =
        this.generatedReports.reduce((acc, r) => acc + r.progress, 0) /
        this.generatedReports.length;

      assert
        .dom(`[data-test-ak-loader-linear-progress="${latestReportsProgress}"]`)
        .exists();

      assert
        .dom(
          '[data-test-fileDetailsDynamicScan-capis-generateReportProgress-percent]'
        )
        .exists()
        .hasText(`${latestReportsProgress}%`);

      const notifyService = this.owner.lookup('service:notifications');

      assert.strictEqual(
        notifyService.successMsg,
        t('reportIsGettingGenerated')
      );

      // Sanity check for the report list
      assert
        .dom('[data-test-fileDetailsDynamicScan-capis-reportList]')
        .exists();

      const reportItems = findAll(
        '[data-test-fileDetailsDynamicScan-capis-reportList-reportItem]'
      );

      // Reports are generated the "json", "har" formats.
      const harReport = this.generatedReports[0];
      const jsonReport = this.generatedReports[1];

      const reportDetails = [
        {
          capiReport: harReport,
          type: 'har',
          primaryText: t('apiScanModule.harFile'),
          secondaryText: t('noPasswordRequired'),
          generatedOnDateTime: harReport?.generatedOnDateTime,
          isOutdated: harReport?.isOutdated,
        },
        {
          capiReport: jsonReport,
          type: 'json',
          primaryText: t('apiScanModule.jsonFile'),
          secondaryText: t('noPasswordRequired'),
          generatedOnDateTime: jsonReport?.generatedOnDateTime,
          isOutdated: jsonReport?.isOutdated,
        },
      ];

      // Reports sanity check
      assert.strictEqual(
        reportItems.length,
        reportDetails.length,
        'display correct number of reports'
      );

      reportDetails.forEach(({ type, primaryText }) => {
        assert
          .dom(
            `[data-test-fileDetailsDynamicScan-capis-reportList-reportItem-icon='${type}']`
          )
          .exists();

        assert
          .dom(
            `[data-test-fileDetailsDynamicScan-capis-reportList-Item='${type}']`
          )
          .containsText(primaryText)
          .containsText(t('generating')); // Since reports are generating it should show generating text
      });
    });

    test('it should show error when report files generation fails', async function (assert) {
      this.server.post('/v2/files/:id/capi_reports', () => {
        return new Response(
          400,
          { some: 'header' },
          { errors: [t('reportGenerateError')] }
        );
      });

      await render(
        hbs`<FileDetails::DynamicScan::Results::CapisReportDrawer @file={{this.file}} @closeDrawer={{this.closeDrawer}} />`
      );

      await click(
        '[data-test-fileDetailsDynamicScan-capis-generateReportCTA-btn]'
      );

      const notifyService = this.owner.lookup('service:notifications');

      assert.strictEqual(notifyService.errorMsg, t('reportGenerateError'));
    });
  }
);
