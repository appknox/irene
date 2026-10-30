import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupBrowserFakes } from 'ember-browser-services/test-support';
import { render, click, find, findAll } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import Service from '@ember/service';

import ENUMS from 'irene/enums';

const SCAN_STATUS = ENUMS.OFFSEC_SCAN_STATUS;

// ─── Stubs ───────────────────────────────────────────────────────────────────

class RouterStub extends Service {
  lastRoute = null;
  lastModels = [];

  transitionTo(route, ...models) {
    this.lastRoute = route;
    this.lastModels = models;
  }

  hasRoute() {
    return true;
  }

  urlFor() {
    return '';
  }

  isActive() {
    return false;
  }
}

// ─── Selectors ───────────────────────────────────────────────────────────────

const SELECTORS = {
  risksCard: '[data-test-offensiveSecurity-pentestGoalsCard]',
  risksTitle: '[data-test-offensiveSecurity-pentestGoalsCard-title]',
  risksEmpty: '[data-test-offensiveSecurity-pentestGoalsCard-empty]',
  updatingLive: '[data-test-offensiveSecurity-pentestGoalsCard-updatingLive]',
  goalRow: (index) =>
    `[data-test-offensiveSecurity-pentest-goal-row="${index}"]`,
  goalName: '[data-test-offensiveSecurity-pentest-goal-name]',
  goalReason: '[data-test-offensiveSecurity-pentest-goal-reason]',
  goalFindingsCount: '[data-test-offensiveSecurity-pentest-goal-findingsCount]',
  goalStatus: '[data-test-offensiveSecurity-pentest-goal-status]',
  goalDetailBack: '[data-test-offensiveSecurity-pentest-back]',
  goalDetailNav: '[data-test-offensiveSecurity-pentest-nav]',
  findingsList: '[data-test-offensiveSecurity-findingsList]',
  findingsEmpty: '[data-test-offensiveSecurity-findingsList-empty]',
  groupTitle: '[data-test-offensiveSecurity-findingsList-groupTitle]',
  groupHeader: '[data-test-offensiveSecurity-findingsList-groupHeader]',
  groupSummary: '[data-test-offensiveSecurity-findingsList-groupSummary]',
  groupCount: '[data-test-offensiveSecurity-findingsList-groupCount]',
  groupOutcome: '[data-test-offensiveSecurity-findingsList-groupOutcome]',
  findingsUpdatingLive:
    '[data-test-offensiveSecurity-findingsList-updatingLive]',
};

// ─── Template ────────────────────────────────────────────────────────────────

const TEMPLATE = hbs`<OffensiveSecurity::RunResults
  @scan={{this.scan}}
  @activeGoalParam={{this.goalParam}}
  @onGoalParamChange={{this.onGoalParamChange}}
/>`;

// ─── Helpers ─────────────────────────────────────────────────────────────────

const GOALS = [
  {
    goal_id: 'find-secrets',
    goal_name: 'Find every secret this app holds or hands out',
    status: 'budget_exhausted',
    reason: 'step ceiling reached (40 steps)',
    findings_count: 3,
    findings: [],
    plans: [],
    observations: [],
  },
  {
    goal_id: 'bypass-root',
    goal_name: 'Bypass root detection mechanism',
    status: 'completed',
    findings: [{ pattern: 'su', kind: 'binary' }],
    plans: [],
    observations: [],
  },
];

function createScan(test, overrides = {}) {
  return test.server.create('offsec-scan', {
    status: SCAN_STATUS.COMPLETED,
    pentest_results: [],
    findings: [],
    ...overrides,
  });
}

function pushScan(test, scan) {
  const store = test.owner.lookup('service:store');

  return store.push(store.normalize('offsec-scan', scan.toJSON()));
}

// ─── Test suite ──────────────────────────────────────────────────────────────

