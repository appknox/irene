import { find, findAll, render, click, waitFor } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';

import { SbomReportStatus } from 'irene/models/sbom-report';
import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';

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

class RealtimeStub extends Service {
  @tracked SbomReportCounter = 0;
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
  setupIntl(hooks, 'en');

  hooks.beforeEach(async function () {
    const store = this.owner.lookup('service:store');

    const file = this.server.create('file');
    const project = this.server.create('project', { last_file: file });

    const sbomProject = this.server.create('sbom-project', {
      project: project.id,
    });

    const sbomFile = this.server.create('sbom-file');
    const sbomReport = this.server.create('sbom-report');

    const normalizedSbomScan = store.normalize('sbom-file', sbomFile.toJSON());
    const normalizedSbomProject = store.normalize(
      'sbom-file',
      sbomProject.toJSON()
    );

    this.setProperties({
      sbomFile: store.push(normalizedSbomScan),
      sbomProject: store.push(normalizedSbomProject),
      sbomReport,
      onClose: () => {},
    });

    this.owner.register('service:notifications', NotificationsStub);
    this.owner.register('service:realtime', RealtimeStub);
    this.owner.register('service:browser/window', WindowStub);
  });

  test('it renders scan report drawer', async function (assert) {
    this.server.get('/v2/sb_files/:id/sb_reports', (schema) => {
      const results = schema.sbomReports.all().models;

      return { count: results.length, next: null, previous: null, results };
    });

    await render(hbs`
      <Sbom::ScanReportDrawer @sbomFile={{this.sbomFile}} @open={{true}} @onClose={{this.onClose}} />
    `);

    assert.dom('[data-test-sbomReportDrawer-drawer]').exists();

    assert
      .dom('[data-test-sbomReportDrawer-title]')
      .hasText(t('sbomModule.scanReports'));

    assert.dom('[data-test-sbomReportDrawer-closeBtn]').isNotDisabled();

    assert
      .dom(
        '[data-test-appPlatform-icon]',
        find('[data-test-sbomReportDrawer-drawer]')
      )
      .doesNotExist();

    assert
      .dom(
        '[data-test-appLogo-img]',
        find('[data-test-sbomReportDrawer-drawer]')
      )
      .doesNotExist();

    assert.dom('[data-test-sbomReportDrawer-appName]').doesNotExist();

    assert.dom('[data-test-sbomReportDrawer-appPackageName]').doesNotExist();

    assert
      .dom('[data-test-sbomReportDrawer-description]')
      .hasText(t('sbomModule.sbomDownloadReportDescription'));

    assert.dom('[data-test-sbomReportList-reportlist]').exists();

    const reportList = findAll('[data-test-sbomReportList-reportlistItem]');

    assert.strictEqual(reportList.length, 2);
  });

