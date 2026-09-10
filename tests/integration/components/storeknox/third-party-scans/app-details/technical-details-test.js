import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, findAll, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupMirage } from 'ember-cli-mirage/test-support';

const FINDINGS = [
  {
    rule_id: 'rule-2',
    name: 'Cleartext Traffic',
    description: 'App allows cleartext traffic.',
    severity: 'medium',
    status: 'clean',
    category: 'sensitive_capabilities',
    details: [],
    checks: 'Checks for cleartext traffic configuration.',
    business_impact: 'Would allow traffic interception.',
    is_potential_risk: false,
  },
  {
    rule_id: 'rule-1',
    name: 'Insecure Storage',
    description: 'Sensitive data stored insecurely.',
    severity: 'high',
    status: 'triggered',
    category: 'sensitive_capabilities',
    details: ['Detail one', 'Detail two'],
    checks: 'Checks for the READ_CALL_LOG permission.',
    business_impact: 'May expose who was called and when.',
    is_potential_risk: true,
  },
  {
    rule_id: 'rule-3',
    name: 'Debug Flag',
    description: 'Debuggable flag check skipped.',
    severity: 'info',
    status: 'skipped',
    category: 'app_hardening',
    details: [],
    checks: '',
    business_impact: '',
    is_potential_risk: false,
  },
];

// ─── Selectors ───────────────────────────────────────────────────────────────
const P = 'data-test-storeknoxThirdPartyScansAppDetailsTechnicalDetails';

const selectors = {
  title: `[${P}-title]`,
  description: `[${P}-description]`,
  riskCountChip: `[${P}-riskCountChip]`,
  categoryHeading: `[${P}-categoryHeading]`,
  categoryInfoIcon: `[${P}-categoryInfoIcon]`,
  riskChip: `[${P}-riskChip]`,
  findingChecks: `[${P}-findingChecks]`,
  findingBusinessImpact: `[${P}-findingBusinessImpact]`,
  findingDescription: `[${P}-findingDescription]`,
  findingSummary: (ruleId) => `[${P}-findingSummary="${ruleId}"]`,
};

// ─── Template ────────────────────────────────────────────────────────────────
const TEMPLATE = hbs`
  <Storeknox::ThirdPartyScans::AppDetails::TechnicalDetails @app={{this.app}} />
`;

// ─── Test suite ──────────────────────────────────────────────────────────────
module(
  'Integration | Component | storeknox/third-party-scans/app-details/technical-details',
  function (hooks) {
    setupRenderingTest(hooks);
    setupIntl(hooks, 'en');
    setupMirage(hooks);

    hooks.beforeEach(function () {
      const store = this.owner.lookup('service:store');

      const record = this.server.create('sk-third-party-app', {
        findings: FINDINGS,
      });

      this.app = store.push(
        store.normalize('sk-third-party-app', record.toJSON())
      );
    });

    // ─── Header ──────────────────────────────────────────────────────────────────
    test('it renders the title, description and risk count chips', async function (assert) {
      await render(TEMPLATE);

      assert.dom(selectors.title).hasText(t('storeknox.technicalDetails'));

      assert
        .dom(selectors.description)
        .hasText(t('storeknox.technicalDetailsDescription'));

      const chips = findAll(selectors.riskCountChip);

      assert.strictEqual(chips.length, 2);
      assert
        .dom(chips[0])
        .hasText(`${t('storeknox.thirdPartyFinding.potentialRisks')} 1`);
      assert
        .dom(chips[1])
        .hasText(`${t('storeknox.thirdPartyFinding.noRisksDetected')} 2`);
    });

    // ─── Category grouping ───────────────────────────────────────────────────────
    test('it groups findings by category with potential risk counts', async function (assert) {
      await render(TEMPLATE);

      const headings = findAll(selectors.categoryHeading);

      assert.strictEqual(headings.length, 2);

      assert.dom(headings[0]).containsText('Sensitive Capabilities');
      assert.dom(headings[0]).containsText('1 potential risk');

      assert.dom(headings[1]).containsText('App Hardening');
      assert.dom(headings[1]).containsText('0 potential risks');
    });

    test('it shows the info tooltip icon only for categories with a description', async function (assert) {
      await render(TEMPLATE);

      assert.dom(selectors.categoryInfoIcon).exists({ count: 1 });
    });

    // ─── Finding rows ────────────────────────────────────────────────────────────
    test('it renders a risk chip per finding, sorted by severity high to low within a category', async function (assert) {
      await render(TEMPLATE);

      const chips = findAll(selectors.riskChip);

      assert.strictEqual(chips.length, 3);

      assert
        .dom(chips[0])
        .hasText(t('storeknox.thirdPartyFinding.potentialRisk'));
      assert
        .dom(chips[1])
        .hasText(t('storeknox.thirdPartyFinding.noRiskDetected'));
      assert
        .dom(chips[2])
        .hasText(t('storeknox.thirdPartyFinding.noRiskDetected'));
    });

    test('it renders the finding names with category groups expanded by default', async function (assert) {
      await render(TEMPLATE);

      assert
        .dom(selectors.findingSummary('rule-1'))
        .containsText('Insecure Storage');
      assert
        .dom(selectors.findingSummary('rule-2'))
        .containsText('Cleartext Traffic');
      assert.dom(selectors.findingSummary('rule-3')).containsText('Debug Flag');
    });

    // ─── Finding details ─────────────────────────────────────────────────────────
    test('it reveals checks, findings and business impact for a potential-risk finding', async function (assert) {
      await render(TEMPLATE);

      assert.dom(selectors.findingChecks).doesNotExist();

      await click(selectors.findingSummary('rule-1'));

      assert
        .dom(selectors.findingChecks)
        .hasText('Checks for the READ_CALL_LOG permission.');

      assert
        .dom(selectors.findingBusinessImpact)
        .hasText('May expose who was called and when.');

      assert.dom(selectors.findingDescription).doesNotExist();

      assert.dom(this.element).containsText('Detail one');
      assert.dom(this.element).containsText('Detail two');
      assert
        .dom(this.element)
        .containsText(t('storeknox.thirdPartyFinding.whatItChecks'));
      assert
        .dom(this.element)
        .containsText(t('storeknox.thirdPartyFinding.findings'));
      assert
        .dom(this.element)
        .containsText(t('storeknox.thirdPartyFinding.potentialBusinessImpact'));
    });

    test('it shows the description instead of business impact for a no-risk finding', async function (assert) {
      await render(TEMPLATE);

      await click(selectors.findingSummary('rule-2'));

      assert
        .dom(selectors.findingChecks)
        .hasText('Checks for cleartext traffic configuration.');

      assert
        .dom(selectors.findingDescription)
        .hasText('App allows cleartext traffic.');

      assert.dom(selectors.findingBusinessImpact).doesNotExist();
      assert.dom(this.element).containsText(t('description'));
    });
  }
);
