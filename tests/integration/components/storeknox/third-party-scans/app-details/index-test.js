import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupMirage } from 'ember-cli-mirage/test-support';

module(
  'Integration | Component | storeknox/third-party-scans/app-details',
  function (hooks) {
    setupRenderingTest(hooks);
    setupIntl(hooks, 'en');
    setupMirage(hooks);

    hooks.beforeEach(function () {
      this.store = this.owner.lookup('service:store');
    });

    test('it renders the risk assessment details when the score is present', async function (assert) {
      const skApp = this.server.create('sk-third-party-app', { score: 60 });

      this.app = this.store.push(
        this.store.normalize('sk-third-party-app', skApp.toJSON())
      );

      await render(hbs`
        <Storeknox::ThirdPartyScans::AppDetails
          @app={{this.app}}
          @selectedVersion=''
        />
      `);

      assert.dom(this.element).containsText(t('storeknox.technicalDetails'));

      assert
        .dom('[data-test-storeknoxThirdPartyScansAppDetails-errorState]')
        .doesNotExist();
    });

    test('it renders the error state instead of risk assessment details when the score is null', async function (assert) {
      const skApp = this.server.create('sk-third-party-app', { score: null });

      this.app = this.store.push(
        this.store.normalize('sk-third-party-app', skApp.toJSON())
      );

      await render(hbs`
        <Storeknox::ThirdPartyScans::AppDetails
          @app={{this.app}}
          @selectedVersion=''
        />
      `);

      assert
        .dom('[data-test-storeknoxThirdPartyScansAppDetails-errorState]')
        .exists();

      assert
        .dom('[data-test-storeknoxThirdPartyScansAppDetails-errorState]')
        .containsText(t('storeknox.riskAssessmentErrorTitle'));

      assert
        .dom('[data-test-storeknoxThirdPartyScansAppDetails-errorState]')
        .containsText(t('storeknox.riskAssessmentErrorDescription'));

      assert
        .dom(this.element)
        .doesNotContainText(t('storeknox.technicalDetails'));
    });
  }
);