  test('test pdf report generate & download flow', async function (assert) {
    this.setProperties({
      status: SbomReportStatus.PENDING,
      open: true,
    });

    this.server.get('/v2/sb_files/:id/sb_reports', (schema) => {
      const results = schema.sbomReports.all().models;

      results[0].pdf_status = this.status;

      return { count: results.length, next: null, previous: null, results };
    });

    this.server.get('/v2/sb_reports/:id', (schema, req) => {
      return {
        ...schema.sbomReports.find(`${req.params.id}`)?.toJSON(),
        pdf_status: SbomReportStatus.IN_PROGRESS,
      };
    });

    this.server.post('/v2/sb_reports/:id/pdf/generate', () => ({
      success: true,
    }));

    this.server.get('/v2/sb_reports/:id/pdf/download_url', () => {
      return { url: 'some_pdf_download_url.com' };
    });

    await render(hbs`
      <Sbom::ScanReportDrawer @sbomFile={{this.sbomFile}} @open={{this.open}} @onClose={{this.onClose}} />
    `);

    assert.dom('[data-test-sbomReportDrawer-drawer]').exists();
    assert.dom('[data-test-sbomReportList-reportlist]').exists();

    let reportList = findAll('[data-test-sbomReportList-reportlistItem]');

    assert
      .dom('[data-test-sbomReportList-reportGenerateTitle]', reportList[0])
      .hasText(t('sbomModule.sbomDownloadPdfPrimaryText'));

    assert
      .dom('[data-test-sbomReportList-reportGenerateSvg]', reportList[0])
      .exists();

    assert
      .dom(
        '[data-test-sbomReportList-reportGenerateDescription]',
        reportList[0]
      )
      .hasText(t('sbomModule.generateReportDescription'));

    assert
      .dom('[data-test-sbomReportList-reportGenerateBtn]', reportList[0])
      .isNotDisabled()
      .hasText(t('generateReport'));

    await click(
      reportList[0].querySelector(
        '[data-test-sbomReportList-reportGenerateBtn]'
      )
    );

    // refresh dom reference
    reportList = findAll('[data-test-sbomReportList-reportlistItem]');

    // previous state
    assert
      .dom('[data-test-sbomReportList-reportGenerateTitle]', reportList[0])
      .doesNotExist();

    assert
      .dom('[data-test-sbomReportList-reportGenerateSvg]', reportList[0])
      .doesNotExist();

    assert
      .dom(
        '[data-test-sbomReportList-reportGenerateDescription]',
        reportList[0]
      )
      .doesNotExist();

    assert
      .dom('[data-test-sbomReportList-reportGenerateBtn]', reportList[0])
      .doesNotExist();

    // current state
    assert
      .dom('[data-test-sbomReportList-reportPrimaryText]', reportList[0])
      .hasText(t('sbomModule.sbomDownloadPdfPrimaryText'));

    assert
      .dom('[data-test-sbomReportList-reportGeneratingText]', reportList[0])
      .hasText(`${t('generating')}...`);

    assert
      .dom('[data-test-sbomReportList-reportGeneratingLoader]', reportList[0])
      .exists();

    // close and open to get latest status
    this.set('open', false);

    assert.dom('[data-test-sbomReportDrawer-drawer]').doesNotExist();
    assert.dom('[data-test-sbomReportList-reportlist]').doesNotExist();

    this.setProperties({
      status: SbomReportStatus.COMPLETED,
      open: true,
    });

    assert.dom('[data-test-sbomReportDrawer-drawer]').exists();

    // wait for api
    await waitFor('[data-test-sbomReportList-reportlist]', {
      timeout: 200,
    });

    // refresh dom reference
    reportList = findAll('[data-test-sbomReportList-reportlistItem]');

    // previous state
    assert
      .dom('[data-test-sbomReportList-reportGeneratingText]', reportList[0])
      .doesNotExist();

    assert
      .dom('[data-test-sbomReportList-reportGeneratingLoader]', reportList[0])
      .doesNotExist();

    // after report generation
    assert
      .dom('[data-test-sbomReportList-reportPrimaryText]', reportList[0])
      .hasText(t('sbomModule.sbomDownloadPdfPrimaryText'));

    assert
      .dom('[data-test-sbomReportList-reportSecondaryText]', reportList[0])
      .hasText(
        t('sbomModule.sbomDownloadPdfSecondaryText', {
          password: this.sbomReport.report_password,
        })
      );

    assert
      .dom('[data-test-sbomReportList-reportCopyBtn]', reportList[0])
      .isNotDisabled()
      .hasAttribute('data-clipboard-text', this.sbomReport.report_password);

    assert
      .dom('[data-test-sbomReportList-reportDownloadBtn]', reportList[0])
      .isNotDisabled();

    await click(
      reportList[0].querySelector(
        '[data-test-sbomReportList-reportDownloadBtn]'
      )
    );

    const window = this.owner.lookup('service:browser/window');

    assert.strictEqual(window.url, 'some_pdf_download_url.com');
    assert.strictEqual(window.target, '_blank');
  });

