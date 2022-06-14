import { module, test } from 'qunit';
import dayjs from 'dayjs';
import { Response } from 'miragejs';
import { setupRenderingTest } from 'ember-qunit';
import Service from '@ember/service';
import { render, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl } from 'ember-intl/test-support';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { serializer } from 'irene/tests/test-utils';
import styles from 'irene/components/partner/client-report-download/index.scss';

class WindowStub extends Service {
  locationAssign(url) {
    return url;
  }
}

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
  'Integration | Component | partner/client-report-download',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks);

    hooks.beforeEach(async function () {
      this.owner.register('service:notifications', NotificationsStub);
      this.owner.register('service:window', WindowStub);

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
        .hasClass(styles['button-progress']);
      assert
        .dom('[data-test-download-button-generating-progress]')
        .hasClass('is-progress')
        .hasClass(styles['progress-loader'])
        .hasAttribute('style', `width: ${report.progress}%`);
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
        .hasText(`t:generateNewReport:()`);
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
        .hasText(`t:reportGenerationInProgressWait:()`);
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
          return new Response(500);
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

    test('it should download report pdf file on download button click', async function (assert) {
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

      this.server.get('v2/reports/:id/pdf', () => {
        return new Response(
          200,
          {},
          {
            url: 'http://localhost/report_signed_url.pdf',
          }
        );
      });

      this.server.create('partner/partnerclient-report-unlockkey');
      this.server.get(
        'v2/partnerclients/:clientId/reports/:id/unlock_key',
        (schema) => {
          const data = schema['partner/partnerclientReportUnlockkeys'].find(1);
          return serializer(data);
        }
      );

      this.set('clientId', 1);
      this.set('fileId', 1);

      const notifyService = this.owner.lookup('service:notifications');

      await render(
        hbs`<Partner::ClientReportDownload @clientId={{this.clientId}} @fileId={{this.fileId}} />`
      );

      const downloadBtn = this.element.querySelector(
        '[data-test-download-report-button]'
      );

      await click(downloadBtn);

      assert.strictEqual(notifyService.get('errorMsg'), null);
    });

    test('it should auto expand password dropdown after download', async function (assert) {
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

      this.server.get('v2/reports/:id/pdf', () => {
        return new Response(
          200,
          {},
          { url: 'http://localhost/report_signed_url.pdf' }
        );
      });

      const unlockKey = this.server.create(
        'partner/partnerclient-report-unlockkey'
      );
      this.server.get(
        'v2/partnerclients/:clientId/reports/:id/unlock_key',
        (schema) => {
          const data = schema['partner/partnerclientReportUnlockkeys'].find(1);
          return serializer(data);
        }
      );

      this.set('clientId', 1);
      this.set('fileId', 1);

      await render(
        hbs`<Partner::ClientReportDownload @clientId={{this.clientId}} @fileId={{this.fileId}} />`
      );

      assert.dom('[data-test-action-copy-password]').exists();
      assert
        .dom(`[data-test-report-password-toggle-id="${report.id}"]`)
        .exists();
      assert.dom('[data-test-dropdown-tray]').doesNotExist();

      const downloadBtn = this.element.querySelector(
        '[data-test-download-report-button]'
      );
      await click(downloadBtn);

      assert.dom('[data-test-action-copy-password]').exists();
      assert
        .dom(`[data-test-report-password-toggle-id="${report.id}"]`)
        .exists();
      assert.dom('[data-test-dropdown-tray]').exists();
      assert.dom('[data-test-report-password]').exists();
      assert
        .dom('[data-test-report-password-title]')
        .hasText(`t:reportPassword:()`);
      assert
        .dom('[data-test-report-password-value]')
        .hasAttribute('id', `unlock-key-${report.id}`)
        .hasValue(unlockKey.unlockKey);
      assert
        .dom('[data-test-report-password-copy-button]')
        .containsText(`t:copy:()`);
    });

    test('it should notify on download report error', async function (assert) {
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

      this.server.get('v2/reports/:id/pdf', () => {
        return new Response(500);
      });

      this.set('clientId', 1);
      this.set('fileId', 1);

      const notifyService = this.owner.lookup('service:notifications');

      await render(
        hbs`<Partner::ClientReportDownload @clientId={{this.clientId}} @fileId={{this.fileId}} />`
      );

      const downloadBtn = this.element.querySelector(
        '[data-test-download-report-button]'
      );

      await click(downloadBtn);

      assert.strictEqual(
        notifyService.get('errorMsg'),
        `t:downloadUrlNotFound:()`
      );
    });

    test('it should trigger report generation and notify on generate button click', async function (assert) {
      this.server.create('partner/partner', {
        access: { download_reports: true },
      });
      this.server.get('v2/partners/:id', (schema) => {
        return serializer(schema['partner/partners'].find(1));
      });
      await this.owner.lookup('service:partner').load();

      this.server.create('partner/partnerclient-file');
      this.server.get('v2/partnerclients/:clientId/files/:fileId', (schema) => {
        const data = schema['partner/partnerclientFiles'].find(1);
        return serializer(data);
      });

      this.server.post(
        'v2/partnerclients/:clientId/files/:fileId/reports',
        () => {
          return new Response(202);
        }
      );

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

      const notifyService = this.owner.lookup('service:notifications');

      await render(
        hbs`<Partner::ClientReportDownload @clientId={{this.clientId}} @fileId={{this.fileId}} />`
      );

      const generateBtn = this.element.querySelector(
        '[data-test-generate-report-button]'
      );

      await click(generateBtn);

      assert.strictEqual(
        notifyService.get('successMsg'),
        `t:reportIsGettingGenerated:()`
      );
      assert.strictEqual(notifyService.get('errorMsg'), null);
    });

    test('it should notify error on report generation button click', async function (assert) {
      this.server.create('partner/partner', {
        access: { download_reports: true },
      });
      this.server.get('v2/partners/:id', (schema) => {
        return serializer(schema['partner/partners'].find(1));
      });
      await this.owner.lookup('service:partner').load();

      this.server.create('partner/partnerclient-file');
      this.server.get('v2/partnerclients/:clientId/files/:fileId', (schema) => {
        const data = schema['partner/partnerclientFiles'].find(1);
        return serializer(data);
      });

      this.server.post(
        'v2/partnerclients/:clientId/files/:fileId/reports',
        () => {
          return new Response(
            403,
            {},
            {
              detail: 'You do not have permission to perform this action.',
            }
          );
        }
      );

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

      const notifyService = this.owner.lookup('service:notifications');

      await render(
        hbs`<Partner::ClientReportDownload @clientId={{this.clientId}} @fileId={{this.fileId}} />`
      );

      const generateBtn = this.element.querySelector(
        '[data-test-generate-report-button]'
      );

      await click(generateBtn);

      assert.strictEqual(notifyService.get('successMsg'), null);
      assert.strictEqual(
        notifyService.get('errorMsg'),
        'You do not have permission to perform this action.'
      );
    });

    test('it should notify error from API if exists on report generation failure', async function (assert) {
      this.server.create('partner/partner', {
        access: { download_reports: true },
      });
      this.server.get('v2/partners/:id', (schema) => {
        return serializer(schema['partner/partners'].find(1));
      });
      await this.owner.lookup('service:partner').load();

      this.server.create('partner/partnerclient-file');
      this.server.get('v2/partnerclients/:clientId/files/:fileId', (schema) => {
        const data = schema['partner/partnerclientFiles'].find(1);
        return serializer(data);
      });

      this.server.post(
        'v2/partnerclients/:clientId/files/:fileId/reports',
        () => {
          return new Response(
            400,
            {},
            {
              message: 'A report is already being generated. Please wait.',
            }
          );
        }
      );

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

      const notifyService = this.owner.lookup('service:notifications');

      await render(
        hbs`<Partner::ClientReportDownload @clientId={{this.clientId}} @fileId={{this.fileId}} />`
      );

      const generateBtn = this.element.querySelector(
        '[data-test-generate-report-button]'
      );

      await click(generateBtn);

      assert.strictEqual(notifyService.get('successMsg'), null);
      assert.strictEqual(
        notifyService.get('errorMsg'),
        'A report is already being generated. Please wait.'
      );
    });
  }
);
