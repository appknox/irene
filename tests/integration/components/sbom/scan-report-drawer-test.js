import { find, findAll, render, click, waitFor } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';

import { SbomScanReportStatus } from 'irene/models/sbom-scan-report';
import Service from '@ember/service';

class NotificationsStub extends Service {
  errorMsg = null;
  successMsg = null;
  infoMsg = null;

  error(msg) {
    this.errorMsg = msg;
  }

  success(msg) {
    this.successMsg = msg;
  }

  info(msg) {
    this.infoMsg = msg;
  }
}

class WindowStub extends Service {
  url = null;
  target = null;

  open(url, target) {
    this.url = url;
    this.target = target;
  }
}

module('Integration | Component | sbom/scan-report-drawer', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  hooks.beforeEach(async function () {
    const store = this.owner.lookup('service:store');

    const file = this.server.create('file');
    const project = this.server.create('project', { last_file_id: file.id });

    const sbomApp = this.server.create('sbom-app', {
      project: project.id,
    });

    const sbomScan = this.server.create('sbom-scan');
    const sbomScanReport = this.server.create('sbom-scan-report');

    const normalizedSbomScan = store.normalize('sbom-scan', sbomScan.toJSON());
    const normalizedSbomApp = store.normalize('sbom-scan', sbomApp.toJSON());

    this.setProperties({
      sbomScan: store.push(normalizedSbomScan),
      sbomApp: store.push(normalizedSbomApp),
      sbomScanReport,
      onClose: () => {},
    });

    this.owner.register('service:notifications', NotificationsStub);
    this.owner.register('service:browser/window', WindowStub);
  });

  test('it renders scan report drawer', async function (assert) {
    this.server.get('/v2/sb_files/:id/sb_reports', (schema) => {
      const results = schema.sbomScanReports.all().models;

      return { count: results.length, next: null, previous: null, results };
    });

    await render(hbs`
      <Sbom::ScanReportDrawer @sbomScan={{this.sbomScan}} @open={{true}} @onClose={{this.onClose}} />
    `);

    assert.dom('[data-test-sbomScanReportDrawer-drawer]').exists();

    assert
      .dom('[data-test-sbomScanReportDrawer-title]')
      .hasText('t:sbomModule.scanReports:()');

    assert.dom('[data-test-sbomScanReportDrawer-closeBtn]').isNotDisabled();

    assert
      .dom(
        '[data-test-appPlatform-icon]',
        find('[data-test-sbomScanReportDrawer-drawer]')
      )
      .doesNotExist();

    assert
      .dom(
        '[data-test-sbomApp-logo]',
        find('[data-test-sbomScanReportDrawer-drawer]')
      )
      .doesNotExist();

    assert.dom('[data-test-sbomScanReportDrawer-appName]').doesNotExist();

    assert
      .dom('[data-test-sbomScanReportDrawer-appPackageName]')
      .doesNotExist();

    assert
      .dom('[data-test-sbomScanReportDrawer-description]')
      .hasText('t:sbomModule.sbomDownloadReportDescription:()');

    assert.dom('[data-test-sbomScanReportList-reportlist]').exists();

    const reportList = findAll('[data-test-sbomScanReportList-reportlistItem]');

    assert.strictEqual(reportList.length, 2);
  });

  test('test pdf report generate & download flow', async function (assert) {
    this.setProperties({
      status: SbomScanReportStatus.PENDING,
      open: true,
    });

    this.server.get('/v2/sb_files/:id/sb_reports', (schema) => {
      const results = schema.sbomScanReports.all().models;

      results[0].pdf_status = this.status;

      return { count: results.length, next: null, previous: null, results };
    });

    this.server.get('/v2/sb_reports/:id', (schema, req) => {
      return {
        ...schema.sbomScanReports.find(`${req.params.id}`)?.toJSON(),
        pdf_status: SbomScanReportStatus.IN_PROGRESS,
      };
    });

    this.server.post('/v2/sb_reports/:id/pdf/generate', () => ({
      success: true,
    }));

    this.server.get('/v2/sb_reports/:id/pdf/download_url', () => {
      return { url: 'some_pdf_download_url.com' };
    });

    await render(hbs`
      <Sbom::ScanReportDrawer @sbomScan={{this.sbomScan}} @open={{this.open}} @onClose={{this.onClose}} />
    `);

    assert.dom('[data-test-sbomScanReportDrawer-drawer]').exists();
    assert.dom('[data-test-sbomScanReportList-reportlist]').exists();

    let reportList = findAll('[data-test-sbomScanReportList-reportlistItem]');

    assert
      .dom('[data-test-sbomScanReportList-reportGenerateTitle]', reportList[0])
      .hasText('t:sbomModule.sbomDownloadPdfPrimaryText:()');

    assert
      .dom('[data-test-sbomScanReportList-reportGenerateSvg]', reportList[0])
      .exists();

    assert
      .dom(
        '[data-test-sbomScanReportList-reportGenerateDescription]',
        reportList[0]
      )
      .hasText('t:sbomModule.generateReportDescription:()');

    assert
      .dom('[data-test-sbomScanReportList-reportGenerateBtn]', reportList[0])
      .isNotDisabled()
      .hasText('t:generateReport:()');

    await click(
      reportList[0].querySelector(
        '[data-test-sbomScanReportList-reportGenerateBtn]'
      )
    );

    // refresh dom reference
    reportList = findAll('[data-test-sbomScanReportList-reportlistItem]');

    // previous state
    assert
      .dom('[data-test-sbomScanReportList-reportGenerateTitle]', reportList[0])
      .doesNotExist();

    assert
      .dom('[data-test-sbomScanReportList-reportGenerateSvg]', reportList[0])
      .doesNotExist();

    assert
      .dom(
        '[data-test-sbomScanReportList-reportGenerateDescription]',
        reportList[0]
      )
      .doesNotExist();

    assert
      .dom('[data-test-sbomScanReportList-reportGenerateBtn]', reportList[0])
      .doesNotExist();

    // current state
    assert
      .dom('[data-test-sbomScanReportList-reportPrimaryText]', reportList[0])
      .hasText('t:sbomModule.sbomDownloadPdfPrimaryText:()');

    assert
      .dom('[data-test-sbomScanReportList-reportGeneratingText]', reportList[0])
      .hasText('t:generating:()...');

    assert
      .dom(
        '[data-test-sbomScanReportList-reportGeneratingLoader]',
        reportList[0]
      )
      .exists();

    // close and open to get latest status
    this.set('open', false);

    assert.dom('[data-test-sbomScanReportDrawer-drawer]').doesNotExist();
    assert.dom('[data-test-sbomScanReportList-reportlist]').doesNotExist();

    this.setProperties({
      status: SbomScanReportStatus.COMPLETED,
      open: true,
    });

    assert.dom('[data-test-sbomScanReportDrawer-drawer]').exists();

    // wait for api
    await waitFor('[data-test-sbomScanReportList-reportlist]', {
      timeout: 200,
    });

    // refresh dom reference
    reportList = findAll('[data-test-sbomScanReportList-reportlistItem]');

    // previous state
    assert
      .dom('[data-test-sbomScanReportList-reportGeneratingText]', reportList[0])
      .doesNotExist();

    assert
      .dom(
        '[data-test-sbomScanReportList-reportGeneratingLoader]',
        reportList[0]
      )
      .doesNotExist();

    // after report generation
    assert
      .dom('[data-test-sbomScanReportList-reportPrimaryText]', reportList[0])
      .hasText('t:sbomModule.sbomDownloadPdfPrimaryText:()');

    assert
      .dom('[data-test-sbomScanReportList-reportSecondaryText]', reportList[0])
      .hasText(
        `t:sbomModule.sbomDownloadPdfSecondaryText:("password":"${this.sbomScanReport.report_password}")`
      );

    assert
      .dom('[data-test-sbomScanReportList-reportCopyBtn]', reportList[0])
      .isNotDisabled()
      .hasAttribute('data-clipboard-text', this.sbomScanReport.report_password);

    assert
      .dom('[data-test-sbomScanReportList-reportDownloadBtn]', reportList[0])
      .isNotDisabled();

    await click(
      reportList[0].querySelector(
        '[data-test-sbomScanReportList-reportDownloadBtn]'
      )
    );

    const window = this.owner.lookup('service:browser/window');

    assert.strictEqual(window.url, 'some_pdf_download_url.com');
    assert.strictEqual(window.target, '_blank');
  });

  test('test pdf report download (already generated)', async function (assert) {
    this.server.get('/v2/sb_files/:id/sb_reports', (schema) => {
      const results = schema.sbomScanReports.all().models;

      results[0].pdf_status = SbomScanReportStatus.COMPLETED;

      return { count: results.length, next: null, previous: null, results };
    });

    this.server.get('/v2/sb_reports/:id/pdf/download_url', () => {
      return { url: 'some_pdf_download_url.com' };
    });

    await render(hbs`
      <Sbom::ScanReportDrawer @sbomScan={{this.sbomScan}} @open={{true}} @onClose={{this.onClose}} />
    `);

    assert.dom('[data-test-sbomScanReportDrawer-drawer]').exists();
    assert.dom('[data-test-sbomScanReportList-reportlist]').exists();

    const reportList = findAll('[data-test-sbomScanReportList-reportlistItem]');

    assert
      .dom('[data-test-sbomScanReportList-reportPrimaryText]', reportList[0])
      .hasText('t:sbomModule.sbomDownloadPdfPrimaryText:()');

    assert
      .dom('[data-test-sbomScanReportList-reportSecondaryText]', reportList[0])
      .hasText(
        `t:sbomModule.sbomDownloadPdfSecondaryText:("password":"${this.sbomScanReport.report_password}")`
      );

    assert
      .dom('[data-test-sbomScanReportList-reportCopyBtn]', reportList[0])
      .isNotDisabled()
      .hasAttribute('data-clipboard-text', this.sbomScanReport.report_password);

    assert
      .dom('[data-test-sbomScanReportList-reportDownloadBtn]', reportList[0])
      .isNotDisabled();

    await click(
      reportList[0].querySelector(
        '[data-test-sbomScanReportList-reportDownloadBtn]'
      )
    );

    const window = this.owner.lookup('service:browser/window');

    assert.strictEqual(window.url, 'some_pdf_download_url.com');
    assert.strictEqual(window.target, '_blank');
  });

  test('test pdf report copy password', async function (assert) {
    this.server.get('/v2/sb_files/:id/sb_reports', (schema) => {
      const results = schema.sbomScanReports.all().models;

      results[0].pdf_status = SbomScanReportStatus.COMPLETED;

      return { count: results.length, next: null, previous: null, results };
    });

    await render(hbs`
      <Sbom::ScanReportDrawer @sbomScan={{this.sbomScan}} @open={{true}} @onClose={{this.onClose}} />
    `);

    assert.dom('[data-test-sbomScanReportDrawer-drawer]').exists();
    assert.dom('[data-test-sbomScanReportList-reportlist]').exists();

    const reportList = findAll('[data-test-sbomScanReportList-reportlistItem]');

    assert
      .dom('[data-test-sbomScanReportList-reportSecondaryText]', reportList[0])
      .hasText(
        `t:sbomModule.sbomDownloadPdfSecondaryText:("password":"${this.sbomScanReport.report_password}")`
      );

    assert
      .dom('[data-test-sbomScanReportList-reportCopyBtn]', reportList[0])
      .isNotDisabled()
      .hasAttribute('data-clipboard-text', this.sbomScanReport.report_password);

    await click(
      reportList[0].querySelector(
        '[data-test-sbomScanReportList-reportCopyBtn]'
      )
    );

    const notify = this.owner.lookup('service:notifications');

    assert.strictEqual(notify.infoMsg, 't:passwordCopied:()');
  });

  test('test json report download', async function (assert) {
    this.server.get('/v2/sb_files/:id/sb_reports', (schema) => {
      const results = schema.sbomScanReports.all().models;

      results[0].pdf_status = SbomScanReportStatus.COMPLETED;

      return { count: results.length, next: null, previous: null, results };
    });

    this.server.get(
      '/v2/sb_reports/:id/cyclonedx_json_file/download_url',
      () => {
        return { url: 'some_download_url.com' };
      }
    );

    await render(hbs`
      <Sbom::ScanReportDrawer @sbomScan={{this.sbomScan}} @open={{true}} @onClose={{this.onClose}} />
    `);

    assert.dom('[data-test-sbomScanReportDrawer-drawer]').exists();
    assert.dom('[data-test-sbomScanReportList-reportlist]').exists();

    const reportList = findAll('[data-test-sbomScanReportList-reportlistItem]');

    assert
      .dom('[data-test-sbomScanReportList-reportPrimaryText]', reportList[1])
      .hasText('t:sbomModule.sbomDownloadJsonPrimaryText:()');

    assert
      .dom('[data-test-sbomScanReportList-reportSecondaryText]', reportList[1])
      .hasText('t:sbomModule.sbomDownloadJsonSecondaryText:()');

    assert
      .dom('[data-test-sbomScanReportList-reportDownloadBtn]', reportList[1])
      .isNotDisabled();

    await click(
      reportList[1].querySelector(
        '[data-test-sbomScanReportList-reportDownloadBtn]'
      )
    );

    const window = this.owner.lookup('service:browser/window');

    assert.strictEqual(window.url, 'some_download_url.com');
    assert.strictEqual(window.target, '_blank');
  });
});
