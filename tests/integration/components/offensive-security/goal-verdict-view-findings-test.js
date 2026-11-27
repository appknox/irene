import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl, t } from 'ember-intl/test-support';
import {
  render,
  click,
  find,
  findAll,
  triggerEvent,
} from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

// ─── Selectors ─────────────────────────────────────────────────────────────────

const selectors = {
  root: '[data-test-offensiveSecurity-goalView-findings]',
  label: '[data-test-offensiveSecurity-goalView-findings-label]',
  total: '[data-test-offensiveSecurity-goalView-findings-count]',
  row: '[data-test-offensiveSecurity-goalView-finding]',
  title: '[data-test-offensiveSecurity-goalView-finding-title]',
  audit: '[data-test-offensiveSecurity-goalView-finding-audit]',
  exploitability:
    '[data-test-offensiveSecurity-goalView-finding-exploitability]',
  severity: '[data-test-offensiveSecurity-goalView-finding-severity]',
  count: '[data-test-offensiveSecurity-goalView-finding-count]',
  pager: '[data-test-offensiveSecurity-goalView-finding-pager]',
  pagerLabel:
    '[data-test-offensiveSecurity-goalView-finding-pager] [data-test-offensiveSecurity-goalView-pager-label]',
  pagerPrev:
    '[data-test-offensiveSecurity-goalView-finding-pager] [data-test-offensiveSecurity-goalView-pager-prev]',
  pagerNext:
    '[data-test-offensiveSecurity-goalView-finding-pager] [data-test-offensiveSecurity-goalView-pager-next]',
  secret: '[data-test-offensiveSecurity-goalView-finding-secret]',
  field: (name) =>
    `[data-test-offensiveSecurity-goalView-finding-field="${name}"]`,
  fieldLabel: '[data-test-offensiveSecurity-goalView-finding-fieldLabel]',
  review: '[data-test-offensiveSecurity-goalView-finding-review]',
  auditReason: '[data-test-offensiveSecurity-goalView-finding-auditReason]',
  whyExploitable:
    '[data-test-offensiveSecurity-goalView-finding-whyExploitable]',
  whySevere: '[data-test-offensiveSecurity-goalView-finding-whySevere]',
  place: '[data-test-offensiveSecurity-goalView-finding-place]',
  preRun: '[data-test-offensiveSecurity-goalView-finding-preRun]',
  atLaunch: '[data-test-offensiveSecurity-goalView-finding-atLaunch]',
  observation: '[data-test-offensiveSecurity-goalView-observation]',
  credentials: '[data-test-offensiveSecurity-goalView-credentials]',
};

// ─── Template ──────────────────────────────────────────────────────────────────

const TEMPLATE = hbs`<OffensiveSecurity::ScanResults::GoalVerdictView::Findings
  @findings={{this.findings}}
  @credentials={{this.credentials}}
  @evidence={{this.evidence}}
/>`;

// ─── Fixtures ──────────────────────────────────────────────────────────────────

const FULL_FINDING = {
  id: 'F1',
  kind: 'credential',
  pattern: 'http_basic_auth',
  quote: 'Authorization: Basic YWth',
  value: 'YWth',
  severity: 3,
  exploitability: 'unproven',
  exploitability_because: 'no check has run against the service',
  severity_because: ['it ships in the app', 'it opens an account'],
  review: 'A real service credential shipped in the app.',
  audit: { status: 'valid', reason: 'Genuine key.' },
  places: ['inspect_strings Bestbuy-mApp'],
  pre_run: true,
  at_launch: true,
  observation_id: 7,
};

const assignment = (review, severity) => ({
  kind: 'credential',
  pattern: 'credential_assignment',
  severity,
  review,
});

// ─── Test suite ────────────────────────────────────────────────────────────────

