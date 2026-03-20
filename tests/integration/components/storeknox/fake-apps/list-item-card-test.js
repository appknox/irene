import dayjs from 'dayjs';
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

  transitionTo(route, model) {
    this.lastRoute = route;
    this.lastModel = model;
  }
}

module(
  'Integration | Component | storeknox/fake-apps/list-item-card',
  function (hooks) {
    setupRenderingTest(hooks);
    setupIntl(hooks, 'en');
    setupMirage(hooks);

    hooks.beforeEach(async function () {
      this.owner.unregister('service:router');
      this.owner.register('service:router', RouterStub);

      const store = this.owner.lookup('service:store');

      const lastFakeDetectionOn = new Date('2025-06-15T10:00:00Z');

      const appMetadata = this.server.create('sk-app-metadata', {
        title: 'My Test App',
        package_name: 'com.example.myapp',
        icon_url: 'https://example.com/icon.png',
        url: 'https://play.google.com/store/apps/details?id=com.example.myapp',
        dev_name: 'Example Developer',
        platform: ENUMS.PLATFORM.ANDROID,
      });

      const skApp = this.server.create('sk-app', {
        id: '42',
        app_metadata: appMetadata,
        fake_app_counts: { brand_abuse: 4, fake_app: 3, ignored: 1 },
        last_fake_detection_on: lastFakeDetectionOn.toISOString(),
      });

      this.skAppRecord = store.push(
        store.normalize('sk-app', {
          ...skApp.toJSON(),
          app_metadata: appMetadata.toJSON(),
        })
      );

      this.lastFakeDetectionOn = lastFakeDetectionOn;
    });

    test('it renders the app logo, title, package name and developer name', async function (assert) {
      await render(hbs`
        <Storeknox::FakeApps::ListItemCard @skApp={{this.skAppRecord}} />
      `);

      assert
        .dom('[data-test-storeknoxFakeAppsListItemCard-appLogo]')
        .hasAttribute('src', 'https://example.com/icon.png');

      assert
        .dom('[data-test-storeknoxFakeAppsListItemCard-appTitle]')
        .hasText('My Test App');

      assert
        .dom('[data-test-storeknoxFakeAppsListItemCard-packageName]')
        .hasText('com.example.myapp');

      assert
        .dom('[data-test-storeknoxFakeAppsListItemCard-developerName]')
        .containsText('Example Developer');
    });

    test('it renders the play store logo for android apps', async function (assert) {
      await render(hbs`
        <Storeknox::FakeApps::ListItemCard @skApp={{this.skAppRecord}} />
      `);

      assert
        .dom('[data-test-storeknoxFakeAppsListItemCard-playStoreLogo]')
        .exists();

      assert
        .dom('[data-test-storeknoxFakeAppsListItemCard-appStoreLogo]')
        .doesNotExist();
    });

    test('it renders the app store logo for iOS apps', async function (assert) {
      const store = this.owner.lookup('service:store');

      const iosMetadata = this.server.create('sk-app-metadata', {
        title: 'iOS App',
        package_name: 'com.example.iosapp',
        icon_url: 'https://example.com/ios-icon.png',
        url: 'https://apps.apple.com/app/id123',
        dev_name: 'iOS Developer',
        platform: ENUMS.PLATFORM.IOS,
      });

      const iosApp = this.server.create('sk-app', {
        id: '99',
        app_metadata: iosMetadata,
        fake_app_counts: { brand_abuse: 1, fake_app: 1, ignored: 0 },
        last_fake_detection_on: new Date().toISOString(),
      });

      const iosAppRecord = store.push(
        store.normalize('sk-app', {
          ...iosApp.toJSON(),
          app_metadata: iosMetadata.toJSON(),
        })
      );

      this.set('iosAppRecord', iosAppRecord);

      await render(hbs`
        <Storeknox::FakeApps::ListItemCard @skApp={{this.iosAppRecord}} />
      `);

      assert
        .dom('[data-test-storeknoxFakeAppsListItemCard-appStoreLogo]')
        .exists();

      assert
        .dom('[data-test-storeknoxFakeAppsListItemCard-playStoreLogo]')
        .doesNotExist();
    });

    test('it renders the total fake apps count', async function (assert) {
      // totalFakeApps = brand_abuse (4) + fake_app (3) = 7
      await render(hbs`
        <Storeknox::FakeApps::ListItemCard @skApp={{this.skAppRecord}} />
      `);

      assert
        .dom('[data-test-storeknoxFakeAppsListItemCard-totalFakeApps]')
        .hasText('7');
    });

    test('it renders the brand abuse count and label', async function (assert) {
      await render(hbs`
        <Storeknox::FakeApps::ListItemCard @skApp={{this.skAppRecord}} />
      `);

      assert
        .dom('[data-test-storeknoxFakeAppsListItemCard-brandAbuseRow]')
        .containsText(t('storeknox.brandAbuse'))
        .containsText('4');
    });

    test('it renders the fake app count and label', async function (assert) {
      await render(hbs`
        <Storeknox::FakeApps::ListItemCard @skApp={{this.skAppRecord}} />
      `);

      assert
        .dom('[data-test-storeknoxFakeAppsListItemCard-fakeAppRow]')
        .containsText(t('storeknox.fakeApps.fakeApp'))
        .containsText('3');
    });

    test('it renders the last monitoring date formatted correctly', async function (assert) {
      await render(hbs`
        <Storeknox::FakeApps::ListItemCard @skApp={{this.skAppRecord}} />
      `);

      const expectedDate = dayjs(this.lastFakeDetectionOn).format(
        'MMM DD, YYYY'
      );

      assert
        .dom('[data-test-storeknoxFakeAppsListItemCard-lastMonitoringDate]')
        .hasText(expectedDate);
    });

    test('it navigates to the fake app details page on click', async function (assert) {
      await render(hbs`
        <Storeknox::FakeApps::ListItemCard @skApp={{this.skAppRecord}} />
      `);

      await click('[data-test-storeknoxFakeAppsListItemCard-appLogo]');

      const router = this.owner.lookup('service:router');

      assert.strictEqual(
        router.lastRoute,
        'authenticated.storeknox.fake-apps.fake-app-list.index',
        'transitions to the correct route'
      );

      assert.strictEqual(router.lastModel, '42', 'passes the correct app id');
    });
  }
);
