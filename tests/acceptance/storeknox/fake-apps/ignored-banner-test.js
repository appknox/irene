import { visit, find } from '@ember/test-helpers';

import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { t } from 'ember-intl/test-support';
import dayjs from 'dayjs';
import Service from '@ember/service';

import { setupRequiredEndpoints } from 'irene/tests/helpers/acceptance-utils';

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

module('Acceptance | storeknox/fake-apps/ignored-banner', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const { organization, currentSkOrganization } =
      await setupRequiredEndpoints(this.server);

    organization.update({
      features: {
        storeknox: true,
      },
    });

    currentSkOrganization.update({
      sk_features: { fake_app_detection: true },
    });

    this.owner.register('service:notifications', NotificationsStub);

    // Create sk-inventory-app (used as :sk_app in route)
    this.skInventoryApp = this.server.create('sk-inventory-app');

    // Mock sk-inventory-app detail endpoint
    this.server.get('/v2/sk_app_detail/:id', (schema, req) => {
      const app = schema.skInventoryApps.find(req.params.id);

      return {
        ...app.toJSON(),
        app_metadata: app.app_metadata,
      };
    });
  });

  test('it does not render when fakeApp is not ignored (no reviewedBy)', async function (assert) {
    assert.expect(1);

    const fakeApp = this.server.create('sk-fake-app', {
      sk_app: this.skInventoryApp.id,
      reviewed_by: null,
      reviewed_on: null,
    });

    this.server.get('/v2/sk_app/:sk_app_id/sk_fake_app/:id', (schema, req) => {
      return schema.skFakeApps.find(req.params.id).toJSON();
    });

    await visit(
      `/dashboard/storeknox/fake-apps/${this.skInventoryApp.id}/details/${fakeApp.id}`
    );

    assert
      .dom('[data-test-storeknoxFakeAppsIgnoredBanner-root]')
      .doesNotExist();
  });

  test('it renders the banner when fakeApp is ignored but not added to inventory', async function (assert) {
    assert.expect(5);

    const reviewedOn = new Date('2024-06-15');

    const fakeApp = this.server.create('sk-fake-app', {
      sk_app: this.skInventoryApp.id,
      reviewed_by: 'reviewer@example.com',
      reviewed_on: reviewedOn.toISOString(),
      added_to_inventory_app: null,
    });

    this.server.get('/v2/sk_app/:sk_app_id/sk_fake_app/:id', (schema, req) => {
      return schema.skFakeApps.find(req.params.id).toJSON();
    });

    await visit(
      `/dashboard/storeknox/fake-apps/${this.skInventoryApp.id}/details/${fakeApp.id}`
    );

    assert.dom('[data-test-storeknoxFakeAppsIgnoredBanner-root]').exists();
    assert.dom('[data-test-storeknoxFakeAppsIgnoredBanner-icon]').exists();

    const bannerText = find('[data-test-storeknoxFakeAppsIgnoredBanner-text]');

    assert
      .dom(bannerText)
      .containsText(t('storeknox.fakeApps.ignoredBannerAddedToInventory'))
      .containsText(dayjs(reviewedOn).format('MMM DD, YYYY'));

    assert
      .dom('[data-test-storeknoxFakeAppsIgnoredBanner-inventoryLink]')
      .doesNotExist();
  });

  test('it renders the banner with inventory link when fakeApp is ignored and added to inventory', async function (assert) {
    assert.expect(6);

    const reviewedOn = new Date('2024-08-20');
    const skInventoryApp = this.server.create('sk-inventory-app');

    const fakeApp = this.server.create('sk-fake-app', {
      sk_app: this.skInventoryApp.id,
      reviewed_by: 'reviewer@example.com',
      reviewed_on: reviewedOn.toISOString(),
      added_to_inventory_app: skInventoryApp.id,
    });

    this.server.get('/v2/sk_app/:sk_app_id/sk_fake_app/:id', (schema, req) => {
      const record = schema.skFakeApps.find(req.params.id);

      return {
        ...record.toJSON(),
        added_to_inventory_app: skInventoryApp.id,
      };
    });

    await visit(
      `/dashboard/storeknox/fake-apps/${this.skInventoryApp.id}/details/${fakeApp.id}`
    );

    assert.dom('[data-test-storeknoxFakeAppsIgnoredBanner-root]').exists();
    assert.dom('[data-test-storeknoxFakeAppsIgnoredBanner-icon]').exists();

    const bannerText = find('[data-test-storeknoxFakeAppsIgnoredBanner-text]');

    assert
      .dom(bannerText)
      .containsText(
        t('storeknox.fakeApps.ignoredBannerIgnoredAndAddedToInventory')
      )
      .containsText(dayjs(reviewedOn).format('MMM DD, YYYY'));

    assert
      .dom('[data-test-storeknoxFakeAppsIgnoredBanner-inventoryLink]')
      .containsText(t('storeknox.viewInInventory'))
      .hasAttribute(
        'href',
        `/dashboard/storeknox/inventory-details/${skInventoryApp.id}`
      );
  });
});
