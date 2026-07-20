import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { render, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

import ENUMS from 'irene/enums';

const SCAN_STATUS = ENUMS.STORE_RELEASE_SCAN_STATUS;
const VERDICT = ENUMS.STORE_RELEASE_VERDICT;

function pushScan(test, attrs = {}) {
  const store = test.owner.lookup('service:store');

  const fileMirage = test.server.create('file', {
    name: 'Acme App',
    icon_url: 'https://example.test/icon.png',
  });

  const scanMirage = test.server.create('store-release-readiness-scan', {
    file: fileMirage.id,
    file_name: 'Acme App',
    package_name: 'com.acme.alpha',
    platform: ENUMS.PLATFORM.ANDROID,
    status: SCAN_STATUS.COMPLETED,
    verdict: VERDICT.LOW_REJECTION_RISK,
    verdict_display: 'Low rejection risk',
    failed_count: 0,
    blocker_count: 0,
    warning_count: 0,
    passed_count: 0,
    untested_count: 0,
    findings: [],
    ...attrs,
  });

  store.push(store.normalize('file', fileMirage.toJSON()));

  return store.push(
    store.normalize('store-release-readiness-scan', scanMirage.toJSON())
  );
}

module(
  'Integration | Component | store-release-readiness/scan-results/details',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en');

    test('it renders heading, risk, progress bar and counts container', async function (assert) {
      this.set(
        'scanData',
        pushScan(this, {
          status: SCAN_STATUS.COMPLETED,
          failed_count: 2,
          passed_count: 5,
          untested_count: 3,
        })
      );

      await render(hbs`
        <StoreReleaseReadiness::ScanResults::Details @scanData={{this.scanData}} />
      `);

      assert
        .dom('[data-test-store-release-readiness-scan-results-details]')
        .exists();

      assert
        .dom('[data-test-store-release-readiness-scan-results-details-heading]')
        .hasText(t('scanResults'));

      assert
        .dom('[data-test-store-release-readiness-scan-results-details-main]')
        .exists();

      assert
        .dom('[data-test-store-release-readiness-scan-results-details-risk]')
        .exists();

      assert
        .dom('[data-test-store-release-readiness-scan-results-details-counts]')
        .exists();

      assert
        .dom(
          '[data-test-store-release-readiness-scan-results-details-progress]'
        )
        .exists();

      assert
        .dom('[data-test-store-release-readiness-summary-progress-bar]')
        .exists();
    });

    test('it renders the right counts for each metric', async function (assert) {
      this.set(
        'scanData',
        pushScan(this, {
          status: SCAN_STATUS.COMPLETED,
          failed_count: 4,
          blocker_count: 1,
          warning_count: 3,
          passed_count: 12,
          untested_count: 7,
        })
      );

      await render(hbs`
        <StoreReleaseReadiness::ScanResults::Details @scanData={{this.scanData}} />
      `);

      assert
        .dom(
          '[data-test-store-release-readiness-scan-results-details-metric="failed"]'
        )
        .containsText(t('failed'))
        .containsText('4');

      assert
        .dom(
          '[data-test-store-release-readiness-scan-results-details-metric="blocker"]'
        )
        .containsText(t('storeReleaseReadiness.summaryBlocker'))
        .containsText('1');

      assert
        .dom(
          '[data-test-store-release-readiness-scan-results-details-metric="warning"]'
        )
        .containsText(t('storeReleaseReadiness.summaryWarning'))
        .containsText('3');

      assert
        .dom(
          '[data-test-store-release-readiness-scan-results-details-metric="untested"]'
        )
        .containsText(t('untested'))
        .containsText('7');

      assert
        .dom(
          '[data-test-store-release-readiness-scan-results-details-metric="passed"]'
        )
        .containsText(t('passed'))
        .containsText('12');
    });

    test('passed and untested rows render loaders while scan is IN_PROGRESS', async function (assert) {
      this.set(
        'scanData',
        pushScan(this, {
          status: SCAN_STATUS.IN_PROGRESS,
          failed_count: 2,
          passed_count: 5,
          untested_count: 3,
        })
      );

      await render(hbs`
        <StoreReleaseReadiness::ScanResults::Details @scanData={{this.scanData}} />
      `);

      assert
        .dom(
          '[data-test-store-release-readiness-scan-results-details-metric="failed"]'
        )
        .containsText('2');

      const passedSegment = document.querySelector(
        '[data-test-store-release-readiness-scan-results-details-metric="passed"]'
      );

      const untestedSegment = document.querySelector(
        '[data-test-store-release-readiness-scan-results-details-metric="untested"]'
      );

      assert.notOk(
        passedSegment.textContent.includes('5'),
        'Passed count is replaced by loader while in progress'
      );

      assert.notOk(
        untestedSegment.textContent.includes('3'),
        'Untested count is replaced by loader while in progress'
      );
    });

    test.each(
      'it renders the right progress-bar segments per scan status',
      [
        {
          name: 'NOT_STARTED → only untested',
          status: SCAN_STATUS.NOT_STARTED,
          counts: { failed: 0, passed: 0, untested: 0 },
          expected: ['untested'],
          notExpected: ['failed', 'passed', 'loading'],
        },
        {
          name: 'IN_PROGRESS → failed, passed, loading',
          status: SCAN_STATUS.IN_PROGRESS,
          counts: { failed: 2, passed: 5, untested: 3 },
          expected: ['failed', 'passed', 'loading'],
          notExpected: ['untested'],
        },
        {
          name: 'COMPLETED → failed, passed, untested',
          status: SCAN_STATUS.COMPLETED,
          counts: { failed: 2, passed: 5, untested: 3 },
          expected: ['failed', 'passed', 'untested'],
          notExpected: ['loading'],
        },
        {
          name: 'FAILED → failed, passed, untested',
          status: SCAN_STATUS.FAILED,
          counts: { failed: 2, passed: 5, untested: 3 },
          expected: ['failed', 'passed', 'untested'],
          notExpected: ['loading'],
        },
      ],
      async function (assert, { status, counts, expected, notExpected }) {
        this.set(
          'scanData',
          pushScan(this, {
            status,
            failed_count: counts.failed,
            passed_count: counts.passed,
            untested_count: counts.untested,
          })
        );

        await render(hbs`
          <StoreReleaseReadiness::ScanResults::Details @scanData={{this.scanData}} />
        `);

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

        if (status === SCAN_STATUS.IN_PROGRESS) {
          const loadingEl = find(
            '[data-test-store-release-readiness-summary-progress-bar] [data-test-ak-progress-bar-segment="loading"]'
          );

          assert.ok(
            loadingEl?.getAttribute('style')?.includes('50%'),
            'In-progress loading stripe occupies half the bar'
          );
        }
      }
    );

    test.each(
      'it renders the right rejection-risk block per verdict',
      [
        {
          verdict: VERDICT.HIGH_REJECTION_RISK,
          labelKey: 'storeReleaseReadiness.rejectionRiskChipHigh',
        },
        {
          verdict: VERDICT.MODERATE_REJECTION_RISK,
          labelKey: 'storeReleaseReadiness.rejectionRiskChipMedium',
        },
        {
          verdict: VERDICT.LOW_REJECTION_RISK,
          labelKey: 'storeReleaseReadiness.rejectionRiskChipLow',
        },
      ],
      async function (assert, { verdict, labelKey }) {
        this.set('scanData', pushScan(this, { verdict }));

        await render(hbs`
          <StoreReleaseReadiness::ScanResults::Details @scanData={{this.scanData}} />
        `);

        assert
          .dom('[data-test-store-release-readiness-scan-results-details-risk]')
          .exists();

        assert
          .dom(
            '[data-test-store-release-readiness-scan-results-details-risk-label]'
          )
          .hasText(t(labelKey));

        assert
          .dom(
            '[data-test-store-release-readiness-scan-results-details-risk] svg'
          )
          .exists('Risk tower svg renders inside the risk block');
      }
    );
  }
);
