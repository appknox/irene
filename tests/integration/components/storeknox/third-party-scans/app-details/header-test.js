import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { findAll, render, triggerEvent } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { selectChoose } from 'ember-power-select/test-support';
import { clickTrigger } from 'ember-power-select/test-support/helpers';
import Service from '@ember/service';

class RouterStub extends Service {
  lastTransition = null;

  transitionTo(options) {
    this.lastTransition = options;
  }
}

// ─── Selectors ───────────────────────────────────────────────────────────────
const selectors = {
  appIcon: '[data-test-storeknoxThirdPartyScansAppDetailsHeader-appIcon]',
  appIconPlaceholder:
    '[data-test-storeknoxThirdPartyScansAppDetailsHeader-appIconPlaceholder]',
  appTitle: '[data-test-storeknoxThirdPartyScansAppDetailsHeader-appTitle]',
  packageName:
    '[data-test-storeknoxThirdPartyScansAppDetailsHeader-packageName]',
  devName: '[data-test-storeknoxThirdPartyScansAppDetailsHeader-devName]',
  versionSelect:
    '[data-test-storeknoxThirdPartyScansAppDetailsHeader-versionSelect]',
  platformChip:
    '[data-test-storeknoxThirdPartyScansAppDetailsHeader-platformChip]',
  storeChip: '[data-test-storeknoxThirdPartyScansAppDetailsHeader-storeChip]',
  powerSelectOption: '.ember-power-select-option',
};

// ─── Template ────────────────────────────────────────────────────────────────
const TEMPLATE = hbs`
  <Storeknox::ThirdPartyScans::AppDetails::Header
    @app={{this.app}}
    @selectedVersion={{this.selectedVersion}}
  />
`;

// ─── Test suite ──────────────────────────────────────────────────────────────
module(
  'Integration | Component | storeknox/third-party-scans/app-details/header',
  function (hooks) {
    setupRenderingTest(hooks);
    setupIntl(hooks, 'en');
    setupMirage(hooks);

    hooks.beforeEach(function () {
      this.owner.unregister('service:router');
      this.owner.register('service:router', RouterStub);

      this.store = this.owner.lookup('service:store');

      this.createApp = (overrides = {}) => {
        const record = this.server.create('sk-third-party-app', {
          title: 'My Test App',
          package_name: 'com.example.myapp',
          dev_name: 'Example Developer',
          icon_url: 'https://example.com/icon.png',
          store: 'playstore',
          version: '1.0.0',
          versions: ['1.0.0', '1.0.1'],
          ...overrides,
        });

        return this.store.push(
          this.store.normalize('sk-third-party-app', record.toJSON())
        );
      };

      this.setProperties({
        app: this.createApp(),
        selectedVersion: '',
      });
    });

    // ─── App info ──────────────────────────────────────────────────────────────
    test('it renders the app icon, title, package name and developer name', async function (assert) {
      await render(TEMPLATE);

      assert
        .dom(selectors.appIcon)
        .hasAttribute('src', 'https://example.com/icon.png')
        .hasAttribute('alt', 'My Test App');

      assert.dom(selectors.appTitle).hasText('My Test App');
      assert.dom(selectors.packageName).hasText('com.example.myapp');
      assert.dom(selectors.devName).hasText('Example Developer');
      assert.dom(selectors.appIconPlaceholder).doesNotExist();
    });

    test('it renders the fallback icon when the icon url is missing', async function (assert) {
      this.set('app', this.createApp({ icon_url: '' }));

      await render(TEMPLATE);

      assert.dom(selectors.appIconPlaceholder).exists();
      assert.dom(selectors.appIcon).doesNotExist();
    });

    test('it renders the fallback icon when the image fails to load', async function (assert) {
      await render(TEMPLATE);

      assert.dom(selectors.appIcon).exists();

      await triggerEvent(selectors.appIcon, 'error', { bubbles: false });

      assert.dom(selectors.appIconPlaceholder).exists();
      assert.dom(selectors.appIcon).doesNotExist();
    });

    // ─── Platform and store chips ────────────────────────────────────────────────
    test('it renders android platform and play store chips for a play store app', async function (assert) {
      await render(TEMPLATE);

      assert.dom(selectors.platformChip).hasText(t('android'));
      assert.dom(selectors.storeChip).hasText(t('storeknox.playStore'));
    });

    test('it renders ios platform and app store chips for an app store app', async function (assert) {
      this.set('app', this.createApp({ store: 'appstore' }));

      await render(TEMPLATE);

      assert.dom(selectors.platformChip).hasText(t('ios'));
      assert.dom(selectors.storeChip).hasText(t('storeknox.appStore'));
    });

    // ─── Version select ──────────────────────────────────────────────────────────
    test('it renders the version select with v-prefixed options', async function (assert) {
      await render(TEMPLATE);

      assert.dom(selectors.versionSelect).containsText('v1.0.0');

      await clickTrigger(selectors.versionSelect);

      const options = findAll(selectors.powerSelectOption);

      assert.strictEqual(options.length, 2);
      assert.dom(options[0]).hasText('v1.0.0');
      assert.dom(options[1]).hasText('v1.0.1');
    });

    test('it shows the provided selected version in the trigger', async function (assert) {
      this.set('selectedVersion', '1.0.1');

      await render(TEMPLATE);

      assert.dom(selectors.versionSelect).containsText('v1.0.1');
    });

    test('it hides the version select when the app has no versions', async function (assert) {
      this.set('app', this.createApp({ versions: [] }));

      await render(TEMPLATE);

      assert.dom(selectors.versionSelect).doesNotExist();
    });

    test('it transitions with the tp_version query param on version change', async function (assert) {
      await render(TEMPLATE);

      const router = this.owner.lookup('service:router');

      assert.strictEqual(router.lastTransition, null);

      await selectChoose(
        selectors.versionSelect,
        selectors.powerSelectOption,
        1
      );

      assert.deepEqual(router.lastTransition, {
        queryParams: { tp_version: '1.0.1' },
      });
    });
  }
);
