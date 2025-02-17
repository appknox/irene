import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';
import { render } from '@ember/test-helpers';

module(
  'Integration | Component | storeknox/inventory-details/unscanned-version/table/store-version',

  function (hooks) {
    setupRenderingTest(hooks);
    setupIntl(hooks, 'en');
    setupMirage(hooks);

    test('it renders', async function (assert) {
      const store = this.owner.lookup('service:store');
      const skAppVersion = this.server.create('sk-app-version');

      this.skAppVersionRecord = store.push(
        store.normalize('sk-app-version', skAppVersion.toJSON())
      );

      await render(
        hbs`<Storeknox::InventoryDetails::UnscannedVersion::Table::StoreVersion @skAppVersion={{this.skAppVersionRecord}} />`
      );

      assert
        .dom(
          '[data-test-storeknoxInventoryDetails-unscannedVersionTable-storeVersion]'
        )
        .exists()
        .containsText(this.skAppVersionRecord.get('version'));
    });
  }
);
