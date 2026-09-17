import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import {
  click,
  find,
  findAll,
  render,
  waitFor,
  waitUntil,
} from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import Service from '@ember/service';
import dayjs from 'dayjs';
import { Response } from 'miragejs';

// ─── Stubs ─────────────────────────────────────────────────────────────────────
class LoggerStub extends Service {
  errors = [];

  error(...args) {
    this.errors.push(args);
  }
}

// ─── Selectors ─────────────────────────────────────────────────────────────────
const selectors = {
  root: '[data-test-cyodDeviceTable]',
  table: '[data-test-cyodDeviceTable-table]',
  row: '[data-test-cyodDeviceTable-row]',
  cell: '[data-test-cyodDeviceTable-cell]',
  thead: '[data-test-cyodDeviceTable-thead]',
  statusChip: '[data-test-cyodDeviceTable-statusChip]',
  heading: '[data-test-cyodDeviceTable-heading]',
  refreshBtn: '[data-test-cyodDeviceTable-refreshBtn]',
  loading: '[data-test-cyodDeviceTable-loading]',
  empty: '[data-test-cyodDeviceTable-empty]',
  emptySvg: '[data-test-cyodDeviceTable-emptySvg]',
  emptyTitle: '[data-test-cyodDeviceTable-emptyTitle]',
  emptyDescription: '[data-test-cyodDeviceTable-emptyDescription]',
  notConfigured: '[data-test-cyodDeviceTable-notConfigured]',
};

// ─── Templates ─────────────────────────────────────────────────────────────────
const BARE = hbs`<Cyod::DeviceTable />`;
const ONLY_CONNECTED = hbs`<Cyod::DeviceTable @onlyConnected={{true}} />`;
const WITH_HEADING = hbs`<Cyod::DeviceTable
  @heading='Your connected device'
  @subheading='Registered through Mercer'
/>`;
const WITH_EMPTY_HINT = hbs`<Cyod::DeviceTable @emptyHint='Register one first' />`;

