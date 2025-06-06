import { visit, click } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { t } from 'ember-intl/test-support';
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

module(
  'Acceptance | storeknox/inventory-details/brand-abuse',
  function (hooks) {
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

      this.server.get('/v2/files/:id', (schema, req) => {
        return schema.files.find(`${req.params.id}`)?.toJSON();
      });

      this.server.get('/v2/projects/:id', (schema, req) => {
        return schema.projects.find(`${req.params.id}`)?.toJSON();
      });

      // Services
      this.owner.register('service:notifications', NotificationsStub);
      const store = this.owner.lookup('service:store');

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

    test.each(
      'it renders app details',
      [{ available_on_appknox: true }, { available_on_appknox: false }],
      async function (assert, { available_on_appknox }) {
        const file = this.server.create('file');
        const core_project = this.server.create('project');

        // Models
        const inventoryApp = this.server.create(
          'sk-inventory-app',
          'withApprovedStatus',
          {
            core_project: available_on_appknox ? core_project.id : null,
            core_project_latest_version: available_on_appknox ? file.id : null,
          }
        );

        const inventoryAppRecord = this.normalizeSKInventoryApp(inventoryApp);

        await visit(
          `/dashboard/storeknox/inventory-details/${inventoryApp.id}/brand-abuse`
        );

        assert
          .dom('[data-test-storeknoxInventoryDetails-breadcrumbContainer]')
          .exists();

        if (!available_on_appknox) {
          assert
            .dom(
              '[data-test-storeknoxInventoryDetails-appNotPartOfAppknoxIcon]'
            )
            .exists();

          assert
            .dom(
              '[data-test-storeknoxInventoryDetails-appNotPartOfAppknoxIconText]'
            )
            .hasText(t('storeknox.appNotPartOfAppknox'));
        }

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

        // Page Info tag
        assert
          .dom('[data-test-storeknoxInventoryDetails-pageInfoTag]')
          .hasText(t('storeknox.brandAbuse'));

        // Monitoring action should not exist
        assert
          .dom('[data-test-storeknoxInventoryDetails-monitoringStatusToggle]')
          .doesNotExist(t('storeknox.brandAbuse'));

        // Feature unavailable checks
        assert
          .dom(
            '[data-test-storeknoxInventoryDetails-brandAbuseFeatureUnavailable-Illustration]'
          )
          .exists();

        assert
          .dom(
            '[data-test-storeknoxInventoryDetails-featureUnavailable-headerTitle]'
          )
          .hasText(t('storeknox.brandAbuseFeatureUnavailableHeader'));

        assert
          .dom(
            '[data-test-storeknoxInventoryDetails-featureUnavailable-headerDescription]'
          )
          .hasText(t('storeknox.brandAbuseFeatureUnavailableSubText'));
      }
    );
  }
);
