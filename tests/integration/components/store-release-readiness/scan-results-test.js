import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupBrowserFakes } from 'ember-browser-services/test-support';
import { render, click, findAll } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { selectChoose } from 'ember-power-select/test-support';
import { clickTrigger } from 'ember-power-select/test-support/helpers';
import Service from '@ember/service';
import { Response } from 'miragejs';

import ENUMS from 'irene/enums';

const SCAN_STATUS = ENUMS.STORE_RELEASE_SCAN_STATUS;
const VERDICT = ENUMS.STORE_RELEASE_VERDICT;
const SEVERITY = ENUMS.STORE_RELEASE_FINDING_SEVERITY;

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

class RouterStub extends Service {
  lastRoute = null;
  lastModel = null;

  transitionTo(route, model) {
    this.lastRoute = route;
    this.lastModel = model;
  }
}

function buildFinding(server, overrides = {}) {
  return server.build('store-release-readiness-finding', {
    is_overridden: false,
    ...overrides,
  });
}

function buildFindings(server) {
  // ids chosen to expose ordering bugs: the failed BLOCKER has the highest
  // id, and the failed WARNING ids (9, 10) sort wrongly under alphabetical
  // comparison ("10" < "9").
  return [
    buildFinding(server, {
      id: 102,
      category: 'Privacy',
      severity: SEVERITY.BLOCKER,
      passed: false,
    }),
    buildFinding(server, {
      id: 9,
      category: 'Security',
      severity: SEVERITY.WARNING,
      passed: false,
    }),
    buildFinding(server, {
      id: 10,
      category: 'Security',
      severity: SEVERITY.WARNING,
      passed: false,
    }),
    buildFinding(server, {
      id: 13,
      category: 'Compliance',
      severity: SEVERITY.WARNING,
      passed: true,
    }),
    buildFinding(server, {
      id: 14,
      category: 'Compliance',
      severity: SEVERITY.WARNING,
      passed: true,
      is_overridden: true,
    }),
    buildFinding(server, {
      id: 15,
      category: 'Privacy',
      severity: SEVERITY.WARNING,
      passed: null,
    }),
  ];
}

function seedScan(test, attrs = {}) {
  const file = test.server.create('file');

  return test.server.create('store-release-readiness-scan', {
    file: file.id,
    status: SCAN_STATUS.COMPLETED,
    findings: test.findings,
    ...attrs,
  });
}

