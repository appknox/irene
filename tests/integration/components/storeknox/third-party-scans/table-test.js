import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, findAll, render } from '@ember/test-helpers';
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

// ─── Selectors ───────────────────────────────────────────────────────────────
const selectors = {
  row: '[data-test-storeknoxThirdPartyScansTable-row]',
  emptyContainer: '[data-test-storeknoxThirdPartyScansTable-emptyContainer]',
  emptyHeader: '[data-test-storeknoxThirdPartyScansTable-emptyHeader]',
  devName: '[data-test-storeknoxTableColumns-applicationDevName]',
  devEmail: '[data-test-storeknoxTableColumns-applicationDevEmail]',
};

// ─── Template ────────────────────────────────────────────────────────────────
const TEMPLATE = hbs`<Storeknox::ThirdPartyScans::Table />`;

// ─── Test suite ──────────────────────────────────────────────────────────────
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

      this.router = this.owner.lookup('service:router');
      this.skThirdPartyApps = this.owner.lookup('service:sk-third-party-apps');
      this.store = this.owner.lookup('service:store');

      this.createApp = (props) => {
        const record = this.server.create('sk-third-party-app', props);

        return this.store.push(
          this.store.normalize('sk-third-party-app', record.toJSON())
        );
      };

      this.loadApps = (apps) => {
        this.skThirdPartyApps.apps = apps;
        this.skThirdPartyApps.totalCount = apps.length;
      };
    });

    // ─── Empty state ─────────────────────────────────────────────────────────────
    test('it renders the empty state when there are no apps', async function (assert) {
      await render(TEMPLATE);

      assert.dom(selectors.emptyContainer).exists();
      assert.dom(selectors.emptyHeader).hasText(t('noDataAvailable'));
      assert.dom(selectors.row).doesNotExist();
    });

    // ─── Loading ─────────────────────────────────────────────────────────────────
    test('it renders neither the empty state nor rows while fetching', async function (assert) {
      this.skThirdPartyApps.isFetching = true;

      await render(TEMPLATE);

      assert.dom(selectors.emptyContainer).doesNotExist();
      assert.dom(selectors.row).doesNotExist();
    });

    // ─── Rows ────────────────────────────────────────────────────────────────────
    test('it renders a row for each app with its title, developer and score', async function (assert) {
      const apps = [
        {
          title: 'App One',
          dev: 'Dev One',
          score: 42,
          record: this.createApp({
            title: 'App One',
            package_name: 'com.example.one',
            dev_name: 'Dev One',
            score: 42,
            risk_status: ENUMS.SK_THIRD_PARTY_APP_RISK_STATUS.HIGH,
            store: 'playstore',
          }),
        },
        {
          title: 'App Two',
          dev: 'Dev Two',
          score: 91,
          record: this.createApp({
            title: 'App Two',
            package_name: 'com.example.two',
            dev_name: 'Dev Two',
            score: 91,
            risk_status: ENUMS.SK_THIRD_PARTY_APP_RISK_STATUS.MINIMAL,
            store: 'appstore',
          }),
        },
      ];

      this.loadApps(apps.map((a) => a.record));

      await render(TEMPLATE);

      const rows = findAll(selectors.row);

      assert.strictEqual(rows.length, apps.length);
      assert.dom(selectors.emptyContainer).doesNotExist();

      apps.forEach((app, index) => {
        assert.dom(rows[index]).containsText(app.title);
        assert.dom(rows[index]).containsText(app.dev);
        assert.dom(rows[index]).containsText(`${app.score}/100`);
      });
    });

    // ─── Developer column ────────────────────────────────────────────────────────
    test('it does not render the developer email in the developer column', async function (assert) {
      this.loadApps([
        this.createApp({
          title: 'App One',
          package_name: 'com.example.one',
          dev_name: 'Dev One',
          store: 'playstore',
        }),
      ]);

      await render(TEMPLATE);

      assert.dom(selectors.devName).hasText('Dev One');
      assert.dom(selectors.devEmail).doesNotExist();
    });

    // ─── Row click ───────────────────────────────────────────────────────────────
    test('it transitions to app details on row click', async function (assert) {
      this.loadApps([
        this.createApp({
          title: 'App One',
          package_name: 'com.example.one',
          dev_name: 'Dev One',
          store: 'playstore',
        }),
      ]);

      await render(TEMPLATE);

      assert.strictEqual(this.router.lastRoute, null);

      await click(selectors.row);

      assert.strictEqual(
        this.router.lastRoute,
        'authenticated.storeknox.third-party-scans.app-details'
      );

      assert.strictEqual(this.router.lastModel, 'com.example.one');

      assert.deepEqual(this.router.lastOptions, {
        queryParams: { tp_store: 'playstore', tp_region: 'US' },
      });
    });
  }
);
