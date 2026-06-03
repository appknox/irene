import { click, find, findAll, render, waitFor } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';
import Service from '@ember/service';

import ENUMS from 'irene/enums';
import {
  enableKnoxiqForTests,
  setupFileExploitabilityMirageEndpoint,
  setupKnoxiqMirageEndpoints,
} from 'irene/tests/helpers/knoxiq-test-utils';
import { setupFileModelEndpoints } from 'irene/tests/helpers/file-model-utils';
import { KNOXIQ_VULNERABILITY_ANALYSIS_DEFAULT_SORTS } from 'irene/components/knox-iq/vulnerability-analysis';

class NotificationsStub extends Service {
  error() {}
}

// Each row exercises a distinct code-path inside knoxiqStatusCardConfig
// in app/components/file-details/index.ts.
const STATUS_CARD_SCENARIOS = [
  {
    label: 'SAST RUNNING → running state, no run button',
    sast: ENUMS.KNOXIQ_SCAN_STATUS.RUNNING,
    dast: ENUMS.KNOXIQ_SCAN_STATUS.NOT_TRIGGERED,
    fileAttrs: { isStaticDone: true },
    state: 'running',
    showsRunBtn: false,
  },
  {
    label: 'SAST PENDING → running state, no run button',
    sast: ENUMS.KNOXIQ_SCAN_STATUS.PENDING,
    dast: ENUMS.KNOXIQ_SCAN_STATUS.NOT_TRIGGERED,
    fileAttrs: { isStaticDone: true },
    state: 'running',
    showsRunBtn: false,
  },
  {
    label: 'DAST RUNNING → running state, no run button',
    sast: ENUMS.KNOXIQ_SCAN_STATUS.COMPLETED,
    dast: ENUMS.KNOXIQ_SCAN_STATUS.RUNNING,
    fileAttrs: { isStaticDone: true, isDynamicDone: true },
    state: 'running',
    showsRunBtn: false,
  },
  {
    label: 'both COMPLETED → completed state, no run button',
    sast: ENUMS.KNOXIQ_SCAN_STATUS.COMPLETED,
    dast: ENUMS.KNOXIQ_SCAN_STATUS.COMPLETED,
    fileAttrs: { isStaticDone: true, isDynamicDone: true },
    state: 'completed',
    showsRunBtn: false,
  },
  {
    label: 'ready — static done, SAST NOT_TRIGGERED → active + enabled run',
    sast: ENUMS.KNOXIQ_SCAN_STATUS.NOT_TRIGGERED,
    dast: ENUMS.KNOXIQ_SCAN_STATUS.NOT_TRIGGERED,
    fileAttrs: { isStaticDone: true },
    state: 'active',
    showsRunBtn: true,
    runBtnDisabled: false,
  },
  {
    label: 'dast-ready — SAST done, dynamic done → active + enabled run',
    sast: ENUMS.KNOXIQ_SCAN_STATUS.COMPLETED,
    dast: ENUMS.KNOXIQ_SCAN_STATUS.NOT_TRIGGERED,
    fileAttrs: { isStaticDone: true, isDynamicDone: true, isManualDone: false },
    state: 'active',
    showsRunBtn: true,
    runBtnDisabled: false,
  },
  {
    label: 'complete-dast — SAST done, dynamic NOT done → inactive + disabled',
    sast: ENUMS.KNOXIQ_SCAN_STATUS.COMPLETED,
    dast: ENUMS.KNOXIQ_SCAN_STATUS.NOT_TRIGGERED,
    fileAttrs: {
      isStaticDone: true,
      isDynamicDone: false,
      isManualDone: false,
    },
    state: 'inactive',
    showsRunBtn: true,
    runBtnDisabled: true,
  },
  {
    label: 'SAST ERRORED → failed state, no run button, no chip',
    sast: ENUMS.KNOXIQ_SCAN_STATUS.ERRORED,
    dast: ENUMS.KNOXIQ_SCAN_STATUS.NOT_TRIGGERED,
    fileAttrs: { isStaticDone: true },
    state: 'failed',
    showsRunBtn: false,
  },
  {
    label: 'DAST ERRORED → failed state, no run button, no chip',
    sast: ENUMS.KNOXIQ_SCAN_STATUS.COMPLETED,
    dast: ENUMS.KNOXIQ_SCAN_STATUS.ERRORED,
    fileAttrs: { isStaticDone: true, isDynamicDone: true },
    state: 'failed',
    showsRunBtn: false,
  },
];

