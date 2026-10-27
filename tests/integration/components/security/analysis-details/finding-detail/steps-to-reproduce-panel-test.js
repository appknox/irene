import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { render, findAll } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

// ─── Selectors ───────────────────────────────────────────────────────────────
const selectors = {
  step: '[data-test-securityAnalysisDetails-validatedFindings-step]',
  codeInput: (index) =>
    `[data-test-securityAnalysisDetails-validatedFindings-stepCodeInput='${index}']`,
  expectedEvidenceEditor:
    '[data-test-securityAnalysisDetails-validatedFindings-expectedEvidenceEditor]',
  listFieldError: (field) =>
    `[data-test-securityAnalysisDetails-validatedFindings-listFieldError='${field}']`,
};

// ─── Template ────────────────────────────────────────────────────────────────
const TEMPLATE = hbs`<Security::AnalysisDetails::ValidatedFindings::FindingDetail::StepsToReproducePanel
  @finding={{this.finding}}
  @panelId='steps-to-reproduce'
  @steps={{this.steps}}
  @onStepsChange={{this.onStepsChange}}
  @disabled={{this.disabled}}
  @invalidListFields={{this.invalidListFields}}
  @isExpanded={{true}}
  @onTogglePanel={{this.noop}}
  @onSavePanel={{this.noop}}
/>`;

module(
  'Integration | Component | security/analysis-details/validated-findings/finding-detail/steps-to-reproduce-panel',
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
        invalidListFields: [],
        committed: null,
        onStepsChange: (steps) => this.set('committed', steps),
        noop: () => {},
        steps: [
          { heading: 'Unzip', body: 'APK extracted', command: 'unzip', id: 1 },
        ],
      });
    });

    // ─── Rendering ─────────────────────────────────────────────────────────

    test('it renders the steps it was given', async function (assert) {
      await render(TEMPLATE);

      assert.strictEqual(findAll(selectors.step).length, this.steps.length);
    });

    test('a step carries the command the API stores', async function (assert) {
      await render(TEMPLATE);

      assert.dom(selectors.codeInput(0)).hasValue('unzip');
    });

    test('it renders the expected evidence editor', async function (assert) {
      await render(TEMPLATE);

      assert.dom(selectors.expectedEvidenceEditor).exists();
    });

    // ─── List field errors ─────────────────────────────────────────────────

    test('the expected evidence explains an invalid list', async function (assert) {
      this.set('invalidListFields', ['expectedEvidence']);

      await render(TEMPLATE);

      assert
        .dom(selectors.listFieldError('expectedEvidence'))
        .hasText(t('securityAnalysisDetails.validatedFindings.listFieldError'));
    });

    test('nothing is marked until a save says so', async function (assert) {
      await render(TEMPLATE);

      assert.dom(selectors.listFieldError('expectedEvidence')).doesNotExist();
    });
  }
);
