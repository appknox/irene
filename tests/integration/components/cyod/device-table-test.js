import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl, t } from 'ember-intl/test-support';
import Service from '@ember/service';

class OrganizationStub extends Service {
  selected = { id: 42 };
}

module('Integration | Component | cyod/device-table', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en');

  hooks.beforeEach(function () {
    this.owner.register('service:organization', OrganizationStub);
  });

  test('it renders the registered devices with name, date and status', async function (assert) {
    class AjaxStub extends Service {
      request() {
        return Promise.resolve({
          results: [
            {
              id: 1,
              name: 'Pixel 7a',
              model: 'Pixel 7a',
              serial_number: 'SER1',
              platform: 0,
              is_connected: true,
              created_on: '2026-07-20T10:00:00Z',
            },
          ],
        });
      }
    }

    this.owner.register('service:ajax', AjaxStub);

    await render(hbs`<Cyod::DeviceTable />`);

    assert.dom('[data-test-cyodDeviceTable-table]').exists();
    assert.dom('[data-test-cyodDeviceTable-row]').exists({ count: 1 });
    assert.dom('[data-test-cyodDeviceTable-table]').containsText('Pixel 7a');
    assert.dom('[data-test-cyodDeviceTable-table]').containsText('20 July 2026');

    assert
      .dom('[data-test-cyodDeviceTable-statusChip]')
      .hasText(t('orgDeviceRegistrationOnline'));
  });

  test('it falls back to the serial number and a dash when name and date are absent', async function (assert) {
    class AjaxStub extends Service {
      request() {
        return Promise.resolve({
          results: [
            {
              id: 2,
              name: '',
              model: '',
              serial_number: 'SER-NO-NAME',
              platform: 0,
              is_connected: false,
            },
          ],
        });
      }
    }

    this.owner.register('service:ajax', AjaxStub);

    await render(hbs`<Cyod::DeviceTable />`);

    assert
      .dom('[data-test-cyodDeviceTable-table]')
      .containsText('SER-NO-NAME', 'falls back to the serial number');

    assert
      .dom('[data-test-cyodDeviceTable-statusChip]')
      .hasText(t('orgDeviceRegistrationOffline'));
  });

  test('@onlyConnected keeps just the online devices', async function (assert) {
    class AjaxStub extends Service {
      request() {
        return Promise.resolve({
          results: [
            {
              id: 1,
              name: 'Pixel 7a',
              serial_number: 'SER1',
              platform: 0,
              is_connected: true,
            },
            {
              id: 2,
              name: 'iPhone 12',
              serial_number: 'SER2',
              platform: 1,
              is_connected: false,
            },
          ],
        });
      }
    }

    this.owner.register('service:ajax', AjaxStub);

    // The org view shows the full inventory, online and offline alike.
    await render(hbs`<Cyod::DeviceTable />`);

    assert.dom('[data-test-cyodDeviceTable-row]').exists({ count: 2 });

    // "Your connected device" only lists what is actually reachable.
    await render(hbs`<Cyod::DeviceTable @onlyConnected={{true}} />`);

    assert.dom('[data-test-cyodDeviceTable-row]').exists({ count: 1 });
    assert.dom('[data-test-cyodDeviceTable-table]').containsText('Pixel 7a');

    assert
      .dom('[data-test-cyodDeviceTable-table]')
      .doesNotContainText('iPhone 12');
  });

  test('@onlyConnected falls back to the empty state when every device is offline', async function (assert) {
    class AjaxStub extends Service {
      request() {
        return Promise.resolve({
          results: [
            {
              id: 2,
              name: 'iPhone 12',
              serial_number: 'SER2',
              platform: 1,
              is_connected: false,
            },
          ],
        });
      }
    }

    this.owner.register('service:ajax', AjaxStub);

    await render(hbs`<Cyod::DeviceTable @onlyConnected={{true}} />`);

    assert.dom('[data-test-cyodDeviceTable-empty]').exists();
    assert.dom('[data-test-cyodDeviceTable-table]').doesNotExist();
  });

  test('it shows the empty state when the org has no devices', async function (assert) {
    class AjaxStub extends Service {
      request() {
        return Promise.resolve({ results: [] });
      }
    }

    this.owner.register('service:ajax', AjaxStub);

    await render(hbs`<Cyod::DeviceTable @emptyHint='Register one first' />`);

    assert.dom('[data-test-cyodDeviceTable-empty]').exists();
    assert.dom('[data-test-cyodDeviceTable-empty]').containsText(
      t('cyodDeviceTable.emptyTitle')
    );

    assert
      .dom('[data-test-cyodDeviceTable-empty]')
      .containsText('Register one first');

    assert.dom('[data-test-cyodDeviceTable-table]').doesNotExist();
  });

  test('it distinguishes an unconfigured device farm (400) from an empty list', async function (assert) {
    class AjaxStub extends Service {
      request() {
        return Promise.reject({ status: 400 });
      }
    }

    this.owner.register('service:ajax', AjaxStub);

    await render(hbs`<Cyod::DeviceTable />`);

    assert.dom('[data-test-cyodDeviceTable-notConfigured]').exists();
    assert.dom('[data-test-cyodDeviceTable-empty]').doesNotExist();
  });

  test('it renders a header with a refresh button only when a heading is given', async function (assert) {
    class AjaxStub extends Service {
      request() {
        return Promise.resolve({ results: [] });
      }
    }

    this.owner.register('service:ajax', AjaxStub);

    await render(hbs`<Cyod::DeviceTable />`);

    assert.dom('[data-test-cyodDeviceTable-refreshBtn]').doesNotExist();

    await render(hbs`<Cyod::DeviceTable @heading='Your connected device' />`);

    assert
      .dom('[data-test-cyodDeviceTable-heading]')
      .hasText('Your connected device');

    assert.dom('[data-test-cyodDeviceTable-refreshBtn]').exists();
  });
});