  test('test pdf report realtime state updates', async function (assert) {
    this.setProperties({
      status: SbomReportStatus.PENDING,
      open: true,
    });

    this.server.get('/v2/sb_files/:id/sb_reports', (schema) => {
      const results = schema.sbomReports.all().models;

      results[0].pdf_status = this.status;

      return { count: results.length, next: null, previous: null, results };
    });

    this.server.get('/v2/sb_reports/:id', (schema, req) => {
      return {
        ...schema.sbomReports.find(`${req.params.id}`)?.toJSON(),
        pdf_status: this.status,
      };
    });

    this.server.post('/v2/sb_reports/:id/pdf/generate', () => ({
      success: true,
    }));

    await render(hbs`
      <Sbom::ScanReportDrawer @sbomFile={{this.sbomFile}} @open={{this.open}} @onClose={{this.onClose}} />
    `);

    assert.dom('[data-test-sbomReportDrawer-drawer]').exists();
    assert.dom('[data-test-sbomReportList-reportlist]').exists();

    let reportList = findAll('[data-test-sbomReportList-reportlistItem]');

    assert
      .dom('[data-test-sbomReportList-reportGenerateBtn]', reportList[0])
      .isNotDisabled()
      .hasText(t('generateReport'));

    this.set('status', SbomReportStatus.STARTED);

    await click(
      reportList[0].querySelector(
        '[data-test-sbomReportList-reportGenerateBtn]'
      )
    );

    // refresh dom reference
    reportList = findAll('[data-test-sbomReportList-reportlistItem]');

    // previous state
    assert
      .dom('[data-test-sbomReportList-reportGenerateTitle]', reportList[0])
      .doesNotExist();

    assert
      .dom('[data-test-sbomReportList-reportGenerateSvg]', reportList[0])
      .doesNotExist();

    assert
      .dom(
        '[data-test-sbomReportList-reportGenerateDescription]',
        reportList[0]
      )
      .doesNotExist();

    assert
      .dom('[data-test-sbomReportList-reportGenerateBtn]', reportList[0])
      .doesNotExist();

    // current state
    assert
      .dom('[data-test-sbomReportList-reportPrimaryText]', reportList[0])
      .hasText(t('sbomModule.sbomDownloadPdfPrimaryText'));

    assert
      .dom('[data-test-sbomReportList-reportGeneratingText]', reportList[0])
      .hasText(`${t('generating')}...`);

    assert
      .dom('[data-test-sbomReportList-reportGeneratingLoader]', reportList[0])
      .exists();

    // change status to completed and increment sbom report counter to notify
    this.set('status', SbomReportStatus.COMPLETED);

    const realtime = this.owner.lookup('service:realtime');
    realtime.incrementProperty('SbomReportCounter');

    // wait for api
    await waitFor('[data-test-sbomReportList-reportCopyBtn]', {
      timeout: 200,
    });

    // refresh dom reference
    reportList = findAll('[data-test-sbomReportList-reportlistItem]');

    // previous state
    assert
      .dom('[data-test-sbomReportList-reportGeneratingText]', reportList[0])
      .doesNotExist();

    assert
      .dom('[data-test-sbomReportList-reportGeneratingLoader]', reportList[0])
      .doesNotExist();

    // completed state
    assert
      .dom('[data-test-sbomReportList-reportPrimaryText]', reportList[0])
      .hasText(t('sbomModule.sbomDownloadPdfPrimaryText'));

    assert
      .dom('[data-test-sbomReportList-reportSecondaryText]', reportList[0])
      .hasText(
        t('sbomModule.sbomDownloadPdfSecondaryText', {
          password: this.sbomReport.report_password,
        })
      );

    assert
      .dom('[data-test-sbomReportList-reportCopyBtn]', reportList[0])
      .isNotDisabled()
      .hasAttribute('data-clipboard-text', this.sbomReport.report_password);

    assert
      .dom('[data-test-sbomReportList-reportDownloadBtn]', reportList[0])
      .isNotDisabled();
  });

