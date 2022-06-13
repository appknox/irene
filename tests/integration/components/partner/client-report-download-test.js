import { module, test } from 'qunit';
import dayjs from 'dayjs';
import { Response } from 'miragejs';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl } from 'ember-intl/test-support';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { serializer } from 'irene/tests/test-utils';
import styles from 'irene/components/partner/client-report-download/index.scss';

module(
  'Integration | Component | partner/client-report-download',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks);

    hooks.beforeEach(async function () {
      await this.server.create('organization');
      await this.owner.lookup('service:organization').load();
    });

    test('it should not render if report_download privilege is set to false', async function (assert) {
      this.server.create('partner/partner', {
        access: { download_reports: false },
      });
      this.server.get('v2/partners/:id', (schema) => {
        return serializer(schema['partner/partners'].find(1));
      });
      await this.owner.lookup('service:partner').load();

      this.set('clientId', 1);
      this.set('fileId', 1);

      await render(
        hbs`<Partner::ClientReportDownload @clientId={{this.clientId}} @fileId={{this.fileId}} />`
      );
      assert.dom('[data-test-report-download]').doesNotExist();
    });

    test('it should not render report download, generate or copy password buttons if reports list API fails', async function (assert) {
      this.server.create('partner/partner', {
        access: { download_reports: true },
      });
      this.server.get('v2/partners/:id', (schema) => {
        return serializer(schema['partner/partners'].find(1));
      });
      await this.owner.lookup('service:partner').load();

      this.server.get(
        'v2/partnerclients/:clientId/files/:fileId/reports',
        () => {
          return new Response(403);
        }
      );
      this.set('clientId', 1);
      this.set('fileId', 1);

      await render(
        hbs`<Partner::ClientReportDownload @clientId={{this.clientId}} @fileId={{this.fileId}} />`
      );
      assert.dom('[data-test-report-download]').exists();
      assert.dom('[data-test-report-actions]').doesNotExist();
      assert.dom('[data-test-action-download]').doesNotExist();
      assert.dom('[data-test-report-generate]').doesNotExist();
      assert.dom('[data-test-report-copy-password]').doesNotExist();
    });

    test('it should show disabled download button if no report exists', async function (assert) {
      this.server.create('partner/partner', {
        access: { download_reports: true },
      });
      this.server.get('v2/partners/:id', (schema) => {
        return serializer(schema['partner/partners'].find(1));
      });
      await this.owner.lookup('service:partner').load();

      this.server.get(
        'v2/partnerclients/:clientId/files/:fileId/reports',
        () => {
          return {
            count: 0,
            next: null,
            previous: null,
            results: [],
          };
        }
      );
      this.set('clientId', 1);
      this.set('fileId', 1);

      await render(
        hbs`<Partner::ClientReportDownload @clientId={{this.clientId}} @fileId={{this.fileId}} />`
      );
      assert.dom('[data-test-report-download]').exists();
      assert.dom('[data-test-download-report-button]').hasAttribute('disabled');
      assert
        .dom('[data-test-download-button-download-label]')
        .includesText(`t:download:()`);
      assert
        .dom('[data-test-download-button-no-report-tooltip]')
        .hasText(`t:noReportsGenerated:()`);
    });

    test('it should show disabled download button if fails to fetch report for the id', async function (assert) {
      this.server.create('partner/partner', {
        access: { download_reports: true },
      });
      this.server.get('v2/partners/:id', (schema) => {
        return serializer(schema['partner/partners'].find(1));
      });
      await this.owner.lookup('service:partner').load();

      this.server.create('partner/partnerclient-file-report');
      this.server.get(
        'v2/partnerclients/:clientId/files/:fileId/reports',
        (schema) => {
          const data = schema['partner/partnerclientFileReports'].all();
          return serializer(data, true);
        }
      );

      this.server.get('v2/partnerclients/:clientId/reports/:id', () => {
        return new Response(500);
      });

      this.set('clientId', 1);
      this.set('fileId', 1);

      await render(
        hbs`<Partner::ClientReportDownload @clientId={{this.clientId}} @fileId={{this.fileId}} />`
      );

      assert.dom('[data-test-report-download]').exists();
      assert.dom('[data-test-download-report-button]').hasAttribute('disabled');
      assert
        .dom('[data-test-download-button-download-label]')
        .includesText(`t:download:()`);
      assert
        .dom('[data-test-download-button-no-report-tooltip]')
        .hasText(`t:noReportsGenerated:()`);
    });

    test('it should render download button with generating state if report generation is in progress', async function (assert) {
      this.server.create('partner/partner', {
        access: { download_reports: true },
      });
      this.server.get('v2/partners/:id', (schema) => {
        return serializer(schema['partner/partners'].find(1));
      });
      await this.owner.lookup('service:partner').load();

      this.server.create('partner/partnerclient-file-report');
      this.server.get(
        'v2/partnerclients/:clientId/files/:fileId/reports',
        (schema) => {
          const data = schema['partner/partnerclientFileReports'].all();
          return serializer(data, true);
        }
      );

      const report = this.server.create('partner/partnerclient-report', {
        progress: 75,
      });
      this.server.get('v2/partnerclients/:clientId/reports/:id', (schema) => {
        const data = schema['partner/partnerclientReports'].find(1);
        return serializer(data);
      });

      this.set('clientId', 1);
      this.set('fileId', 1);

      await render(
        hbs`<Partner::ClientReportDownload @clientId={{this.clientId}} @fileId={{this.fileId}} />`
      );

      assert.dom('[data-test-report-download]').exists();
      assert
        .dom('[data-test-download-report-button]')
        .hasAttribute('disabled')
        .hasClass('is-progress')
        .hasClass(styles['button-progress']);
      assert
        .dom('[data-test-download-button-generating-label]')
        .hasText(`t:generating:()`);
      assert
        .dom('[data-test-download-button-generating-tooltip]')
        .hasText(`Progress: ${report.progress}%`);
    });

    test('it should show download button if report already exists for the user language', async function (assert) {
      this.server.create('partner/partner', {
        access: { download_reports: true },
      });
      this.server.get('v2/partners/:id', (schema) => {
        return serializer(schema['partner/partners'].find(1));
      });
      await this.owner.lookup('service:partner').load();

      this.server.create('partner/partnerclient-file-report');
      this.server.get(
        'v2/partnerclients/:clientId/files/:fileId/reports',
        (schema) => {
          const data = schema['partner/partnerclientFileReports'].all();
          return serializer(data, true);
        }
      );

      const report = this.server.create('partner/partnerclient-report', {
        progress: 100,
      });
      this.server.get('v2/partnerclients/:clientId/reports/:id', (schema) => {
        const data = schema['partner/partnerclientReports'].find(1);
        return serializer(data);
      });

      this.set('clientId', 1);
      this.set('fileId', 1);

      await render(
        hbs`<Partner::ClientReportDownload @clientId={{this.clientId}} @fileId={{this.fileId}} />`
      );

      assert.dom('[data-test-report-download]').exists();
      assert
        .dom('[data-test-download-report-button]')
        .hasNoAttribute('disabled')
        .hasNoClass(styles['button-progress']);
      assert
        .dom('[data-test-download-button-download-label]')
        .includesText(`t:download:()`);
      assert
        .dom('[data-test-download-button-tooltip]')
        .hasText(
          `t:generatedOn:() ${dayjs(report.generatedOn).format(
            'DD MMM YYYY hh:mm a'
          )}`
        );
    });

    test('it should enable generate button if no report exists', async function (assert) {
      this.server.create('partner/partner', {
        access: { download_reports: true },
      });
      this.server.get('v2/partners/:id', (schema) => {
        return serializer(schema['partner/partners'].find(1));
      });
      await this.owner.lookup('service:partner').load();

      this.server.get(
        'v2/partnerclients/:clientId/files/:fileId/reports',
        () => {
          return {
            count: 0,
            next: null,
            previous: null,
            results: [],
          };
        }
      );

      this.set('clientId', 1);
      this.set('fileId', 1);

      await render(
        hbs`<Partner::ClientReportDownload @clientId={{this.clientId}} @fileId={{this.fileId}} />`
      );

      assert
        .dom('[data-test-generate-report-button]')
        .doesNotHaveAttribute('disabled');
    });

    test('it should enable generate button even if report already exists', async function (assert) {
      this.server.create('partner/partner', {
        access: { download_reports: true },
      });
      this.server.get('v2/partners/:id', (schema) => {
        return serializer(schema['partner/partners'].find(1));
      });
      await this.owner.lookup('service:partner').load();

      this.server.create('partner/partnerclient-file-report');
      this.server.get(
        'v2/partnerclients/:clientId/files/:fileId/reports',
        (schema) => {
          const data = schema['partner/partnerclientFileReports'].all();
          return serializer(data, true);
        }
      );

      this.server.create('partner/partnerclient-report', {
        progress: 100,
      });
      this.server.get('v2/partnerclients/:clientId/reports/:id', (schema) => {
        const data = schema['partner/partnerclientReports'].find(1);
        return serializer(data);
      });

      this.set('clientId', 1);
      this.set('fileId', 1);

      await render(
        hbs`<Partner::ClientReportDownload @clientId={{this.clientId}} @fileId={{this.fileId}} />`
      );

      assert
        .dom('[data-test-generate-report-button]')
        .doesNotHaveAttribute('disabled')
        .hasText('');
      assert
        .dom('[data-test-generate-button-tooltip]')
        .hasText(`t:generate:() t:newReport:()`);
    });

    test('it should disable generate button even if report is in generating state', async function (assert) {
      this.server.create('partner/partner', {
        access: { download_reports: true },
      });
      this.server.get('v2/partners/:id', (schema) => {
        return serializer(schema['partner/partners'].find(1));
      });
      await this.owner.lookup('service:partner').load();

      this.server.create('partner/partnerclient-file-report');
      this.server.get(
        'v2/partnerclients/:clientId/files/:fileId/reports',
        (schema) => {
          const data = schema['partner/partnerclientFileReports'].all();
          return serializer(data, true);
        }
      );

      this.server.create('partner/partnerclient-report', {
        progress: 75,
      });
      this.server.get('v2/partnerclients/:clientId/reports/:id', (schema) => {
        const data = schema['partner/partnerclientReports'].find(1);
        return serializer(data);
      });

      this.set('clientId', 1);
      this.set('fileId', 1);

      await render(
        hbs`<Partner::ClientReportDownload @clientId={{this.clientId}} @fileId={{this.fileId}} />`
      );

      assert
        .dom('[data-test-generate-report-button]')
        .hasAttribute('disabled')
        .hasText('');
      assert
        .dom('[data-test-generate-button-progress-tooltip]')
        .hasText('Report generation in progress. Please wait');
    });

    test('it should hide password toggle button if no report exists', async function (assert) {
      this.server.create('partner/partner', {
        access: { download_reports: true },
      });
      this.server.get('v2/partners/:id', (schema) => {
        return serializer(schema['partner/partners'].find(1));
      });
      await this.owner.lookup('service:partner').load();

      this.server.get(
        'v2/partnerclients/:clientId/files/:fileId/reports',
        () => {
          return {
            count: 0,
            next: null,
            previous: null,
            results: [],
          };
        }
      );
      this.set('clientId', 1);
      this.set('fileId', 1);

      await render(
        hbs`<Partner::ClientReportDownload @clientId={{this.clientId}} @fileId={{this.fileId}} />`
      );
      assert.dom('[data-test-action-copy-password]').doesNotExist();
    });

    test('it should hide password toggle button if report detail api fails to load', async function (assert) {
      this.server.create('partner/partner', {
        access: { download_reports: true },
      });
      this.server.get('v2/partners/:id', (schema) => {
        return serializer(schema['partner/partners'].find(1));
      });
      await this.owner.lookup('service:partner').load();

      this.server.get(
        'v2/partnerclients/:clientId/files/:fileId/reports',
        () => {
          return Response(500);
        }
      );
      this.set('clientId', 1);
      this.set('fileId', 1);

      await render(
        hbs`<Partner::ClientReportDownload @clientId={{this.clientId}} @fileId={{this.fileId}} />`
      );
      assert.dom('[data-test-action-copy-password]').doesNotExist();
    });

    test('it should show password toggle button if report already exists', async function (assert) {
      this.server.create('partner/partner', {
        access: { download_reports: true },
      });
      this.server.get('v2/partners/:id', (schema) => {
        return serializer(schema['partner/partners'].find(1));
      });
      await this.owner.lookup('service:partner').load();

      this.server.create('partner/partnerclient-file-report');
      this.server.get(
        'v2/partnerclients/:clientId/files/:fileId/reports',
        (schema) => {
          const data = schema['partner/partnerclientFileReports'].all();
          return serializer(data, true);
        }
      );

      const report = this.server.create('partner/partnerclient-report', {
        progress: 100,
      });
      this.server.get('v2/partnerclients/:clientId/reports/:id', (schema) => {
        const data = schema['partner/partnerclientReports'].find(1);
        return serializer(data);
      });
      this.set('clientId', 1);
      this.set('fileId', 1);

      await render(
        hbs`<Partner::ClientReportDownload @clientId={{this.clientId}} @fileId={{this.fileId}} />`
      );
      assert.dom('[data-test-action-copy-password]').exists();
      assert
        .dom(`[data-test-report-password-toggle-id="${report.id}"]`)
        .exists();
    });

    test('it should show password toggle button if report is being generated', async function (assert) {
      this.server.create('partner/partner', {
        access: { download_reports: true },
      });
      this.server.get('v2/partners/:id', (schema) => {
        return serializer(schema['partner/partners'].find(1));
      });
      await this.owner.lookup('service:partner').load();

      this.server.create('partner/partnerclient-file-report');
      this.server.get(
        'v2/partnerclients/:clientId/files/:fileId/reports',
        (schema) => {
          const data = schema['partner/partnerclientFileReports'].all();
          return serializer(data, true);
        }
      );

      const report = this.server.create('partner/partnerclient-report', {
        progress: 50,
      });
      this.server.get('v2/partnerclients/:clientId/reports/:id', (schema) => {
        const data = schema['partner/partnerclientReports'].find(1);
        return serializer(data);
      });
      this.set('clientId', 1);
      this.set('fileId', 1);

      await render(
        hbs`<Partner::ClientReportDownload @clientId={{this.clientId}} @fileId={{this.fileId}} />`
      );
      assert.dom('[data-test-action-copy-password]').exists();
      assert
        .dom(`[data-test-report-password-toggle-id="${report.id}"]`)
        .exists();
    });
  }
);
