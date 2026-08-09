import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

import ENUMS from 'irene/enums';

const selectors = {
  badge: '[data-test-fileDetails-dynamicScanDrawer-devicePrefTable-cyodBadge]',
  label: '[data-test-ak-typography]',
};

const TEMPLATE = hbs`<FileDetails::DynamicScan::Action::Drawer::DevicePrefTable::Type
  @deviceProps={{this.device}}
/>`;

module(
  'Integration | Component | file-details/dynamic-scan/action/drawer/device-pref-table/type',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en');

    /**
     * The component takes an `available-manual-device`, so the record has to come
     * through the store for `registrationSource` to be deserialized from the
     * factory's `registration_source`.
     */
    function pushDevice(context, ...traits) {
      const store = context.owner.lookup('service:store');

      const device = store.push(
        store.normalize(
          'available-manual-device',
          context.server.create('available-manual-device', ...traits).toJSON()
        )
      );

      context.set('device', device);

      return device;
    }

    test('a farm device gets no CYOD badge', async function (assert) {
      const device = pushDevice(this);

      assert.strictEqual(
        device.registrationSource,
        ENUMS.DEVICE_REGISTRATION_SOURCE.FARM,
        'the factory default is a farm-owned device'
      );

      await render(TEMPLATE);

      assert.dom(selectors.badge).doesNotExist();
    });

    test('a device with no registration source gets no CYOD badge', async function (assert) {
      // Older device payloads omit the field entirely. Matching "not FARM" would
      // badge every one of them, which is what this guards.
      const device = pushDevice(this, { registration_source: undefined });

      assert.strictEqual(
        device.registrationSource,
        undefined,
        'the attribute stays undefined rather than defaulting'
      );

      await render(TEMPLATE);

      assert
        .dom(selectors.badge)
        .doesNotExist('an unknown source is not assumed to be CYOD');
    });

    test('both CYOD enrolment routes get the badge', async function (assert) {
      pushDevice(this, 'proxyCyod');

      await render(TEMPLATE);

      assert
        .dom(selectors.badge)
        .exists('a device enrolled through the Mercer proxy is CYOD');

      pushDevice(this, 'webusbCyod');

      await render(TEMPLATE);

      assert
        .dom(selectors.badge)
        .exists('so is one enrolled over WebUSB — they share one badge');
    });

    test('it renders the device type alongside the badge', async function (assert) {
      pushDevice(this, 'proxyCyod', { is_tablet: false });

      await render(TEMPLATE);

      assert
        .dom(selectors.label)
        .hasText(
          t('phone'),
          'the badge sits beside the type, it does not replace it'
        );
    });
  }
);