  test('test pdf report download (already generated)', async function (assert) {
    this.server.get('/v2/sb_files/:id/sb_reports', (schema) => {
      const results = schema.sbomReports.all().models;

      results[0].pdf_status = SbomReportStatus.COMPLETED;

      return { count: results.length, next: null, previous: null, results };
    });

    this.server.get('/v2/sb_reports/:id/pdf/download_url', () => {
      return { url: 'some_pdf_download_url.com' };
    });

    await render(hbs`
      <Sbom::ScanReportDrawer @sbomFile={{this.sbomFile}} @open={{true}} @onClose={{this.onClose}} />
    `);

    assert.dom('[data-test-sbomReportDrawer-drawer]').exists();
    assert.dom('[data-test-sbomReportList-reportlist]').exists();

    const reportList = findAll('[data-test-sbomReportList-reportlistItem]');

    assert
      .dom('[data-test-sbomReportList-reportPrimaryText]', reportList[0])
      .hasText(t('sbomModule.sbomDownloadPdfPrimaryText'));

    assert
      .dom('[data-test-sbomReportList-reportSecondaryText]', reportList[0])
      .hasText(
        t('sbomModule.sbomDownloadPdfSecondaryText', {
          password: this.sbomReport.report_password,
        })
      );

    assert
      .dom('[data-test-sbomReportList-reportCopyBtn]', reportList[0])
      .isNotDisabled()
      .hasAttribute('data-clipboard-text', this.sbomReport.report_password);

    assert
      .dom('[data-test-sbomReportList-reportDownloadBtn]', reportList[0])
      .isNotDisabled();

    await click(
      reportList[0].querySelector(
        '[data-test-sbomReportList-reportDownloadBtn]'
      )
    );

    const window = this.owner.lookup('service:browser/window');

    assert.strictEqual(window.url, 'some_pdf_download_url.com');
    assert.strictEqual(window.target, '_blank');
  });

  test('test pdf report copy password', async function (assert) {
    this.server.get('/v2/sb_files/:id/sb_reports', (schema) => {
      const results = schema.sbomReports.all().models;

      results[0].pdf_status = SbomReportStatus.COMPLETED;

      return { count: results.length, next: null, previous: null, results };
    });

    await render(hbs`
      <Sbom::ScanReportDrawer @sbomFile={{this.sbomFile}} @open={{true}} @onClose={{this.onClose}} />
    `);

    assert.dom('[data-test-sbomReportDrawer-drawer]').exists();
    assert.dom('[data-test-sbomReportList-reportlist]').exists();

    const reportList = findAll('[data-test-sbomReportList-reportlistItem]');

    assert
      .dom('[data-test-sbomReportList-reportSecondaryText]', reportList[0])
      .hasText(
        t('sbomModule.sbomDownloadPdfSecondaryText', {
          password: this.sbomReport.report_password,
        })
      );

    assert
      .dom('[data-test-sbomReportList-reportCopyBtn]', reportList[0])
      .isNotDisabled()
      .hasAttribute('data-clipboard-text', this.sbomReport.report_password);

    await click(
      reportList[0].querySelector('[data-test-sbomReportList-reportCopyBtn]')
    );

    const notify = this.owner.lookup('service:notifications');

    assert.strictEqual(notify.infoMsg, t('passwordCopied'));
  });

  test('test json report download', async function (assert) {
    this.server.get('/v2/sb_files/:id/sb_reports', (schema) => {
      const results = schema.sbomReports.all().models;

      results[0].pdf_status = SbomReportStatus.COMPLETED;

      return { count: results.length, next: null, previous: null, results };
    });

    this.server.get(
      '/v2/sb_reports/:id/cyclonedx_json_file/download_url',
      () => {
        return { url: 'some_download_url.com' };
      }
    );

    await render(hbs`
      <Sbom::ScanReportDrawer @sbomFile={{this.sbomFile}} @open={{true}} @onClose={{this.onClose}} />
    `);

    assert.dom('[data-test-sbomReportDrawer-drawer]').exists();
    assert.dom('[data-test-sbomReportList-reportlist]').exists();

    const reportList = findAll('[data-test-sbomReportList-reportlistItem]');

    assert
      .dom('[data-test-sbomReportList-reportPrimaryText]', reportList[1])
      .hasText(t('sbomModule.sbomDownloadJsonPrimaryText'));

    assert
      .dom('[data-test-sbomReportList-reportSecondaryText]', reportList[1])
      .hasText(t('sbomModule.sbomDownloadJsonSecondaryText'));

    assert
      .dom('[data-test-sbomReportList-reportDownloadBtn]', reportList[1])
      .isNotDisabled();

    await click(
      reportList[1].querySelector(
        '[data-test-sbomReportList-reportDownloadBtn]'
      )
    );

    const window = this.owner.lookup('service:browser/window');

    assert.strictEqual(window.url, 'some_download_url.com');
    assert.strictEqual(window.target, '_blank');
  });
});
