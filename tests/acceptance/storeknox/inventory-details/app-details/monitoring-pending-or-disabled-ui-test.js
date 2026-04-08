import { visit, waitFor } from '@ember/test-helpers';

import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { t } from 'ember-intl/test-support';

import ENUMS from 'irene/enums';
import { setupRequiredEndpoints } from 'irene/tests/helpers/acceptance-utils';

module(
  'Acceptance | storeknox/inventory-details/app-details/monitoring-pending-or-disabled-ui',
  function (hooks) {
    setupApplicationTest(hooks);
    setupMirage(hooks);

    hooks.beforeEach(async function () {
      const { organization } = await setupRequiredEndpoints(this.server);

      organization.update({ features: { storeknox: true } });

      this.server.get('v2/sk_app_detail/:id', (schema, req) => {
        const app = schema.skInventoryApps.find(req.params.id);

        return { ...app.toJSON(), app_metadata: app.app_metadata };
      });

      this.server.get('/v2/sk_organization/:id/sk_subscription', (_, req) => {
        return {
          id: req.params.id,
          is_active: true,
          is_trial: false,
        };
      });
    });

    // --- showMonitoringPendingInfo ---
    // Both store_monitoring_status and fake_app_detection_status are initializing

    test('it shows the monitoring results pending UI when both statuses are initializing', async function (assert) {
      const inventoryApp = this.server.create(
        'sk-inventory-app',
        'withApprovedStatus',
        {
          monitoring_enabled: true,
          store_monitoring_status: ENUMS.SK_APP_MONITORING_STATUS.INITIALIZING,
          fake_app_detection_status:
            ENUMS.SK_FAKE_APP_DETECTION_STATUS.INITIALIZING,
          has_store_monitoring_data: false,
          has_fake_app_detection_data: false,
        }
      );

      await visit(`/dashboard/storeknox/inventory-details/${inventoryApp.id}`);

      await waitFor(
        '[data-test-storeknoxInventoryDetails-monitoringResultsPendingIllustration]'
      );

      assert
        .dom(
          '[data-test-storeknoxInventoryDetails-monitoringResultsPendingIllustration]'
        )
        .exists();

      assert
        .dom(
          '[data-test-storeknoxInventoryDetails-monitoringResultsPendingText]'
        )
        .hasText(t('storeknox.monitoringResultsPending'));

      assert
        .dom(
          '[data-test-storeknoxInventoryDetails-monitoringDisabledWithNoResultsIllustration]'
        )
        .doesNotExist();
    });

    // --- monitoringIsDisabledWithNoResults ---
    // monitoring_enabled is false and neither store monitoring nor fake app data exists

    test('it shows the monitoring disabled UI when monitoring is off with no prior data', async function (assert) {
      const inventoryApp = this.server.create(
        'sk-inventory-app',
        'withApprovedStatus',
        {
          monitoring_enabled: false,
          store_monitoring_status: ENUMS.SK_APP_MONITORING_STATUS.DISABLED,
          fake_app_detection_status:
            ENUMS.SK_FAKE_APP_DETECTION_STATUS.DISABLED,
          has_store_monitoring_data: false,
          has_fake_app_detection_data: false,
        }
      );

      await visit(`/dashboard/storeknox/inventory-details/${inventoryApp.id}`);

      await waitFor(
        '[data-test-storeknoxInventoryDetails-monitoringDisabledWithNoResultsIllustration]'
      );

      assert
        .dom(
          '[data-test-storeknoxInventoryDetails-monitoringDisabledWithNoResultsIllustration]'
        )
        .exists();

      assert
        .dom(
          '[data-test-storeknoxInventoryDetails-monitoringDisabledWithNoResultsHeaderText]'
        )
        .hasText(t('storeknox.enableMonitoringForApp'));

      assert
        .dom(
          '[data-test-storeknoxInventoryDetails-monitoringDisabledWithNoResultsOff]'
        )
        .hasText(t('storeknox.monitoringDisabledWithNoResults'));

      assert
        .dom(
          '[data-test-storeknoxInventoryDetails-monitoringResultsPendingIllustration]'
        )
        .doesNotExist();
    });
  }
);
