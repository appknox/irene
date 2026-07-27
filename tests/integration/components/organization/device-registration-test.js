import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl, t } from 'ember-intl/test-support';
import Service from '@ember/service';

function organizationStub({ registrationEnabled = true } = {}) {
  return class OrganizationStub extends Service {
    selected = {
      id: 42,
      cyodRegistrationEnabled: registrationEnabled,
      set(key, value) {
        this[key] = value;
      },
      save() {
        return Promise.resolve();
      },
    };
  };
}

// AkToggle puts the test attribute on the wrapping <span> and renders the real
// checkbox inside it, so assertions and clicks have to target the input.
const TOGGLE_INPUT = '[data-test-orgDeviceRegistration-toggle] input';

class NotificationsStub extends Service {
  success() {}
  error() {}
}

class EmptyAjaxStub extends Service {
  request() {
    return Promise.resolve({ results: [] });
  }
}

module(
  'Integration | Component | organization/device-registration',
  function (hooks) {
    setupRenderingTest(hooks);
    setupIntl(hooks, 'en');

    hooks.beforeEach(function () {
      this.owner.register('service:notifications', NotificationsStub);
      this.owner.register('service:ajax', EmptyAjaxStub);
    });

    test('it renders the CYOD registration switch turned on', async function (assert) {
      this.owner.register('service:organization', organizationStub());

      await render(hbs`<Organization::DeviceRegistration />`);

      assert
        .dom('[data-test-orgDeviceRegistration-title]')
        .hasText(t('cyodRegistration.title'));

      assert.dom(TOGGLE_INPUT).isChecked();
    });

    test('it hides the device table when the switch is off', async function (assert) {
      this.owner.register(
        'service:organization',
        organizationStub({ registrationEnabled: false })
      );

      await render(hbs`<Organization::DeviceRegistration />`);

      assert.dom(TOGGLE_INPUT).isNotChecked();
      assert.dom('[data-test-cyodDeviceTable]').doesNotExist();
    });

    test('it persists the switch when toggled', async function (assert) {
      assert.expect(1);

      class OrganizationStub extends Service {
        selected = {
          id: 42,
          cyodRegistrationEnabled: true,
          set(key, value) {
            this[key] = value;
          },
          save: () => {
            assert.ok(true, 'persists the organization');

            return Promise.resolve();
          },
        };
      }

      this.owner.register('service:organization', OrganizationStub);

      await render(hbs`<Organization::DeviceRegistration />`);
      await click(TOGGLE_INPUT);
    });

    test('it links to the account CYOD settings from the empty state', async function (assert) {
      this.owner.register('service:organization', organizationStub());

      await render(hbs`<Organization::DeviceRegistration />`);

      assert.dom('[data-test-cyodDeviceTable-empty]').exists();

      assert
        .dom('[data-test-orgDeviceRegistration-goToCyodSettings]')
        .exists('points members at where they can register a device');
    });
  }
);
