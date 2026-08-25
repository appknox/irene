import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { module, test } from 'qunit';

import ENUMS from 'irene/enums';
import {
  IOS_MODERN_DEVICE_VERSION_CUTOFF,
  getPlatformMajorVersion,
} from 'irene/utils/dynamic-scan-device';

// ─── Selectors ─────────────────────────────────────────────────────────────────
const selectors = {
  device: '[data-test-vncViewer-device]',
  deviceScreen: '[data-test-vncViewer-deviceScreen]',
  deviceCamera: '[data-test-vncViewer-deviceCamera]',
  deviceHome: '[data-test-vncViewer-deviceHome]',
  devicePart: (part) => `[data-test-vncViewer-device${part}]`,
  canvasContainer: '[data-test-NovncRfb-canvasContainer]',
  cyodDownload: '[data-test-vncViewer-cyodDownload]',
  cyodDownloadLink: '[data-test-vncViewer-cyodDownloadLink]',
  cyodViewer: '[data-test-vncViewer-cyodViewer]',
  cyodReady: '[data-test-vncViewer-cyodReady]',
};

// ─── Template ──────────────────────────────────────────────────────────────────
const TEMPLATE = hbs`
  <VncViewer
    @file={{this.file}}
    @profileId={{this.activeProfileId}}
    @dynamicScan={{this.dynamicscan}}
  />
`;

// ─── Helpers ───────────────────────────────────────────────────────────────────
/**
 * Builds the profile/file/project graph both modules render against, and mocks
 * the project fetch the component makes while resolving the device frame. The
 * handler reads `context.platform` when the request runs, so a test only has to
 * set it before rendering.
 */
function setupModels(context) {
  const store = context.owner.lookup('service:store');

  const profile = context.server.create('profile');

  const project = context.server.create('project', {
    active_profile_id: profile.id,
  });

  const file = context.server.create('file', {
    project: project.id,
    profile: profile.id,
    is_active: true,
  });

  project.update({ last_file: file });

  context.setProperties({
    store,
    project,
    file: store.push(store.normalize('file', file.toJSON())),
    activeProfileId: profile.id,
  });

  context.server.get('/v3/projects/:id', (schema, req) => ({
    ...schema.projects.find(`${req.params.id}`)?.toJSON(),
    platform: context.platform,
  }));
}

/**
 * Creates a dynamicscan and pushes it into the store as the ember-data record
 * the component takes as `@dynamicScan`. Returns the mirage model so tests can
 * assert against the attributes the factory generated.
 */
function createDynamicScan(context, { traits = [], ...attrs }) {
  const dynamicscan = context.server.create('dynamicscan', ...traits, {
    file: context.file.id,
    ended_on: null,
    ...attrs,
  });

  context.dynamicscan = context.store.push(
    context.store.normalize('dynamicscan', dynamicscan.toJSON())
  );

  return dynamicscan;
}

/**
 * A CYOD scan built from one of the dynamicscan factory's CYOD traits. The
 * project platform is taken from the device the trait attached, so the two
 * cannot disagree.
 */
function createCyodScan(context, trait, status) {
  const dynamicscan = createDynamicScan(context, { traits: [trait], status });

  context.platform = dynamicscan.device_used.platform;

  return dynamicscan;
}