module('Integration | Component | cyod/device-table', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en');
  setupMirage(hooks);

  hooks.beforeEach(function () {
    this.owner.register('service:logger', LoggerStub);

    const organization = this.server.create('organization');

    class OrganizationStub extends Service {
      selected = organization;
    }

    this.owner.register('service:organization', OrganizationStub);

    this.setProperties({
      organization,
      logger: this.owner.lookup('service:logger'),
    });
  });

  // ─── Rendering ───────────────────────────────────────────────────────────────

  test('it renders the registered devices with name, date and status', async function (assert) {
    const device = this.server.create('organization-cyod-registered-device');

    await render(BARE);

    assert.dom(selectors.row).exists({ count: 1 });
    assert.dom(selectors.thead).containsText(t('cyod.deviceTable.name'));
    assert
      .dom(selectors.thead)
      .containsText(t('cyod.deviceTable.registeredOn'));
    assert.dom(selectors.thead).containsText(t('cyod.deviceTable.status'));

    const row = find(selectors.row);

    assert.dom(row).containsText(device.name);

    assert
      .dom(row)
      .containsText(dayjs(device.created_on).format('D MMMM YYYY'));

    assert
      .dom(selectors.statusChip, row)
      .hasText(t('cyod.deviceRegistration.online'));
  });

  test('it renders every device the org has registered', async function (assert) {
    const devices = this.server.createList(
      'organization-cyod-registered-device',
      3
    );

    await render(BARE);

    const rows = findAll(selectors.row);

    assert.strictEqual(rows.length, devices.length);

    devices.forEach((device, index) => {
      assert.dom(rows[index]).containsText(device.name);

      assert
        .dom(rows[index])
        .containsText(dayjs(device.created_on).format('D MMMM YYYY'));

      assert
        .dom(selectors.statusChip, rows[index])
        .hasText(t('cyod.deviceRegistration.online'));
    });
  });

  test('it falls back to the serial number and a dash when name and date are absent', async function (assert) {
    const device = this.server.create(
      'organization-cyod-registered-device',
      'withoutName',
      'withOfflineStatus',
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

  test('it prefers the name, then the model, then the serial number', async function (assert) {
    this.server.create('organization-cyod-registered-device', 'withoutName', {
      model: 'Pixel 8 Pro',
    });

    await render(BARE);

    assert
      .dom(selectors.row)
      .containsText('Pixel 8 Pro', 'falls back to the model before the serial');
  });

  // ─── Filtering ───────────────────────────────────────────────────────────────

  test('@onlyConnected keeps just the online devices', async function (assert) {
    const online = this.server.create('organization-cyod-registered-device');
    const offline = this.server.create(
      'organization-cyod-registered-device',
      'withOfflineStatus',
      'withIosPlatform'
    );

    await render(BARE);

    assert.dom(selectors.row).exists({ count: 2 });

    await render(ONLY_CONNECTED);

    assert.dom(selectors.row).exists({ count: 1 });
    assert.dom(selectors.table).containsText(online.name);
    assert.dom(selectors.table).doesNotContainText(offline.serial_number);
  });

  test('@onlyConnected falls back to the empty state when every device is offline', async function (assert) {
    this.server.create(
      'organization-cyod-registered-device',
      'withOfflineStatus'
    );

    await render(ONLY_CONNECTED);

    assert.dom(selectors.empty).exists();
    assert.dom(selectors.table).doesNotExist();
  });

  // ─── Header ──────────────────────────────────────────────────────────────────

  test('it renders a header with a refresh button only when a heading is given', async function (assert) {
    await render(BARE);

    assert.dom(selectors.refreshBtn).doesNotExist();
    assert.dom(selectors.heading).doesNotExist();

    await render(WITH_HEADING);

    assert.dom(selectors.heading).hasText('Your connected device');
    assert.dom(selectors.root).containsText('Registered through Mercer');
    assert.dom(selectors.refreshBtn).exists();
  });

  test('the refresh button reloads the list', async function (assert) {
    assert.expect(3);

    this.server.create('organization-cyod-registered-device');

    let requests = 0;

    this.server.get('/organizations/:id/registered-devices', (schema) => {
      requests += 1;

      const results = schema.organizationCyodRegisteredDevices
        .all()
        .models.map((device) => device.toJSON());

      return { count: results.length, next: null, previous: null, results };
    });

    await render(WITH_HEADING);

    assert.strictEqual(requests, 1, 'loads once on render');

    this.server.create('organization-cyod-registered-device');

    await click(selectors.refreshBtn);

    assert.strictEqual(requests, 2, 'refetches on click');
    assert.dom(selectors.row).exists({ count: 2 });
  });

  // ─── Empty and error states ──────────────────────────────────────────────────

  test('it shows the empty state when the org has no devices', async function (assert) {
    await render(WITH_EMPTY_HINT);

    assert.dom(selectors.emptyTitle).hasText(t('cyod.deviceTable.emptyTitle'));
    assert.dom(selectors.emptyDescription).hasText('Register one first');
    assert.dom(selectors.emptySvg).exists();
    assert.dom(selectors.table).doesNotExist();
  });

  test('it distinguishes an unconfigured device farm (400) from an empty list', async function (assert) {
    this.server.get(
      '/organizations/:id/registered-devices',
      () => ({ detail: 'Device farm is not configured' }),
      400
    );

    await render(BARE);

    assert
      .dom(selectors.notConfigured)
      .hasText(t('cyod.deviceRegistration.notConfigured'));

    assert.dom(selectors.empty).doesNotExist();
    assert.dom(selectors.table).doesNotExist();

    assert.strictEqual(
      this.logger.errors.length,
      0,
      'an unconfigured farm is an expected state, not an error to log'
    );
  });

  test('any other failure falls back to the empty state and is logged', async function (assert) {
    this.server.get(
      '/organizations/:id/registered-devices',
      () => new Response(500)
    );

    await render(BARE);

    assert.dom(selectors.empty).exists();
    assert.dom(selectors.notConfigured).doesNotExist();
    assert.dom(selectors.table).doesNotExist();

    assert.strictEqual(this.logger.errors.length, 1, 'logs the failure');
  });

  test('it shows a loader while the devices are being fetched', async function (assert) {
    this.server.create('organization-cyod-registered-device');

    this.server.get(
      '/organizations/:id/registered-devices',
      (schema) => {
        const results = schema.organizationCyodRegisteredDevices
          .all()
          .models.map((device) => device.toJSON());

        return { count: results.length, next: null, previous: null, results };
      },
      { timing: 150 }
    );

    render(BARE);

    await waitFor(selectors.loading, { timeout: 500 });

    assert.dom(selectors.loading).containsText(t('loading'));
    assert.dom(selectors.table).doesNotExist();

    await waitUntil(() => !find(selectors.loading), { timeout: 1000 });

    assert.dom(selectors.loading).doesNotExist();
    assert.dom(selectors.row).exists({ count: 1 });
  });

  test('it renders nothing to load without a selected organization', async function (assert) {
    class NoOrganizationStub extends Service {
      selected = null;
    }

    this.owner.unregister('service:organization');
    this.owner.register('service:organization', NoOrganizationStub);

    await render(BARE);

    assert.dom(selectors.empty).exists();
    assert.dom(selectors.table).doesNotExist();
  });
});
