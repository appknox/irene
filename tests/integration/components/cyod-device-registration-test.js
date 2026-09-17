import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, waitUntil } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import Service from '@ember/service';

import ENUMS from 'irene/enums';
import { Response } from 'miragejs';

const AGENT_URL = 'http://localhost:17392/device-info';
const DEVICEFARM_HOST = 'https://devicefarm.app.com';
const REGISTER_URL = `${DEVICEFARM_HOST}/devicefarm/v2/devices/webusb-register/`;

// ─── Stubs ─────────────────────────────────────────────────────────────────────
class NotificationsStub extends Service {
  errorMsg = null;
  successMsg = null;

  error(msg) {
    this.errorMsg = msg;
  }

  success(msg) {
    this.successMsg = msg;
  }

  setDefaultAutoClear() {}
}

class OrganizationStub extends Service {
  cyodEnabled = true;

  get isCyodEnabled() {
    return this.cyodEnabled;
  }
}

// The real devicefarm service builds the register URL, so only the host it
// reads is stubbed.
class ConfigurationStub extends Service {
  dashboardData = { devicefarmURL: '' };
  serverData = { devicefarmURL: DEVICEFARM_HOST };
}

// `isWebUsbSupported` reads `this.window.navigator`, so the browser capability
// is controlled by swapping the navigator the service hands back.
class WindowStub extends Service {
  navigator = { usb: {} };
}

class LoggerStub extends Service {
  error() {}
}

// ─── Selectors ─────────────────────────────────────────────────────────────────
const selectors = {
  root: '[data-test-cyodRegistration]',
  notEnabled: '[data-test-cyodRegistration-notEnabled]',
  detected: '[data-test-cyodRegistration-detected]',
  usbNotSupported: '[data-test-cyodRegistration-usbNotSupported]',
  unsupportedPlatform: '[data-test-cyodRegistration-unsupportedPlatform]',
  registerAndroidBtn: '[data-test-cyodRegistration-registerAndroidBtn]',
  registerIosBtn: '[data-test-cyodRegistration-registerIosBtn]',
};

// ─── Templates ─────────────────────────────────────────────────────────────────
const TEMPLATE = hbs`<CyodDeviceRegistration
  @platform={{this.platform}}
  @onDeviceRegistered={{this.onDeviceRegistered}}
/>`;

