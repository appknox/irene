import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';

// ─── Selectors ─────────────────────────────────────────────────────────────────
const selectors = {
  chip: '[data-test-cyodDeviceTable-statusChip]',
};

// ─── Templates ─────────────────────────────────────────────────────────────────
const TEMPLATE = hbs`<Cyod::DeviceTable::Status @device={{this.device}} />`;

module('Integration | Component | cyod/device-table/status', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en');
  setupMirage(hooks);

  hooks.beforeEach(function () {
    const store = this.owner.lookup('service:store');

    this.pushDevice = (...traits) => {
      const record = this.server.create(
        'organization-cyod-registered-device',
        ...traits
      );

      return store.push(
        store.normalize('organization-cyod-registered-device', record.toJSON())
      );
    };
  });

  // ─── Rendering ─────────────────────────────────────────────────────────────

  test('it renders the online chip for a connected device', async function (assert) {
    this.set('device', this.pushDevice());

    await render(TEMPLATE);

    assert.dom(selectors.chip).hasText(t('cyod.deviceRegistration.online'));
  });

  test('it renders the offline chip for a disconnected device', async function (assert) {
    this.set('device', this.pushDevice('withOfflineStatus'));

    await render(TEMPLATE);

    assert.dom(selectors.chip).hasText(t('cyod.deviceRegistration.offline'));
  });

  test('the chip reflects a device that reconnects', async function (assert) {
    const device = this.pushDevice('withOfflineStatus');

    this.set('device', device);

    await render(TEMPLATE);

    assert.dom(selectors.chip).hasText(t('cyod.deviceRegistration.offline'));

    device.isConnected = true;
    await render(TEMPLATE);

    assert
      .dom(selectors.chip)
      .hasText(
        t('cyod.deviceRegistration.online'),
        'the chip tracks the record rather than a snapshot'
      );
  });
});
