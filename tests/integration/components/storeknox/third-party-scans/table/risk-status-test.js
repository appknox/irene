import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl, t } from 'ember-intl/test-support';

import ENUMS from 'irene/enums';

module(
  'Integration | Component | storeknox/third-party-scans/table/risk-status',
  function (hooks) {
    setupRenderingTest(hooks);
    setupIntl(hooks, 'en');

    const RISK_STATUS = ENUMS.SK_THIRD_PARTY_APP_RISK_STATUS;

    const scenarios = [
      {
        riskStatus: RISK_STATUS.MINIMAL,
        label: 'storeknox.riskStatus.minimal',
      },
      { riskStatus: RISK_STATUS.MEDIUM, label: 'storeknox.riskStatus.medium' },
      { riskStatus: RISK_STATUS.HIGH, label: 'storeknox.riskStatus.high' },
      { riskStatus: 99, label: 'storeknox.riskStatus.unknown' },
    ];

    scenarios.forEach(({ riskStatus, label }) => {
      test(`it renders the "${label}" chip for risk status ${riskStatus}`, async function (assert) {
        this.data = { riskStatus };

        await render(hbs`
          <Storeknox::ThirdPartyScans::Table::RiskStatus @data={{this.data}} />
        `);

        assert
          .dom('[data-test-storeknoxThirdPartyScansTableRiskStatus-chip]')
          .hasText(t(label));
      });
    });

    test('it renders a skeleton when loading', async function (assert) {
      this.data = { riskStatus: RISK_STATUS.HIGH };

      await render(hbs`
        <Storeknox::ThirdPartyScans::Table::RiskStatus
          @data={{this.data}}
          @loading={{true}}
        />
      `);

      assert
        .dom('[data-test-storeknoxThirdPartyScansTableRiskStatus-chip]')
        .doesNotExist();
    });
  }
);
