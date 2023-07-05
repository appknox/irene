import { click, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';

import ENUMS from 'irene/enums';

module('Integration | Component | vnc-viewer', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  hooks.beforeEach(async function () {
    const store = this.owner.lookup('service:store');

    const profile = this.server.create('profile', { id: '100' });

    const file = this.server.create('file', {
      project: '1',
      profile: profile.id,
    });

    this.server.create('project', {
      file: file.id,
      id: '1',
      active_profile_id: profile.id,
    });

    const devicePreference = this.server.create('device-preference', {
      id: profile.id,
    });

    this.setProperties({
      file: store.push(store.normalize('file', file.toJSON())),
      devicePreference,
      activeProfileId: profile.id,
      store,
    });
  });

  test.each(
    'it renders vnc viewer',
    [
      {
        platform: ENUMS.PLATFORM.ANDROID,
        deviceType: ENUMS.DEVICE_TYPE.TABLET_REQUIRED,
        deviceClass: 'tablet',
      },
      {
        platform: ENUMS.PLATFORM.IOS,
        deviceType: ENUMS.DEVICE_TYPE.TABLET_REQUIRED,
        deviceClass: 'ipad black',
      },
      {
        platform: ENUMS.PLATFORM.ANDROID,
        deviceType: ENUMS.DEVICE_TYPE.PHONE_REQUIRED,
        deviceClass: 'nexus5',
      },
      {
        platform: ENUMS.PLATFORM.IOS,
        deviceType: ENUMS.DEVICE_TYPE.PHONE_REQUIRED,
        deviceClass: 'iphone5s black',
      },
      {
        platform: ENUMS.PLATFORM.ANDROID,
        deviceType: ENUMS.DEVICE_TYPE.NO_PREFERENCE,
        deviceClass: 'nexus5',
      },
      {
        platform: ENUMS.PLATFORM.IOS,
        deviceType: ENUMS.DEVICE_TYPE.NO_PREFERENCE,
        deviceClass: 'iphone5s black',
      },
    ],
    async function (assert, { platform, deviceType, deviceClass }) {
      this.file.dynamicStatus = ENUMS.DYNAMIC_STATUS.NONE;
      this.file.isDynamicDone = true;

      // make sure file is active
      this.file.isActive = true;

      this.server.get('/v2/projects/:id', (schema, req) => {
        return {
          ...schema.projects.find(`${req.params.id}`)?.toJSON(),
          platform,
        };
      });

      this.server.get('/profiles/:id/device_preference', (schema, req) => {
        return {
          ...schema.devicePreferences.find(`${req.params.id}`)?.toJSON(),
          device_type: deviceType,
        };
      });

      await render(hbs`
        <VncViewer @file={{this.file}} @profileId={{this.activeProfileId}} />
      `);

      assert
        .dom('[data-test-vncViewer-root]')
        .doesNotHaveClass(/vnc-viewer-fullscreen/);

      assert.dom('[data-test-vncViewer-backdrop]').doesNotExist();

      assert
        .dom('[data-test-vncViewer-fullscreenContainer]')
        .doesNotHaveClass(/vnc-viewer-fullscreen-container/);

      deviceClass.split(' ').forEach((val) => {
        assert.dom('[data-test-vncViewer-device]').hasClass(val);
      });

      ['TopBar', 'Sleep', 'Volume'].forEach((it) => {
        if (deviceType === ENUMS.DEVICE_TYPE.TABLET_REQUIRED) {
          assert.dom(`[data-test-vncViewer-device${it}]`).exists();
        } else {
          assert.dom(`[data-test-vncViewer-device${it}]`).doesNotExist();
        }
      });

      assert.dom('[data-test-vncViewer-deviceCamera]').exists();

      assert
        .dom('[data-test-vncViewer-deviceScreen]')
        .hasClass(
          platform === ENUMS.PLATFORM.ANDROID &&
            deviceType === ENUMS.DEVICE_TYPE.TABLET_REQUIRED
            ? 'noscreen'
            : 'screen'
        );

      if (platform === ENUMS.PLATFORM.IOS) {
        assert.dom('[data-test-vncViewer-deviceHome]').exists();

        ['Speaker', 'BottomBar'].forEach((it) => {
          if (deviceType === ENUMS.DEVICE_TYPE.TABLET_REQUIRED) {
            assert.dom(`[data-test-vncViewer-device${it}]`).exists();
          } else {
            assert.dom(`[data-test-vncViewer-device${it}]`).doesNotExist();
          }
        });
      }

      assert.dom('[data-test-dynamicScan-startBtn]').hasText('t:completed:()');

      assert.dom('[data-test-dynamicScan-restartBtn]').isNotDisabled();

      assert.dom('[data-test-vncViewer-fullscreenToggleBtn]').doesNotExist();
    }
  );

  test('test vnc viewer with status ready', async function (assert) {
    this.server.create('dynamicscan', { expires_on: null });

    this.file.dynamicStatus = ENUMS.DYNAMIC_STATUS.READY;

    // make sure file is active
    this.file.isActive = true;

    this.server.get('/v2/projects/:id', (schema, req) => {
      return {
        ...schema.projects.find(`${req.params.id}`)?.toJSON(),
        platform: ENUMS.PLATFORM.ANDROID,
      };
    });

    this.server.get('/profiles/:id/device_preference', (schema, req) => {
      return schema.devicePreferences.find(`${req.params.id}`)?.toJSON();
    });

    this.server.get('/dynamicscan/:id', (schema, req) => {
      return schema.dynamicscans.find(`${req.params.id}`)?.toJSON();
    });

    await render(hbs`
      <VncViewer @file={{this.file}} @profileId={{this.activeProfileId}} />
    `);

    assert
      .dom('[data-test-vncViewer-root]')
      .doesNotHaveClass(/vnc-viewer-fullscreen/);

    assert.dom('[data-test-vncViewer-backdrop]').doesNotExist();

    assert
      .dom('[data-test-vncViewer-fullscreenContainer]')
      .doesNotHaveClass(/vnc-viewer-fullscreen-container/);

    assert.dom('[data-test-NovncRfb-canvasContainer]').exists();

    assert.dom('[data-test-dynamicScan-stopBtn]').hasText('t:stop:()');
    assert.dom('[data-test-dynamicScan-restartBtn]').doesNotExist();

    assert
      .dom('[data-test-vncViewer-fullscreenToggleBtn]')
      .isNotDisabled()
      .hasText('t:popOutModal:()');

    // go fullscreen
    await click('[data-test-vncViewer-fullscreenToggleBtn]');

    assert.dom('[data-test-vncViewer-root]').hasClass(/vnc-viewer-fullscreen/);

    assert.dom('[data-test-vncViewer-backdrop]').exists();

    assert
      .dom('[data-test-vncViewer-fullscreenContainer]')
      .hasClass(/vnc-viewer-fullscreen-container/);

    assert
      .dom('[data-test-vncViewer-fullscreenToggleBtn]')
      .isNotDisabled()
      .hasText('t:closeModal:()');

    // exit fullscreen
    await click('[data-test-vncViewer-fullscreenToggleBtn]');

    assert
      .dom('[data-test-vncViewer-root]')
      .doesNotHaveClass(/vnc-viewer-fullscreen/);

    assert.dom('[data-test-vncViewer-backdrop]').doesNotExist();

    assert
      .dom('[data-test-vncViewer-fullscreenContainer]')
      .doesNotHaveClass(/vnc-viewer-fullscreen-container/);

    assert
      .dom('[data-test-vncViewer-fullscreenToggleBtn]')
      .isNotDisabled()
      .hasText('t:popOutModal:()');
  });
});
