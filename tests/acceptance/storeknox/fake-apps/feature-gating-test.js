import { visit, currentURL } from '@ember/test-helpers';

import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { t } from 'ember-intl/test-support';
import Service from '@ember/service';

import { setupRequiredEndpoints } from 'irene/tests/helpers/acceptance-utils';

// Service stubs
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

// URL constants
const INVENTORY_APP_LIST_URL = '/dashboard/storeknox/inventory/app-list';

module(
  'Acceptance | storeknox/fake-apps/feature gating (fake_app_detection)',
  function (hooks) {
    setupApplicationTest(hooks);
    setupMirage(hooks);

    hooks.beforeEach(async function () {
      this.owner.register('service:notifications', NotificationsStub);

      const { organization, currentSkOrganization } =
        await setupRequiredEndpoints(this.server);

      // Update organization features
      organization.update({
        features: { storeknox: true },
      });

      currentSkOrganization.update({
        sk_features: { fake_app_detection: false },
      });

      // Server mocks
      this.server.get('v2/sk_app', () => ({
        count: 0,
        next: null,
        previous: null,
        results: [],
      }));
    });

    test('visiting fake-apps root redirects to inventory app list', async function (assert) {
      await visit('/dashboard/storeknox/fake-apps');

      assert.strictEqual(currentURL(), INVENTORY_APP_LIST_URL);
    });

    test('visiting fake-apps per-app list URL redirects to inventory app list', async function (assert) {
      const skInventoryApp = this.server.create('sk-inventory-app');

      await visit(`/dashboard/storeknox/fake-apps/${skInventoryApp.id}`);

      assert.strictEqual(currentURL(), INVENTORY_APP_LIST_URL);
    });

    test('visiting fake-apps tab URL redirects to inventory app list', async function (assert) {
      const skInventoryApp = this.server.create('sk-inventory-app');

      await visit(
        `/dashboard/storeknox/fake-apps/${skInventoryApp.id}/fake-apps`
      );

      assert.strictEqual(currentURL(), INVENTORY_APP_LIST_URL);
    });

    test('visiting fake-app details URL redirects to inventory app list', async function (assert) {
      const skInventoryApp = this.server.create('sk-inventory-app');

      const fakeApp = this.server.create('sk-fake-app', {
        sk_app: skInventoryApp.id,
      });

      await visit(
        `/dashboard/storeknox/fake-apps/${skInventoryApp.id}/details/${fakeApp.id}`
      );

      assert.strictEqual(currentURL(), INVENTORY_APP_LIST_URL);
    });

    test('side nav does not show Fake Apps when fake_app_detection is off', async function (assert) {
      await visit(INVENTORY_APP_LIST_URL);

      assert
        .dom(`[data-test-side-menu-item="${t('storeknox.fakeAppsTitle')}"]`)
        .doesNotExist();
    });
  }
);
