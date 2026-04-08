import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';
import { render } from '@ember/test-helpers';
import Service from '@ember/service';

import ENUMS from 'irene/enums';

class SkOrganizationStub extends Service {
  selected = {
    skFeatures: {
      fake_app_detection: true,
    },
  };
}

module(
  'Integration | Component | storeknox/inventory-details/app-details',
  function (hooks) {
    setupRenderingTest(hooks);
    setupIntl(hooks, 'en');
    setupMirage(hooks);

    hooks.beforeEach(async function () {
      this.owner.register('service:sk-organization', SkOrganizationStub);

      const store = this.owner.lookup('service:store');

      // Create organization
      const organization = this.server.create('organization');

      // Load organization
      await this.owner.lookup('service:organization').load();

      // Create organization me
      this.server.create('organization-me', { id: organization.id });

      // Create sk app metadata
      const appMetadata = this.server.create('sk-app-metadata');

      this.createInventoryApp = (attrs = {}) => {
        const skApp = this.server.create('sk-inventory-app', {
          app_metadata: appMetadata,
          ...attrs,
        });

        return store.push(
          store.normalize('sk-inventory-app', {
            ...skApp.toJSON(),
            app_metadata: appMetadata.toJSON(),
          })
        );
      };

      // Server mocks
      this.server.get('/organizations/:id/me', (schema, req) =>
        schema.organizationMes.find(`${req.params.id}`)?.toJSON()
      );
    });

    // --- showMonitoringPendingInfo ---

    // When fake_app_detection is disabled, only store monitoring pending matters
    test.each(
      'it shows the pending UI when fake_app_detection is off and store monitoring is initializing (regardless of fake app state)',
      [
        {
          label: 'store initializing, fake app also initializing',
          attrs: {
            store_monitoring_status:
              ENUMS.SK_APP_MONITORING_STATUS.INITIALIZING,
            fake_app_detection_status:
              ENUMS.SK_FAKE_APP_DETECTION_STATUS.INITIALIZING,
          },
        },
        {
          label: 'store initializing, fake app not initializing',
          attrs: {
            store_monitoring_status:
              ENUMS.SK_APP_MONITORING_STATUS.INITIALIZING,
            fake_app_detection_status:
              ENUMS.SK_FAKE_APP_DETECTION_STATUS.NO_RESULTS,
          },
        },
      ],
      async function (assert, { label, attrs }) {
        const skOrg = this.owner.lookup('service:sk-organization');
        skOrg.selected = { skFeatures: { fake_app_detection: false } };

        this.set(
          'skInventoryApp',
          this.createInventoryApp({ monitoring_enabled: true, ...attrs })
        );

        await render(hbs`
          <Storeknox::InventoryDetails::AppDetails
            @skInventoryApp={{this.skInventoryApp}}
          />
        `);

        assert
          .dom(
            '[data-test-storeknoxInventoryDetails-monitoringResultsPendingIllustration]'
          )
          .exists(`${label}: pending UI shown`);

        assert
          .dom('[data-test-storeknoxInventoryDetails-actionListHeaderText]')
          .doesNotExist(`${label}: action list hidden`);
      }
    );

    // When fake_app_detection is enabled, BOTH must be initializing
    test('it shows the pending UI when fake_app_detection is on and both are initializing', async function (assert) {
      this.set(
        'skInventoryApp',
        this.createInventoryApp({
          monitoring_enabled: true,
          store_monitoring_status: ENUMS.SK_APP_MONITORING_STATUS.INITIALIZING,
          fake_app_detection_status:
            ENUMS.SK_FAKE_APP_DETECTION_STATUS.INITIALIZING,
        })
      );

      await render(hbs`
        <Storeknox::InventoryDetails::AppDetails
          @skInventoryApp={{this.skInventoryApp}}
        />
      `);

      assert
        .dom(
          '[data-test-storeknoxInventoryDetails-monitoringResultsPendingIllustration]'
        )
        .exists();

      assert
        .dom('[data-test-storeknoxInventoryDetails-actionListHeaderText]')
        .doesNotExist();
    });

    test.each(
      'it shows the action list when fake_app_detection is on and only one service is initializing',
      [
        {
          label: 'only store monitoring initializing',
          attrs: {
            store_monitoring_status:
              ENUMS.SK_APP_MONITORING_STATUS.INITIALIZING,
            fake_app_detection_status:
              ENUMS.SK_FAKE_APP_DETECTION_STATUS.NO_RESULTS,
          },
        },
        {
          label: 'only fake app detection initializing',
          attrs: {
            store_monitoring_status:
              ENUMS.SK_APP_MONITORING_STATUS.NO_ACTION_NEEDED,
            fake_app_detection_status:
              ENUMS.SK_FAKE_APP_DETECTION_STATUS.INITIALIZING,
          },
        },
      ],
      async function (assert, { label, attrs }) {
        this.set(
          'skInventoryApp',
          this.createInventoryApp({ monitoring_enabled: true, ...attrs })
        );

        await render(hbs`
          <Storeknox::InventoryDetails::AppDetails
            @skInventoryApp={{this.skInventoryApp}}
          />
        `);

        assert
          .dom('[data-test-storeknoxInventoryDetails-actionListHeaderText]')
          .exists(`${label}: action list shown`);

        assert
          .dom(
            '[data-test-storeknoxInventoryDetails-monitoringResultsPendingIllustration]'
          )
          .doesNotExist(`${label}: pending UI hidden`);
      }
    );

    // --- showMonitoringPendingOrDisabledInfo: disabled state ---

    // When fake_app_detection is off: disabled UI shown if !monitoringEnabled && !hasStoreMonitoringData
    // (hasFakeAppDetectionData is irrelevant)
    test.each(
      'it shows the disabled UI when fake_app_detection is off based only on store monitoring data',
      [
        {
          label: 'no store data, no fake app data → disabled UI',
          attrs: {
            has_store_monitoring_data: false,
            has_fake_app_detection_data: false,
          },
          expectDisabledUi: true,
        },
        {
          label:
            'no store data but has fake app data → still shows disabled UI (fake app data ignored)',
          attrs: {
            has_store_monitoring_data: false,
            has_fake_app_detection_data: true,
          },
          expectDisabledUi: true,
        },
        {
          label: 'has store data → action list shown',
          attrs: {
            has_store_monitoring_data: true,
            has_fake_app_detection_data: false,
          },
          expectDisabledUi: false,
        },
      ],
      async function (assert, { label, attrs, expectDisabledUi }) {
        const skOrg = this.owner.lookup('service:sk-organization');
        skOrg.selected = { skFeatures: { fake_app_detection: false } };

        this.set(
          'skInventoryApp',
          this.createInventoryApp({
            monitoring_enabled: false,
            store_monitoring_status: ENUMS.SK_APP_MONITORING_STATUS.DISABLED,
            fake_app_detection_status:
              ENUMS.SK_FAKE_APP_DETECTION_STATUS.DISABLED,
            ...attrs,
          })
        );

        await render(hbs`
          <Storeknox::InventoryDetails::AppDetails
            @skInventoryApp={{this.skInventoryApp}}
          />
        `);

        if (expectDisabledUi) {
          assert
            .dom(
              '[data-test-storeknoxInventoryDetails-monitoringDisabledWithNoResultsIllustration]'
            )
            .exists(`${label}`);

          assert
            .dom('[data-test-storeknoxInventoryDetails-actionListHeaderText]')
            .doesNotExist(`${label}`);
        } else {
          assert
            .dom('[data-test-storeknoxInventoryDetails-actionListHeaderText]')
            .exists(`${label}`);

          assert
            .dom(
              '[data-test-storeknoxInventoryDetails-monitoringDisabledWithNoResultsIllustration]'
            )
            .doesNotExist(`${label}`);
        }
      }
    );

    // When fake_app_detection is on: disabled UI shown only if BOTH data fields are absent
    test.each(
      'it shows the disabled UI when fake_app_detection is on only when both data fields are absent',
      [
        {
          label: 'no store data, no fake app data → disabled UI',
          attrs: {
            has_store_monitoring_data: false,
            has_fake_app_detection_data: false,
          },
          expectDisabledUi: true,
        },
        {
          label:
            'no store data but has fake app data → action list (has prior data)',
          attrs: {
            has_store_monitoring_data: false,
            has_fake_app_detection_data: true,
          },
          expectDisabledUi: false,
        },
        {
          label:
            'has store data, no fake app data → action list (has prior data)',
          attrs: {
            has_store_monitoring_data: true,
            has_fake_app_detection_data: false,
          },
          expectDisabledUi: false,
        },
      ],
      async function (assert, { label, attrs, expectDisabledUi }) {
        this.set(
          'skInventoryApp',
          this.createInventoryApp({
            monitoring_enabled: false,
            store_monitoring_status: ENUMS.SK_APP_MONITORING_STATUS.DISABLED,
            fake_app_detection_status:
              ENUMS.SK_FAKE_APP_DETECTION_STATUS.DISABLED,
            ...attrs,
          })
        );

        await render(hbs`
          <Storeknox::InventoryDetails::AppDetails
            @skInventoryApp={{this.skInventoryApp}}
          />
        `);

        if (expectDisabledUi) {
          assert
            .dom(
              '[data-test-storeknoxInventoryDetails-monitoringDisabledWithNoResultsIllustration]'
            )
            .exists(`${label}`);

          assert
            .dom('[data-test-storeknoxInventoryDetails-actionListHeaderText]')
            .doesNotExist(`${label}`);
        } else {
          assert
            .dom('[data-test-storeknoxInventoryDetails-actionListHeaderText]')
            .exists(`${label}`);

          assert
            .dom(
              '[data-test-storeknoxInventoryDetails-monitoringDisabledWithNoResultsIllustration]'
            )
            .doesNotExist(`${label}`);
        }
      }
    );
  }
);