module('Integration | Component | cyod-device-registration', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en');
  setupMirage(hooks);

  hooks.beforeEach(function () {
    this.owner.register('service:notifications', NotificationsStub);
    this.owner.register('service:organization', OrganizationStub);
    this.owner.register('service:configuration', ConfigurationStub);
    this.owner.register('service:logger', LoggerStub);
    this.owner.unregister('service:browser/window');
    this.owner.register('service:browser/window', WindowStub);

    this.notify = this.owner.lookup('service:notifications');
    this.orgStub = this.owner.lookup('service:organization');
    this.windowStub = this.owner.lookup('service:browser/window');

    this.setProperties({
      platform: ENUMS.PLATFORM.ANDROID,
      registeredDevice: null,
      onDeviceRegistered: (device) => this.set('registeredDevice', device),
    });
  });

  // ─── Feature gating ──────────────────────────────────────────────────────────

  test('it shows the not-enabled notice when cyod is off', async function (assert) {
    this.orgStub.cyodEnabled = false;

    await render(TEMPLATE);

    assert.dom(selectors.notEnabled).hasText(t('cyod.notEnabled'));
    assert.dom(selectors.registerAndroidBtn).doesNotExist();
    assert.dom(selectors.registerIosBtn).doesNotExist();
  });

  // ─── Android ─────────────────────────────────────────────────────────────────

  test('it offers the android wizard when webusb is supported', async function (assert) {
    await render(TEMPLATE);

    assert.dom(selectors.notEnabled).doesNotExist();
    assert.dom(selectors.root).containsText(t('cyod.connectUsb'));

    assert
      .dom(selectors.registerAndroidBtn)
      .hasText(t('cyod.registerAndroid'))
      .isNotDisabled();

    assert.dom(selectors.registerIosBtn).doesNotExist();
  });

  test('it reports an unsupported browser instead of the android wizard', async function (assert) {
    this.windowStub.navigator = {};

    await render(TEMPLATE);

    assert.dom(selectors.usbNotSupported).hasText(t('cyod.usbNotSupported'));
    assert.dom(selectors.registerAndroidBtn).doesNotExist();
  });

  // ─── iOS ─────────────────────────────────────────────────────────────────────

  test('it offers the ios wizard for an ios file', async function (assert) {
    this.set('platform', ENUMS.PLATFORM.IOS);

    await render(TEMPLATE);

    assert.dom(selectors.root).containsText(t('cyod.connectUsb'));

    assert
      .dom(selectors.registerIosBtn)
      .hasText(t('cyod.registerIos'))
      .isNotDisabled();

    assert.dom(selectors.registerAndroidBtn).doesNotExist();
    assert.dom(selectors.usbNotSupported).doesNotExist();
  });

  test('registering an ios device shows what was detected and reports it up', async function (assert) {
    const device = this.server.create('organization-cyod-registered-device', {
      model: 'iPhone 15 Pro',
    });

    this.server.get(AGENT_URL, () => ({
      udid: device.serial_number,
      model: device.model,
      product_version: '17.4',
      cpu_architecture: 'arm64e',
    }));

    this.server.post(REGISTER_URL, () => device.toJSON());

    this.set('platform', ENUMS.PLATFORM.IOS);

    await render(TEMPLATE);

    assert.strictEqual(this.registeredDevice, null);
    assert.dom(selectors.detected).doesNotExist();

    await click(selectors.registerIosBtn);
    await waitUntil(() => this.registeredDevice, { timeout: 2000 });

    assert
      .dom(selectors.detected)
      .containsText(t('cyod.deviceDetected'))
      .containsText(device.model)
      .containsText(t('cyod.deviceDetectedOs'))
      .containsText(t('ios'))
      .containsText('17.4');

    assert.strictEqual(
      this.notify.successMsg,
      t('cyod.deviceRegistered'),
      'confirms the device was registered'
    );

    assert.strictEqual(
      this.registeredDevice.serial_number,
      device.serial_number,
      'hands the registered device to the caller'
    );

    assert.dom(selectors.registerIosBtn).doesNotExist();
  });

  test('an unreachable knoxops agent is reported as such', async function (assert) {
    this.set('platform', ENUMS.PLATFORM.IOS);

    await render(TEMPLATE);
    await click(selectors.registerIosBtn);
    await waitUntil(() => this.notify.errorMsg, { timeout: 2000 });

    assert.strictEqual(this.notify.errorMsg, t('cyod.iosAgentNotFound'));
    assert.dom(selectors.detected).doesNotExist();
    assert.strictEqual(this.registeredDevice, null);
  });

  test('an agent error response is reported as an unreachable agent', async function (assert) {
    this.server.get(AGENT_URL, () => new Response(500));

    this.set('platform', ENUMS.PLATFORM.IOS);

    await render(TEMPLATE);
    await click(selectors.registerIosBtn);
    await waitUntil(() => this.notify.errorMsg, { timeout: 2000 });

    assert.strictEqual(this.notify.errorMsg, t('cyod.iosAgentNotFound'));
    assert.dom(selectors.detected).doesNotExist();
  });

  test('a failed registration keeps the detected device and reports the failure', async function (assert) {
    const device = this.server.create('organization-cyod-registered-device');

    this.server.get(AGENT_URL, () => ({
      udid: device.serial_number,
      model: device.model,
      product_version: '17.4',
      cpu_architecture: 'arm64e',
    }));

    this.server.post(REGISTER_URL, () => new Response(500));

    this.set('platform', ENUMS.PLATFORM.IOS);

    await render(TEMPLATE);
    await click(selectors.registerIosBtn);
    await waitUntil(() => this.notify.errorMsg, { timeout: 2000 });

    assert.strictEqual(this.notify.errorMsg, t('cyod.registrationFailed'));
    assert.strictEqual(this.registeredDevice, null);
    assert.dom(selectors.detected).containsText(device.model);
  });

  // ─── Unsupported platform ────────────────────────────────────────────────────

  test('it reports an unsupported platform rather than rendering nothing', async function (assert) {
    this.set('platform', ENUMS.PLATFORM.WINDOWS);

    await render(TEMPLATE);

    assert
      .dom(selectors.unsupportedPlatform)
      .hasText(t('cyod.unsupportedPlatform'));

    assert.dom(selectors.registerAndroidBtn).doesNotExist();
    assert.dom(selectors.registerIosBtn).doesNotExist();
  });
});
