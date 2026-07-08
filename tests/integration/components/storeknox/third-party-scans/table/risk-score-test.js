import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl, t } from 'ember-intl/test-support';

module(
  'Integration | Component | storeknox/third-party-scans/table/risk-score',
  function (hooks) {
    setupRenderingTest(hooks);
    setupIntl(hooks, 'en');

    test('it renders the score out of 100', async function (assert) {
      this.data = { score: 85 };

      await render(hbs`
        <Storeknox::ThirdPartyScans::Table::RiskScore @data={{this.data}} />
      `);

      assert
        .dom('[data-test-storeknoxThirdPartyScansTableRiskScore-score]')
        .hasText('85/100');
    });

    test('it renders "Unavailable" when the score is null', async function (assert) {
      this.data = { score: null };

      await render(hbs`
        <Storeknox::ThirdPartyScans::Table::RiskScore @data={{this.data}} />
      `);

      assert
        .dom('[data-test-storeknoxThirdPartyScansTableRiskScore-score]')
        .doesNotExist();

      assert
        .dom('[data-test-storeknoxThirdPartyScansTableRiskScore-unavailable]')
        .hasText(t('storeknox.riskScoreUnavailable'));
    });

    test('it renders the score when it is zero', async function (assert) {
      this.data = { score: 0 };

      await render(hbs`
        <Storeknox::ThirdPartyScans::Table::RiskScore @data={{this.data}} />
      `);

      assert
        .dom('[data-test-storeknoxThirdPartyScansTableRiskScore-score]')
        .hasText('0/100');
    });

    test('it renders a skeleton when loading', async function (assert) {
      this.data = { score: 85 };

      await render(hbs`
        <Storeknox::ThirdPartyScans::Table::RiskScore
          @data={{this.data}}
          @loading={{true}}
        />
      `);

      assert
        .dom('[data-test-storeknoxThirdPartyScansTableRiskScore-score]')
        .doesNotExist();
    });
  }
);
