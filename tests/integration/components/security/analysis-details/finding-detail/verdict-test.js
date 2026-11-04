import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { render, fillIn } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

import styles from 'irene/components/ak-select/index.scss';

const AkSelectClasses = { trigger: styles['ak-select-trigger'] };

// ─── Selectors ───────────────────────────────────────────────────────────────
const selectors = {
  confidence:
    '[data-test-securityAnalysisDetails-validatedFindings-confidenceSelect]',
  sourceType:
    '[data-test-securityAnalysisDetails-validatedFindings-sourceTypeInput]',
  sourceSnippet:
    '[data-test-securityAnalysisDetails-validatedFindings-sourceSnippetInput]',
  summary: '[data-test-securityAnalysisDetails-validatedFindings-summaryInput]',
  evidenceEditor:
    '[data-test-securityAnalysisDetails-validatedFindings-evidenceEditor]',
  reasoningEditor:
    '[data-test-securityAnalysisDetails-validatedFindings-reasoningEditor]',
  listFieldError: (field) =>
    `[data-test-securityAnalysisDetails-validatedFindings-listFieldError='${field}']`,
};

// ─── Template ────────────────────────────────────────────────────────────────
const TEMPLATE = hbs`<Security::AnalysisDetails::ValidatedFindings::FindingDetail::Verdict
  @finding={{this.finding}}
  @disabled={{this.disabled}}
  @invalidListFields={{this.invalidListFields}}
/>`;

module(
  'Integration | Component | security/analysis-details/validated-findings/finding-detail/verdict',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en');

    hooks.beforeEach(function () {
      this.store = this.owner.lookup('service:store');

      this.pushFinding = (attrs = {}) => {
        const record = this.server.create('security/validated-finding', attrs);

        return this.store.push(
          this.store.normalize('security/validated-finding', record.toJSON())
        );
      };

      this.setProperties({ disabled: false, invalidListFields: [] });

      this.finding = this.pushFinding();
    });

    // ─── Rendering ─────────────────────────────────────────────────────────

    test('it shows what the finding holds', async function (assert) {
      await render(TEMPLATE);

      assert.dom(selectors.sourceType).hasValue(this.finding.title);
      assert.dom(selectors.sourceSnippet).hasValue(this.finding.description);
      assert.dom(selectors.summary).hasValue(this.finding.summary);
      assert.dom(selectors.evidenceEditor).exists();
      assert.dom(selectors.reasoningEditor).exists();
    });

    test('the confidence select reads the finding label', async function (assert) {
      this.finding = this.pushFinding({
        validation: {
          verdict: 'valid',
          is_valid: true,
          confidence: 0.9,
          confidence_label: 'HIGH',
          finding_summary: 'A summary',
          evidence: [],
          reasoning: '',
          false_positive_indicators: [],
          is_third_party: false,
          library_origin: null,
        },
      });

      await render(TEMPLATE);

      assert
        .dom(selectors.confidence)
        .containsText(t('securityAnalysisDetails.validatedFindings.scale.3'));
    });

    // ─── Editing ───────────────────────────────────────────────────────────

    test('editing the source is kept on the finding', async function (assert) {
      await render(TEMPLATE);

      await fillIn(selectors.sourceType, 'AndroidManifest.xml');
      await fillIn(selectors.sourceSnippet, '<uses-permission />');

      assert.strictEqual(this.finding.title, 'AndroidManifest.xml');
      assert.strictEqual(this.finding.description, '<uses-permission />');
    });

    test('editing the summary is kept on the finding', async function (assert) {
      await render(TEMPLATE);

      await fillIn(selectors.summary, 'An edited summary');

      assert.strictEqual(this.finding.summary, 'An edited summary');
    });

    // ─── List field errors ─────────────────────────────────────────────────

    test('a list field marked invalid explains itself', async function (assert) {
      this.set('invalidListFields', ['evidence']);

      await render(TEMPLATE);

      assert
        .dom(selectors.listFieldError('evidence'))
        .hasText(t('securityAnalysisDetails.validatedFindings.listFieldError'));
    });

    test('nothing is marked until a save says so', async function (assert) {
      await render(TEMPLATE);

      assert.dom(selectors.listFieldError('evidence')).doesNotExist();
    });

    // ─── Disabled ──────────────────────────────────────────────────────────

    test('the fields are disabled with the editor', async function (assert) {
      this.set('disabled', true);

      await render(TEMPLATE);

      assert.dom(selectors.sourceType).isDisabled();
      assert.dom(selectors.sourceSnippet).isDisabled();
      assert.dom(selectors.summary).isDisabled();

      assert
        .dom(`${selectors.confidence} .${AkSelectClasses.trigger}`)
        .hasAria('disabled', 'true');
    });
  }
);
