import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupBrowserFakes } from 'ember-browser-services/test-support';
import { render, click, settled } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import Service from '@ember/service';

import ENUMS from 'irene/enums';

const STORE_RELEASE_REPORT_STATUS = ENUMS.STORE_RELEASE_REPORT_STATUS;

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

function pushScan(test, attrs = {}) {
  const store = test.owner.lookup('service:store');

  const file = test.server.create('file', {
    name: 'Acme App',
    icon_url: 'https://example.test/icon.png',
  });

  const scanMirage = test.server.create('store-release-readiness-scan', {
    file: file.id,
    file_name: 'Acme App',
    package_name: 'com.acme.alpha',
    platform: ENUMS.PLATFORM.ANDROID,
    status: ENUMS.STORE_RELEASE_SCAN_STATUS.COMPLETED,
    findings: [],
    ...attrs,
  });

  store.push(store.normalize('file', file.toJSON()));

  return store.push(
    store.normalize('store-release-readiness-scan', scanMirage.toJSON())
  );
}

function seedReport(test, attrs = {}) {
  return test.server.create('store-release-readiness-report', {
    pdf_status: STORE_RELEASE_REPORT_STATUS.PENDING,
    pdf_progress: 0,
    report_password: 'ABC12345',
    refresh_available: true,
    language: 'en',
    ...attrs,
  });
}

