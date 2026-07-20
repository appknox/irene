import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { render, triggerEvent } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import dayjs from 'dayjs';

import ENUMS from 'irene/enums';

const SCAN_STATUS = ENUMS.STORE_RELEASE_SCAN_STATUS;
const VERDICT = ENUMS.STORE_RELEASE_VERDICT;

function pushScan(test, attrs = {}) {
  const store = test.owner.lookup('service:store');

  const file = test.server.create('file', {
    name: 'Acme App',
    icon_url: 'https://example.test/icon.png',
  });

  const scan = test.server.create('store-release-readiness-scan', {
    file: file.id,
    file_name: 'Acme App',
    package_name: 'com.acme.alpha',
    platform: ENUMS.PLATFORM.ANDROID,
    verdict: VERDICT.LOW_REJECTION_RISK,
    verdict_display: 'Low rejection risk',
    status: SCAN_STATUS.COMPLETED,
    failed_count: 0,
    blocker_count: 0,
    warning_count: 0,
    passed_count: 0,
    untested_count: 0,
    overridden_count: 0,
    findings: [],
    created_at: '2024-01-15T10:00:00Z',
    completed_at: '2024-01-16T10:00:00Z',
    ...attrs,
  });

  const normalized = store.normalize(
    'store-release-readiness-scan',
    scan.toJSON()
  );

  return store.push(normalized);
}

