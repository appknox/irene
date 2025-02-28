import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';
import { find, findAll, render, triggerEvent } from '@ember/test-helpers';
import { COUNTRY_NAMES_MAP } from 'irene/utils/constants';

module(
  'Integration | Component | storeknox/inventory-details/unscanned-version/table/countries',

  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);

    test('it correct country codes with their respective names in a tooltip', async function (assert) {
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
        hbs`<Storeknox::InventoryDetails::UnscannedVersion::Table::Countries @skAppVersion={{this.skAppVersionRecord}} />`
      );

      assert
        .dom(
          '[data-test-storeknoxInventoryDetails-unscannedVersionTable-countriesCodes]'
        )
        .exists();

      const countryCodes = skStoreInstances.map((inst) => inst.country_code);

      const allRenderedCountryCodes = findAll(
        '[data-test-storeknoxInventoryDetails-unscannedVersionTable-countryCode]'
      );

      assert.strictEqual(allRenderedCountryCodes.length, countryCodes.length);

      for (let idx = 0; idx < countryCodes.length; idx++) {
        const cc = countryCodes[idx];

        const countryCodeElement = find(
          `[data-test-storeknoxInventoryDetails-unscannedVersionTable-countryCodeId='${cc}']`
        );

        assert.dom(countryCodeElement).containsText(cc);

        const countryCodeTooltip = find(
          `[data-test-storeknoxInventoryDetails-unscannedVersionTable-countryCodeTooltipId='${cc}']`
        );

        await triggerEvent(countryCodeTooltip, 'mouseenter');

        assert
          .dom('[data-test-ak-tooltip-content]')
          .exists()
          .containsText(COUNTRY_NAMES_MAP[cc]);

        await triggerEvent(countryCodeTooltip, 'mouseleave');
      }
    });

    test('it renders "-" if no country code exists in store instance', async function (assert) {
      const store = this.owner.lookup('service:store');

      const skAppVersion = this.server.create('sk-app-version', {
        sk_store_instances: [],
      });

      this.skAppVersionRecord = store.push(
        store.normalize('sk-app-version', skAppVersion.toJSON())
      );

      await render(
        hbs`<Storeknox::InventoryDetails::UnscannedVersion::Table::Countries @skAppVersion={{this.skAppVersionRecord}} />`
      );

      assert
        .dom(
          '[data-test-storeknoxInventoryDetails-unscannedVersionTable-countriesCodes]'
        )
        .exists()
        .hasText('-');
    });
  }
);