module(
  'Integration | Component | store-release-readiness/scan-results/report-drawer',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en');
    setupBrowserFakes(hooks, { window: true });

    hooks.beforeEach(function () {
      this.owner.register('service:notifications', NotificationsStub);

      this.setProperties({
        open: true,
        onClose: () => this.set('open', false),
      });
    });

    test('fetches the report only when the drawer opens and does not refetch on reopen', async function (assert) {
      this.set('scan', pushScan(this));

      const report = seedReport(this);

      let reportFetchCount = 0;

      this.server.get('/v2/files/:fileId/store_readiness_report', () => {
        reportFetchCount++;

        return report.toJSON();
      });

      this.set('open', false);

      await render(hbs`
        <StoreReleaseReadiness::ScanResults::ReportDrawer
          @scanData={{this.scan}}
          @open={{this.open}}
          @onClose={{this.onClose}}
        />
      `);

      assert.strictEqual(
        reportFetchCount,
        0,
        'no report API call while drawer is closed'
      );

      this.set('open', true);
      await settled();

      assert.strictEqual(
        reportFetchCount,
        1,
        'report fetched when drawer opens'
      );

      this.set('open', false);
      await settled();

      this.set('open', true);
      await settled();

      assert.strictEqual(
        reportFetchCount,
        1,
        'report is not refetched when the drawer is reopened'
      );
    });

    test('it renders the drawer header, description and close button when open', async function (assert) {
      this.set('scan', pushScan(this));

      const report = seedReport(this, {
        pdf_status: STORE_RELEASE_REPORT_STATUS.PENDING,
      });

      this.server.get('/v2/files/:fileId/store_readiness_report', () =>
        report.toJSON()
      );

      await render(hbs`
        <StoreReleaseReadiness::ScanResults::ReportDrawer
          @scanData={{this.scan}}
          @open={{this.open}}
          @onClose={{this.onClose}}
        />
      `);

      assert
        .dom('[data-test-store-release-readiness-report-drawer]')
        .exists()
        .containsText(t('downloadReport'))
        .containsText(t('storeReleaseReadiness.downloadReportDescription'));

      assert
        .dom('[data-test-store-release-readiness-report-drawer-close]')
        .exists();
    });

    test('shows the Generate Report button when the report has not been generated yet', async function (assert) {
      this.set('scan', pushScan(this));

      const report = seedReport(this, {
        pdf_status: STORE_RELEASE_REPORT_STATUS.PENDING,
        refresh_available: true,
      });

      this.server.get('/v2/files/:fileId/store_readiness_report', () =>
        report.toJSON()
      );

      await render(hbs`
        <StoreReleaseReadiness::ScanResults::ReportDrawer
          @scanData={{this.scan}}
          @open={{this.open}}
          @onClose={{this.onClose}}
        />
      `);

      assert
        .dom('[data-test-store-release-readiness-report-generate-button]')
        .exists()
        .isNotDisabled()
        .hasText(t('generateReport'));

      assert
        .dom('[data-test-store-release-readiness-report-download-button]')
        .doesNotExist('Download button is hidden until report is generated');
    });

    test('shows "Generating" label while a report generation is in progress', async function (assert) {
      this.set('scan', pushScan(this));

      const report = seedReport(this, {
        pdf_status: STORE_RELEASE_REPORT_STATUS.IN_PROGRESS,
      });

      this.server.get('/v2/files/:fileId/store_readiness_report', () =>
        report.toJSON()
      );

      await render(hbs`
        <StoreReleaseReadiness::ScanResults::ReportDrawer
          @scanData={{this.scan}}
          @open={{this.open}}
          @onClose={{this.onClose}}
        />
      `);

      assert
        .dom('[data-test-store-release-readiness-report-generate-button]')
        .exists()
        .hasText(t('generating'));
    });

    test('clicking the Generate Report button triggers the generate flow and reveals the download UI', async function (assert) {
      this.set('scan', pushScan(this));

      const report = seedReport(this, {
        pdf_status: STORE_RELEASE_REPORT_STATUS.PENDING,
        refresh_available: true,
      });

      this.server.get('/v2/files/:fileId/store_readiness_report', () =>
        report.toJSON()
      );

      let generateCalled = false;

      this.server.post(
        '/v2/store-release-readiness/reports/:id/pdf/generate',
        () => {
          generateCalled = true;

          report.update({ pdf_status: STORE_RELEASE_REPORT_STATUS.COMPLETED });

          return { success: true };
        }
      );

      this.server.get(
        '/v2/store-release-readiness/reports/:id',
        (schema, req) =>
          schema.storeReleaseReadinessReports
            .find(String(req.params.id))
            ?.toJSON()
      );

      await render(hbs`
        <StoreReleaseReadiness::ScanResults::ReportDrawer
          @scanData={{this.scan}}
          @open={{this.open}}
          @onClose={{this.onClose}}
        />
      `);

      await click('[data-test-store-release-readiness-report-generate-button]');

      assert.true(generateCalled, 'POST generate endpoint was hit');

      assert
        .dom('[data-test-store-release-readiness-report-download-button]')
        .exists('Download button visible after generation completes');
    });

    test('shows the Download button when the report is COMPLETED and clicking it opens the URL in a new tab', async function (assert) {
      this.set('scan', pushScan(this));

      const report = seedReport(this, {
        pdf_status: STORE_RELEASE_REPORT_STATUS.COMPLETED,
        report_password: 'ABC12345',
        refresh_available: false,
      });

      this.server.get('/v2/files/:fileId/store_readiness_report', () =>
        report.toJSON()
      );

      this.server.get(
        '/v2/store-release-readiness/reports/:id/pdf/download_url',
        () => ({ url: 'https://example.test/download/report.pdf' })
      );

      const window = this.owner.lookup('service:browser/window');

      let openedUrl = null;
      let openedTarget = null;

      window.open = (url, target) => {
        openedUrl = url;
        openedTarget = target;
      };

      await render(hbs`
        <StoreReleaseReadiness::ScanResults::ReportDrawer
          @scanData={{this.scan}}
          @open={{this.open}}
          @onClose={{this.onClose}}
        />
      `);

      assert
        .dom('[data-test-store-release-readiness-report-download-button]')
        .exists();

      assert
        .dom('[data-test-store-release-readiness-report-drawer]')
        .containsText(
          t('storeReleaseReadiness.downloadPdfPrimaryText'),
          'Renders the download primary text'
        )
        .containsText(
          'ABC12345',
          'Renders the report password in the secondary line'
        );

      assert
        .dom('[data-test-store-release-readiness-report-generate-button]')
        .doesNotExist(
          'Generate button hidden when report is generated and refresh is unavailable'
        );

      await click('[data-test-store-release-readiness-report-download-button]');

      assert.strictEqual(
        openedUrl,
        'https://example.test/download/report.pdf',
        'window.open is called with the API-provided URL'
      );

      assert.strictEqual(openedTarget, '_blank', 'opens in a new tab');
    });
  }
);
