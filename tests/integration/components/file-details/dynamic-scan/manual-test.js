import { click, find, render, triggerEvent } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';
import Service from '@ember/service';
import { faker } from '@faker-js/faker';

import ENUMS from 'irene/enums';
import { dsManualDevicePref } from 'irene/helpers/ds-manual-device-pref';
import styles from 'irene/components/ak-select/index.scss';

const classes = {
  dropdown: styles['ak-select-dropdown'],
  trigger: styles['ak-select-trigger'],
  triggerError: styles['ak-select-trigger-error'],
};

class NotificationsStub extends Service {
  errorMsg = null;
  successMsg = null;

  error(msg) {
    this.errorMsg = msg;
  }

  success(msg) {
    this.successMsg = msg;
  }
}

const dynamicScanStatusTextList = [
  {
    status: ENUMS.DYNAMIC_SCAN_STATUS.NOT_STARTED,
    text: () => t('notStarted'),
  },
  {
    status: ENUMS.DYNAMIC_SCAN_STATUS.PREPROCESSING,
    text: () => t('deviceInQueue'),
  },
  {
    status: ENUMS.DYNAMIC_SCAN_STATUS.PROCESSING_SCAN_REQUEST,
    text: () => t('deviceInQueue'),
  },
  {
    status: ENUMS.DYNAMIC_SCAN_STATUS.IN_QUEUE,
    text: () => t('deviceInQueue'),
  },
  {
    status: ENUMS.DYNAMIC_SCAN_STATUS.DEVICE_ALLOCATED,
    text: () => t('deviceBooting'),
  },
  {
    status: ENUMS.DYNAMIC_SCAN_STATUS.CONNECTING_TO_DEVICE,
    text: () => t('deviceBooting'),
  },
  {
    status: ENUMS.DYNAMIC_SCAN_STATUS.PREPARING_DEVICE,
    text: () => t('deviceBooting'),
  },
  {
    status: ENUMS.DYNAMIC_SCAN_STATUS.DOWNLOADING_AUTO_SCRIPT,
    text: () => t('deviceBooting'),
  },
  {
    status: ENUMS.DYNAMIC_SCAN_STATUS.CONFIGURING_AUTO_INTERACTION,
    text: () => t('deviceBooting'),
  },
  {
    status: ENUMS.DYNAMIC_SCAN_STATUS.INSTALLING,
    text: () => t('deviceInstalling'),
  },
  {
    status: ENUMS.DYNAMIC_SCAN_STATUS.LAUNCHING,
    text: () => t('deviceLaunching'),
  },
  {
    status: ENUMS.DYNAMIC_SCAN_STATUS.CONFIGURING_API_CAPTURE,
    text: () => t('deviceHooking'),
  },
  { status: ENUMS.DYNAMIC_SCAN_STATUS.HOOKING, text: () => t('deviceHooking') },
  { status: ENUMS.DYNAMIC_SCAN_STATUS.READY_FOR_INTERACTION, text: null },
  {
    status: ENUMS.DYNAMIC_SCAN_STATUS.STOP_SCAN_REQUESTED,
    text: () => t('deviceShuttingDown'),
  },
  {
    status: ENUMS.DYNAMIC_SCAN_STATUS.SCAN_TIME_LIMIT_EXCEEDED,
    text: () => t('deviceShuttingDown'),
  },
  {
    status: ENUMS.DYNAMIC_SCAN_STATUS.SHUTTING_DOWN,
    text: () => t('deviceShuttingDown'),
  },
  {
    status: ENUMS.DYNAMIC_SCAN_STATUS.CLEANING_DEVICE,
    text: () => t('deviceShuttingDown'),
  },
  {
    status: ENUMS.DYNAMIC_SCAN_STATUS.RUNTIME_DETECTION_COMPLETED,
    text: () => t('deviceShuttingDown'),
  },
  { status: ENUMS.DYNAMIC_SCAN_STATUS.ERROR, text: () => t('errored') },
  { status: ENUMS.DYNAMIC_SCAN_STATUS.TIMED_OUT, text: () => t('errored') },
  { status: ENUMS.DYNAMIC_SCAN_STATUS.TERMINATED, text: () => t('errored') },
  { status: ENUMS.DYNAMIC_SCAN_STATUS.CANCELLED, text: () => t('cancelled') },
  {
    status: ENUMS.DYNAMIC_SCAN_STATUS.ANALYZING,
    text: () => t('deviceCompleted'),
  },
  {
    status: ENUMS.DYNAMIC_SCAN_STATUS.ANALYSIS_COMPLETED,
    text: () => t('deviceCompleted'),
  },
];