module(
  'Integration | Component | store-release-readiness/scan-results',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en');
    setupBrowserFakes(hooks, { window: true, localStorage: true });

    hooks.beforeEach(function () {
      this.owner.register('service:notifications', NotificationsStub);
      this.owner.unregister('service:router');
      this.owner.register('service:router', RouterStub);

      this.findings = buildFindings(this.server);

      this.server.get(
        '/v2/store-release-readiness/scans/:id',
        (schema, req) => {
          const scan = schema.storeReleaseReadinessScans.find(
            String(req.params.id)
          );

          return scan?.toJSON();
        }
      );

      this.server.get('/v3/files/:id', (schema, req) => {
        return schema.files.find(String(req.params.id))?.toJSON();
      });

      this.server.get(
        '/v2/store-release-readiness/scans/:id/reports',
        () => new Response(404, {}, { detail: 'No report' })
      );
    });

    test('it renders the assessment table with one row per finding', async function (assert) {
      const scan = seedScan(this);

      this.set('scanId', String(scan.id));

      await render(
        hbs`<StoreReleaseReadiness::ScanResults @scanId={{this.scanId}} />`
      );

      assert.dom('[data-test-store-release-readiness-scan-results]').exists();

      assert
        .dom(
          '[data-test-store-release-readiness-scan-results-assessment-heading]'
        )
        .hasText(t('storeReleaseReadiness.assessmentResults'));

      assert
        .dom(
          '[data-test-store-release-readiness-scan-results-assessment-table]'
        )
        .exists();

      const rows = findAll(
        '[data-test-store-release-readiness-scan-results-assessment-row]'
      );

      assert.strictEqual(
        rows.length,
        this.findings.length,
        'Renders one row per finding'
      );

      this.findings.forEach((finding) => {
        assert
          .dom(
            `[data-test-store-release-readiness-assessment-policy-cell="${finding.id}"]`
          )
          .containsText(finding.category, `row ${finding.id} shows category`)
          .containsText(finding.title, `row ${finding.id} shows title`);
      });
    });

    test('rows sort failed (blocker first, then numeric id) → passed → untested', async function (assert) {
      const scan = seedScan(this);

      this.set('scanId', String(scan.id));

      await render(
        hbs`<StoreReleaseReadiness::ScanResults @scanId={{this.scanId}} />`
      );

      const renderedIds = findAll(
        '[data-test-store-release-readiness-assessment-policy-cell]'
      ).map((cell) =>
        cell.getAttribute(
          'data-test-store-release-readiness-assessment-policy-cell'
        )
      );

      assert.deepEqual(
        renderedIds,
        ['102', '9', '10', '13', '14', '15'],
        'Failed blocker leads, failed warnings follow in numeric id order, then passed, then untested'
      );
    });

    test('row policy cell shows category + title and status chip', async function (assert) {
      const scan = seedScan(this);

      this.set('scanId', String(scan.id));

      await render(
        hbs`<StoreReleaseReadiness::ScanResults @scanId={{this.scanId}} />`
      );

      const [blocker] = this.findings;

      assert
        .dom(
          `[data-test-store-release-readiness-assessment-policy-cell="${blocker.id}"]`
        )
        .containsText(blocker.category)
        .containsText(blocker.title);

      assert
        .dom(
          `[data-test-store-release-readiness-assessment-status-cell="${blocker.id}"]`
        )
        .exists();

      assert
        .dom(
          `[data-test-store-release-readiness-assessment-status-cell="${blocker.id}"] [data-test-store-release-readiness-assessment-status="failed"]`
        )
        .containsText(t('failed'));

      const passedRow = this.findings.find((f) => f.passed === true);

      assert
        .dom(
          `[data-test-store-release-readiness-assessment-status-cell="${passedRow.id}"] [data-test-store-release-readiness-assessment-status="passed"]`
        )
        .containsText(t('passed'));

      const untestedRow = this.findings.find((f) => f.passed === null);

      assert
        .dom(
          `[data-test-store-release-readiness-assessment-status-cell="${untestedRow.id}"] [data-test-store-release-readiness-assessment-status="untested"]`
        )
        .containsText(t('untested'));
    });

    test('failed rows render the blocker / warning severity chip', async function (assert) {
      const scan = seedScan(this);

      this.set('scanId', String(scan.id));

      await render(
        hbs`<StoreReleaseReadiness::ScanResults @scanId={{this.scanId}} />`
      );

      const blocker = this.findings.find(
        (f) => f.passed === false && f.severity === SEVERITY.BLOCKER
      );

      assert
        .dom(
          `[data-test-store-release-readiness-assessment-severity="${blocker.id}"]`
        )
        .containsText(t('storeReleaseReadiness.summaryBlocker'));

      const warning = this.findings.find(
        (f) => f.passed === false && f.severity === SEVERITY.WARNING
      );

      assert
        .dom(
          `[data-test-store-release-readiness-assessment-severity="${warning.id}"]`
        )
        .containsText(t('storeReleaseReadiness.summaryWarning'));

      const passedRow = this.findings.find((f) => f.passed === true);

      assert
        .dom(
          `[data-test-store-release-readiness-assessment-severity="${passedRow.id}"]`
        )
        .doesNotExist('Passed rows do not show severity chip');

      const untestedRow = this.findings.find((f) => f.passed === null);

      assert
        .dom(
          `[data-test-store-release-readiness-assessment-severity="${untestedRow.id}"]`
        )
        .doesNotExist('Untested rows do not show severity chip');
    });

    test('overridden passed row shows the override edit-icon indicator', async function (assert) {
      const scan = seedScan(this);

      this.set('scanId', String(scan.id));

      await render(
        hbs`<StoreReleaseReadiness::ScanResults @scanId={{this.scanId}} />`
      );

      const overridden = this.findings.find(
        (f) => f.passed === true && f.is_overridden
      );

      assert
        .dom(
          `[data-test-store-release-readiness-assessment-status-cell="${overridden.id}"] [data-test-store-release-readiness-assessment-status-overridden-edit-icon]`
        )
        .exists();

      const notOverridden = this.findings.find(
        (f) => f.passed === true && !f.is_overridden
      );

      assert
        .dom(
          `[data-test-store-release-readiness-assessment-status-cell="${notOverridden.id}"] [data-test-store-release-readiness-assessment-status-overridden-edit-icon]`
        )
        .doesNotExist();
    });

    test('status filter narrows table to selected status', async function (assert) {
      const scan = seedScan(this);

      this.set('scanId', String(scan.id));

      await render(
        hbs`<StoreReleaseReadiness::ScanResults @scanId={{this.scanId}} />`
      );

      assert
        .dom('[data-test-store-release-readiness-scan-results-assessment-row]')
        .exists({ count: this.findings.length });

      await selectChoose(
        '[data-test-vulnerability-analysis-filterselect]',
        t('failed')
      );

      const failedCount = this.findings.filter(
        (f) => f.passed === false
      ).length;

      assert
        .dom('[data-test-store-release-readiness-scan-results-assessment-row]')
        .exists(
          { count: failedCount },
          'Only failed rows visible after selecting Failed'
        );

      await selectChoose(
        '[data-test-vulnerability-analysis-filterselect]',
        t('all')
      );

      assert
        .dom('[data-test-store-release-readiness-scan-results-assessment-row]')
        .exists(
          { count: this.findings.length },
          'All rows return after switching back to All'
        );
    });

    test('category filter narrows table to selected categories', async function (assert) {
      const scan = seedScan(this);

      this.set('scanId', String(scan.id));

      await render(
        hbs`<StoreReleaseReadiness::ScanResults @scanId={{this.scanId}} />`
      );

      await clickTrigger('[data-test-store-release-readiness-category-filter]');

      const privacyOption = findAll('.ember-power-select-option').find((o) =>
        o.textContent.trim().includes('Privacy')
      );

      assert.ok(privacyOption, 'Privacy category option exists');

      await click(privacyOption);

      const privacyCount = this.findings.filter(
        (f) => f.category === 'Privacy'
      ).length;

      assert
        .dom('[data-test-store-release-readiness-scan-results-assessment-row]')
        .exists(
          { count: privacyCount },
          'Only rows in the selected category remain'
        );
    });

    test('shows assessment-filtered-empty status when filters yield zero rows', async function (assert) {
      const scan = seedScan(this);

      this.set('scanId', String(scan.id));

      await render(
        hbs`<StoreReleaseReadiness::ScanResults @scanId={{this.scanId}} />`
      );

      await clickTrigger('[data-test-store-release-readiness-category-filter]');

      const compliance = findAll('.ember-power-select-option').find((o) =>
        o.textContent.trim().includes('Compliance')
      );

      await click(compliance);

      await selectChoose(
        '[data-test-vulnerability-analysis-filterselect]',
        t('failed')
      );

      assert
        .dom(
          '[data-test-store-release-readiness-scan-results-assessment-filtered-empty]'
        )
        .exists();

      assert
        .dom(
          '[data-test-store-release-readiness-scan-results-assessment-filtered-empty] [data-test-store-release-readiness-status-heading]'
        )
        .hasText(t('storeReleaseReadiness.assessmentTryAdjustingFilters'));

      assert
        .dom(
          '[data-test-store-release-readiness-scan-results-assessment-filtered-empty] [data-test-store-release-readiness-status-description]'
        )
        .hasText(t('storeReleaseReadiness.assessmentFilteredEmptyDescription'));

      assert
        .dom(
          '[data-test-store-release-readiness-scan-results-assessment-table]'
        )
        .doesNotExist('Table is hidden when filters yield zero rows');
    });

    test('FAILED scan renders the scan-failed status and hides Details + assessment table', async function (assert) {
      const scan = seedScan(this, {
        status: SCAN_STATUS.FAILED,
      });

      this.set('scanId', String(scan.id));

      await render(
        hbs`<StoreReleaseReadiness::ScanResults @scanId={{this.scanId}} />`
      );

      assert.dom('[data-test-store-release-readiness-status]').exists();

      assert
        .dom('[data-test-store-release-readiness-status-heading]')
        .hasText(t('storeReleaseReadiness.scanFailedHeading'));

      assert
        .dom('[data-test-store-release-readiness-status-description]')
        .hasText(t('storeReleaseReadiness.scanFailedDescription'));

      assert
        .dom('[data-test-store-release-readiness-scan-results-details]')
        .doesNotExist('Details section is hidden for FAILED');

      assert
        .dom(
          '[data-test-store-release-readiness-scan-results-assessment-table]'
        )
        .doesNotExist('Assessment table is hidden for FAILED');
    });

    test('NOT_STARTED scan renders not-started status (with details, no assessment table)', async function (assert) {
      const scan = seedScan(this, {
        status: SCAN_STATUS.NOT_STARTED,
        verdict: VERDICT.HIGH_REJECTION_RISK,
        failed_count: 0,
        passed_count: 0,
        untested_count: 0,
        blocker_count: 0,
        warning_count: 0,
      });

      this.set('scanId', String(scan.id));

      await render(
        hbs`<StoreReleaseReadiness::ScanResults @scanId={{this.scanId}} />`
      );

      assert
        .dom('[data-test-store-release-readiness-scan-results-details]')
        .exists();

      assert
        .dom('[data-test-store-release-readiness-status-heading]')
        .hasText(t('storeReleaseReadiness.scanNotStartedHeading'));

      assert
        .dom('[data-test-store-release-readiness-status-description]')
        .hasText(t('storeReleaseReadiness.scanNotStartedDescription'));

      assert
        .dom(
          '[data-test-store-release-readiness-scan-results-assessment-table]'
        )
        .doesNotExist('Assessment table is hidden for NOT_STARTED');
    });

    test('IN_PROGRESS scan renders Details with loaders and hides the assessment table', async function (assert) {
      const scan = seedScan(this, {
        status: SCAN_STATUS.IN_PROGRESS,
      });

      this.set('scanId', String(scan.id));

      await render(
        hbs`<StoreReleaseReadiness::ScanResults @scanId={{this.scanId}} />`
      );

      assert
        .dom('[data-test-store-release-readiness-scan-results-details]')
        .exists();

      assert
        .dom('[data-test-store-release-readiness-scan-summary-status-loader]')
        .exists('File-summary header shows the in-progress loader');

      assert
        .dom('[data-test-store-release-readiness-status]')
        .exists('Assessment in-progress placeholder is shown');

      assert
        .dom('[data-test-store-release-readiness-status-heading]')
        .hasText(t('storeReleaseReadiness.assessmentInProgressHeading'));

      assert
        .dom('[data-test-store-release-readiness-status-description]')
        .hasText(t('storeReleaseReadiness.assessmentInProgressDescription'));

      assert
        .dom(
          '[data-test-store-release-readiness-scan-results-assessment-table]'
        )
        .doesNotExist('Assessment table is hidden while scan is in progress');
    });
  }
);
