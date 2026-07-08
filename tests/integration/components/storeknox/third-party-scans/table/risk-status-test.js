import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl, t } from 'ember-intl/test-support';

import ENUMS from 'irene/enums';

const RISK_STATUS = ENUMS.SK_THIRD_PARTY_APP_RISK_STATUS;

// ─── Selectors ───────────────────────────────────────────────────────────────
const selectors = {
  chip: '[data-test-storeknoxThirdPartyScansTableRiskStatus-chip]',
};

// ─── Template ────────────────────────────────────────────────────────────────
const TEMPLATE = hbs`
  <Storeknox::ThirdPartyScans::Table::RiskStatus
    @data={{this.data}}
    @loading={{this.loading}}
  />
`;

// ─── Test suite ──────────────────────────────────────────────────────────────
module(
  'Integration | Component | storeknox/third-party-scans/table/risk-status',
  function (hooks) {
    setupRenderingTest(hooks);
    setupIntl(hooks, 'en');

    hooks.beforeEach(function () {
      this.setProperties({
        data: { riskStatus: RISK_STATUS.HIGH },
        loading: false,
      });
    });

    // ─── Chip label per risk status ──────────────────────────────────────────────
    test.each(
      'it renders the chip label for each risk status',
      [
        [RISK_STATUS.MINIMAL, 'storeknox.riskStatus.minimal'],
        [RISK_STATUS.MEDIUM, 'storeknox.riskStatus.medium'],
        [RISK_STATUS.HIGH, 'storeknox.riskStatus.high'],
        [99, 'storeknox.riskStatus.unknown'],
      ],
      async function (assert, [riskStatus, label]) {
        this.set('data', { riskStatus });

        await render(TEMPLATE);

        assert.dom(selectors.chip).hasText(t(label));
      }
    );

    // ─── Loading ─────────────────────────────────────────────────────────────────
    test('it does not render the chip while loading', async function (assert) {
      this.set('loading', true);

      await render(TEMPLATE);

      assert.dom(selectors.chip).doesNotExist();
    });
  }
);
