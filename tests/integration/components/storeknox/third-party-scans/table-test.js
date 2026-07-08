import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupMirage } from 'ember-cli-mirage/test-support';
import Service from '@ember/service';

import ENUMS from 'irene/enums';

class RouterStub extends Service {
  lastRoute = null;
  lastModel = null;
  lastOptions = null;

  transitionTo(route, model, options) {
    this.lastRoute = route;
    this.lastModel = model;
    this.lastOptions = options;
  }
}

class SkThirdPartyAppsStub extends Service {
  isFetching = false;
  totalCount = 0;
  limit = 10;
  offset = 0;
  region = 'US';
  apps = [];
}

module(
  'Integration | Component | storeknox/third-party-scans/table',
  function (hooks) {
    setupRenderingTest(hooks);
    setupIntl(hooks, 'en');
    setupMirage(hooks);

    hooks.beforeEach(function () {
      this.owner.unregister('service:router');
      this.owner.register('service:router', RouterStub);
      this.owner.register('service:sk-third-party-apps', SkThirdPartyAppsStub);

      this.skThirdPartyApps = this.owner.lookup('service:sk-third-party-apps');

      const store = this.owner.lookup('service:store');

      this.createApp = (props) => {
        const skApp = this.server.create('sk-third-party-app', props);

        return store.push(
          store.normalize('sk-third-party-app', skApp.toJSON())
        );
      };
    });

    test('it renders the empty state when there are no apps', async function (assert) {
      await render(hbs`<Storeknox::ThirdPartyScans::Table />`);

      assert
        .dom('[data-test-storeknoxThirdPartyScansTable-emptyContainer]')
        .exists();

      assert
        .dom('[data-test-storeknoxThirdPartyScansTable-emptyHeader]')
        .hasText(t('noDataAvailable'));
    });

    test('it renders rows for each app', async function (assert) {
      this.skThirdPartyApps.apps = [
        this.createApp({
          title: 'App One',
          package_name: 'com.example.one',
          dev_name: 'Dev One',
          score: 42,
          risk_status: ENUMS.SK_THIRD_PARTY_APP_RISK_STATUS.HIGH,
          store: 'playstore',
        }),
        this.createApp({
          title: 'App Two',
          package_name: 'com.example.two',
          dev_name: 'Dev Two',
          score: 91,
          risk_status: ENUMS.SK_THIRD_PARTY_APP_RISK_STATUS.MINIMAL,
          store: 'appstore',
        }),
      ];

      this.skThirdPartyApps.totalCount = 2;

      await render(hbs`<Storeknox::ThirdPartyScans::Table />`);

      assert
        .dom('[data-test-storeknoxThirdPartyScansTable-row]')
        .exists({ count: 2 });

      assert
        .dom('[data-test-storeknoxThirdPartyScansTable-emptyContainer]')
        .doesNotExist();

      const firstRow = this.element.querySelector(
        '[data-test-storeknoxThirdPartyScansTable-row]'
      );

      assert.dom(firstRow).containsText('App One');
      assert.dom(firstRow).containsText('Dev One');
      assert.dom(firstRow).containsText('42/100');
    });

    test('it does not render the developer email in the developer column', async function (assert) {
      this.skThirdPartyApps.apps = [
        this.createApp({
          title: 'App One',
          package_name: 'com.example.one',
          dev_name: 'Dev One',
          store: 'playstore',
        }),
      ];

      this.skThirdPartyApps.totalCount = 1;

      await render(hbs`<Storeknox::ThirdPartyScans::Table />`);

      assert
        .dom('[data-test-storeknoxTableColumns-applicationDevName]')
        .hasText('Dev One');

      assert
        .dom('[data-test-storeknoxTableColumns-applicationDevEmail]')
        .doesNotExist();
    });

    test('it transitions to app details on row click', async function (assert) {
      this.skThirdPartyApps.apps = [
        this.createApp({
          title: 'App One',
          package_name: 'com.example.one',
          dev_name: 'Dev One',
          store: 'playstore',
        }),
      ];

      this.skThirdPartyApps.totalCount = 1;

      await render(hbs`<Storeknox::ThirdPartyScans::Table />`);

      await click('[data-test-storeknoxThirdPartyScansTable-row]');

      const router = this.owner.lookup('service:router');

      assert.strictEqual(
        router.lastRoute,
        'authenticated.storeknox.third-party-scans.app-details'
      );

      assert.strictEqual(router.lastModel, 'com.example.one');

      assert.deepEqual(router.lastOptions, {
        queryParams: { tp_store: 'playstore', tp_region: 'US' },
      });
    });
  }
);
