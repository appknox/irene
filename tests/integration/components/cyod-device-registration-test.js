import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl } from 'ember-intl/test-support';
import Service from '@ember/service';

import ENUMS from 'irene/enums';

class OrganizationStub extends Service {
  cyodEnabled = false;

  get isCyodEnabled() {
    return this.cyodEnabled;
  }
}

module('Integration | Component | cyod-device-registration', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en');

  hooks.beforeEach(function () {
    this.owner.register('service:organization', OrganizationStub);
    this.orgStub = this.owner.lookup('service:organization');
    this.set('platform', ENUMS.PLATFORM.ANDROID);
    this.set('onDeviceRegistered', () => {});
  });

  test('it gates the wizard behind the cyod feature flag', async function (assert) {
    this.orgStub.cyodEnabled = false;

    await render(hbs`
        <CyodDeviceRegistration
          @platform={{this.platform}}
          @onDeviceRegistered={{this.onDeviceRegistered}}
        />
      `);

    assert
      .dom('[data-test-cyodRegistration-notEnabled]')
      .exists('shows the not-enabled notice when cyod is disabled');
    assert
      .dom('[data-test-cyodRegistration-registerAndroidBtn]')
      .doesNotExist('hides the register wizard when cyod is disabled');
  });

  test('it shows the wizard when the cyod feature is enabled', async function (assert) {
    this.orgStub.cyodEnabled = true;

    await render(hbs`
        <CyodDeviceRegistration
          @platform={{this.platform}}
          @onDeviceRegistered={{this.onDeviceRegistered}}
        />
      `);

    assert
      .dom('[data-test-cyodRegistration-notEnabled]')
      .doesNotExist('the not-enabled notice is gone when cyod is enabled');
  });
});
