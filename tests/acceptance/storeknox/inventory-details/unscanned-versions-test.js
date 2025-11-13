import { visit, click, currentURL } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { t } from 'ember-intl/test-support';
import dayjs from 'dayjs';

import ENUMS from 'irene/enums';
import { setupRequiredEndpoints } from 'irene/tests/helpers/acceptance-utils';
import { setupFileModelEndpoints } from 'irene/tests/helpers/file-model-utils';

module(
  'Acceptance | storeknox/inventory-details/unscanned-versions',
  function (hooks) {
    setupApplicationTest(hooks);
    setupMirage(hooks);

    hooks.beforeEach(async function () {
      const { organization, currentOrganizationMe } =
        await setupRequiredEndpoints(this.server);

      setupFileModelEndpoints(this.server);

      organization.update({
        features: { storeknox: true },
      });

      // Server mocks
      this.server.get('v2/sk_app_detail/:id', (schema, req) => {
        const app = schema.skInventoryApps.find(req.params.id);

        return { ...app.toJSON(), app_metadata: app.app_metadata };
      });

      this.server.get('/v2/sk_organization', (schema) => {
        const skOrganizations = schema.skOrganizations.all().models;

        return {
          count: skOrganizations.length,
          next: null,
          previous: null,
          results: skOrganizations,
        };
      });

      this.server.get('/v3/files/:id', (schema, req) => {
        return schema.files.find(`${req.params.id}`)?.toJSON();
      });

      this.server.get('/v3/projects/:id', (schema, req) => {
        return schema.projects.find(`${req.params.id}`)?.toJSON();
      });

      // Services
      const store = this.owner.lookup('service:store');

      this.server.create('sk-organization');

      const normalizeSKInventoryApp = (inventoryApp) =>
        store.push(
          store.normalize('sk-inventory-app', {
            ...inventoryApp.toJSON(),
            app_metadata: inventoryApp.app_metadata,
          })
        );

      this.setProperties({
        currentOrganizationMe,
        store,
        normalizeSKInventoryApp,
      });
    });

    test('it renders header and store monitoring overview info', async function (assert) {
      const file = this.server.create('file');
      const core_project = this.server.create('project');

      // Models
      const inventoryApp = this.server.create(
        'sk-inventory-app',
        'withApprovedStatus',
        {
          core_project: core_project.id,
          core_project_latest_version: file.id,
          store_monitoring_status: ENUMS.SK_APP_MONITORING_STATUS.ACTION_NEEDED,
        }
      );

      const inventoryAppRecord = this.normalizeSKInventoryApp(inventoryApp);

      // Server Mocks
      this.server.get('/v2/sk_app/:id/sk_app_version', () => {
        return {
          count: 0,
          next: null,
          previous: null,
          results: [],
        };
      });

      await visit(
        `/dashboard/storeknox/inventory-details/${inventoryAppRecord.id}/unscanned-version`
      );

      // Header info
      assert
        .dom('[data-test-storeknoxInventoryDetails-breadcrumbContainer]')
        .exists();

      assert
        .dom('[data-test-storeknoxInventoryDetails-appLogoImage]')
        .hasAttribute('src', inventoryAppRecord.appMetadata.iconUrl);

      assert
        .dom('[data-test-storeknoxInventoryDetails-headerAppTitle]')
        .hasText(inventoryAppRecord.appMetadata.title);

      assert
        .dom('[data-test-storeknoxInventoryDetails-headerAppPackageName]')
        .hasText(inventoryAppRecord.appMetadata.packageName);

      // App Logo tests
      assert
        .dom('[data-test-storeknoxInventoryDetails-headerPlatformIcon]')
        .hasClass(inventoryAppRecord.isAndroid ? /android/ : /apple/);

      const storeLogoSelector = inventoryAppRecord.isAndroid
        ? '[data-test-storeknoxInventoryDetails-playStoreLogo]'
        : '[data-test-storeknoxInventoryDetails-appStoreLogo]';

      assert.dom(storeLogoSelector).exists();

      await click(storeLogoSelector);

      assert
        .dom('[data-test-storeknox-productInfoCaptionText]')
        .hasText(t('infoCapitalCase'));

      const productTitle = inventoryAppRecord.isAndroid
        ? t('storeknox.playStore')
        : t('storeknox.appStore');

      assert
        .dom('[data-test-storeknox-productInfo-appIsPartOfText]')
        .containsText(t('storeknox.appIsPartOf'))
        .containsText(productTitle);

      assert
        .dom('[data-test-storeknox-productInfo-appStoreLink]')
        .hasAttribute('href', inventoryAppRecord.appMetadata.url);

      assert
        .dom('[data-test-storeknox-productInfo-appStoreLinkBtn]')
        .hasText(t('storeknox.checkOn') + ` ${productTitle}`);

      await click(storeLogoSelector);

      assert
        .dom('[data-test-storeknoxInventoryDetails-pageInfoTag]')
        .isDisabled()
        .hasText(t('storeknox.unscannedVersion'));

      assert
        .dom('[data-test-storeknoxInventoryDetails-monitoringStatusToggle]')
        .doesNotExist();

      // Tab items check
      const tabItems = [
        {
          id: 'monitoring-details',
          label: t('storeknox.monitoringDetails'),
        },
        {
          id: 'monitoring-history',
          label: t('storeknox.monitoringHistory'),
        },
      ];

      tabItems
        .filter(Boolean)
        .forEach((tab) =>
          assert
            .dom(
              `[data-test-storeknoxInventoryDetails-unscannedVersion-tab='${tab.id}']`
            )
            .hasText(tab.label)
        );

      // Store monitoring overview checks
      assert
        .dom(
          '[data-test-storeknoxInventoryDetails-unscannedVersionHeader-accordion]'
        )
        .exists();

      // Expand overview accordion
      await click('[data-test-ak-accordion-summary]');

      const corePrjLatestVersion = inventoryAppRecord?.coreProjectLatestVersion;

      assert
        .dom(
          '[data-test-storeknoxInventoryDetails-unscannedVersionHeader-fileId]'
        )
        .hasText(t('fileID'));

      assert
        .dom(
          '[data-test-storeknoxInventoryDetails-unscannedVersionHeader-fileIdLink]'
        )
        .hasText(corePrjLatestVersion.id)
        .hasAttribute('href', `/dashboard/file/${corePrjLatestVersion.id}`);

      assert
        .dom(
          '[data-test-storeknoxInventoryDetails-unscannedVersionHeader-lastScannedVersion]'
        )
        .hasText(t('storeknox.lastScannedVersion'));

      assert
        .dom(
          '[data-test-storeknoxInventoryDetails-unscannedVersionHeader-lastScannedVersionValue]'
        )
        .hasText(corePrjLatestVersion.get('version'));

      assert
        .dom(
          '[data-test-storeknoxInventoryDetails-unscannedVersionHeader-lastMonitoredOn]'
        )
        .hasText(t('storeknox.lastMonitoredOn'));

      assert
        .dom(
          '[data-test-storeknoxInventoryDetails-unscannedVersionHeader-lastMonitoredOnValue]'
        )
        .hasText(
          dayjs(inventoryAppRecord.lastMonitoredOn).format('DD MMMM, YYYY')
        );

      const monitoringEnabled = inventoryAppRecord.monitoringEnabled;

      assert
        .dom(
          '[data-test-storeknoxInventoryDetails-unscannedVersionHeader-monitoringStatus]'
        )
        .hasText(t('storeknox.monitoringStatus'));

      assert
        .dom(
          '[data-test-storeknoxInventoryDetails-unscannedVersionHeader-monitoringStatusChip]'
        )
        .hasClass(new RegExp(monitoringEnabled ? 'success' : 'error'));
    });

    test.each(
      'it should redirect to details page if app status is being initialized or disabled',
      ['withInitializingStatus', 'withDisabledStatus'],
      async function (assert, appStatus) {
        const file = this.server.create('file');
        const core_project = this.server.create('project');

        // Models
        const inventoryApp = this.server.create('sk-inventory-app', appStatus, {
          core_project: core_project.id,
          core_project_latest_version: file.id,
        });

        const inventoryAppRecord = this.normalizeSKInventoryApp(inventoryApp);

        // Server Mocks
        this.server.get('/v2/sk_app/:id/sk_app_version', () => {
          return {
            count: 0,
            next: null,
            previous: null,
            results: [],
          };
        });

        await visit(
          `/dashboard/storeknox/inventory-details/${inventoryAppRecord.id}/unscanned-version`
        );

        //  Redirect to details page
        assert.strictEqual(
          currentURL(),
          `/dashboard/storeknox/inventory-details/${inventoryAppRecord.id}`
        );
      }
    );
  }
);
