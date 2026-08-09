import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import Service from '@ember/service';
import dayjs from 'dayjs';

// ─── Selectors ─────────────────────────────────────────────────────────────────
const selectors = {
  table: '[data-test-cyodDeviceTable-table]',
  row: '[data-test-cyodDeviceTable-row]',
  statusChip: '[data-test-cyodDeviceTable-statusChip]',
  heading: '[data-test-cyodDeviceTable-heading]',
  refreshBtn: '[data-test-cyodDeviceTable-refreshBtn]',
  empty: '[data-test-cyodDeviceTable-empty]',
  emptyTitle: '[data-test-cyodDeviceTable-emptyTitle]',
  emptyDescription: '[data-test-cyodDeviceTable-emptyDescription]',
  notConfigured: '[data-test-cyodDeviceTable-notConfigured]',
};

// ─── Templates ─────────────────────────────────────────────────────────────────
const BARE = hbs`<Cyod::DeviceTable />`;
const ONLY_CONNECTED = hbs`<Cyod::DeviceTable @onlyConnected={{true}} />`;

module('Integration | Component | cyod/device-table', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en');
  setupMirage(hooks);

  hooks.beforeEach(function () {
    const organization = this.server.create('organization');

    class OrganizationStub extends Service {
      selected = organization;
    }

    this.owner.register('service:organization', OrganizationStub);
    this.organization = organization;
  });

  test('it renders the registered devices with name, date and status', async function (assert) {
    const device = this.server.create('registered-device');

    await render(BARE);

    assert.dom(selectors.table).exists();
    assert.dom(selectors.row).exists({ count: 1 });
    assert.dom(selectors.table).containsText(device.name);

    assert
      .dom(selectors.table)
      .containsText(dayjs(device.created_on).format('D MMMM YYYY'));

    const chip = this.element.querySelector(selectors.statusChip);

    assert.dom(chip).hasText(t('cyod.deviceRegistration.online'));

    // The chip centres via the column's textAlign, which ember-table turns
    // into a class on the cell — the chip itself is inline-flex.
    assert
      .dom(chip.closest('td'))
      .hasClass(
        'ember-table__text-align-center',
        'status column is centre-aligned'
      );
  });

  test('it falls back to the serial number and a dash when name and date are absent', async function (assert) {
    const device = this.server.create(
      'registered-device',
      'unnamed',
      'offline',
      {
        model: '',
        created_on: null,
      }
    );

    await render(BARE);

    assert
      .dom(selectors.table)
      .containsText(device.serial_number, 'falls back to the serial number');

    assert.dom(selectors.table).containsText('-', 'no date renders as a dash');

    assert
      .dom(selectors.statusChip)
      .hasText(t('cyod.deviceRegistration.offline'));
  });

  test('@onlyConnected keeps just the online devices', async function (assert) {
    const online = this.server.create('registered-device');
    const offline = this.server.create('registered-device', 'offline', 'ios');

    // The org view shows the full inventory, online and offline alike.
    await render(BARE);

    assert.dom(selectors.row).exists({ count: 2 });

    // "Your connected device" only lists what is actually reachable.
    await render(ONLY_CONNECTED);

    assert.dom(selectors.row).exists({ count: 1 });
    assert.dom(selectors.table).containsText(online.name);
    assert.dom(selectors.table).doesNotContainText(offline.serial_number);
  });

  test('@onlyConnected falls back to the empty state when every device is offline', async function (assert) {
    this.server.create('registered-device', 'offline');

    await render(ONLY_CONNECTED);

    assert.dom(selectors.empty).exists();
    assert.dom(selectors.table).doesNotExist();
  });

  test('it shows the empty state when the org has no devices', async function (assert) {
    await render(hbs`<Cyod::DeviceTable @emptyHint='Register one first' />`);

    assert.dom(selectors.empty).exists();
    assert.dom(selectors.empty).containsText(t('cyod.deviceTable.emptyTitle'));
    assert.dom(selectors.empty).containsText('Register one first');
    assert.dom(selectors.table).doesNotExist();
    assert.dom(selectors.emptyTitle).hasText(t('cyod.deviceTable.emptyTitle'));
  });

  test('it distinguishes an unconfigured device farm (400) from an empty list', async function (assert) {
    this.server.get(
      '/organizations/:id/registered-devices',
      () => ({
        errors: [{ status: 400 }],
      }),
      400
    );

    await render(BARE);

    assert.dom(selectors.notConfigured).exists();
    assert.dom(selectors.empty).doesNotExist();
  });

  test('it renders a header with a refresh button only when a heading is given', async function (assert) {
    await render(BARE);

    assert.dom(selectors.refreshBtn).doesNotExist();

    await render(hbs`<Cyod::DeviceTable @heading='Your connected device' />`);

    assert.dom(selectors.heading).hasText('Your connected device');
    assert.dom(selectors.refreshBtn).exists();
  });
});
