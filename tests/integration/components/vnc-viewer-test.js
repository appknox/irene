import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { module, test } from 'qunit';

import ENUMS from 'irene/enums';
import {
  requiresVncPassword,
  supportsModernIOSDeviceFrame,
} from 'irene/components/vnc-viewer';

module('Integration | Component | vnc-viewer', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en');
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const store = this.owner.lookup('service:store');

    const profile = this.server.create('profile', { id: '100' });

    const file = this.server.create('file', {
      project: '1',
      profile: profile.id,
      is_active: true,
    });

    this.server.create('project', {
      last_file: file,
      id: '1',
      active_profile_id: profile.id,
    });

    this.setProperties({
      file: store.push(store.normalize('file', file.toJSON())),
      activeProfileId: profile.id,
      store,
    });
  });

  test('it requires vnc password for device platform versions below 17', function (assert) {
    assert.true(requiresVncPassword('16'));
    assert.true(requiresVncPassword('16.7.10'));
    assert.true(requiresVncPassword('Android 13'));
    assert.false(requiresVncPassword('17'));
    assert.false(requiresVncPassword('17.0.1'));
    assert.false(requiresVncPassword(null));
    assert.false(supportsModernIOSDeviceFrame('16.7.10'));
    assert.true(supportsModernIOSDeviceFrame('17'));
    assert.false(supportsModernIOSDeviceFrame(null));
  });

  test.each(
    'it renders when not started & device not allocated',
    [
      {
        platform: ENUMS.PLATFORM.ANDROID,
        deviceClass: 'nexus5',
      },
      {
        platform: ENUMS.PLATFORM.IOS,
        deviceClass: 'iphone5s black',
      },
    ],
    async function (assert, { platform, deviceClass }) {
      const dynamicscan = this.server.create('dynamicscan', {
        file: this.file.id,
        status: ENUMS.DYNAMIC_SCAN_STATUS.NOT_STARTED,
        ended_on: null,
      });

      this.dynamicscan = this.store.push(
        this.store.normalize('dynamicscan', dynamicscan.toJSON())
      );

      this.server.get('/v3/projects/:id', (schema, req) => {
        return {
          ...schema.projects.find(`${req.params.id}`)?.toJSON(),
          platform,
        };
      });

      await render(hbs`
        <VncViewer @file={{this.file}} @profileId={{this.activeProfileId}} @dynamicScan={{this.dynamicscan}} />
      `);

      deviceClass.split(' ').forEach((val) => {
        assert.dom('[data-test-vncViewer-device]').hasClass(val);
      });

      assert.dom('[data-test-vncViewer-deviceCamera]').exists();
      assert.dom('[data-test-vncViewer-deviceScreen]').hasClass('screen');

      if (platform === ENUMS.PLATFORM.IOS) {
        assert.dom('[data-test-vncViewer-deviceHome]').exists();
      } else {
        assert.dom('[data-test-vncViewer-deviceHome]').doesNotExist();
      }

      ['TopBar', 'Sleep', 'Volume'].forEach((it) => {
        assert.dom(`[data-test-vncViewer-device${it}]`).doesNotExist();
      });

      ['Speaker', 'BottomBar'].forEach((it) => {
        assert.dom(`[data-test-vncViewer-device${it}]`).doesNotExist();
      });
    }
  );

  test.each(
    'it renders when started & device allocated',
    [
      {
        platform: ENUMS.PLATFORM.IOS,
        isTablet: true,
        deviceClass: 'ipad black',
        platformVersion: '16.7.10',
      },
      {
        platform: ENUMS.PLATFORM.IOS,
        isTablet: true,
        deviceClass: 'iphone5s black', // since device might not be allocated so show default
        status: ENUMS.DYNAMIC_SCAN_STATUS.IN_QUEUE,
        platformVersion: '16.7.10',
      },
      {
        platform: ENUMS.PLATFORM.ANDROID,
        isTablet: false,
        deviceClass: 'nexus5',
      },
      {
        platform: ENUMS.PLATFORM.IOS,
        isTablet: false,
        deviceClass: 'iphone5s black',
        platformVersion: '16.7.10',
      },
      {
        platform: ENUMS.PLATFORM.IOS,
        isTablet: false,
        deviceClass: 'iphone5s black',
        platformVersion: '18.0',
      },
    ],
    async function (
      assert,
      { platform, isTablet, deviceClass, platformVersion, status }
    ) {
      const deviceUsed = this.server.create('device', {
        is_tablet: isTablet,
        platform,
        platform_version: platformVersion,
      });

      const dynamicscan = this.server.create('dynamicscan', {
        file: this.file.id,
        status: status || ENUMS.DYNAMIC_SCAN_STATUS.READY_FOR_INTERACTION,
        ended_on: null,
        device_used: deviceUsed.toJSON(),
      });

      this.dynamicscan = this.store.push(
        this.store.normalize('dynamicscan', dynamicscan.toJSON())
      );

      this.server.get('/v3/projects/:id', (schema, req) => {
        return {
          ...schema.projects.find(`${req.params.id}`)?.toJSON(),
          platform,
        };
      });

      await render(hbs`
        <VncViewer @file={{this.file}} @profileId={{this.activeProfileId}} @dynamicScan={{this.dynamicscan}} />
      `);

      const isScanInProgress =
        this.dynamicscan.isBooting ||
        this.dynamicscan.isInstalling ||
        this.dynamicscan.isLaunching ||
        this.dynamicscan.isHooking ||
        this.dynamicscan.isReadyOrRunning;

      const usesModernIOSDeviceFrame =
        platform === ENUMS.PLATFORM.IOS &&
        supportsModernIOSDeviceFrame(platformVersion);

      if (usesModernIOSDeviceFrame) {
        assert
          .dom('[data-test-vncViewer-device]')
          .doesNotHaveClass('marvel-device');
        assert.dom('[data-test-vncViewer-deviceScreen]').exists();
        assert.dom('[data-test-vncViewer-deviceCamera]').doesNotExist();
        assert.dom('[data-test-vncViewer-deviceHome]').doesNotExist();
      } else {
        deviceClass.split(' ').forEach((val) => {
          assert.dom('[data-test-vncViewer-device]').hasClass(val);
        });

        assert.dom('[data-test-vncViewer-deviceCamera]').exists();
        assert.dom('[data-test-vncViewer-deviceScreen]').hasClass('screen');

        if (platform === ENUMS.PLATFORM.IOS) {
          assert.dom('[data-test-vncViewer-deviceHome]').exists();
        } else {
          assert.dom('[data-test-vncViewer-deviceHome]').doesNotExist();
        }
      }

      ['TopBar', 'Sleep', 'Volume'].forEach((it) => {
        if (!usesModernIOSDeviceFrame && isScanInProgress && isTablet) {
          assert.dom(`[data-test-vncViewer-device${it}]`).exists();
        } else {
          assert.dom(`[data-test-vncViewer-device${it}]`).doesNotExist();
        }
      });

      ['Speaker', 'BottomBar'].forEach((it) => {
        if (
          platform === ENUMS.PLATFORM.IOS &&
          !usesModernIOSDeviceFrame &&
          isScanInProgress &&
          isTablet
        ) {
          assert.dom(`[data-test-vncViewer-device${it}]`).exists();
        } else {
          assert.dom(`[data-test-vncViewer-device${it}]`).doesNotExist();
        }
      });

      if (this.dynamicscan.isReadyOrRunning) {
        assert
          .dom('[data-test-NovncRfb-canvasContainer]')
          .hasAttribute(
            'data-contain-canvas',
            usesModernIOSDeviceFrame ? 'true' : 'false'
          );
      }
    }
  );
});
