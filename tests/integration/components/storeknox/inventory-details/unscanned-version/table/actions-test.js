import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';
import { render, triggerEvent } from '@ember/test-helpers';

module(
  'Integration | Component | storeknox/inventory-details/unscanned-version/table/actions',

  function (hooks) {
    setupRenderingTest(hooks);
    setupIntl(hooks, 'en');
    setupMirage(hooks);

    test('the upload action is disabled with the decommissioned tooltip for a decommissioned app', async function (assert) {
      const store = this.owner.lookup('service:store');
      const appMetadata = this.server.create('sk-app-metadata');

      const skApp = this.server.create('sk-inventory-app', 'decommissioned', {
        app_metadata: appMetadata,
      });

      const inventoryApp = store.push(
        store.normalize('sk-inventory-app', {
          ...skApp.toJSON(),
          app_metadata: appMetadata.toJSON(),
        })
      );

      const skAppVersion = this.server.create('sk-app-version', {
        sk_app: inventoryApp.id,
        can_initiate_upload: true,
        upload_submission: null,
        file: null,
        file_created_on: null,
      });

      this.skAppVersionRecord = store.push(
        store.normalize('sk-app-version', skAppVersion.toJSON())
      );

      await render(
        hbs`<Storeknox::InventoryDetails::UnscannedVersion::Table::Actions
              @skAppVersion={{this.skAppVersionRecord}}
              @isLoadingTableData={{false}}
            />`
      );

      assert
        .dom('[data-test-skAppVersionTable-initiateUploadBtn]')
        .isDisabled('upload stays blocked for a decommissioned app');

      await triggerEvent(
        '[data-test-skAppVersionTable-initiateUploadBtn-tooltip]',
        'mouseenter'
      );

      assert
        .dom('[data-test-skAppVersionTable-initiateUploadBtn-tooltipText]')
        .hasText(
          t('storeknox.decommissionedActionDisabled'),
          'names the decommissioned state, not the archived one'
        );
    });
  }
);
