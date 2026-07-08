import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupMirage } from 'ember-cli-mirage/test-support';

import ENUMS from 'irene/enums';

module(
  'Integration | Component | storeknox/third-party-scans/app-details/risk-section',
  function (hooks) {
    setupRenderingTest(hooks);
    setupIntl(hooks, 'en');
    setupMirage(hooks);

    hooks.beforeEach(function () {
      const store = this.owner.lookup('service:store');

      const skApp = this.server.create('sk-third-party-app', {
        score: 85,
        version: '2.3.4',
        risk_status: ENUMS.SK_THIRD_PARTY_APP_RISK_STATUS.HIGH,
      });

      this.app = store.push(
        store.normalize('sk-third-party-app', skApp.toJSON())
      );
    });

    test('it renders the risk score out of 100', async function (assert) {
      await render(hbs`
        <Storeknox::ThirdPartyScans::AppDetails::RiskSection
          @app={{this.app}}
        />
      `);

      assert
        .dom('[data-test-storeknoxThirdPartyScansAppDetailsRiskSection-score]')
        .hasText('85/100');
    });

    test('it renders the version analysis text with a bold version', async function (assert) {
      await render(hbs`
        <Storeknox::ThirdPartyScans::AppDetails::RiskSection
          @app={{this.app}}
        />
      `);

      const versionAnalysis = this.element.querySelector(
        '[data-test-storeknoxThirdPartyScansAppDetailsRiskSection-versionAnalysis]'
      );

      assert.dom(versionAnalysis).hasText('Based on v2.3.4 analysis');
      assert.dom(versionAnalysis.querySelector('strong')).hasText('v2.3.4');
    });

    test('it renders "Unavailable" with no risk svg when the score is null', async function (assert) {
      const store = this.owner.lookup('service:store');

      const skApp = this.server.create('sk-third-party-app', {
        score: null,
        version: '2.3.4',
        risk_status: ENUMS.SK_THIRD_PARTY_APP_RISK_STATUS.MINIMAL,
      });

      this.app = store.push(
        store.normalize('sk-third-party-app', skApp.toJSON())
      );

      await render(hbs`
        <Storeknox::ThirdPartyScans::AppDetails::RiskSection
          @app={{this.app}}
        />
      `);

      assert
        .dom('[data-test-storeknoxThirdPartyScansAppDetailsRiskSection-score]')
        .doesNotExist();

      assert
        .dom(
          '[data-test-storeknoxThirdPartyScansAppDetailsRiskSection-unavailable]'
        )
        .hasText(t('storeknox.riskScoreUnavailable'));

      assert.dom('svg').doesNotExist();
    });
  }
);
