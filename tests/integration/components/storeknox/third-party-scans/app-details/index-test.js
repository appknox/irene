import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupMirage } from 'ember-cli-mirage/test-support';

// ─── Selectors ───────────────────────────────────────────────────────────────
const selectors = {
  technicalDetails:
    '[data-test-storeknoxThirdPartyScansAppDetails-technicalDetails]',
  errorState: '[data-test-storeknoxThirdPartyScansAppDetails-errorState]',
};

// ─── Template ────────────────────────────────────────────────────────────────
const TEMPLATE = hbs`
  <Storeknox::ThirdPartyScans::AppDetails
    @app={{this.app}}
    @selectedVersion=''
  />
`;

// ─── Test suite ──────────────────────────────────────────────────────────────
module(
  'Integration | Component | storeknox/third-party-scans/app-details',
  function (hooks) {
    setupRenderingTest(hooks);
    setupIntl(hooks, 'en');
    setupMirage(hooks);

    hooks.beforeEach(function () {
      this.store = this.owner.lookup('service:store');

      this.createApp = (overrides = {}) => {
        const record = this.server.create('sk-third-party-app', overrides);

        return this.store.push(
          this.store.normalize('sk-third-party-app', record.toJSON())
        );
      };
    });

    // ─── Score present ───────────────────────────────────────────────────────────
    test('it renders the risk assessment details when the score is present', async function (assert) {
      this.set('app', this.createApp({ score: 60 }));

      await render(TEMPLATE);

      assert.dom(selectors.technicalDetails).exists();
      assert.dom(selectors.errorState).doesNotExist();
    });

    // ─── Score absent ────────────────────────────────────────────────────────────
    test('it renders the error state instead of risk assessment details when the score is null', async function (assert) {
      this.set('app', this.createApp({ score: null }));

      await render(TEMPLATE);

      assert.dom(selectors.technicalDetails).doesNotExist();

      assert
        .dom(selectors.errorState)
        .containsText(t('storeknox.riskAssessmentErrorTitle'))
        .containsText(t('storeknox.riskAssessmentErrorDescription'));
    });
  }
);
