import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl, t } from 'ember-intl/test-support';

// ─── Selectors ───────────────────────────────────────────────────────────────
const selectors = {
  score: '[data-test-storeknoxThirdPartyScansTableRiskScore-score]',
  unavailable: '[data-test-storeknoxThirdPartyScansTableRiskScore-unavailable]',
};

// ─── Template ────────────────────────────────────────────────────────────────
const TEMPLATE = hbs`
  <Storeknox::ThirdPartyScans::Table::RiskScore
    @data={{this.data}}
    @loading={{this.loading}}
  />
`;

// ─── Test suite ──────────────────────────────────────────────────────────────
module(
  'Integration | Component | storeknox/third-party-scans/table/risk-score',
  function (hooks) {
    setupRenderingTest(hooks);
    setupIntl(hooks, 'en');

    hooks.beforeEach(function () {
      this.setProperties({ data: { score: 85 }, loading: false });
    });

    // ─── Score present ───────────────────────────────────────────────────────────
    test.each(
      'it renders the score out of 100',
      [85, 0],
      async function (assert, score) {
        this.set('data', { score });

        await render(TEMPLATE);

        assert.dom(selectors.score).hasText(`${score}/100`);
        assert.dom(selectors.unavailable).doesNotExist();
      }
    );

    // ─── Score absent ────────────────────────────────────────────────────────────
    test.each(
      'it renders "Unavailable" when the score is absent',
      [null, undefined],
      async function (assert, score) {
        this.set('data', { score });

        await render(TEMPLATE);

        assert
          .dom(selectors.unavailable)
          .hasText(t('storeknox.riskScoreUnavailable'));

        assert.dom(selectors.score).doesNotExist();
      }
    );

    // ─── Loading ─────────────────────────────────────────────────────────────────
    test('it renders neither score nor unavailable while loading', async function (assert) {
      this.set('loading', true);

      await render(TEMPLATE);

      assert.dom(selectors.score).doesNotExist();
      assert.dom(selectors.unavailable).doesNotExist();
    });
  }
);