module(
  'Integration | Component | offensive-security/goal-verdict-view/findings',
  function (hooks) {
    setupRenderingTest(hooks);
    setupIntl(hooks, 'en');

    hooks.beforeEach(function () {
      this.setProperties({
        findings: [],
        credentials: undefined,
        evidence: undefined,
      });
    });

    // ─── Fallback ──────────────────────────────────────────────────────────────

    test('without findings it falls back to the credentials block', async function (assert) {
      this.set('credentials', [
        { quote: 'KEY = abc', severity_because: ['it ships in the app'] },
      ]);

      await render(TEMPLATE);

      assert.dom(selectors.root).doesNotExist();
      assert.dom(selectors.credentials).containsText('KEY = abc');
    });

    test('without findings or credentials it renders nothing', async function (assert) {
      await render(TEMPLATE);

      assert.dom(selectors.root).doesNotExist();
      assert.dom(selectors.credentials).doesNotExist();
    });

    // ─── Rows ──────────────────────────────────────────────────────────────────

    test('it groups findings of one kind into one row, the most severe kind first', async function (assert) {
      this.set('findings', [
        assignment('The second key.', 2),
        FULL_FINDING,
        assignment('The first key.', 3),
      ]);

      await render(TEMPLATE);

      assert
        .dom(selectors.label)
        .containsText(t('offensiveSecurity.goalView.findings'));
      assert.dom(selectors.total).hasText('3');

      const rows = findAll(selectors.row);

      assert.strictEqual(rows.length, 2, 'one row per kind');

      assert
        .dom(selectors.title, rows[0])
        .hasText('Http basic auth · Credential');
      assert
        .dom(selectors.title, rows[1])
        .hasText('Credential assignment · Credential');
    });

    test('a finding shows its chips and every field it carries', async function (assert) {
      this.set('findings', [FULL_FINDING]);

      await render(TEMPLATE);

      assert
        .dom(selectors.audit)
        .doesNotExist('every finding shown is verified, so no chip says so');
      assert
        .dom(selectors.exploitability)
        .doesNotExist('the reason stays under why it is exploitable');
      assert
        .dom(selectors.severity)
        .hasText(t('offensiveSecurity.goalView.findingSeverity', { level: 3 }));

      assert.dom(selectors.secret).containsText('Authorization: Basic YWth');

      assert
        .dom(selectors.fieldLabel, find(selectors.field('review')))
        .hasText(t('offensiveSecurity.goalView.findingReview'));
      assert
        .dom(selectors.review)
        .hasText('A real service credential shipped in the app.');

      assert
        .dom(selectors.fieldLabel, find(selectors.field('auditReason')))
        .hasText(t('offensiveSecurity.goalView.auditReason'));
      assert.dom(selectors.auditReason).hasText('Genuine key.');

      assert
        .dom(selectors.fieldLabel, find(selectors.field('whyExploitable')))
        .hasText(t('offensiveSecurity.goalView.whyExploitable'));
      assert
        .dom(selectors.whyExploitable)
        .hasText('no check has run against the service');

      assert
        .dom(selectors.fieldLabel, find(selectors.field('whySevere')))
        .hasText(t('offensiveSecurity.goalView.whySevere'));
      assert
        .dom(selectors.whySevere)
        .hasText('it ships in the app it opens an account');

      assert
        .dom(selectors.fieldLabel, find(selectors.field('place')))
        .hasText(t('offensiveSecurity.goalView.foundAt'));
      assert.dom(selectors.place).hasText('inspect_strings Bestbuy-mApp');

      assert
        .dom(selectors.preRun)
        .hasText(t('offensiveSecurity.goalView.foundBeforeRun'));
      assert
        .dom(selectors.atLaunch)
        .hasText(t('offensiveSecurity.goalView.seenAtLaunch'));

      assert
        .dom(selectors.observation)
        .doesNotExist('raw observation output is not shown');
    });

    test('a finding without the optional fields leaves them out', async function (assert) {
      this.set('findings', [{ kind: 'pii', pattern: 'email_address' }]);

      await render(TEMPLATE);

      assert.dom(selectors.title).hasText('Email address · Pii');
      assert.dom(selectors.audit).doesNotExist();
      assert.dom(selectors.exploitability).doesNotExist();
      assert.dom(selectors.severity).doesNotExist();
      assert.dom(selectors.secret).doesNotExist();
      assert.dom(selectors.review).doesNotExist();
      assert.dom(selectors.auditReason).doesNotExist();
      assert.dom(selectors.whyExploitable).doesNotExist();
      assert.dom(selectors.whySevere).doesNotExist();
      assert.dom(selectors.place).doesNotExist();
      assert.dom(selectors.preRun).doesNotExist();
      assert.dom(selectors.atLaunch).doesNotExist();
      assert.dom(selectors.observation).doesNotExist();
    });

    // ─── Stepping through a kind ───────────────────────────────────────────────

    test('a single finding shows neither a count nor arrows', async function (assert) {
      this.set('findings', [FULL_FINDING]);

      await render(TEMPLATE);

      assert.dom(selectors.count).doesNotExist();
      assert.dom(selectors.pager).doesNotExist();
    });

    test('a collapsed kind shows its count, and arrows once expanded', async function (assert) {
      this.set('findings', [
        assignment('The first key.', 3),
        assignment('The second key.', 2),
      ]);

      await render(TEMPLATE);

      const row = find(selectors.row);

      assert
        .dom(selectors.count)
        .hasText(t('offensiveSecurity.goalView.findingCount', { count: 2 }));
      assert.dom(selectors.pager).doesNotExist();

      row.open = true;
      await triggerEvent(row, 'toggle');

      assert.dom(selectors.count).doesNotExist();
      assert
        .dom(selectors.pagerLabel)
        .hasText(
          t('offensiveSecurity.goalView.pagerOf', { current: 1, total: 2 })
        );

      row.open = false;
      await triggerEvent(row, 'toggle');

      assert
        .dom(selectors.count)
        .hasText(t('offensiveSecurity.goalView.findingCount', { count: 2 }));
      assert.dom(selectors.pager).doesNotExist();
    });

    test('the arrows step through the kind without closing the row', async function (assert) {
      this.set('findings', [
        assignment('The first key.', 3),
        assignment('The second key.', 2),
      ]);

      await render(TEMPLATE);

      const row = find(selectors.row);

      row.open = true;
      await triggerEvent(row, 'toggle');

      assert.dom(selectors.review).hasText('The first key.');
      assert.dom(selectors.pagerPrev).isDisabled();
      assert.dom(selectors.pagerNext).isNotDisabled();

      await click(selectors.pagerNext);

      assert
        .dom(selectors.pagerLabel)
        .hasText(
          t('offensiveSecurity.goalView.pagerOf', { current: 2, total: 2 })
        );
      assert.dom(selectors.review).hasText('The second key.');
      assert.dom(selectors.pagerNext).isDisabled();
      assert.dom(row).hasAttribute('open');

      await click(selectors.pagerPrev);

      assert
        .dom(selectors.pagerLabel)
        .hasText(
          t('offensiveSecurity.goalView.pagerOf', { current: 1, total: 2 })
        );
      assert.dom(selectors.review).hasText('The first key.');
    });

    test('reopening a kind keeps the finding it was on', async function (assert) {
      this.set('findings', [
        assignment('The first key.', 3),
        assignment('The second key.', 2),
      ]);

      await render(TEMPLATE);

      const row = find(selectors.row);

      row.open = true;
      await triggerEvent(row, 'toggle');
      await click(selectors.pagerNext);

      row.open = false;
      await triggerEvent(row, 'toggle');
      row.open = true;
      await triggerEvent(row, 'toggle');

      assert
        .dom(selectors.pagerLabel)
        .hasText(
          t('offensiveSecurity.goalView.pagerOf', { current: 2, total: 2 })
        );
      assert.dom(selectors.review).hasText('The second key.');
    });
  }
);