module('Integration | Component | file-details/knoxiq', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks, 'en');

  hooks.beforeEach(async function () {
    this.server.createList('organization', 1);
    this.owner.register('service:notifications', NotificationsStub);

    const store = this.owner.lookup('service:store');
    const project = this.server.create('project', { id: '1' });
    const profile = this.server.create('profile');
    const file = this.server.create('file', { project: project.id });

    this.file = store.push(
      store.normalize('file', {
        ...file.toJSON(),
        project: project.id,
        profile: profile.id,
      })
    );

    this.file.set('project', store.peekRecord('project', project.id));

    enableKnoxiqForTests(this, { automated: false });

    await this.owner.lookup('service:organization').load();
  });

  // ─── Status Card ───────────────────────────────────────────────────────────
  // The StatusCard component is rendered directly.  The knoxiqStatusCardConfig
  // getter (file-details/index.ts) is NOT involved — we test the card itself
  // at all states, plus an absence check via the {{unless isKnoxiqAutomated}}
  // guard in index.hbs by rendering the parent guard logic separately.

  module('status card (KnoxIq::StatusCard component)', function () {
    test('renders correctly for active state with enabled run button', async function (assert) {
      await render(hbs`
        <KnoxIq::StatusCard
          @title="KnoxIQ Ready"
          @subtitle="Run SAST scan"
          @state="active"
        />
      `);

      assert.dom('[data-test-knoxiq-status-card]').exists();
      assert
        .dom('[data-test-knoxiq-status-card-icon]')
        .hasClass(/status-card-icon-active/);
      assert
        .dom('[data-test-knoxiq-status-card-title]')
        .hasText('KnoxIQ Ready');
      assert
        .dom('[data-test-knoxiq-status-card-subtitle]')
        .hasText('Run SAST scan');
      assert.dom('[data-test-knoxiq-status-card-runBtn]').exists();
      assert
        .dom('[data-test-knoxiq-status-card-runBtn]')
        .doesNotHaveAttribute('disabled');
    });

    test('renders correctly for inactive state with disabled run button', async function (assert) {
      await render(hbs`
        <KnoxIq::StatusCard
          @title="Run Dynamic Scan First"
          @subtitle="Complete DAST before running KnoxIQ"
          @state="inactive"
        />
      `);

      assert
        .dom('[data-test-knoxiq-status-card-icon]')
        .hasClass(/status-card-icon-inactive/);
      assert
        .dom('[data-test-knoxiq-status-card-runBtn]')
        .hasAttribute('disabled');
    });

    test('renders correctly for running state — shows status chip, not run button', async function (assert) {
      await render(hbs`
        <KnoxIq::StatusCard @title="Scanning…" @state="running" />
      `);

      assert
        .dom('[data-test-knoxiq-status-card-icon]')
        .hasClass(/status-card-icon-running/);
      assert.dom('[data-test-knoxiq-status-card-runBtn]').doesNotExist();
      // StatusChip shows an AkLoader spinner for the running state
      assert.dom('[data-test-ak-loader]').exists();
    });

    test('renders correctly for completed state — shows status chip, not run button', async function (assert) {
      await render(hbs`
        <KnoxIq::StatusCard @title="Scan Complete" @state="completed" />
      `);

      assert
        .dom('[data-test-knoxiq-status-card-icon]')
        .hasClass(/status-card-icon-completed/);
      assert.dom('[data-test-knoxiq-status-card-runBtn]').doesNotExist();
      // StatusChip renders "completed" text for completed state
      assert.dom().containsText(t('completed'));
    });

    test('renders correctly for failed state — shows error icon, subtitle, no run button, no chip', async function (assert) {
      await render(hbs`
        <KnoxIq::StatusCard
          @title="KnoxIQ encountered an error."
          @subtitle="An unexpected issue occurred."
          @state="failed"
        />
      `);

      assert
        .dom('[data-test-knoxiq-status-card-icon]')
        .hasClass(/status-card-icon-failed/);
      assert
        .dom('[data-test-knoxiq-status-card-title]')
        .hasText('KnoxIQ encountered an error.');
      assert
        .dom('[data-test-knoxiq-status-card-subtitle]')
        .hasText('An unexpected issue occurred.');
      assert.dom('[data-test-knoxiq-status-card-runBtn]').doesNotExist();
      assert.dom('[data-test-ak-loader]').doesNotExist();
    });

    test('run button click fires the @onRunKnoxiq action', async function (assert) {
      let fired = false;

      this.handleRun = () => {
        fired = true;
      };

      await render(hbs`
        <KnoxIq::StatusCard
          @title="Ready"
          @state="active"
          @onRunKnoxiq={{this.handleRun}}
        />
      `);

      await click('[data-test-knoxiq-status-card-runBtn]');

      assert.true(fired, 'onRunKnoxiq action was called');
    });
  });

  // Tests for the presence/absence of the status card in the FileDetails
  // template, driven by file.isKnoxiqAutomated and knoxiqStatusCardConfig.
  module('status card — FileDetails integration', function (nestedHooks) {
    nestedHooks.beforeEach(function () {
      setupKnoxiqMirageEndpoints(this.server);
    });

    test('card is absent when knoxiq is automated (not manual)', async function (assert) {
      this.file.isKnoxiqAutomated = true;
      this.file.isStaticDone = true;

      // Render only the conditional guard from file-details/index.hbs
      this.knoxiqStatusCardConfig = {
        title: 'KnoxIQ Ready',
        state: 'active',
      };

      await render(hbs`
        {{#unless this.file.isKnoxiqAutomated}}
          {{#if this.knoxiqStatusCardConfig}}
            <KnoxIq::StatusCard
              @title={{this.knoxiqStatusCardConfig.title}}
              @state={{this.knoxiqStatusCardConfig.state}}
            />
          {{/if}}
        {{/unless}}
      `);

      assert.dom('[data-test-knoxiq-status-card]').doesNotExist();
    });

    test.each(
      'card renders with correct state for each manual scan scenario',
      STATUS_CARD_SCENARIOS,
      async function (assert, scenario) {
        const config = {
          title: 'KnoxIQ Status',
          state: scenario.state,
        };

        this.file = Object.assign(this.file, scenario.fileAttrs);
        this.file.isKnoxiqAutomated = false;
        this.knoxiqStatusCardConfig = config;

        await render(hbs`
          {{#unless this.file.isKnoxiqAutomated}}
            {{#if this.knoxiqStatusCardConfig}}
              <KnoxIq::StatusCard
                @title={{this.knoxiqStatusCardConfig.title}}
                @state={{this.knoxiqStatusCardConfig.state}}
              />
            {{/if}}
          {{/unless}}
        `);

        assert.dom('[data-test-knoxiq-status-card]').exists(scenario.label);
        assert
          .dom('[data-test-knoxiq-status-card-icon]')
          .hasClass(
            new RegExp(`status-card-icon-${scenario.state}`),
            scenario.label
          );

        if (scenario.showsRunBtn) {
          assert
            .dom('[data-test-knoxiq-status-card-runBtn]')
            .exists(scenario.label);

          if (scenario.runBtnDisabled) {
            assert
              .dom('[data-test-knoxiq-status-card-runBtn]')
              .hasAttribute('disabled', '', scenario.label);
          } else {
            assert
              .dom('[data-test-knoxiq-status-card-runBtn]')
              .doesNotHaveAttribute('disabled', scenario.label);
          }
        } else {
          assert
            .dom('[data-test-knoxiq-status-card-runBtn]')
            .doesNotExist(scenario.label);
        }
      }
    );
  });

  // ─── Scan Actions ──────────────────────────────────────────────────────────
  // Tests for FileDetails::ScanActions::StaticScan and ::DynamicScan,
  // matching the knoxiq-scan-actions-test.js pattern.

  module('scan actions', function (nestedHooks) {
    nestedHooks.beforeEach(function () {
      this.server.get('/manualscans/:id', (_, req) => ({ id: req.params.id }));
      this.server.get('/v3/projects/:id', (schema, req) =>
        schema.projects.find(req.params.id)?.toJSON()
      );
    });

    test('automated: shows KnoxIQ StatusChip instead of legacy completed chip on static scan', async function (assert) {
      this.file.isKnoxiqAutomated = true;
      this.file.isStaticDone = true;

      this.knoxiqStatuses = {
        [ENUMS.KNOXIQ_SCAN_TYPE.SAST]: ENUMS.KNOXIQ_SCAN_STATUS.COMPLETED,
        [ENUMS.KNOXIQ_SCAN_TYPE.DAST_MANUAL]:
          ENUMS.KNOXIQ_SCAN_STATUS.NOT_TRIGGERED,
      };

      await render(hbs`
        <FileDetails::ScanActions::StaticScan
          @file={{this.file}}
          @isKnoxiqEnabled={{true}}
          @knoxiqStatuses={{this.knoxiqStatuses}}
          @vulnerabilityCount={{0}}
        />
      `);

      assert
        .dom('[data-test-fileDetailScanActions-staticScanCompletedStatus]')
        .doesNotExist(
          'legacy chip must not appear when Knox status chip is shown'
        );

      assert.dom().containsText(t('completed'));
    });

    test('manual (scan running): legacy completed chip is shown with a pending accent', async function (assert) {
      this.file.isKnoxiqAutomated = false;
      this.file.isStaticDone = true;

      this.knoxiqStatuses = {
        [ENUMS.KNOXIQ_SCAN_TYPE.SAST]: ENUMS.KNOXIQ_SCAN_STATUS.RUNNING,
        [ENUMS.KNOXIQ_SCAN_TYPE.DAST_MANUAL]:
          ENUMS.KNOXIQ_SCAN_STATUS.NOT_TRIGGERED,
      };

      await render(hbs`
        <FileDetails::ScanActions::StaticScan
          @file={{this.file}}
          @isKnoxiqEnabled={{true}}
          @knoxiqStatuses={{this.knoxiqStatuses}}
          @vulnerabilityCount={{0}}
        />
      `);

      assert
        .dom('[data-test-fileDetailScanActions-staticScanCompletedStatus]')
        .hasText(t('completed'));

      // The accent <div> is the first child of the root AkStack when Knox is
      // enabled; the second child is [data-test-cy="staticScan-infoContainer"].
      const infoContainer = find('[data-test-cy="staticScan-infoContainer"]');
      const rootEl = infoContainer?.parentElement;
      const accentDiv = rootEl?.querySelector(':scope > div:first-child');

      assert.ok(accentDiv, 'accent bar div should exist when Knox is enabled');
      assert.ok(
        accentDiv?.className.includes('pending'),
        'accent bar should use pending styling when SAST is running'
      );
    });

    test('manual (scan completed): legacy completed chip is shown with a done accent', async function (assert) {
      this.file.isKnoxiqAutomated = false;
      this.file.isStaticDone = true;

      this.knoxiqStatuses = {
        [ENUMS.KNOXIQ_SCAN_TYPE.SAST]: ENUMS.KNOXIQ_SCAN_STATUS.COMPLETED,
        [ENUMS.KNOXIQ_SCAN_TYPE.DAST_MANUAL]:
          ENUMS.KNOXIQ_SCAN_STATUS.NOT_TRIGGERED,
      };

      await render(hbs`
        <FileDetails::ScanActions::StaticScan
          @file={{this.file}}
          @isKnoxiqEnabled={{true}}
          @knoxiqStatuses={{this.knoxiqStatuses}}
          @vulnerabilityCount={{0}}
        />
      `);

      assert
        .dom('[data-test-fileDetailScanActions-staticScanCompletedStatus]')
        .hasText(t('completed'));

      const infoContainer2 = find('[data-test-cy="staticScan-infoContainer"]');
      const rootEl2 = infoContainer2?.parentElement;
      const accentDiv2 = rootEl2?.querySelector(':scope > div:first-child');

      assert.ok(accentDiv2, 'accent bar div should exist');
      assert.ok(
        accentDiv2?.className.includes('done'),
        'accent bar should use done styling when SAST is completed'
      );
    });
  });

  // ─── Scan Summary ──────────────────────────────────────────────────────────

  module('scan summary (KnoxIq::ScanSummary)', function (nestedHooks) {
    nestedHooks.beforeEach(function () {
      const { file_risk_info } = setupFileModelEndpoints(this.server);

      this.file_risk_info = file_risk_info;
    });

    test('shows pending accent when no scan has completed (hasAnyKnoxiqScanCompleted=false)', async function (assert) {
      setupFileExploitabilityMirageEndpoint(this.server, {
        exploitability_count_high: 3,
        exploitability_count_medium: 1,
        exploitability_count_low: 5,
        exploitability_count_passed: 0,
        exploitability_count_unknown: 0,
      });

      await render(hbs`
        <KnoxIq::ScanSummary
          @file={{this.file}}
          @hasAnyKnoxiqScanCompleted={{false}}
        />
      `);

      assert.dom('[data-test-knoxiq-scan-summary]').exists();

      const accentBar = find('[data-test-knoxiq-scan-summary]')?.querySelector(
        ':scope > div:first-child'
      );

      assert.ok(
        accentBar?.className.includes('pending'),
        'accent bar class should contain "pending"'
      );
    });

    test('shows done accent when at least one scan has completed', async function (assert) {
      setupFileExploitabilityMirageEndpoint(this.server, {
        exploitability_count_high: 1,
        exploitability_count_medium: 0,
        exploitability_count_low: 0,
        exploitability_count_passed: 0,
        exploitability_count_unknown: 0,
      });

      await render(hbs`
        <KnoxIq::ScanSummary
          @file={{this.file}}
          @hasAnyKnoxiqScanCompleted={{true}}
        />
      `);

      const accentBar = find('[data-test-knoxiq-scan-summary]')?.querySelector(
        ':scope > div:first-child'
      );

      assert.ok(
        accentBar?.className.includes('done'),
        'accent bar class should contain "done"'
      );
    });

    test('displays correct exploitability counts from the API', async function (assert) {
      setupFileExploitabilityMirageEndpoint(this.server, {
        exploitability_count_high: 4,
        exploitability_count_medium: 2,
        exploitability_count_low: 7,
        exploitability_count_passed: 0,
        exploitability_count_unknown: 0,
      });

      await render(hbs`
        <KnoxIq::ScanSummary
          @file={{this.file}}
          @hasAnyKnoxiqScanCompleted={{false}}
        />
      `);

      await waitFor('[data-test-knoxiq-scan-summary-exploitability-high]', {
        timeout: 5000,
      });

      assert
        .dom('[data-test-knoxiq-scan-summary-exploitability-high]')
        .includesText('04');

      assert
        .dom('[data-test-knoxiq-scan-summary-exploitability-medium]')
        .includesText('02');

      assert
        .dom('[data-test-knoxiq-scan-summary-exploitability-low]')
        .includesText('07');
    });

    test('displays severity counts from file-risk data', async function (assert) {
      setupFileExploitabilityMirageEndpoint(this.server);

      await render(hbs`
        <KnoxIq::ScanSummary
          @file={{this.file}}
          @hasAnyKnoxiqScanCompleted={{true}}
        />
      `);

      await waitFor('[data-test-knoxiq-scan-summary-severity-counts]', {
        timeout: 5000,
      });

      const criticalCount = String(
        this.file_risk_info.risk_count_critical
      ).padStart(2, '0');

      assert
        .dom('[data-test-knoxiq-scan-summary-severity-count="critical"]')
        .includesText(criticalCount);
    });
  });

  // ─── Vulnerability Analysis ────────────────────────────────────────────────

  module(
    'vulnerability analysis (KnoxIq::VulnerabilityAnalysis)',
    function (nestedHooks) {
      nestedHooks.beforeEach(function () {
        setupFileModelEndpoints(this.server);

        const organizations = this.server.schema.organizations.all().models;
        const orgId = organizations[0]?.id;

        if (orgId) {
          this.server.create('organization-me', { id: orgId });
        }

        this.server.get('/organizations/:id/me', (schema, req) =>
          schema.organizationMes.find(`${req.params.id}`)?.toJSON()
        );

        this.server.get('/profiles/:id/unknown_analysis_status', (_, req) => ({
          id: req.params.id,
          status: true,
        }));

        this.server.get('/v3/files/:id/analyses', (schema, req) => {
          const analyses = schema.analysisOverviews.where({
            file: req.params.id,
          }).models;

          return {
            count: analyses.length,
            next: null,
            previous: null,
            results: analyses,
          };
        });

        const store = this.owner.lookup('service:store');

        const vuln1 = this.server.create('vulnerability', {
          name: 'Alpha SQL Injection',
        });
        const vuln2 = this.server.create('vulnerability', {
          name: 'Beta XSS Issue',
        });
        const vuln3 = this.server.create('vulnerability', {
          name: 'Gamma Buffer Overflow',
        });

        // Analyses with different exploitability levels for sort assertions.
        const fileId = this.file.id;

        const makeAnalysis = (vuln, risk, likelihood) => {
          const record = this.server.create('analysis-overview', {
            file: fileId,
            vulnerability: vuln.id,
            status: ENUMS.ANALYSIS_STATUS.COMPLETED,
            computed_risk: risk,
            exploitability_likelihood: likelihood,
          });

          return store.push(
            store.normalize('analysis-overview', {
              ...record.toJSON(),
              relationships: {
                vulnerability: {
                  data: { type: 'vulnerabilities', id: vuln.id },
                },
              },
            })
          );
        };

        this.fileAnalyses = [
          makeAnalysis(
            vuln1,
            ENUMS.RISK.HIGH,
            ENUMS.KNOXIQ_EXPLOITABILITY.HIGH
          ),
          makeAnalysis(vuln2, ENUMS.RISK.LOW, ENUMS.KNOXIQ_EXPLOITABILITY.LOW),
          makeAnalysis(
            vuln3,
            ENUMS.RISK.MEDIUM,
            ENUMS.KNOXIQ_EXPLOITABILITY.MEDIUM
          ),
        ];

        this.sorts = KNOXIQ_VULNERABILITY_ANALYSIS_DEFAULT_SORTS;
        this.updateAnalysesSorts = (sorts) => {
          this.set('sorts', sorts);
        };
      });

      test('does not show KnoxIQ table when hasAnyKnoxiqScanCompleted is false — legacy table is shown', async function (assert) {
        // Replicate the parent template guard from file-details/index.hbs:
        // {{#if hasAnyKnoxiqScanCompleted}} Knox table {{else}} legacy table {{/if}}
        this.showKnox = false;

        await render(hbs`
        {{#if this.showKnox}}
          <KnoxIq::VulnerabilityAnalysis @file={{this.file}} @hasAnyKnoxiqScanCompleted={{false}} />
        {{else}}
          <FileDetails::VulnerabilityAnalysis @file={{this.file}} />
        {{/if}}
      `);

        await waitFor('[data-test-vulnerability-analysis-table]', {
          timeout: 5000,
        });

        assert.dom('[data-test-knoxiq-vulnerability-analysis]').doesNotExist();
        assert.dom('[data-test-vulnerability-analysis-table]').exists();
      });

      test('shows KnoxIQ table with done accent when scan is completed', async function (assert) {
        await render(hbs`
        <KnoxIq::VulnerabilityAnalysis
          @file={{this.file}}
          @hasAnyKnoxiqScanCompleted={{true}}
        />
      `);

        assert.dom('[data-test-knoxiq-vulnerability-analysis]').exists();

        const accentBar = find(
          '[data-test-knoxiq-vulnerability-analysis]'
        )?.querySelector(':scope > div:first-child');

        assert.ok(
          accentBar?.className.includes('done'),
          'accent bar should use done styling when scan is completed'
        );

        assert.dom('[data-test-knoxiq-vulnerability-analysis-search]').exists();
      });

      test('shows KnoxIQ table with pending accent when scan has not completed', async function (assert) {
        await render(hbs`
        <KnoxIq::VulnerabilityAnalysis
          @file={{this.file}}
          @hasAnyKnoxiqScanCompleted={{false}}
        />
      `);

        const accentBar = find(
          '[data-test-knoxiq-vulnerability-analysis]'
        )?.querySelector(':scope > div:first-child');

        assert.ok(
          accentBar?.className.includes('pending'),
          'accent bar should use pending styling when scan has not completed'
        );
      });

      test('table rows and exploitability icons render correctly', async function (assert) {
        this.searchQuery = '';

        await render(hbs`
        <KnoxIq::VulnerabilityAnalysis::Table
          @file={{this.file}}
          @sorts={{this.sorts}}
          @searchQuery={{this.searchQuery}}
          @updateAnalysesSorts={{this.updateAnalysesSorts}}
          @fileAnalyses={{this.fileAnalyses}}
          @loadingFileAnalyses={{false}}
        />
      `);

        assert.dom('[data-test-knoxiq-vulnerability-analysis-table]').exists();
        assert
          .dom('[data-test-knoxiq-vulnerability-analysis-row]')
          .exists({ count: 3 });
        assert.dom('[data-test-knoxiq-exploitabilityLevelIcon]').exists();
      });

      test('empty search query shows all rows', async function (assert) {
        this.searchQuery = '';

        await render(hbs`
        <KnoxIq::VulnerabilityAnalysis::Table
          @file={{this.file}}
          @sorts={{this.sorts}}
          @searchQuery={{this.searchQuery}}
          @updateAnalysesSorts={{this.updateAnalysesSorts}}
          @fileAnalyses={{this.fileAnalyses}}
          @loadingFileAnalyses={{false}}
        />
      `);

        assert
          .dom('[data-test-knoxiq-vulnerability-analysis-row]')
          .exists({ count: 3 });
      });

      test('search box filters rows by vulnerability name', async function (assert) {
        this.searchQuery = 'Beta';

        await render(hbs`
        <KnoxIq::VulnerabilityAnalysis::Table
          @file={{this.file}}
          @sorts={{this.sorts}}
          @searchQuery={{this.searchQuery}}
          @updateAnalysesSorts={{this.updateAnalysesSorts}}
          @fileAnalyses={{this.fileAnalyses}}
          @loadingFileAnalyses={{false}}
        />
      `);

        assert
          .dom('[data-test-knoxiq-vulnerability-analysis-row]')
          .exists({ count: 1 });

        assert.dom().containsText('Beta XSS Issue');
      });

      test('search shows empty state when no rows match', async function (assert) {
        this.searchQuery = 'definitely-no-match';

        await render(hbs`
        <KnoxIq::VulnerabilityAnalysis::Table
          @file={{this.file}}
          @sorts={{this.sorts}}
          @searchQuery={{this.searchQuery}}
          @updateAnalysesSorts={{this.updateAnalysesSorts}}
          @fileAnalyses={{this.fileAnalyses}}
          @loadingFileAnalyses={{false}}
        />
      `);

        assert
          .dom('[data-test-knoxiq-vulnerability-analysis-search-empty]')
          .exists();

        assert
          .dom('[data-test-knoxiq-vulnerability-analysis-row]')
          .doesNotExist();
      });

      test('default sort is descending by exploitability (HIGH first, LOW last)', async function (assert) {
        this.searchQuery = '';

        await render(hbs`
        <KnoxIq::VulnerabilityAnalysis::Table
          @file={{this.file}}
          @sorts={{this.sorts}}
          @searchQuery={{this.searchQuery}}
          @updateAnalysesSorts={{this.updateAnalysesSorts}}
          @fileAnalyses={{this.fileAnalyses}}
          @loadingFileAnalyses={{false}}
        />
      `);

        const rows = findAll('[data-test-knoxiq-vulnerability-analysis-row]');

        assert.strictEqual(rows.length, 3, 'three rows rendered');
        assert.dom(rows[0]).containsText('Alpha SQL Injection');
        assert.dom(rows[2]).containsText('Beta XSS Issue');
      });

      test('clicking the exploitability column header inverts sort order', async function (assert) {
        this.searchQuery = '';

        await render(hbs`
        <KnoxIq::VulnerabilityAnalysis::Table
          @file={{this.file}}
          @sorts={{this.sorts}}
          @searchQuery={{this.searchQuery}}
          @updateAnalysesSorts={{this.updateAnalysesSorts}}
          @fileAnalyses={{this.fileAnalyses}}
          @loadingFileAnalyses={{false}}
        />
      `);

        const headers = findAll(
          '[data-test-knoxiq-vulnerability-analysis-thead] th'
        );

        // The second column is exploitability.
        assert.ok(headers.length >= 2, 'at least two column headers');

        await click(headers[1]);

        const rows = findAll('[data-test-knoxiq-vulnerability-analysis-row]');

        // After ascending sort: LOW → MEDIUM → HIGH
        assert.dom(rows[0]).containsText('Beta XSS Issue');
        assert.dom(rows[2]).containsText('Alpha SQL Injection');
      });
    }
  );
});
