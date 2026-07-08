import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { selectChoose } from 'ember-power-select/test-support';
import Service from '@ember/service';

class RouterStub extends Service {
  lastTransition = null;

  transitionTo(options) {
    this.lastTransition = options;
  }
}

module(
  'Integration | Component | storeknox/third-party-scans/app-details/header',
  function (hooks) {
    setupRenderingTest(hooks);
    setupIntl(hooks, 'en');
    setupMirage(hooks);

    hooks.beforeEach(function () {
      this.owner.unregister('service:router');
      this.owner.register('service:router', RouterStub);

      const store = this.owner.lookup('service:store');

      const skApp = this.server.create('sk-third-party-app', {
        title: 'My Test App',
        package_name: 'com.example.myapp',
        dev_name: 'Example Developer',
        icon_url: 'https://example.com/icon.png',
        store: 'playstore',
        version: '1.0.0',
        versions: ['1.0.0', '1.0.1'],
      });

      this.app = store.push(
        store.normalize('sk-third-party-app', skApp.toJSON())
      );
    });

    test('it renders the app info with package name and developer name inline', async function (assert) {
      await render(hbs`
        <Storeknox::ThirdPartyScans::AppDetails::Header
          @app={{this.app}}
          @selectedVersion=''
        />
      `);

      assert
        .dom('[data-test-storeknoxThirdPartyScansAppDetailsHeader-appIcon]')
        .hasAttribute('src', 'https://example.com/icon.png');

      assert
        .dom('[data-test-storeknoxThirdPartyScansAppDetailsHeader-appTitle]')
        .hasText('My Test App');

      assert
        .dom('[data-test-storeknoxThirdPartyScansAppDetailsHeader-packageName]')
        .hasText('com.example.myapp');

      assert
        .dom('[data-test-storeknoxThirdPartyScansAppDetailsHeader-devName]')
        .hasText('Example Developer');
    });

    test('it renders platform and store chips for a play store app', async function (assert) {
      await render(hbs`
        <Storeknox::ThirdPartyScans::AppDetails::Header
          @app={{this.app}}
          @selectedVersion=''
        />
      `);

      assert
        .dom(
          '[data-test-storeknoxThirdPartyScansAppDetailsHeader-platformChip]'
        )
        .containsText(t('android'));

      assert
        .dom('[data-test-storeknoxThirdPartyScansAppDetailsHeader-storeChip]')
        .containsText(t('storeknox.playStore'));
    });

    test('it renders platform and store chips for an app store app', async function (assert) {
      this.app.skStore = 'appstore';

      await render(hbs`
        <Storeknox::ThirdPartyScans::AppDetails::Header
          @app={{this.app}}
          @selectedVersion=''
        />
      `);

      assert
        .dom(
          '[data-test-storeknoxThirdPartyScansAppDetailsHeader-platformChip]'
        )
        .containsText(t('ios'));

      assert
        .dom('[data-test-storeknoxThirdPartyScansAppDetailsHeader-storeChip]')
        .containsText(t('storeknox.appStore'));
    });

    test('it renders the fallback icon when icon url is missing', async function (assert) {
      this.app.iconUrl = '';

      await render(hbs`
        <Storeknox::ThirdPartyScans::AppDetails::Header
          @app={{this.app}}
          @selectedVersion=''
        />
      `);

      assert
        .dom(
          '[data-test-storeknoxThirdPartyScansAppDetailsHeader-appIconPlaceholder]'
        )
        .exists();

      assert
        .dom('[data-test-storeknoxThirdPartyScansAppDetailsHeader-appIcon]')
        .doesNotExist();
    });

    test('it renders the version select with a v prefix and transitions on change', async function (assert) {
      await render(hbs`
        <Storeknox::ThirdPartyScans::AppDetails::Header
          @app={{this.app}}
          @selectedVersion=''
        />
      `);

      assert
        .dom(
          '[data-test-storeknoxThirdPartyScansAppDetailsHeader-versionSelect]'
        )
        .containsText('v1.0.0');

      await selectChoose(
        '[data-test-storeknoxThirdPartyScansAppDetailsHeader-versionSelect]',
        '.ember-power-select-option',
        1
      );

      const router = this.owner.lookup('service:router');

      assert.deepEqual(router.lastTransition, {
        queryParams: { tp_version: '1.0.1' },
      });
    });
  }
);
