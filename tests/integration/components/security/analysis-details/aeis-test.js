import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import {
  render,
  click,
  fillIn,
  findAll,
  settled,
  waitUntil,
} from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import Service from '@ember/service';
import { selectChoose } from 'ember-power-select/test-support';

import {
  SECURITY_ANALYSIS_AEIS_PASSED_OVERRIDE as PASSED_OVERRIDE,
  SECURITY_ANALYSIS_AEIS_SIGNAL_KEYS,
  SECURITY_ANALYSIS_AEIS_SIGNAL_VALUES as SIGNAL_VALUES,
} from 'irene/utils/security-aeis';
import { SECURITY_ANALYSIS_AEIS_SCORE_MAX as SCORE_MAX } from 'irene/components/security/analysis-details/aeis';

class NotificationsStub extends Service {
  errorMsg = null;
  successMsg = null;

  error(msg) {
    this.errorMsg = msg;
  }

  success(msg) {
    this.successMsg = msg;
  }

  setDefaultAutoClear() {} // NOSONAR
}

// ─── Selectors ───────────────────────────────────────────────────────────────
const selectors = {
  score: '[data-test-securityAnalysisDetails-scoreChip-score]',
  scoreLabel: '[data-test-securityAnalysisDetails-scoreChip-label]',
  loader: '[data-test-securityAnalysisDetails-scoreChip-loader]',
  noScore: '[data-test-securityAnalysisDetails-aeis-noScore]',
  stepper: '[data-test-securityAnalysisDetails-aeis-scoreStepper]',
  scoreInput: '[data-test-securityAnalysisDetails-aeis-scoreInput]',
  decrement: '[data-test-securityAnalysisDetails-aeis-scoreDecrementBtn]',
  increment: '[data-test-securityAnalysisDetails-aeis-scoreIncrementBtn]',
  likelihood: '[data-test-securityAnalysisDetails-aeis-likelihoodSelect]',
  resetBtn: '[data-test-securityAnalysisDetails-aeis-resetBtn]',
  signalLabel: (key) =>
    `[data-test-securityAnalysisDetails-aeis-signalLabel='${key}']`,
  signalSelect: (key) =>
    `[data-test-securityAnalysisDetails-aeis-signalSelect='${key}']`,
  allSignalLabels: '[data-test-securityAnalysisDetails-aeis-signalLabel]',
};

// ─── Template ────────────────────────────────────────────────────────────────
const TEMPLATE = hbs`<Security::AnalysisDetails::Aeis
  @analysis={{this.analysis}}
/>`;

