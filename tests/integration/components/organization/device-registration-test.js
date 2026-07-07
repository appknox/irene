import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl } from 'ember-intl/test-support';
import Service from '@ember/service';

class OrganizationStub extends Service {
  selected = { id: 42 };
}

class NotificationsStub extends Service {
  success() {}
  error() {}
}

module(
  'Integration | Component | organization/device-registration',
  function (hooks) {
    setupRenderingTest(hooks);
    setupIntl(hooks, 'en');

    hooks.beforeEach(function () {
      this.owner.register('service:organization', OrganizationStub);
      this.owner.register('service:notifications', NotificationsStub);
    });

    test('it shows the not-configured message on a 400 (no devicefarm token)', async function (assert) {
      class AjaxStub extends Service {
        request() {
          return Promise.reject({ status: 400 });
        }
      }
      this.owner.register('service:ajax', AjaxStub);

      await render(hbs`<Organization::DeviceRegistration />`);
      await click('[data-test-orgDeviceRegistration-openBtn]');

      assert
        .dom('[data-test-orgDeviceRegistration-notConfigured]')
        .exists('shows the not-configured message');
      // The Mercer setup + empty state are dead ends when not configured.
      assert.dom('[data-test-orgDeviceRegistration-setup]').doesNotExist();
      assert.dom('[data-test-orgDeviceRegistration-empty]').doesNotExist();
    });

    test('it shows the empty state (not the not-configured message) when configured with no devices', async function (assert) {
      class AjaxStub extends Service {
        request() {
          return Promise.resolve({ results: [] });
        }
      }
      this.owner.register('service:ajax', AjaxStub);

      await render(hbs`<Organization::DeviceRegistration />`);
      await click('[data-test-orgDeviceRegistration-openBtn]');

      assert.dom('[data-test-orgDeviceRegistration-empty]').exists();
      assert
        .dom('[data-test-orgDeviceRegistration-notConfigured]')
        .doesNotExist();
      assert
        .dom('[data-test-orgDeviceRegistration-setup]')
        .exists('shows the Mercer setup when configured');
      assert
        .dom('[data-test-orgDeviceRegistration-downloadBtn]')
        .exists('shows the download button');
    });
  }
);