// ─── Test suites ───────────────────────────────────────────────────────────────
module('Integration | Component | vnc-viewer', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en');
  setupMirage(hooks);

  hooks.beforeEach(function () {
    setupModels(this);
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
      this.platform = platform;

      createDynamicScan(this, {
        status: ENUMS.DYNAMIC_SCAN_STATUS.NOT_STARTED,
      });

      await render(TEMPLATE);

      deviceClass.split(' ').forEach((val) => {
        assert.dom(selectors.device).hasClass(val);
      });

      ['TopBar', 'Sleep', 'Volume'].forEach((it) => {
        assert.dom(selectors.devicePart(it)).doesNotExist();
      });

      assert.dom(selectors.deviceCamera).exists();
      assert.dom(selectors.deviceScreen).hasClass('screen');

      if (platform === ENUMS.PLATFORM.IOS) {
        assert.dom(selectors.deviceHome).exists();

        ['Speaker', 'BottomBar'].forEach((it) => {
          assert.dom(selectors.devicePart(it)).doesNotExist();
        });
      }
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
      this.platform = platform;

      const deviceUsed = this.server.create('device', {
        is_tablet: isTablet,
        platform,
        platform_version: platformVersion,
      });

      createDynamicScan(this, {
        status: status || ENUMS.DYNAMIC_SCAN_STATUS.READY_FOR_INTERACTION,
        device_used: deviceUsed.toJSON(),
      });

      await render(TEMPLATE);

      const isScanInProgress =
        this.dynamicscan.isBooting ||
        this.dynamicscan.isInstalling ||
        this.dynamicscan.isLaunching ||
        this.dynamicscan.isHooking ||
        this.dynamicscan.isReadyOrRunning;

      const platformMajorVersion = getPlatformMajorVersion(platformVersion);
      const usesModernIOSDeviceFrame =
        platform === ENUMS.PLATFORM.IOS &&
        platformMajorVersion !== null &&
        platformMajorVersion >= IOS_MODERN_DEVICE_VERSION_CUTOFF;

      if (usesModernIOSDeviceFrame) {
        assert.dom(selectors.device).doesNotHaveClass('marvel-device');
        assert.dom(selectors.deviceScreen).exists();
        assert.dom(selectors.deviceCamera).doesNotExist();
        assert.dom(selectors.deviceHome).doesNotExist();
      } else {
        deviceClass.split(' ').forEach((val) => {
          assert.dom(selectors.device).hasClass(val);
        });

        assert.dom(selectors.deviceCamera).exists();
        assert.dom(selectors.deviceScreen).hasClass('screen');

        if (platform === ENUMS.PLATFORM.IOS) {
          assert.dom(selectors.deviceHome).exists();
        }
      }

      ['TopBar', 'Sleep', 'Volume'].forEach((it) => {
        if (!usesModernIOSDeviceFrame && isScanInProgress && isTablet) {
          assert.dom(selectors.devicePart(it)).exists();
        } else {
          assert.dom(selectors.devicePart(it)).doesNotExist();
        }
      });

      if (platform === ENUMS.PLATFORM.IOS && !usesModernIOSDeviceFrame) {
        ['Speaker', 'BottomBar'].forEach((it) => {
          if (isScanInProgress && isTablet) {
            assert.dom(selectors.devicePart(it)).exists();
          } else {
            assert.dom(selectors.devicePart(it)).doesNotExist();
          }
        });
      }

      if (this.dynamicscan.isReadyOrRunning) {
        assert
          .dom(selectors.canvasContainer)
          .hasAttribute(
            'data-contain-canvas',
            usesModernIOSDeviceFrame ? 'true' : 'false'
          );
      }
    }
  );
});

module('Integration | Component | vnc-viewer | CYOD scans', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en');
  setupMirage(hooks);

  hooks.beforeEach(function () {
    setupModels(this);

    window.WebSocket = class {
      constructor() {}
      addEventListener() {}
      removeEventListener() {}
      close() {}
    };
  });

  test('PROXY_CYOD + INSTALLING shows download link', async function (assert) {
    const scan = createCyodScan(
      this,
      'withProxyCyodDevice',
      ENUMS.DYNAMIC_SCAN_STATUS.INSTALLING
    );

    await render(TEMPLATE);

    assert.dom(selectors.cyodDownload).exists();

    assert
      .dom(selectors.cyodDownloadLink)
      .hasAttribute('href', scan.device_used.android_download_url);
  });

  test('PROXY_CYOD + READY shows CyodViewer', async function (assert) {
    createCyodScan(
      this,
      'withProxyCyodDevice',
      ENUMS.DYNAMIC_SCAN_STATUS.READY_FOR_INTERACTION
    );

    await render(TEMPLATE);

    assert.dom(selectors.cyodViewer).exists();
    assert.dom(selectors.cyodReady).doesNotExist();
  });

  test('REMOTE_CYOD + INSTALLING shows iOS install link', async function (assert) {
    const scan = createCyodScan(
      this,
      'withRemoteCyodDevice',
      ENUMS.DYNAMIC_SCAN_STATUS.INSTALLING
    );

    await render(TEMPLATE);

    assert.dom(selectors.cyodDownload).exists();

    assert
      .dom(selectors.cyodDownloadLink)
      .hasAttribute('href', scan.device_used.ios_itms_url);
  });

  test('REMOTE_CYOD + READY shows interact on device', async function (assert) {
    createCyodScan(
      this,
      'withRemoteCyodDevice',
      ENUMS.DYNAMIC_SCAN_STATUS.READY_FOR_INTERACTION
    );

    await render(TEMPLATE);

    assert.dom(selectors.cyodReady).exists();
    assert.dom(selectors.cyodViewer).doesNotExist();
  });
});
