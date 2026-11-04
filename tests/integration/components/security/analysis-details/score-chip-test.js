import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

// ─── Selectors ───────────────────────────────────────────────────────────────
const selectors = {
  box: '[data-test-securityAnalysisDetails-scoreChip-box]',
  score: '[data-test-securityAnalysisDetails-scoreChip-score]',
  label: '[data-test-securityAnalysisDetails-scoreChip-label]',
  caption: '[data-test-securityAnalysisDetails-scoreChip-caption]',
  loader: '[data-test-securityAnalysisDetails-scoreChip-loader]',
  invalid: '[data-test-securityAnalysisDetails-scoreChip-invalid]',
  invalidLabel: '[data-test-securityAnalysisDetails-scoreChip-invalidLabel]',
};

// ─── Template ────────────────────────────────────────────────────────────────
const TEMPLATE = hbs`<Security::AnalysisDetails::ScoreChip
  @score={{this.score}}
  @label={{this.label}}
  @caption={{this.caption}}
  @riskClass={{this.riskClass}}
  @isInvalid={{this.isInvalid}}
  @invalidLabel={{this.invalidLabel}}
  @isLoading={{this.isLoading}}
  @testId='aeis'
/>`;

module(
  'Integration | Component | security/analysis-details/score-chip',
  function (hooks) {
    setupRenderingTest(hooks);
    setupIntl(hooks, 'en');

    hooks.beforeEach(function () {
      this.setProperties({
        score: 7.1,
        label: 'High',
        caption: null,
        riskClass: 'is-danger',
        isInvalid: false,
        invalidLabel: null,
        isLoading: false,
      });
    });

    // ─── Rendering ─────────────────────────────────────────────────────────

    test('it renders the score and label', async function (assert) {
      await render(TEMPLATE);

      assert.dom(selectors.score).hasText('7.1');
      assert.dom(selectors.label).hasText('High');
      assert.dom(selectors.caption).doesNotExist();
      assert.dom(selectors.loader).doesNotExist();
    });

    test('it renders a caption when given one', async function (assert) {
      this.set('caption', 'Risk Score');

      await render(TEMPLATE);

      assert.dom(selectors.caption).hasText('Risk Score');
    });

    test('it renders an em dash for an untested score', async function (assert) {
      this.setProperties({ score: '—', label: 'Untested' });

      await render(TEMPLATE);

      assert.dom(selectors.score).hasText('—');
      assert.dom(selectors.label).hasText('Untested');
    });

    // ─── Invalid ───────────────────────────────────────────────────────────

    test('it replaces the score with the invalid state', async function (assert) {
      this.setProperties({ isInvalid: true, invalidLabel: 'Invalid vector' });

      await render(TEMPLATE);

      assert.dom(selectors.invalidLabel).hasText('Invalid vector');
      assert.dom(selectors.score).doesNotExist();
      assert.dom(selectors.label).doesNotExist();
    });

    // ─── Loading ───────────────────────────────────────────────────────────

    test('it shows a loader while saving, keeping the score', async function (assert) {
      this.set('isLoading', true);

      await render(TEMPLATE);

      assert.dom(selectors.loader).exists();
      assert.dom(selectors.score).hasText('7.1');
    });

    test('the loader disappears once saving ends', async function (assert) {
      this.set('isLoading', true);

      await render(TEMPLATE);

      assert.dom(selectors.loader).exists();

      this.set('isLoading', false);

      assert.dom(selectors.loader).doesNotExist();
    });
  }
);
