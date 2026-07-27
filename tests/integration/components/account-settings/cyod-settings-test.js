import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl, t } from 'ember-intl/test-support';
import Service from '@ember/service';

function organizationStub({ registrationEnabled = true } = {}) {
  return class OrganizationStub extends Service {
    selected = { id: 42 };
    isCyodEnabled = true;
    isCyodRegistrationEnabled = registrationEnabled;
  };
}

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
  'Integration | Component | account-settings/cyod-settings',
  function (hooks) {
    setupRenderingTest(hooks);
    setupIntl(hooks, 'en');

    hooks.beforeEach(function () {
      this.owner.register('service:notifications', NotificationsStub);
      this.owner.register('service:ajax', EmptyAjaxStub);
    });

    test('it renders the registration section and the connected-device table', async function (assert) {
      this.owner.register('service:organization', organizationStub());

      await render(hbs`<AccountSettings::CyodSettings />`);

      assert
        .dom('[data-test-cyodSettings-registerTitle]')
        .hasText(t('cyodSettings.deviceRegistration'));

      assert.dom('[data-test-cyodSettings-registerBtn]').isNotDisabled();

      assert
        .dom('[data-test-cyodDeviceTable-heading]')
        .hasText(t('cyodSettings.connectedDevice'));
    });

    test('it disables registration when the org owner turned the switch off', async function (assert) {
      this.owner.register(
        'service:organization',
        organizationStub({ registrationEnabled: false })
      );

      await render(hbs`<AccountSettings::CyodSettings />`);

      assert.dom('[data-test-cyodSettings-registerBtn]').isDisabled();
      assert.dom('[data-test-cyodSettings-disabled]').exists();
    });

    test('it opens the five-step Mercer setup modal', async function (assert) {
      this.owner.register('service:organization', organizationStub());

      await render(hbs`<AccountSettings::CyodSettings />`);

      assert.dom('[data-test-cyodSettings-modal]').doesNotExist();

      await click('[data-test-cyodSettings-registerBtn]');

      assert.dom('[data-test-cyodSettings-modal]').exists();
      assert.dom('[data-test-cyodSettings-downloadBtn]').exists();
      assert.dom('[data-test-cyodSettings-serverUrl]').exists();
      assert.dom('[data-test-cyodSettings-copyBtn]').exists();

      assert
        .dom('[data-test-cyodSettings-modal]')
        .containsText(t('cyodSettings.stepRun'), 'renders the final step');
    });
  }
);
