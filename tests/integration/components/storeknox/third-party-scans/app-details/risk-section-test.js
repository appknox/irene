import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupMirage } from 'ember-cli-mirage/test-support';

import ENUMS from 'irene/enums';
import { compareInnerHTMLWithIntlTranslation } from 'irene/tests/test-utils';

const RISK_STATUS = ENUMS.SK_THIRD_PARTY_APP_RISK_STATUS;

// ─── Selectors ───────────────────────────────────────────────────────────────
const selectors = {
  score: '[data-test-storeknoxThirdPartyScansAppDetailsRiskSection-score]',
  versionAnalysis:
    '[data-test-storeknoxThirdPartyScansAppDetailsRiskSection-versionAnalysis]',
  unavailable:
    '[data-test-storeknoxThirdPartyScansAppDetailsRiskSection-unavailable]',
  riskSvg: 'svg',
};

// ─── Template ────────────────────────────────────────────────────────────────
const TEMPLATE = hbs`
  <Storeknox::ThirdPartyScans::AppDetails::RiskSection @app={{this.app}} />
`;

// ─── Test suite ──────────────────────────────────────────────────────────────
module(
  'Integration | Component | storeknox/third-party-scans/app-details/risk-section',
  function (hooks) {
    setupRenderingTest(hooks);
    setupIntl(hooks, 'en');
    setupMirage(hooks);

    hooks.beforeEach(function () {
      this.store = this.owner.lookup('service:store');

      this.createApp = (overrides = {}) => {
        const record = this.server.create('sk-third-party-app', {
          score: 85,
          version: '2.3.4',
          risk_status: RISK_STATUS.HIGH,
          ...overrides,
        });

        return this.store.push(
          this.store.normalize('sk-third-party-app', record.toJSON())
        );
      };

      this.set('app', this.createApp());
    });

    // ─── Score present ───────────────────────────────────────────────────────────
    test('it renders the risk score, version analysis and risk svg', async function (assert) {
      assert.expect(4);

      await render(TEMPLATE);

      assert.dom(selectors.score).hasText('85/100');

      compareInnerHTMLWithIntlTranslation(assert, {
        selector: selectors.versionAnalysis,
        message: t('storeknox.basedOnVersionAnalysis', { version: '2.3.4' }),
      });

      assert.dom(selectors.riskSvg).exists();
      assert.dom(selectors.unavailable).doesNotExist();
    });

    test('it renders a zero risk score', async function (assert) {
      this.set('app', this.createApp({ score: 0 }));

      await render(TEMPLATE);

      assert.dom(selectors.score).hasText('0/100');
      assert.dom(selectors.riskSvg).exists();
    });

    // ─── Score absent ────────────────────────────────────────────────────────────
    test('it renders "Unavailable" with no version analysis or risk svg when the score is null', async function (assert) {
      this.set('app', this.createApp({ score: null }));

      await render(TEMPLATE);

      assert
        .dom(selectors.unavailable)
        .hasText(t('storeknox.riskScoreUnavailable'));

      assert.dom(selectors.score).doesNotExist();
      assert.dom(selectors.versionAnalysis).doesNotExist();
      assert.dom(selectors.riskSvg).doesNotExist();
    });
  }
);