module(
  'Integration | Component | security/analysis-details/aeis',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en');

    hooks.beforeEach(function () {
      this.owner.register('service:notifications', NotificationsStub);

      this.store = this.owner.lookup('service:store');
      this.notify = this.owner.lookup('service:notifications');

      // The component reloads the record after a write, so the override has
      // to persist for the reloaded value to be what was sent.
      this.stubOverrideWrite = () => {
        this.server.put('/v2/analyses/:id/aeis-override', (schema, req) => {
          this.payload = JSON.parse(req.requestBody);

          const analysis = schema['security/analyses'].find(req.params.id);

          analysis.update({
            exploitability_score: this.payload.score,
            exploitability: {
              ...analysis.exploitability,
              score: this.payload.score,
              exploitability_likelihood: this.payload.likelihood,
              signals: this.payload.signals,
            },
          });

          return analysis.toJSON();
        });
      };

      this.pushAnalysis = (attrs = {}) => {
        const record = this.server.create('security/analysis', attrs);

        return this.store.push(
          this.store.normalize('security/analysis', record.toJSON())
        );
      };

      this.analysis = this.pushAnalysis({
        exploitability_score: 7.1,
        exploitability: {
          score: 7.1,
          exploitability_likelihood: 'high',
          signals: {},
        },
      });

      this.score = this.analysis.exploitabilityScore;
      this.likelihood = this.analysis.exploitability.exploitability_likelihood;
      this.scoreStep = 0.1;
    });

    // ─── Rendering ─────────────────────────────────────────────────────────

    test('it renders the score and likelihood', async function (assert) {
      await render(TEMPLATE);

      assert.dom(selectors.score).hasText(this.score.toFixed(1));

      assert
        .dom(selectors.scoreLabel)
        .hasText(
          t(`securityAnalysisDetails.aeis.likelihood.${this.likelihood}`)
        );

      assert.dom(selectors.noScore).doesNotExist();
    });

    test('it renders every vector the endpoint validates', async function (assert) {
      await render(TEMPLATE);

      assert.strictEqual(
        findAll(selectors.allSignalLabels).length,
        SECURITY_ANALYSIS_AEIS_SIGNAL_KEYS.length
      );

      SECURITY_ANALYSIS_AEIS_SIGNAL_KEYS.forEach((key) => {
        assert.dom(selectors.signalSelect(key)).exists();
      });
    });

    test('it renders a vector the backend did not send', async function (assert) {
      await render(TEMPLATE);

      assert
        .dom(selectors.signalLabel('obscure_or_environment_specific'))
        .hasText('Obscure Or Environment Specific');
    });

    test('it shows the untested state when there is no score', async function (assert) {
      this.analysis = this.pushAnalysis({
        exploitability_score: null,
        exploitability: { score: null, exploitability_likelihood: null },
      });

      await render(TEMPLATE);

      assert.dom(selectors.score).hasText('—');

      assert
        .dom(selectors.scoreLabel)
        .hasText(t('securityAnalysisDetails.aeis.untested'));

      assert
        .dom(selectors.noScore)
        .hasText(t('securityAnalysisDetails.aeis.noScoreYet'));
    });

    // ─── Passed ────────────────────────────────────────────────────────────

    test('the canonical passed override reads as passed', async function (assert) {
      this.analysis = this.pushAnalysis({
        exploitability_score: PASSED_OVERRIDE.score,
        exploitability: {
          score: PASSED_OVERRIDE.score,
          exploitability_likelihood: PASSED_OVERRIDE.likelihood,
          signals: { ...PASSED_OVERRIDE.signals },
        },
      });

      await render(TEMPLATE);

      assert.dom(selectors.scoreLabel).hasText(t('passed'));
      assert.dom(selectors.score).hasText(PASSED_OVERRIDE.score.toFixed(1));
      assert.dom(selectors.noScore).doesNotExist();
    });

    test('a score of zero without the passed vectors does not read as passed', async function (assert) {
      this.analysis = this.pushAnalysis({
        exploitability_score: PASSED_OVERRIDE.score,
        exploitability: {
          score: PASSED_OVERRIDE.score,
          exploitability_likelihood: PASSED_OVERRIDE.likelihood,
          signals: {},
        },
      });

      await render(TEMPLATE);

      assert
        .dom(selectors.scoreLabel)
        .hasText(
          t(
            `securityAnalysisDetails.aeis.likelihood.${PASSED_OVERRIDE.likelihood}`
          )
        );
    });

    // ─── Stepper ───────────────────────────────────────────────────────────

    test('stepping up raises the score and writes the override', async function (assert) {
      this.stubOverrideWrite();

      await render(TEMPLATE);

      const scoreAfterIncrement = Number(
        (this.score + this.scoreStep).toFixed(1)
      );

      assert.dom(selectors.score).hasText(this.score.toFixed(1));

      await click(selectors.increment);

      assert
        .dom(selectors.score)
        .hasText(scoreAfterIncrement.toFixed(1), 'the tile tracks the tap');

      await waitUntil(() => this.payload, { timeout: 2000 });

      assert.strictEqual(this.payload.score, scoreAfterIncrement);
      assert.strictEqual(this.payload.likelihood, this.likelihood);

      assert.strictEqual(
        Object.keys(this.payload.signals).length,
        SECURITY_ANALYSIS_AEIS_SIGNAL_KEYS.length,
        'every vector is sent'
      );

      await settled();

      assert
        .dom(selectors.score)
        .hasText(
          scoreAfterIncrement.toFixed(1),
          'the saved score survives the reload'
        );
    });

    test('stepping down lowers the score', async function (assert) {
      this.stubOverrideWrite();

      const scoreAfterDecrement = Number(
        (this.score - this.scoreStep).toFixed(1)
      );

      await render(TEMPLATE);
      await click(selectors.decrement);

      assert
        .dom(selectors.score)
        .hasText(scoreAfterDecrement.toFixed(1), 'the tile tracks the tap');

      await waitUntil(() => this.payload, { timeout: 2000 });

      assert.strictEqual(this.payload.score, scoreAfterDecrement);

      await settled();

      assert
        .dom(selectors.score)
        .hasText(
          scoreAfterDecrement.toFixed(1),
          'the saved score survives the reload'
        );
    });

    test('typing a score writes it', async function (assert) {
      this.stubOverrideWrite();

      await render(TEMPLATE);
      await fillIn(selectors.scoreInput, '4.5');
      await waitUntil(() => this.payload, { timeout: 2000 });

      assert.strictEqual(this.payload.score, 4.5);
    });

    test('a typed score above the maximum is clamped', async function (assert) {
      this.stubOverrideWrite();

      await render(TEMPLATE);
      await fillIn(selectors.scoreInput, String(SCORE_MAX + 89));
      await waitUntil(() => this.payload, { timeout: 2000 });

      assert.strictEqual(this.payload.score, SCORE_MAX);
      assert
        .dom(selectors.score)
        .hasText(SCORE_MAX.toFixed(1), 'the clamped score is shown');
    });

    test('the stepper stops at the range bounds', async function (assert) {
      this.analysis = this.pushAnalysis({
        exploitability_score: SCORE_MAX,
        exploitability: {
          score: SCORE_MAX,
          exploitability_likelihood: 'high',
        },
      });

      await render(TEMPLATE);

      assert.dom(selectors.increment).isDisabled();
      assert.dom(selectors.decrement).isNotDisabled();
    });

    // ─── Likelihood and vectors ────────────────────────────────────────────

    test('choosing a likelihood writes it and shows it', async function (assert) {
      this.stubOverrideWrite();

      await render(TEMPLATE);

      assert
        .dom(selectors.scoreLabel)
        .hasText(
          t(`securityAnalysisDetails.aeis.likelihood.${this.likelihood}`)
        );

      await selectChoose(
        selectors.likelihood,
        t('securityAnalysisDetails.aeis.likelihood.critical')
      );

      await waitUntil(() => this.payload, { timeout: 2000 });

      assert
        .dom(selectors.scoreLabel)
        .hasText(t('securityAnalysisDetails.aeis.likelihood.critical'));

      assert.strictEqual(this.payload.likelihood, 'critical');
    });

    test.each(
      'choosing a value for a vector writes it and shows it',
      // Every vector starts unknown in the fixture, and re-selecting the
      // current option fires no change, so each key is tried at the two
      // values it does not already hold.
      SECURITY_ANALYSIS_AEIS_SIGNAL_KEYS.flatMap((key) =>
        SIGNAL_VALUES.filter((value) => value !== 'unknown').map((value) => [
          key,
          value,
        ])
      ),
      async function (assert, [key, value]) {
        this.stubOverrideWrite();

        await render(TEMPLATE);

        await selectChoose(
          selectors.signalSelect(key),
          t(`securityAnalysisDetails.aeis.signal.${value}`)
        );

        await waitUntil(() => this.payload, { timeout: 2000 });

        assert.strictEqual(
          this.payload.signals[key],
          value,
          `${key} is written as ${value}`
        );

        assert
          .dom(selectors.signalSelect(key))
          .hasText(t(`securityAnalysisDetails.aeis.signal.${value}`));
      }
    );

    test('choosing a vector leaves the others as they were', async function (assert) {
      this.stubOverrideWrite();

      await render(TEMPLATE);
      await selectChoose(
        selectors.signalSelect('requires_chaining'),
        t('securityAnalysisDetails.aeis.signal.true')
      );

      await waitUntil(() => this.payload, { timeout: 2000 });

      assert.strictEqual(
        this.payload.signals.remote_exploitation,
        'unknown',
        'fills a vector the backend never sent'
      );

      assert.strictEqual(
        Object.keys(this.payload.signals).length,
        SECURITY_ANALYSIS_AEIS_SIGNAL_KEYS.length,
        'every vector is sent'
      );
    });

    test('a vector the backend already set survives another edit', async function (assert) {
      this.analysis = this.pushAnalysis({
        exploitability_score: 7.1,
        exploitability: {
          score: 7.1,
          exploitability_likelihood: 'high',
          signals: { remote_exploitation: true },
        },
      });

      this.stubOverrideWrite();

      await render(TEMPLATE);
      await selectChoose(
        selectors.signalSelect('requires_chaining'),
        t('securityAnalysisDetails.aeis.signal.true')
      );

      await waitUntil(() => this.payload, { timeout: 2000 });

      assert.true(this.payload.signals.remote_exploitation);
    });

    test('an edit without a likelihood is refused', async function (assert) {
      this.analysis = this.pushAnalysis({
        exploitability_score: this.score,
        exploitability: {
          score: this.score,
          exploitability_likelihood: 'Unknown',
          signals: {},
        },
      });

      await render(TEMPLATE);
      await click(selectors.increment);
      await waitUntil(() => this.notify.errorMsg, { timeout: 2000 });

      assert.strictEqual(
        this.notify.errorMsg,
        t('securityAnalysisDetails.aeis.likelihoodRequired')
      );
    });

    // ─── Reset ─────────────────────────────────────────────────────────────

    test('reset clears the override', async function (assert) {
      this.server.delete('/v2/analyses/:id/aeis-override', () => {
        this.deleted = true;

        return {};
      });

      await render(TEMPLATE);

      assert
        .dom(selectors.resetBtn)
        .hasText(t('securityAnalysisDetails.aeis.reset'));

      await click(selectors.resetBtn);

      assert.true(this.deleted);

      assert.strictEqual(
        this.notify.successMsg,
        t('securityAnalysisDetails.aeis.saved')
      );
    });

    test('a failed write surfaces an error', async function (assert) {
      this.server.delete(
        '/v2/analyses/:id/aeis-override',
        () => ({
          detail: 'KnoxIQ is not enabled for this organization.',
        }),
        403
      );

      await render(TEMPLATE);
      await click(selectors.resetBtn);
      await waitUntil(() => this.notify.errorMsg, { timeout: 2000 });

      assert.strictEqual(
        this.notify.errorMsg,
        'KnoxIQ is not enabled for this organization.'
      );
    });
  }
);
