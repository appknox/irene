import { visit, click } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { module, test } from 'qunit';
import Service from '@ember/service';
import { t } from 'ember-intl/test-support';

import ENUMS from 'irene/enums';
import {
  assertBreadcrumbsUI,
  navigateBackWithBreadcrumb,
} from 'irene/tests/helpers/breadcrumbs-utils';
import { setupRequiredEndpoints } from 'irene/tests/helpers/acceptance-utils';

class IntegrationStub extends Service {
  async configure(user) {
    this.currentUser = user;
  }

  isPendoEnabled() {
    return false;
  }

  isCrispEnabled() {
    return false;
  }
}

class WebsocketStub extends Service {
  async connect() {}

  async configure() {}
}

class NotificationsStub extends Service {
  errorMsg = null;
  successMsg = null;
  infoMsg = null;

  error(msg) {
    this.errorMsg = msg;
  }

  success(msg) {
    this.successMsg = msg;
  }

  info(msg) {
    this.infoMsg = msg;
  }

  setDefaultAutoClear() {}
}

module('Acceptance | breadcrumbs/storeknox-inventory', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    // service stubs
    this.owner.register('service:notifications', NotificationsStub);
    this.owner.register('service:integration', IntegrationStub);
    this.owner.register('service:websocket', WebsocketStub);

    const { organization } = await setupRequiredEndpoints(this.server);

    organization.update({
      features: {
        storeknox: true,
      },
    });

    // Server mocks
    this.server.create('sk-organization');

    this.server.get('/v2/sk_organization', (schema) => {
      const skOrganizations = schema.skOrganizations.all().models;

      return {
        count: skOrganizations.length,
        next: null,
        previous: null,
        results: skOrganizations,
      };
    });

    const inventoryApps = this.server.createList(
      'sk-inventory-app',
      3,
      'withApprovedStatus',
      {
        store_monitoring_status:
          ENUMS.SK_APP_MONITORING_STATUS.NO_ACTION_NEEDED,
      }
    );

    this.server.get('v2/sk_app', (schema, req) => {
      const { app_status, approval_status } = req.queryParams;

      const inventoryApps = schema.skInventoryApps
        .where(
          (a) =>
            a.app_status === Number(app_status) &&
            a.approval_status === Number(approval_status)
        )
        .models.map((a) => ({
          ...a.toJSON(),
          app_metadata: a.app_metadata,
        }));

      return {
        count: inventoryApps.length,
        next: null,
        previous: null,
        results: inventoryApps,
      };
    });

    this.server.get('v2/sk_app_detail/:id', (schema, req) => {
      const app = schema.skInventoryApps.find(req.params.id);

      return { ...app.toJSON(), app_metadata: app.app_metadata };
    });

    this.server.get('/v2/sk_app/:id/sk_app_version', (schema) => {
      const skAppVersions = schema.skAppVersions.all().models;

      return {
        count: skAppVersions.length,
        next: null,
        previous: null,
        results: skAppVersions,
      };
    });

    this.setProperties({
      inventoryApps,
    });
  });

  test('it checks storeknox inventory breadcrumbs', async function (assert) {
    assert.expect(15);

    await visit(`/dashboard/storeknox/inventory/app-list`);

    await click('[data-test-storeknoxinventory-applisttable-rowid="1"]');

    const packageName = this.inventoryApps[0].app_metadata.package_name;

    assertBreadcrumbsUI(
      [
        t('storeknox.appInventory'),
        `${t('storeknox.inventoryDetails')} (${packageName})`,
      ],
      assert
    );

    await click(
      '[data-test-storeknoxinventorydetails-actionbtn="unscanned-version"]'
    );

    assertBreadcrumbsUI(
      [
        t('storeknox.appInventory'),
        `${t('storeknox.inventoryDetails')} (${packageName})`,
        t('storeknox.unscannedVersion'),
      ],
      assert
    );

    await navigateBackWithBreadcrumb();

    await click(
      '[data-test-storeknoxinventorydetails-actionbtn="brand-abuse"]'
    );

    assertBreadcrumbsUI(
      [
        t('storeknox.appInventory'),
        `${t('storeknox.inventoryDetails')} (${packageName})`,
        t('storeknox.brandAbuse'),
      ],
      assert
    );

    await navigateBackWithBreadcrumb();

    await click(
      '[data-test-storeknoxinventorydetails-actionbtn="malware-detected"]'
    );

    assertBreadcrumbsUI(
      [
        t('storeknox.appInventory'),
        `${t('storeknox.inventoryDetails')} (${packageName})`,
        t('storeknox.malwareDetected'),
      ],
      assert
    );
  });
});
