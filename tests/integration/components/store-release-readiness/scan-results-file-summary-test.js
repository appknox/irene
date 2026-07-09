import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { render, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

import ENUMS from 'irene/enums';

const SCAN_STATUS = ENUMS.STORE_RELEASE_SCAN_STATUS;

function pushScan(test, attrs = {}) {
  const store = test.owner.lookup('service:store');

  const fileMirage = test.server.create('file', {
    name: 'Acme App',
    version: '1.4.2',
    version_code: '142',
    icon_url: 'https://example.test/icon.png',
  });

  const scanMirage = test.server.create('store-release-readiness-scan', {
    file: fileMirage.id,
    file_name: 'Acme App',
    package_name: 'com.acme.alpha',
    platform: ENUMS.PLATFORM.ANDROID,
    status: SCAN_STATUS.COMPLETED,
    completed_at: '2024-01-16T10:00:00Z',
    created_at: '2024-01-15T10:00:00Z',
    findings: [],
    ...attrs,
  });

  store.push(store.normalize('file', fileMirage.toJSON()));

  return store.push(
    store.normalize('store-release-readiness-scan', scanMirage.toJSON())
  );
}

module(
  'Integration | Component | store-release-readiness/scan-results/file-summary',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en');

    test('it renders core summary (app name, package, file id, platform)', async function (assert) {
      const scan = pushScan(this);

      this.set('scanData', scan);

      await render(hbs`
        <StoreReleaseReadiness::ScanResults::FileSummary
          @scanData={{this.scanData}}
        />
      `);

      assert
        .dom('[data-test-store-release-readiness-scan-summary-app-name]')
        .hasText('Acme App');

      assert
        .dom('[data-test-store-release-readiness-scan-summary-package-name]')
        .hasText('com.acme.alpha');

      assert
        .dom('[data-test-store-release-readiness-scan-summary-release-id]')
        .hasText(String(scan.file.get('id')));

      assert
        .dom('[data-test-store-release-readiness-scan-summary-platform-box]')
        .exists();

      assert
        .dom('[data-test-store-release-readiness-scan-summary-expand-button]')
        .exists();
    });

    test.each(
      'it shows the View report button only for COMPLETED / PARTIAL scans',
      [
        { status: SCAN_STATUS.NOT_STARTED, visible: false },
        { status: SCAN_STATUS.IN_PROGRESS, visible: false },
        { status: SCAN_STATUS.PARTIAL, visible: true },
        { status: SCAN_STATUS.COMPLETED, visible: true },
        { status: SCAN_STATUS.FAILED, visible: false },
      ],
      async function (assert, { status, visible }) {
        this.set('scanData', pushScan(this, { status }));

        await render(hbs`
          <StoreReleaseReadiness::ScanResults::FileSummary
            @scanData={{this.scanData}}
          />
        `);

        if (visible) {
          assert
            .dom(
              '[data-test-store-release-readiness-scan-summary-view-report-button]'
            )
            .exists()
            .containsText(t('viewReport'));
        } else {
          assert
            .dom(
              '[data-test-store-release-readiness-scan-summary-view-report-button]'
            )
            .doesNotExist();
        }
      }
    );

    test('clicking expand toggle reveals version, version-code and last-scanned-on rows', async function (assert) {
      this.set('scanData', pushScan(this));

      await render(hbs`
        <StoreReleaseReadiness::ScanResults::FileSummary
          @scanData={{this.scanData}}
        />
      `);

      assert
        .dom('[data-test-store-release-readiness-scan-summary-detail-row]')
        .doesNotExist('Detail rows are hidden by default');

      await click(
        '[data-test-store-release-readiness-scan-summary-expand-button]'
      );

      assert
        .dom('[data-test-store-release-readiness-scan-summary-detail-row]')
        .exists({ count: 3 });

      const labels = document.querySelectorAll(
        '[data-test-store-release-readiness-scan-summary-detail-label]'
      );

      assert.strictEqual(labels[0].textContent.trim(), t('version'));

      assert.strictEqual(
        labels[1].textContent.trim().toLowerCase(),
        t('versionCode').toLowerCase()
      );

      assert.strictEqual(
        labels[2].textContent.trim(),
        t('storeReleaseReadiness.scanDetailLastScannedOn')
      );

      const values = document.querySelectorAll(
        '[data-test-store-release-readiness-scan-summary-detail-value]'
      );

      assert.strictEqual(values[0].textContent.trim(), '1.4.2');
      assert.strictEqual(values[1].textContent.trim(), '142');
      assert.ok(values[2].textContent.trim().length > 0);
    });

    test.each(
      'it renders the analysis status meta per status',
      [
        {
          status: SCAN_STATUS.NOT_STARTED,
          labelKey: 'notStarted',
          loaderVisible: false,
        },
        {
          status: SCAN_STATUS.IN_PROGRESS,
          labelKey: 'inProgress',
          loaderVisible: true,
        },
        {
          status: SCAN_STATUS.COMPLETED,
          labelKey: 'completed',
          loaderVisible: false,
        },
        {
          status: SCAN_STATUS.FAILED,
          labelKey: 'failed',
          loaderVisible: false,
        },
      ],
      async function (assert, { status, labelKey, loaderVisible }) {
        this.set('scanData', pushScan(this, { status }));

        await render(hbs`
          <StoreReleaseReadiness::ScanResults::FileSummary
            @scanData={{this.scanData}}
          />
        `);

        assert
          .dom(
            '[data-test-store-release-readiness-scan-summary-analysis-status]'
          )
          .exists()
          .containsText(t(labelKey));

        if (loaderVisible) {
          assert
            .dom(
              '[data-test-store-release-readiness-scan-summary-status-loader]'
            )
            .exists();

          assert
            .dom('[data-test-store-release-readiness-scan-summary-status-icon]')
            .doesNotExist();
        } else {
          assert
            .dom('[data-test-store-release-readiness-scan-summary-status-icon]')
            .exists();

          assert
            .dom(
              '[data-test-store-release-readiness-scan-summary-status-loader]'
            )
            .doesNotExist();
        }
      }
    );
  }
);
