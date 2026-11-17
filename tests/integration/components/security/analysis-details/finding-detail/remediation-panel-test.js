import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl } from 'ember-intl/test-support';
import { render, fillIn, findAll } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

// ─── Selectors ───────────────────────────────────────────────────────────────
const selectors = {
  prompt:
    '[data-test-securityAnalysisDetails-validatedFindings-remediationPromptInput]',
  summary:
    '[data-test-securityAnalysisDetails-validatedFindings-remediationSummaryInput]',
  step: '[data-test-securityAnalysisDetails-validatedFindings-step]',
  codeInput: (index) =>
    `[data-test-securityAnalysisDetails-validatedFindings-stepCodeInput='${index}']`,
};

// ─── Template ────────────────────────────────────────────────────────────────
const TEMPLATE = hbs`<Security::AnalysisDetails::ValidatedFindings::FindingDetail::RemediationPanel
  @finding={{this.finding}}
  @panelId='remediation'
  @steps={{this.steps}}
  @onStepsChange={{this.onStepsChange}}
  @disabled={{this.disabled}}
  @isExpanded={{true}}
  @onTogglePanel={{this.noop}}
  @onSavePanel={{this.noop}}
/>`;

module(
  'Integration | Component | security/analysis-details/validated-findings/finding-detail/remediation-panel',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en');

    hooks.beforeEach(function () {
      this.store = this.owner.lookup('service:store');

      const record = this.server.create('security/validated-finding');

      this.finding = this.store.push(
        this.store.normalize('security/validated-finding', record.toJSON())
      );

      this.setProperties({
        disabled: false,
        committed: null,
        onStepsChange: (steps) => this.set('committed', steps),
        noop: () => {},
        steps: [
          { heading: 'Rotate', body: 'Rotate the key', codeExample: '', id: 1 },
        ],
      });
    });

    // ─── Rendering ─────────────────────────────────────────────────────────

    test('it shows the prompt and summary the finding holds', async function (assert) {
      await render(TEMPLATE);

      assert.dom(selectors.prompt).hasValue(this.finding.developerPrompt);
      assert.dom(selectors.summary).hasValue(this.finding.remediationSummary);
    });

    test('it renders the steps it was given', async function (assert) {
      await render(TEMPLATE);

      assert.strictEqual(findAll(selectors.step).length, this.steps.length);
      assert.dom(selectors.codeInput(0)).exists('each step takes an example');
    });

    // ─── Editing ───────────────────────────────────────────────────────────

    test('editing the prompt is kept on the finding', async function (assert) {
      await render(TEMPLATE);

      await fillIn(selectors.prompt, 'Rotate the leaked key');

      assert.strictEqual(this.finding.developerPrompt, 'Rotate the leaked key');
    });

    test('editing the summary is kept on the finding', async function (assert) {
      await render(TEMPLATE);

      await fillIn(selectors.summary, 'Rotate it and redeploy');

      assert.strictEqual(
        this.finding.remediationSummary,
        'Rotate it and redeploy'
      );
    });

    // ─── Disabled ──────────────────────────────────────────────────────────

    test('the fields are disabled with the panel', async function (assert) {
      this.set('disabled', true);

      await render(TEMPLATE);

      assert.dom(selectors.prompt).isDisabled();
      assert.dom(selectors.summary).isDisabled();
    });
  }
);
