import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';
import { render } from '@ember/test-helpers';

import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';

dayjs.extend(advancedFormat);

module(
  'Integration | Component | storeknox/inventory-details/unscanned-version/table/date-found',

  function (hooks) {
    setupRenderingTest(hooks);
    setupIntl(hooks, 'en');
    setupMirage(hooks);

    test('it renders', async function (assert) {
      const store = this.owner.lookup('service:store');

      const skStoreInstances = this.server
        .createList('sk-store-instance', 5)
        .map((_) => _.attrs);

      const skAppVersion = this.server.create('sk-app-version', {
        sk_store_instances: skStoreInstances,
      });

      this.skAppVersionRecord = store.push(
        store.normalize('sk-app-version', skAppVersion.toJSON())
      );

      await render(
        hbs`<Storeknox::InventoryDetails::UnscannedVersion::Table::DateFound @skAppVersion={{this.skAppVersionRecord}} />`
      );

      assert
        .dom(
          '[data-test-storeknoxInventoryDetails-unscannedVersionTable-dateFound]'
        )
        .hasText(
          dayjs(this.skAppVersionRecord.get('createdOn')).format('Do MMM YYYY')
        );
    });
  }
);