module(
  'Integration | Component | file-details/dynamic-scan/manual',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en');

    hooks.beforeEach(async function () {
      const store = this.owner.lookup('service:store');

      const profile = this.server.create('profile', { id: '100' });

      const file = this.server.create('file', {
        project: '1',
        profile: profile.id,
        is_active: true,
      });

      const project = this.server.create('project', {
        last_file_id: file.id,
        id: '1',
      });

      const availableDevices = this.server.createList(
        'available-manual-device',
        3
      );

      const devicePreference = this.server.create(
        'ds-manual-device-preference',
        {
          id: profile.id,
          ds_manual_device_selection:
            ENUMS.DS_MANUAL_DEVICE_SELECTION.SPECIFIC_DEVICE,
          ds_manual_device_identifier: availableDevices[0].device_identifier,
        }
      );

      // server mocks
      this.server.get('/v2/files/:id/dynamicscans', (schema, req) => {
        const { limit, mode } = req.queryParams || {};

        const results = schema.dynamicscans
          .where({
            file: req.params.id,
            ...(mode ? { mode: Number(mode) } : {}),
          })
          .models.slice(0, limit ? Number(limit) : results.length);

        return {
          count: results.length,
          next: null,
          previous: null,
          results,
        };
      });

      this.server.get('/v2/projects/:id', (schema, req) => {
        return schema.projects.find(`${req.params.id}`)?.toJSON();
      });

      // set component properties
      this.setProperties({
        file: store.push(store.normalize('file', file.toJSON())),
        dynamicScanText: t('modalCard.dynamicScan.title'),
        profile,
        project,
        devicePreference,
        availableDevices,
        store,
      });

      // set up services
      this.owner.register('service:notifications', NotificationsStub);
    });

    test.each(
      'test different states of dynamic scan status and button',
      dynamicScanStatusTextList,
      async function (assert, { status, text }) {
        const { id } = this.server.create('dynamicscan', {
          file: this.file.id,
          mode: ENUMS.DYNAMIC_MODE.MANUAL,
          status,
          ended_on: null,
        });

        await render(hbs`
          <FileDetails::DynamicScan::Manual @file={{this.file}} @dynamicScanText={{this.dynamicScanText}} />
        `);

        const dynamicscan = this.store.peekRecord('dynamicscan', id);

        assert.strictEqual(
          dynamicscan.statusText,
          text && status !== ENUMS.DYNAMIC_SCAN_STATUS.NOT_STARTED
            ? text()
            : t('unknown')
        );

        if (text?.()) {
          assert
            .dom('[data-test-fileDetails-dynamicScan-statusChip]')
            .hasText(text());
        } else {
          assert
            .dom('[data-test-fileDetails-dynamicScan-statusChip]')
            .doesNotExist();
        }

        if (dynamicscan.isShuttingDown) {
          assert
            .dom(`[data-test-fileDetails-dynamicScanAction]`)
            .doesNotExist();
        } else {
          if (dynamicscan.isStarting) {
            assert
              .dom(`[data-test-fileDetails-dynamicScanAction="cancelBtn"]`)
              .isNotDisabled()
              .hasText(t('cancelScan'));
          } else if (dynamicscan.isReadyOrRunning) {
            assert
              .dom(`[data-test-fileDetails-dynamicScanAction="stopBtn"]`)
              .isNotDisabled()
              .hasText(t('stop'));
          } else if (dynamicscan.isCompleted || dynamicscan.isStatusError) {
            assert
              .dom(`[data-test-fileDetails-dynamicScanAction="restartBtn"]`)
              .isNotDisabled()
              .hasText(this.dynamicScanText);
          } else {
            assert
              .dom(`[data-test-fileDetails-dynamicScanAction="startBtn"]`)
              .isNotDisabled()
              .hasText(this.dynamicScanText);
          }
        }
      }
    );

    test.each(
      'it renders manual dynamic scan action drawer',
      [
        { withApiProxy: false, assertions: 25 },
        { withApiProxy: true, assertions: 33 },
      ],
      async function (assert, { withApiProxy, assertions }) {
        assert.expect(assertions);

        this.devicePreference.update({
          ds_manual_device_selection:
            ENUMS.DS_MANUAL_DEVICE_SELECTION.ANY_DEVICE,
          ds_manual_device_identifier: '',
        });

        this.server.get(
          '/v2/profiles/:id/ds_manual_device_preference',
          (schema, req) => {
            return schema.dsManualDevicePreferences
              .find(`${req.params.id}`)
              ?.toJSON();
          }
        );

        this.server.get('/profiles/:id', (schema, req) =>
          schema.profiles.find(`${req.params.id}`)?.toJSON()
        );

        this.server.get('/profiles/:id/api_scan_options', (_, req) => {
          return { api_url_filters: '', id: req.params.id };
        });

        this.server.get('/profiles/:id/proxy_settings', (_, req) => {
          return {
            id: req.params.id,
            host: withApiProxy ? faker.internet.ip() : '',
            port: withApiProxy ? faker.internet.port() : '',
            enabled: false,
          };
        });

        await render(hbs`
          <FileDetails::DynamicScan::Manual @file={{this.file}} @dynamicScanText={{this.dynamicScanText}} />
        `);

        // open the drawer
        await click('[data-test-fileDetails-dynamicScanAction="startBtn"]');

        assert
          .dom(
            '[data-test-fileDetails-dynamicScanDrawer-drawerContainer-title]'
          )
          .hasText(t('dastTabs.manualDAST'));

        assert
          .dom(
            '[data-test-fileDetails-dynamicScanDrawer-drawerContainer-closeBtn]'
          )
          .isNotDisabled();

        assert
          .dom(
            '[data-test-fileDetails-dynamicScanDrawer-manualDast-headerDeviceRequirements]'
          )
          .hasText(t('modalCard.dynamicScan.deviceRequirements'));

        assert
          .dom(
            '[data-test-fileDetails-dynamicScanDrawer-manualDast-headerOSInfoDesc]'
          )
          .hasText(t('modalCard.dynamicScan.osVersion'));

        assert
          .dom(
            '[data-test-fileDetails-dynamicScanDrawer-manualDast-headerOSInfoValue]'
          )
          .containsText(this.file.project.get('platformDisplay'))
          .containsText(t('modalCard.dynamicScan.orAbove'))
          .containsText(this.file.minOsVersion);

        assert
          .dom(
            '[data-test-fileDetails-dynamicScanDrawer-manualDast-devicePrefHeaderDesc]'
          )
          .hasText(t('devicePreferences'));

        assert
          .dom(
            '[data-test-fileDetails-dynamicScanDrawer-manualDast-devicePrefSelect]'
          )
          .exists();

        assert
          .dom(
            `[data-test-fileDetails-dynamicScanDrawer-manualDast-devicePrefSelect] .${classes.trigger}`
          )
          .hasText(
            t(dsManualDevicePref([ENUMS.DS_MANUAL_DEVICE_SELECTION.ANY_DEVICE]))
          );

        if (withApiProxy) {
          const proxySetting = this.store.peekRecord(
            'proxy-setting',
            this.file.profile.get('id')
          );

          assert.notOk(proxySetting.enabled);

          assert
            .dom('[data-test-fileDetails-proxySettings-container]')
            .exists();

          assert
            .dom('[data-test-fileDetails-proxySettings-enableApiProxyLabel]')
            .hasText(`${t('enable')} ${t('proxySettingsTitle')}`);

          const proxySettingsToggle =
            '[data-test-fileDetails-proxySettings-enableApiProxyToggle] [data-test-toggle-input]';

          assert.dom(proxySettingsToggle).isNotDisabled().isNotChecked();

          const proxySettingsTooltip = find(
            '[data-test-fileDetails-proxySettings-helpIcon]'
          );

          await triggerEvent(proxySettingsTooltip, 'mouseenter');

          assert
            .dom('[data-test-fileDetails-proxySettings-helpTooltipContent]')
            .exists()
            .containsText(t('proxySettingsRouteVia'))
            .containsText(proxySetting.port)
            .containsText(proxySetting.host);

          await triggerEvent(proxySettingsTooltip, 'mouseleave');
        } else {
          assert
            .dom('[data-test-fileDetails-proxySettings-container]')
            .doesNotExist();
        }

        assert
          .dom(
            '[data-test-fileDetails-dynamicScanDrawer-manualDast-enableAPICapture]'
          )
          .hasText(t('modalCard.dynamicScan.runApiScan'));

        assert
          .dom(
            '[data-test-fileDetails-dynamicScanDrawer-manualDast-enableAPICaptureCheckbox]'
          )
          .isNotChecked();

        // Sanity check for API URL filter section (Already tested)
        assert
          .dom(
            '[data-test-fileDetails-dynamicScanDrawer-manualDast-apiFilter-title]'
          )
          .hasText(t('templates.apiScanURLFilter'));

        assert.dom('[data-test-apiFilter-description]').doesNotExist();

        assert
          .dom('[data-test-apiFilter-apiEndpointInput]')
          .isNotDisabled()
          .hasNoValue();

        assert
          .dom('[data-test-apiFilter-addApiEndpointBtn]')
          .isNotDisabled()
          .hasText(t('templates.addNewUrlFilter'));

        const apiURLTitleTooltip = find(
          '[data-test-fileDetails-dynamicScanDrawer-manualDast-apiURLFilter-iconTooltip]'
        );

        await triggerEvent(apiURLTitleTooltip, 'mouseenter');

        assert
          .dom('[data-test-ak-tooltip-content]')
          .exists()
          .containsText(t('modalCard.dynamicScan.apiScanUrlFilterTooltipText'));

        await triggerEvent(apiURLTitleTooltip, 'mouseleave');

        // CTA Buttons
        assert
          .dom('[data-test-fileDetails-dynamicScanDrawer-startBtn]')
          .exists()
          .hasText(t('start'));

        assert
          .dom('[data-test-fileDetails-dynamicScanDrawer-cancelBtn]')
          .exists()
          .hasText(t('cancel'));
      }
    );
  }
);
