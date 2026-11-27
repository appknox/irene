import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl, t } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

// ─── Selectors ─────────────────────────────────────────────────────────────────

const selectors = {
  chip: '[data-test-offensiveSecurity-goalView-cvss-chip]',
  notReproduced: '[data-test-offensiveSecurity-goalView-cvss-notReproduced]',
  field: '[data-test-offensiveSecurity-goalView-cvss-field]',
  fieldLabel: '[data-test-offensiveSecurity-goalView-cvss-fieldLabel]',
  score: '[data-test-offensiveSecurity-goalView-cvss-score]',
  because: '[data-test-offensiveSecurity-goalView-cvss-because]',
  vector: '[data-test-offensiveSecurity-goalView-cvss-vector]',
  pocField: '[data-test-offensiveSecurity-goalView-cvss-pocField]',
  pocLabel: '[data-test-offensiveSecurity-goalView-cvss-pocLabel]',
  poc: '[data-test-offensiveSecurity-goalView-cvss-poc]',
};

// ─── Template ──────────────────────────────────────────────────────────────────

const TEMPLATE = hbs`<OffensiveSecurity::ScanResults::GoalVerdictView::Cvss
  @cvss={{this.cvss}}
  @reproduced={{this.reproduced}}
  @pocReason={{this.pocReason}}
  @detail={{this.detail}}
/>`;

// ─── Fixtures ──────────────────────────────────────────────────────────────────

const CVSS = {
  version: '4.0',
  vector: 'CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:H/VI:H/VA:N/SC:H/SI:H/SA:L/E:P',
  score: 9.3,
  rating: 'Critical',
  because: 'a server-side key lets an attacker act as the backend',
};

// ─── Test suite ────────────────────────────────────────────────────────────────

module(
  'Integration | Component | offensive-security/goal-verdict-view/cvss',
  function (hooks) {
    setupRenderingTest(hooks);
    setupIntl(hooks, 'en');

    hooks.beforeEach(function () {
      this.setProperties({
        cvss: CVSS,
        reproduced: undefined,
        pocReason: undefined,
        detail: false,
      });
    });

    // ─── Chips ─────────────────────────────────────────────────────────────────

    test('a scored finding shows its band and score as a chip', async function (assert) {
      await render(TEMPLATE);

      assert.dom(selectors.chip).hasText('Critical 9.3');
      assert.dom(selectors.notReproduced).doesNotExist();
      assert.dom(selectors.field).doesNotExist();
    });

    test('a score without a rating shows the score alone', async function (assert) {
      this.set('cvss', { score: 4.25 });

      await render(TEMPLATE);

      assert.dom(selectors.chip).hasText('4.3');
    });

    test('an unscored finding shows no chip', async function (assert) {
      this.set('cvss', null);

      await render(TEMPLATE);

      assert.dom(selectors.chip).doesNotExist();
    });

    test.each(
      'the not-reproduced chip shows only when a proof of concept failed',
      [
        [false, true],
        [true, false],
        [undefined, false],
      ],
      async function (assert, [reproduced, shown]) {
        this.set('reproduced', reproduced);

        await render(TEMPLATE);

        if (shown) {
          assert
            .dom(selectors.notReproduced)
            .hasText(t('offensiveSecurity.goalView.notReproduced'));
        } else {
          assert.dom(selectors.notReproduced).doesNotExist();
        }
      }
    );

    // ─── Detail ────────────────────────────────────────────────────────────────

    test('the detail shows the score, its reason and the vector', async function (assert) {
      this.setProperties({ detail: true, reproduced: false });

      await render(TEMPLATE);

      assert.dom(selectors.fieldLabel).hasText(t('cvssScore'));
      assert.dom(selectors.score).hasText('Critical 9.3');
      assert.dom(selectors.because).hasText(CVSS.because);
      assert.dom(selectors.vector).hasText(CVSS.vector);
      assert.dom(selectors.chip).doesNotExist();
      assert.dom(selectors.notReproduced).doesNotExist();
    });

    test('the detail leaves out a missing reason', async function (assert) {
      this.setProperties({ detail: true, cvss: { ...CVSS, because: '' } });

      await render(TEMPLATE);

      assert.dom(selectors.score).hasText('Critical 9.3');
      assert.dom(selectors.because).doesNotExist();
    });

    test('the detail shows no score field for an unscored finding', async function (assert) {
      this.setProperties({ detail: true, cvss: undefined });

      await render(TEMPLATE);

      assert.dom(selectors.field).doesNotExist();
    });

    test('the detail shows what the proof of concept saw, when it ran', async function (assert) {
      this.setProperties({
        detail: true,
        pocReason: 'the value reappeared in the output',
      });

      await render(TEMPLATE);

      assert
        .dom(selectors.pocLabel)
        .hasText(t('offensiveSecurity.goalView.proofOfConcept'));
      assert.dom(selectors.poc).hasText('the value reappeared in the output');
    });

    test('the detail shows no proof-of-concept field without a result', async function (assert) {
      this.set('detail', true);

      await render(TEMPLATE);

      assert.dom(selectors.pocField).doesNotExist();
    });
  }
);
