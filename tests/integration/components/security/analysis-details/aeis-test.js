import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { render, findAll, triggerEvent } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import Service from '@ember/service';

import { SECURITY_ANALYSIS_AEIS_SIGNAL_KEYS } from 'irene/utils/security-aeis';
import styles from 'irene/components/ak-select/index.scss';

const AkSelectClasses = { trigger: styles['ak-select-trigger'] };

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

    // ─── Read-only ─────────────────────────────────────────────────────────

    test('the score cannot be edited from the analysis card', async function (assert) {
      // The analysis score is the highest of its validated findings, so it is
      // edited per finding rather than here.
      await render(TEMPLATE);

      assert.dom(selectors.stepper).doesNotExist();
      assert.dom(selectors.scoreInput).doesNotExist();
      assert.dom(selectors.increment).doesNotExist();
      assert.dom(selectors.decrement).doesNotExist();
    });

    test('the likelihood and vector selects are disabled', async function (assert) {
      await render(TEMPLATE);

      assert.dom(selectors.likelihood).exists();

      assert
        .dom(`${selectors.likelihood} .${AkSelectClasses.trigger}`)
        .hasAria('disabled', 'true');

      SECURITY_ANALYSIS_AEIS_SIGNAL_KEYS.forEach((key) => {
        assert
          .dom(`${selectors.signalSelect(key)} .${AkSelectClasses.trigger}`)
          .hasAria('disabled', 'true');
      });
    });

    test('the read-only fields explain why they cannot be edited', async function (assert) {
      await render(TEMPLATE);

      const reason = t('securityAnalysisDetails.aeis.readOnlyReason');

      // The score chip, the likelihood and every vector carry the reason, so
      // it shows wherever someone tries to edit.
      const tooltipped = findAll('[data-test-ak-tooltip-root]');

      assert.strictEqual(
        tooltipped.length,
        SECURITY_ANALYSIS_AEIS_SIGNAL_KEYS.length + 2
      );

      await triggerEvent(selectors.likelihood, 'mouseenter');

      assert.dom('[data-test-ak-tooltip-content]').hasText(reason);
    });

    test('there is no reset action', async function (assert) {
      await render(TEMPLATE);

      assert.dom(selectors.resetBtn).doesNotExist();
    });

    test('it renders the vector values the backend sent', async function (assert) {
      this.analysis = this.pushAnalysis({
        exploitability_score: 7.1,
        exploitability: {
          score: 7.1,
          exploitability_likelihood: 'high',
          signals: { remote_exploitation: true },
        },
      });

      await render(TEMPLATE);

      assert
        .dom(selectors.signalSelect('remote_exploitation'))
        .containsText(t('securityAnalysisDetails.aeis.signal.true'));

      // A vector the backend omitted reads as unknown rather than blank.
      assert
        .dom(selectors.signalSelect('requires_chaining'))
        .containsText(t('securityAnalysisDetails.aeis.signal.unknown'));
    });
  }
);
