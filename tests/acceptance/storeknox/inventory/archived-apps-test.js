import {
  visit,
  findAll,
  find,
  click,
  currentURL,
  waitFor,
  triggerEvent,
} from '@ember/test-helpers';

import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { t } from 'ember-intl/test-support';
import dayjs from 'dayjs';
import Service from '@ember/service';

import { setupRequiredEndpoints } from 'irene/tests/helpers/acceptance-utils';
import { compareInnerHTMLWithIntlTranslation } from 'irene/tests/test-utils';
import ENUMS from 'irene/enums';

// Notification Service
class NotificationsStub extends Service {
  errorMsg = null;
  successMsg = null;

  error(msg) {
    this.errorMsg = msg;
  }

  success(msg) {
    this.successMsg = msg;
  }

  setDefaultAutoClear() {}
}

module('Acceptance | storeknox/inventory/archived-apps', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const { organization, currentOrganizationMe } =
      await setupRequiredEndpoints(this.server);

    organization.update({
      features: {
        storeknox: true,
      },
    });

    // Server mocks
    this.server.get('v2/sk_app', (schema) => {
      const apps = schema.skApps
        .where((a) => a.app_status === ENUMS.SK_APP_STATUS.ARCHIVED)
        .models.map((app) => ({
          ...app.toJSON(),
          app_metadata: app.app_metadata,
        }));

      return {
        count: apps.length,
        next: null,
        previous: null,
        results: apps,
      };
    });

    // Services
    this.owner.register('service:notifications', NotificationsStub);

    this.setProperties({ currentOrganizationMe });
  });

  test('it renders without archived apps', async function (assert) {
    assert.expect(5);

    // Server mocks
    this.server.get('v2/sk_app', () => {
      return {
        count: 0,
        next: null,
        previous: null,
        results: [],
      };
    });

    await visit('/dashboard/storeknox/inventory/archived-apps');

    assert
      .dom('[data-test-storeknoxInventory-archivedApps-headerText]')
      .hasText(t('storeknox.archivedApps'));

    assert
      .dom('[data-test-storeknoxInventory-archivedApps-subTitleText]')
      .hasText(t('storeknox.archivedAppsDescription'));

    // Empty state
    assert
      .dom('[data-test-storeknoxInventory-archivedApps-empty-illustration]')
      .exists();

    assert
      .dom('[data-test-storeknoxInventory-archivedApps-empty-header]')
      .hasText(t('storeknox.noArchivedAppsFound'));

    compareInnerHTMLWithIntlTranslation(assert, {
      message: t('storeknox.noArchivedAppsFoundDescription'),
      selector: '[data-test-storeknoxInventory-archivedApps-empty-description]',
    });
  });

  test('it renders with archived apps', async function (assert) {
    assert.expect(19);

    // Create archived apps
    const archivedApps = this.server.createList(
      'sk-app',
      3,
      'withArchivedStatus'
    );

    await visit('/dashboard/storeknox/inventory/archived-apps');

    const appElementList = findAll(
      '[data-test-storeknoxInventory-archivedApps-row]'
    );

    // Contains the right number of apps
    assert.strictEqual(appElementList.length, archivedApps.length);

    // Sanity check for rendered apps
    for (let index = 0; index < archivedApps.length; index++) {
      const app = archivedApps[index];
      const metadata = app.app_metadata;

      const appElement = find(
        `[data-test-storeknoxInventory-archivedApps-row-id='${app.id}']`
      );

      const storeIconSelector =
        metadata.platform === ENUMS.PLATFORM.ANDROID
          ? '[data-test-storeknoxTableColumns-store-playStoreIcon]'
          : '[data-test-storeknoxTableColumns-store-iosIcon]';

      assert.dom(storeIconSelector, appElement).exists();

      assert
        .dom('[data-test-storeknoxTableColumns-applicationTitle]', appElement)
        .hasText(metadata.title);

      assert
        .dom(
          '[data-test-storeknoxTableColumns-applicationPackageName]',
          appElement
        )
        .hasText(metadata.package_name);

      assert
        .dom('[data-test-applogo-img]', appElement)
        .hasAttribute('src', metadata.icon_url);

      // Check for archived by and archived date columns
      assert
        .dom(
          '[data-test-storeknoxInventory-archivedAppsTable-archivedBy]',
          appElement
        )
        .exists();

      assert
        .dom(
          '[data-test-storeknoxInventory-archivedAppsTable-archivedDate]',
          appElement
        )
        .exists();
    }
  });

  test('it navigates to app details on row click', async function (assert) {
    assert.expect(2);

    const app = this.server.create('sk-app', 'withArchivedStatus');

    this.server.get('v2/sk_app_detail/:id', (schema, request) => {
      const app = schema.skApps.find(request.params.id);

      return {
        id: request.params.id,
        app_metadata: app.app_metadata,
      };
    });

    await visit('/dashboard/storeknox/inventory/archived-apps');

    await waitFor('[data-test-storeknoxInventory-archivedApps-row]');

    assert.dom('[data-test-storeknoxInventory-archivedApps-row]').exists();

    await click('[data-test-storeknoxInventory-archivedApps-row]');

    // Check that we navigated to the inventory details page
    assert.strictEqual(
      currentURL(),
      `/dashboard/storeknox/inventory-details/${app.id}`
    );
  });

  test('it disables unarchiving from archived apps table if the unarchive date is in the future', async function (assert) {
    assert.expect(4);

    const unarchivableApp = this.server.create(
      'sk-app',
      {
        archived_on: dayjs().subtract(6, 'months').toDate(),
        unarchive_available_on: dayjs().add(5, 'months').toDate(),
      },
      'withArchivedStatus'
    );

    // Server mocks
    this.server.get('v2/sk_app_detail/:id', (schema, request) => {
      const app = schema.skApps.find(request.params.id);

      return {
        ...app.toJSON(),
        app_metadata: app.app_metadata,
      };
    });

    await visit('/dashboard/storeknox/inventory/archived-apps');

    assert.dom('[data-test-storeknoxInventory-archivedApps-row]').exists();

    const unarchiveButtonIcon = find(
      '[data-test-storeknoxInventory-archivedAppsTable-unarchiveButtonIcon]'
    );

    const unarchiveButton = find(
      '[data-test-storeknoxInventory-archivedAppsTable-unarchiveButton]'
    );

    assert.dom(unarchiveButton).hasAttribute('disabled');

    await triggerEvent(unarchiveButtonIcon, 'mouseenter');

    assert
      .dom(
        '[data-test-storeknoxInventory-archivedAppsTable-unarchiveButtonTooltipText]'
      )
      .containsText(t('storeknox.unarchiveDisabled'))
      .containsText(
        dayjs(unarchivableApp.unarchive_available_on).format('MMM DD, YYYY')
      );

    await triggerEvent(unarchiveButtonIcon, 'mouseleave');
  });

  test('it archives an app from archived apps page', async function (assert) {
    assert.expect(4);

    this.server.create(
      'sk-app',
      {
        archived_on: dayjs().subtract(6, 'months').toDate(),
        unarchive_available_on: dayjs().subtract(5, 'months').toDate(),
      },
      'withArchivedStatus'
    );

    // Server mocks
    this.server.get('v2/sk_app', (schema) => {
      const apps = schema.skApps
        .where((a) => a.app_status === ENUMS.SK_APP_STATUS.ARCHIVED)
        .models.map((app) => ({
          ...app.toJSON(),
          app_metadata: app.app_metadata,
        }));

      return {
        count: apps.length,
        next: null,
        previous: null,
        results: apps,
      };
    });

    this.server.put('/v2/sk_app/:id/update_app_status', (schema, request) => {
      const { app_status } = JSON.parse(request.requestBody);

      const app = schema.skApps.find(request.params.id).update({
        app_status,
        archived_on: null,
        unarchive_available_on: null,
      });

      return app.toJSON();
    });

    await visit('/dashboard/storeknox/inventory/archived-apps');

    assert.dom('[data-test-storeknoxInventory-archivedApps-row]').exists();

    const unarchiveButton = find(
      '[data-test-storeknoxInventory-archivedAppsTable-unarchiveButton]'
    );

    assert.dom(unarchiveButton).doesNotHaveAttribute('disabled');

    await click(unarchiveButton);

    await waitFor('[data-test-storeknoxInventory-archivedApps-empty-header]');

    assert
      .dom('[data-test-storeknoxInventory-archivedApps-empty-header]')
      .hasText(t('storeknox.noArchivedAppsFound'));

    assert
      .dom('[data-test-storeknoxInventory-archivedApps-empty-description]')
      .hasText(t('storeknox.noArchivedAppsFoundDescription'));
  });

  test('it shows archived banner in inventory details page', async function (assert) {
    assert.expect(3);

    const archivedApp = this.server.create(
      'sk-app',
      { archived_on: new Date() },
      'withArchivedStatus'
    );

    // Mock API for inventory details page
    this.server.get('v2/sk_app_detail/:id', (schema, request) => {
      const app = schema.skApps.find(request.params.id);

      return {
        ...app.toJSON(),
        app_metadata: app.app_metadata,
      };
    });

    await visit(`/dashboard/storeknox/inventory-details/${archivedApp.id}`);

    // Check that archived banner exists
    assert.dom('[data-test-storeknoxInventory-archivedApps-banner]').exists();

    assert
      .dom('[data-test-storeknoxInventory-archivedApps-bannerIcon]')
      .exists();

    assert
      .dom('[data-test-storeknoxInventory-archivedApps-bannerText]')
      .exists();
  });

  test('it shows archived apps link in inventory page', async function (assert) {
    assert.expect(3);

    await visit('/dashboard/storeknox/inventory/app-list');

    assert
      .dom('[data-test-storeknoxInventory-archivedApps-link]')
      .exists()
      .hasText(t('storeknox.archivedApps'));

    await click('[data-test-storeknoxInventory-archivedApps-link]');

    // Check that we navigated to the archived apps page
    assert.strictEqual(
      currentURL(),
      '/dashboard/storeknox/inventory/archived-apps'
    );
  });
});