module('Integration | Component | offensive-security/run-results', (hooks) => {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks, 'en');
  setupBrowserFakes(hooks, { window: true });

  hooks.beforeEach(function () {
    this.owner.unregister('service:router');
    this.owner.register('service:router', RouterStub);

    this.setProperties({
      goalParam: null,
      goalParamChanges: [],
      onGoalParamChange: (goalId) => {
        this.goalParamChanges.push(goalId);
        this.set('goalParam', goalId);
      },
    });
  });

  // ─── Business risks ────────────────────────────────────────────────────────

  test('it lists every business risk with its findings count and status', async function (assert) {
    const scan = createScan(this, { pentest_results: GOALS });

    this.set('scan', pushScan(this, scan));
    await render(TEMPLATE);

    assert
      .dom(SELECTORS.risksTitle)
      .hasText(t('offensiveSecurity.businessRisks'));
    assert.dom(SELECTORS.risksEmpty).doesNotExist();
    assert.dom(SELECTORS.updatingLive).doesNotExist();

    const firstRow = SELECTORS.goalRow(0);

    assert.dom(SELECTORS.goalName, find(firstRow)).hasText(GOALS[0].goal_name);
    assert.dom(SELECTORS.goalReason, find(firstRow)).hasText(GOALS[0].reason);
    assert.dom(SELECTORS.goalFindingsCount, find(firstRow)).hasText('3');
    assert
      .dom(SELECTORS.goalStatus, find(firstRow))
      .hasText('Budget Exhausted');

    const secondRow = SELECTORS.goalRow(1);

    assert.dom(SELECTORS.goalReason, find(secondRow)).doesNotExist();
    assert.dom(SELECTORS.goalFindingsCount, find(secondRow)).hasText('1');
    assert.dom(SELECTORS.goalStatus, find(secondRow)).hasText('Completed');
  });

  test('it shows an empty state when no business risks were assessed', async function (assert) {
    const scan = createScan(this, { pentest_results: [] });

    this.set('scan', pushScan(this, scan));
    await render(TEMPLATE);

    assert
      .dom(SELECTORS.risksEmpty)
      .hasText(t('offensiveSecurity.noBusinessRisks'));
  });

  test('it hides the business risks card for a resilience assessment', async function (assert) {
    const scan = createScan(this, {
      assessment_type: 'resilience',
      pentest_results: GOALS,
    });

    this.set('scan', pushScan(this, scan));
    await render(TEMPLATE);

    assert.dom(SELECTORS.risksCard).doesNotExist();
    assert.dom(SELECTORS.findingsList).exists();
  });

  test('it marks the risks as updating while the run is in progress', async function (assert) {
    const scan = createScan(this, {
      status: SCAN_STATUS.RUNNING,
      pentest_results: GOALS,
    });

    this.set('scan', pushScan(this, scan));
    await render(TEMPLATE);

    assert
      .dom(SELECTORS.updatingLive)
      .hasText(t('offensiveSecurity.updatingLive'));
  });

  test('clicking a business risk opens its goal detail and back returns to the list', async function (assert) {
    const scan = createScan(this, { pentest_results: GOALS });

    this.set('scan', pushScan(this, scan));
    await render(TEMPLATE);

    assert.deepEqual(this.goalParamChanges, []);
    assert.dom(SELECTORS.goalDetailNav).doesNotExist();

    await click(SELECTORS.goalRow(1));

    assert.deepEqual(this.goalParamChanges, ['bypass-root']);
    assert.dom(SELECTORS.risksCard).doesNotExist();
    assert.dom(SELECTORS.findingsList).doesNotExist();
    assert.dom(SELECTORS.goalDetailNav).exists();

    await click(SELECTORS.goalDetailBack);

    assert.deepEqual(this.goalParamChanges, ['bypass-root', null]);
    assert.dom(SELECTORS.risksCard).exists();
  });

  test('an unknown goal param falls back to the risk list', async function (assert) {
    const scan = createScan(this, { pentest_results: GOALS });

    this.setProperties({ scan: pushScan(this, scan), goalParam: 'missing' });
    await render(TEMPLATE);

    assert.dom(SELECTORS.risksCard).exists();
    assert.dom(SELECTORS.goalDetailNav).doesNotExist();
  });

  // ─── Findings ──────────────────────────────────────────────────────────────

  test('it lists findings for the scan', async function (assert) {
    const scan = createScan(this, {
      findings: [
        {
          id: 1,
          signature_id: 'root-01',
          name: 'Root detection',
          category: 'root_detection',
          outcome: 'bypassed',
          order: 0,
          evidence_ids: [],
        },
        {
          id: 2,
          signature_id: 'ssl-01',
          name: 'SSL pinning',
          category: 'ssl_pinning',
          outcome: 'resisted',
          order: 1,
          evidence_ids: [],
        },
      ],
    });
    this.set('scan', pushScan(this, scan));
    await render(TEMPLATE);

    assert.dom(SELECTORS.findingsList).exists();
    const headers = findAll(SELECTORS.groupHeader);
    assert.strictEqual(headers.length, 2);
    assert.dom(headers[0]).includesText('Root 01');
    assert.dom(headers[1]).includesText('SSL 01');
  });

  test('it lists a detected but untriggered finding with an untriggered badge', async function (assert) {
    const scan = createScan(this, {
      findings: [
        {
          id: 1,
          signature_id: 'root-file-probe',
          name: 'Root artifact file probe',
          category: 'root_detection',
          outcome: 'bypassed',
          detected: true,
          order: 0,
          evidence_ids: [],
        },
        // Detected statically but never triggered at runtime — must still appear.
        {
          id: 2,
          signature_id: 'frida-port-scan',
          name: 'Frida port scan',
          category: 'frida_detection',
          outcome: 'not_attempted',
          detected: true,
          triggered: false,
          order: 1,
          evidence_ids: [],
        },
      ],
    });
    this.set('scan', pushScan(this, scan));
    await render(TEMPLATE);

    const headers = findAll(SELECTORS.groupHeader);
    assert.strictEqual(headers.length, 2);
    assert.dom(headers[0]).includesText('Root File Probe');
    assert.dom(headers[1]).includesText('Frida Port Scan');
  });

  test('a finding whose check fired reads Triggered, not Untriggered', async function (assert) {
    const scan = createScan(this, {
      findings: [
        // outcome not_attempted (no bypass tried) but it fired at runtime — triggered.
        {
          id: 1,
          signature_id: 'root-package-query',
          name: 'Superuser package-manager query',
          category: 'root_detection',
          outcome: 'not_attempted',
          detected: true,
          triggered: true,
          order: 0,
          evidence_ids: [],
        },
      ],
    });
    this.set('scan', pushScan(this, scan));
    await render(TEMPLATE);

    assert.dom(SELECTORS.findingsList).includesText('Root Package Query');
    assert.strictEqual(findAll(SELECTORS.groupHeader).length, 1);
  });

  test('it groups findings by dictionary key and formats the group header in title case', async function (assert) {
    const scan = createScan(this, {
      findings: {
        'anti-debug-ptrace': {
          id: 1,
          signature_id: 'anti-debug-ptrace',
          name: 'ptrace PTRACE_TRACEME check',
          category: 'resilience',
          outcome: 'bypassed',
          order: 0,
        },
        'debug-settings-probe': {
          id: 2,
          signature_id: 'debug-settings-probe',
          name: 'Developer-options / USB-debugging settings probe',
          category: 'resilience',
          outcome: 'bypassed',
          order: 1,
        },
        'frida-port-scan': {
          id: 3,
          signature_id: 'frida-port-scan',
          name: 'Frida server port scan (27042)',
          category: 'resilience',
          outcome: 'not_attempted',
          order: 2,
        },
      },
    });
    this.set('scan', pushScan(this, scan));
    await render(TEMPLATE);

    assert.dom(SELECTORS.findingsList).exists();
    const headers = findAll(SELECTORS.groupHeader);
    assert.strictEqual(headers.length, 2);

    const groupTitles = new Set(
      findAll(SELECTORS.groupTitle).map((el) => el.textContent.trim())
    );
    assert.true(groupTitles.has('Anti Debug Ptrace'));
    assert.true(groupTitles.has('Debug Settings Probe'));
    assert.false(groupTitles.has('Frida Port Scan'));

    assert.dom(SELECTORS.findingsList).containsText('Anti Debug Ptrace');
    assert.dom(SELECTORS.findingsList).containsText('Debug Settings Probe');
  });

  test('findings groups have accordions for all and format keys with slashes', async function (assert) {
    const scan = createScan(this, {
      findings: {
        'anti-debug-ptrace': {
          id: 1,
          signature_id: 'anti-debug-ptrace',
          name: 'ptrace PTRACE_TRACEME check',
          category: 'resilience',
          outcome: 'bypassed',
          order: 0,
        },
        'dev-options/usb-debugging': {
          id: 2,
          signature_id: 'dev-options/usb-debugging',
          name: 'Developer-options detection',
          category: 'resilience',
          outcome: 'bypassed',
          order: 1,
        },
      },
    });
    this.set('scan', pushScan(this, scan));
    await render(TEMPLATE);

    const headers = findAll(SELECTORS.groupHeader);
    assert.strictEqual(headers.length, 2, 'Two group headers rendered');

    // Key with slash formatted to Title Case
    assert.dom(headers[1]).includesText('Dev Options USB Debugging');
  });

  test('findings are rendered as clickable group rows without child rows', async function (assert) {
    const scan = createScan(this, {
      findings: {
        'debug-settings-probe': {
          id: 1,
          signature_id: 'debug-settings-probe',
          name: 'Developer-options / USB-debugging settings probe',
          category: 'resilience',
          outcome: 'bypassed',
          order: 0,
        },
        'freerasp-talsec': {
          id: 2,
          signature_id: 'freerasp-talsec',
          name: 'FreeRASP / Talsec SDK',
          category: 'resilience',
          outcome: 'bypassed',
          order: 1,
        },
      },
    });
    this.set('scan', pushScan(this, scan));
    await render(TEMPLATE);

    const headers = findAll(SELECTORS.groupHeader);
    assert.strictEqual(headers.length, 2, 'Two group rows rendered');

    assert.dom(headers[0]).includesText('Debug Settings Probe');
    assert.dom(SELECTORS.groupCount, headers[0]).hasText('1');
    assert.dom(headers[1]).includesText('Freerasp Talsec');
    assert.dom(SELECTORS.groupCount, headers[1]).hasText('1');
  });

  test('it groups findings when API findings object contains arrays of findings under category keys', async function (assert) {
    const scan = createScan(this, {
      findings: {
        root_detection: [
          {
            id: 8,
            signature_id: 'root-aggregate-guard',
            name: 'Obfuscated aggregate root verdict method',
            category: 'resilience',
            outcome: 'bypassed',
          },
          {
            id: 9,
            signature_id: 'root-build-props',
            name: 'Build tags and system properties',
            category: 'resilience',
            outcome: 'bypassed',
          },
        ],
        debugger_detection: [
          {
            id: 1,
            signature_id: 'anti-debug-ptrace',
            name: 'ptrace check',
            category: 'resilience',
            outcome: 'bypassed',
          },
          {
            id: 2,
            signature_id: 'debug-settings-probe',
            name: 'Developer-options / USB-debugging settings probe',
            category: 'resilience',
            outcome: 'bypassed',
          },
        ],
        ssl_pinning: [
          {
            id: 6,
            signature_id: 'okhttp-pinning',
            name: 'OkHttp Certificate Pinner',
            category: 'resilience',
            outcome: 'bypassed',
          },
        ],
      },
    });
    this.set('scan', pushScan(this, scan));
    await render(TEMPLATE);

    const headers = findAll(SELECTORS.groupHeader);
    assert.strictEqual(headers.length, 3, 'Three group headers rendered');

    // Title formatting and acronym handling
    assert.dom(headers[0]).includesText('Root Detection');
    assert.dom(SELECTORS.groupCount, headers[0]).hasText('2');

    assert.dom(headers[1]).includesText('Debugger Detection');
    assert.dom(SELECTORS.groupCount, headers[1]).hasText('2');

    assert.dom(headers[2]).includesText('SSL Pinning');
    assert.dom(SELECTORS.groupCount, headers[2]).hasText('1');
  });

  test('it shows an empty state when there are no findings', async function (assert) {
    const scan = createScan(this, { findings: [] });
    this.set('scan', pushScan(this, scan));
    await render(TEMPLATE);

    assert
      .dom(SELECTORS.findingsEmpty)
      .hasText(t('offensiveSecurity.noFindings'));
  });

  test('it filters out unassessed findings from the findings list', async function (assert) {
    const scan = createScan(this, {
      findings: [
        {
          id: 1,
          signature_id: 'root-01',
          name: 'Root detection',
          category: 'root_detection',
          outcome: 'bypassed',
          order: 0,
          evidence_ids: [],
        },
        {
          id: 2,
          signature_id: 'usb-01',
          name: 'USB debugging probe',
          category: 'resilience',
          outcome: 'not_attempted',
          order: 1,
          evidence_ids: [],
        },
      ],
    });
    this.set('scan', pushScan(this, scan));
    await render(TEMPLATE);

    assert.dom(SELECTORS.findingsList).exists();
    const headers = findAll(SELECTORS.groupHeader);
    assert.strictEqual(headers.length, 1);
    assert.dom(headers[0]).containsText('Root 01');
    assert.dom(SELECTORS.findingsList).doesNotContainText('Resilience');
  });

  test('it shows an empty state when all findings are unassessed', async function (assert) {
    const scan = createScan(this, {
      findings: [
        {
          id: 1,
          signature_id: 'usb-01',
          name: 'USB debugging probe',
          category: 'resilience',
          outcome: 'not_attempted',
          order: 0,
          evidence_ids: [],
        },
      ],
    });
    this.set('scan', pushScan(this, scan));
    await render(TEMPLATE);

    assert
      .dom(SELECTORS.findingsEmpty)
      .hasText(t('offensiveSecurity.noFindings'));
  });

  test('each defense group shows its checks, count and worst outcome', async function (assert) {
    const scan = createScan(this, {
      findings: [
        {
          id: 1,
          group: 'root_detection',
          signature_id: 'root-su',
          name: 'su binary probe',
          category: 'root_detection',
          outcome: 'resisted',
          detected: true,
          order: 0,
          evidence_ids: [],
        },
        {
          id: 2,
          group: 'root_detection',
          signature_id: 'root-magisk',
          name: 'Magisk artifact probe',
          category: 'root_detection',
          outcome: 'bypassed',
          detected: true,
          order: 1,
          evidence_ids: [],
        },
        {
          id: 3,
          group: 'ssl_pinning',
          signature_id: 'ssl-pin',
          name: 'SSL pinning check',
          category: 'ssl_pinning',
          outcome: 'resisted',
          detected: true,
          order: 2,
          evidence_ids: [],
        },
      ],
    });

    this.set('scan', pushScan(this, scan));
    await render(TEMPLATE);

    const headers = findAll(SELECTORS.groupHeader);

    assert.strictEqual(headers.length, 2);
    assert.dom(SELECTORS.findingsUpdatingLive).doesNotExist();

    assert.dom(SELECTORS.groupTitle, headers[0]).hasText('Root Detection');
    assert
      .dom(SELECTORS.groupSummary, headers[0])
      .hasText('Magisk artifact probe, su binary probe');
    assert.dom(SELECTORS.groupCount, headers[0]).hasText('2');
    assert
      .dom(SELECTORS.groupOutcome, headers[0])
      .hasAttribute(
        'data-test-offensiveSecurity-findingsList-groupOutcome',
        'bypassed'
      )
      .hasText(t('offensiveSecurity.outcome.bypassed'));

    assert.dom(SELECTORS.groupTitle, headers[1]).hasText('SSL Pinning');
    assert.dom(SELECTORS.groupCount, headers[1]).hasText('1');
    assert
      .dom(SELECTORS.groupOutcome, headers[1])
      .hasText(t('offensiveSecurity.outcome.resisted'));
  });

  test('it marks the findings as updating while the run is in progress', async function (assert) {
    const scan = createScan(this, { status: SCAN_STATUS.RUNNING });

    this.set('scan', pushScan(this, scan));
    await render(TEMPLATE);

    assert
      .dom(SELECTORS.findingsUpdatingLive)
      .hasText(t('offensiveSecurity.updatingLive'));
    assert
      .dom(SELECTORS.findingsEmpty)
      .hasText(t('offensiveSecurity.findingsRecording'));
  });

  // ─── Interaction ───────────────────────────────────────────────────────────

  test('clicking a finding transitions to its detail route', async function (assert) {
    const scan = createScan(this, {
      findings: [
        {
          id: 42,
          signature_id: 'root-01',
          name: 'Root detection',
          category: 'root_detection',
          outcome: 'bypassed',
          order: 0,
          evidence_ids: [],
        },
      ],
    });
    this.set('scan', pushScan(this, scan));
    await render(TEMPLATE);

    await click(SELECTORS.groupHeader);

    const router = this.owner.lookup('service:router');

    assert.strictEqual(
      router.lastRoute,
      'authenticated.offensive-security.finding'
    );
    assert.deepEqual(router.lastModels, [String(scan.id), '42']);
  });
});