module(
  'Integration | Component | store-release-readiness/release-card',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en');

    test('it renders core card data (app name, package, platform, release date, summary heading)', async function (assert) {
      this.set(
        'item',
        pushScan(this, {
          status: SCAN_STATUS.COMPLETED,
          failed_count: 2,
          blocker_count: 1,
          warning_count: 1,
          passed_count: 5,
          untested_count: 3,
        })
      );

      await render(
        hbs`<StoreReleaseReadiness::ReleaseCard @item={{this.item}} />`
      );

      assert.dom('[data-test-store-release-readiness-card]').exists();

      assert
        .dom('[data-test-store-release-readiness-app-name]')
        .hasText('Acme App');

      assert
        .dom('[data-test-store-release-readiness-package-name]')
        .hasText('com.acme.alpha');

      assert.dom('[data-test-store-release-readiness-app-logo]').exists();

      assert.dom('[data-test-store-release-readiness-platform-icon]').exists();

      assert
        .dom('[data-test-store-release-readiness-release-date]')
        .hasText(dayjs('2024-01-15T10:00:00Z').format('MMM DD, YYYY'));

      assert
        .dom('[data-test-store-release-readiness-summary-heading]')
        .hasText(t('storeReleaseReadiness.summarySectionHeading'));

      assert
        .dom('[data-test-store-release-readiness-summary-progress-bar]')
        .exists();

      assert
        .dom('[data-test-store-release-readiness-summary-status-list]')
        .exists();
    });

    test.each(
      'it renders the right header status meta',
      [
        { status: SCAN_STATUS.NOT_STARTED, labelKey: 'notStarted' },
        { status: SCAN_STATUS.IN_PROGRESS, labelKey: 'inProgress' },
        { status: SCAN_STATUS.COMPLETED, labelKey: 'completed' },
        { status: SCAN_STATUS.FAILED, labelKey: 'failed' },
      ],
      async function (assert, { status, labelKey }) {
        this.set('item', pushScan(this, { status }));

        await render(
          hbs`<StoreReleaseReadiness::ReleaseCard @item={{this.item}} />`
        );

        assert
          .dom('[data-test-store-release-readiness-header-status]')
          .exists()
          .containsText(t(labelKey));

        if (status === SCAN_STATUS.IN_PROGRESS) {
          assert
            .dom('[data-test-store-release-readiness-header-loader]')
            .exists('Header loader visible while scan is in progress');
        } else {
          assert
            .dom('[data-test-store-release-readiness-header-loader]')
            .doesNotExist();
        }
      }
    );

    test.each(
      'it renders the progress bar segments per scan status',
      [
        {
          name: 'NOT_STARTED → single untested segment',
          status: SCAN_STATUS.NOT_STARTED,
          counts: { failed: 0, passed: 0, untested: 0 },
          expected: ['untested'],
          notExpected: ['failed', 'passed', 'loading'],
        },
        {
          name: 'IN_PROGRESS → failed, passed, loading segments',
          status: SCAN_STATUS.IN_PROGRESS,
          counts: { failed: 2, passed: 5, untested: 3 },
          expected: ['failed', 'passed', 'loading'],
          notExpected: ['untested'],
        },
        {
          name: 'COMPLETED → failed, passed, untested segments',
          status: SCAN_STATUS.COMPLETED,
          counts: { failed: 2, passed: 5, untested: 3 },
          expected: ['failed', 'passed', 'untested'],
          notExpected: ['loading'],
        },
        {
          name: 'FAILED → failed, passed, untested segments',
          status: SCAN_STATUS.FAILED,
          counts: { failed: 2, passed: 5, untested: 3 },
          expected: ['failed', 'passed', 'untested'],
          notExpected: ['loading'],
        },
      ],
      async function (assert, { status, counts, expected, notExpected }) {
        this.set(
          'item',
          pushScan(this, {
            status,
            failed_count: counts.failed,
            passed_count: counts.passed,
            untested_count: counts.untested,
          })
        );

        await render(
          hbs`<StoreReleaseReadiness::ReleaseCard @item={{this.item}} />`
        );

        assert
          .dom('[data-test-store-release-readiness-summary-progress-bar]')
          .exists();

        for (const kind of expected) {
          assert
            .dom(
              `[data-test-store-release-readiness-summary-progress-bar] [data-test-ak-progress-bar-segment="${kind}"]`
            )
            .exists(`Segment "${kind}" rendered`);
        }

        for (const kind of notExpected) {
          assert
            .dom(
              `[data-test-store-release-readiness-summary-progress-bar] [data-test-ak-progress-bar-segment="${kind}"]`
            )
            .doesNotExist(`Segment "${kind}" not rendered`);
        }
      }
    );

    test('it renders the summary status list with the right counts', async function (assert) {
      this.set(
        'item',
        pushScan(this, {
          status: SCAN_STATUS.COMPLETED,
          failed_count: 4,
          blocker_count: 1,
          warning_count: 3,
          passed_count: 12,
          untested_count: 7,
        })
      );

      await render(
        hbs`<StoreReleaseReadiness::ReleaseCard @item={{this.item}} />`
      );

      assert
        .dom('[data-test-store-release-readiness-summary-failed-row]')
        .containsText(t('failed'))
        .containsText('4');

      assert
        .dom('[data-test-store-release-readiness-summary-blocker-row]')
        .containsText(t('storeReleaseReadiness.summaryBlocker'))
        .containsText('1');

      assert
        .dom('[data-test-store-release-readiness-summary-warning-row]')
        .containsText(t('storeReleaseReadiness.summaryWarning'))
        .containsText('3');

      assert
        .dom('[data-test-store-release-readiness-summary-passed-row]')
        .containsText(t('passed'))
        .containsText('12');

      assert
        .dom('[data-test-store-release-readiness-summary-untested-row]')
        .containsText(t('untested'))
        .containsText('7');
    });

    test('it does not render the override icon when overridden_count is 0', async function (assert) {
      this.set(
        'item',
        pushScan(this, {
          status: SCAN_STATUS.COMPLETED,
          passed_count: 5,
          overridden_count: 0,
        })
      );

      await render(
        hbs`<StoreReleaseReadiness::ReleaseCard @item={{this.item}} />`
      );

      assert
        .dom('[data-test-store-release-readiness-summary-passed-override-icon]')
        .doesNotExist();

      assert
        .dom(
          '[data-test-store-release-readiness-summary-passed-override-tooltip]'
        )
        .doesNotExist();

      assert
        .dom('[data-test-store-release-readiness-summary-passed-row]')
        .containsText(t('passed'))
        .containsText('5');
    });

    test('it renders the override icon and tooltip when overridden_count > 0', async function (assert) {
      this.set(
        'item',
        pushScan(this, {
          status: SCAN_STATUS.COMPLETED,
          passed_count: 8,
          overridden_count: 3,
        })
      );

      await render(
        hbs`<StoreReleaseReadiness::ReleaseCard @item={{this.item}} />`
      );

      assert
        .dom('[data-test-store-release-readiness-summary-passed-override-icon]')
        .exists('Override icon is rendered before the passed count');

      assert
        .dom(
          '[data-test-store-release-readiness-summary-passed-override-tooltip]'
        )
        .exists('Tooltip wrapper is rendered around the override icon');

      assert
        .dom('[data-test-store-release-readiness-summary-passed-row]')
        .containsText(t('passed'))
        .containsText('8');
    });

    test('the override tooltip shows the override count message when hovered', async function (assert) {
      this.set(
        'item',
        pushScan(this, {
          status: SCAN_STATUS.COMPLETED,
          passed_count: 10,
          overridden_count: 4,
        })
      );

      await render(
        hbs`<StoreReleaseReadiness::ReleaseCard @item={{this.item}} />`
      );

      await triggerEvent(
        '[data-test-store-release-readiness-summary-passed-override-icon]',
        'mouseenter'
      );

      assert
        .dom(
          '[data-test-store-release-readiness-summary-passed-override-tooltipContent]'
        )
        .exists('Tooltip content appears on hover')
        .containsText(
          t('storeReleaseReadiness.summaryOverrideMessage', {
            overriddenCount: 4,
          })
        );
    });

    test('the override icon does not render while the passed row is loading', async function (assert) {
      this.set(
        'item',
        pushScan(this, {
          status: SCAN_STATUS.IN_PROGRESS,
          passed_count: 5,
          overridden_count: 3,
        })
      );

      await render(
        hbs`<StoreReleaseReadiness::ReleaseCard @item={{this.item}} />`
      );

      assert
        .dom('[data-test-store-release-readiness-summary-passed-loader]')
        .exists('Loader is shown while the scan is in progress');

      assert
        .dom('[data-test-store-release-readiness-summary-passed-override-icon]')
        .doesNotExist(
          'Override icon is hidden while the passed row is loading'
        );
    });

    test.each(
      'it renders the right risk chip per verdict',
      [
        { verdict: VERDICT.HIGH_REJECTION_RISK, label: 'High rejection risk' },
        {
          verdict: VERDICT.MODERATE_REJECTION_RISK,
          label: 'Moderate rejection risk',
        },
        { verdict: VERDICT.LOW_REJECTION_RISK, label: 'Low rejection risk' },
      ],
      async function (assert, { verdict, label }) {
        this.set(
          'item',
          pushScan(this, {
            verdict,
            verdict_display: label,
          })
        );

        await render(
          hbs`<StoreReleaseReadiness::ReleaseCard @item={{this.item}} />`
        );

        assert
          .dom('[data-test-store-release-readiness-risk-chip]')
          .exists()
          .containsText(label);

        assert
          .dom('[data-test-store-release-readiness-risk-chip] svg')
          .exists('Risk chip svg renders');
      }
    );
  }
);
