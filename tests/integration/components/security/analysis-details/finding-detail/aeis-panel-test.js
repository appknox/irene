import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { render, findAll } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

import { SECURITY_ANALYSIS_AEIS_SIGNAL_KEYS } from 'irene/utils/security-aeis';
import { UNKNOWN_SCALE_VALUE } from 'irene/utils/knoxiq-validated-findings';
import styles from 'irene/components/ak-select/index.scss';

const AkSelectClasses = { trigger: styles['ak-select-trigger'] };

// ─── Selectors ───────────────────────────────────────────────────────────────
const selectors = {
  score: '[data-test-securityAnalysisDetails-scoreChip-score]',
  scoreLabel: '[data-test-securityAnalysisDetails-scoreChip-label]',
  likelihood:
    '[data-test-securityAnalysisDetails-validatedFindings-likelihoodSelect]',
  signalLabel: (key) =>
    `[data-test-securityAnalysisDetails-validatedFindings-signalLabel='${key}']`,
  signalSelect: (key) =>
    `[data-test-securityAnalysisDetails-validatedFindings-signalSelect='${key}']`,
  allSignalLabels:
    '[data-test-securityAnalysisDetails-validatedFindings-signalLabel]',
};

// ─── Template ────────────────────────────────────────────────────────────────
const TEMPLATE = hbs`<Security::AnalysisDetails::ValidatedFindings::FindingDetail::AeisPanel
  @finding={{this.finding}}
  @panelId='aeis'
  @disabled={{this.disabled}}
  @isExpanded={{true}}
  @onTogglePanel={{this.noop}}
  @onSavePanel={{this.noop}}
/>`;

module(
  'Integration | Component | security/analysis-details/validated-findings/finding-detail/aeis-panel',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en');

    hooks.beforeEach(function () {
      this.store = this.owner.lookup('service:store');

      this.pushFinding = (...traits) => {
        const record = this.server.create(
          'security/validated-finding',
          ...traits
        );

        return this.store.push(
          this.store.normalize('security/validated-finding', record.toJSON())
        );
      };

      this.setProperties({ disabled: false, noop: () => {} });

      this.finding = this.pushFinding({
        exploitability: {
          score: 7.4,
          exploitability_likelihood: 'High',
          signals: { remote_exploitation: true },
          exploitability_analysis: { summary: '', evidence: [] },
          attack_scenario: [],
        },
      });
    });

    // ─── Score ─────────────────────────────────────────────────────────────

    test('it shows the finding score and its likelihood', async function (assert) {
      await render(TEMPLATE);

      assert.dom(selectors.score).hasText('7.4');

      assert
        .dom(selectors.scoreLabel)
        .hasText(t('securityAnalysisDetails.validatedFindings.scale.3'));
    });

    test('an unscored finding reads as unknown', async function (assert) {
      this.finding = this.pushFinding({
        exploitability: {
          score: null,
          exploitability_likelihood: null,
          signals: {},
          exploitability_analysis: { summary: '', evidence: [] },
          attack_scenario: [],
        },
      });

      await render(TEMPLATE);

      assert.dom(selectors.score).hasText('—');

      assert
        .dom(selectors.scoreLabel)
        .hasText(
          t(
            `securityAnalysisDetails.validatedFindings.scale.${UNKNOWN_SCALE_VALUE}`
          )
        );
    });

    // ─── Vectors ───────────────────────────────────────────────────────────

    test('it renders every vector the endpoint validates', async function (assert) {
      await render(TEMPLATE);

      assert.strictEqual(
        findAll(selectors.allSignalLabels).length,
        SECURITY_ANALYSIS_AEIS_SIGNAL_KEYS.length
      );
    });

    test('a vector reads what the finding holds, defaulting to unknown', async function (assert) {
      await render(TEMPLATE);

      assert
        .dom(selectors.signalSelect('remote_exploitation'))
        .containsText(t('securityAnalysisDetails.aeis.signal.true'));

      assert
        .dom(selectors.signalSelect('requires_chaining'))
        .containsText(t('securityAnalysisDetails.aeis.signal.unknown'));
    });

    // ─── Disabled ──────────────────────────────────────────────────────────

    test('the selects are disabled with the panel', async function (assert) {
      this.set('disabled', true);

      await render(TEMPLATE);

      assert
        .dom(`${selectors.likelihood} .${AkSelectClasses.trigger}`)
        .hasAria('disabled', 'true');

      SECURITY_ANALYSIS_AEIS_SIGNAL_KEYS.forEach((key) => {
        assert
          .dom(`${selectors.signalSelect(key)} .${AkSelectClasses.trigger}`)
          .hasAria('disabled', 'true');
      });
    });
  }
);
