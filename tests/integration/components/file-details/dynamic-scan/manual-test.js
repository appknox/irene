import {
  click,
  find,
  findAll,
  render,
  triggerEvent,
} from '@ember/test-helpers';

import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { selectChoose } from 'ember-power-select/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';
import Service from '@ember/service';
import { faker } from '@faker-js/faker';

import ENUMS from 'irene/enums';
import { deviceType } from 'irene/helpers/device-type';
import { dsManualDevicePref } from 'irene/helpers/ds-manual-device-pref';
import styles from 'irene/components/ak-select/index.scss';
import dayjs from 'dayjs';

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
        last_automated_dynamic_scan: null,
        last_manual_dynamic_scan: null,
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
      this.server.get('/v2/dynamicscans/:id', (schema, req) => {
        return schema.dynamicscans.find(`${req.params.id}`)?.toJSON();
      });

      this.server.get('/v2/projects/:id', (schema, req) => {
        return schema.projects.find(`${req.params.id}`)?.toJSON();
      });

      this.server.get('/v2/files/:id', (schema, req) => {
        return schema.files.find(`${req.params.id}`)?.toJSON();
      });

      const fileModel = store.push(store.normalize('file', file.toJSON()));

      // set component properties
      this.setProperties({
        file: fileModel,
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
      'it renders manual dynamic scan action drawer',
      [
        { withApiFilter: true, assertions: 26 },
        { withApiProxy: true, assertions: 25 },
      ],
      async function (assert, { withApiProxy, withApiFilter, assertions }) {
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

        const enableAPICaptureCheckbox =
          '[data-test-fileDetails-dynamicScanDrawer-manualDast-enableAPICaptureCheckbox] input';

        assert.dom(enableAPICaptureCheckbox).isNotChecked();

        if (withApiFilter) {
          await click(enableAPICaptureCheckbox);

          assert.dom(enableAPICaptureCheckbox).isChecked();

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
            .containsText(
              t('modalCard.dynamicScan.apiScanUrlFilterTooltipText')
            );

          await triggerEvent(apiURLTitleTooltip, 'mouseleave');
        }

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

    test('it selects a device preference', async function (assert) {
      // start with any device
      this.devicePreference.update({
        ds_manual_device_selection: ENUMS.DS_MANUAL_DEVICE_SELECTION.ANY_DEVICE,
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

      this.server.put(
        '/v2/profiles/:id/ds_manual_device_preference',
        (schema, req) => {
          return schema.db.dsManualDevicePreferences.update(
            req.params.id,
            JSON.parse(req.requestBody)
          );
        }
      );

      this.server.get('/v2/projects/:id/available_manual_devices', (schema) => {
        const results = schema.availableManualDevices.all().models;

        return { count: results.length, next: null, previous: null, results };
      });

      this.server.get('/profiles/:id', (schema, req) =>
        schema.profiles.find(`${req.params.id}`)?.toJSON()
      );

      this.server.get('/profiles/:id/api_scan_options', (_, req) => {
        return { api_url_filters: '', id: req.params.id };
      });

      this.server.get('/profiles/:id/proxy_settings', (_, req) => {
        return { id: req.params.id, host: '', port: '', enabled: false };
      });

      await render(hbs`
        <FileDetails::DynamicScan::Manual @file={{this.file}} @dynamicScanText={{this.dynamicScanText}} />
      `);

      // open the drawer
      await click('[data-test-fileDetails-dynamicScanAction="startBtn"]');

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

      await selectChoose(
        `[data-test-fileDetails-dynamicScanDrawer-manualDast-devicePrefSelect] .${classes.trigger}`,
        t(
          dsManualDevicePref([ENUMS.DS_MANUAL_DEVICE_SELECTION.SPECIFIC_DEVICE])
        )
      );

      assert
        .dom(
          `[data-test-fileDetails-dynamicScanDrawer-manualDast-devicePrefSelect] .${classes.trigger}`
        )
        .hasText(
          t(
            dsManualDevicePref([
              ENUMS.DS_MANUAL_DEVICE_SELECTION.SPECIFIC_DEVICE,
            ])
          )
        );

      assert
        .dom(
          '[data-test-fileDetails-dynamicScanDrawer-manualDast-devicePrefTable-root]'
        )
        .exists();

      assert
        .dom(
          '[data-test-fileDetails-dynamicScanDrawer-manualDast-devicePrefTableHeaderTitle]'
        )
        .exists()
        .containsText(t('modalCard.dynamicScan.selectSpecificDevice'));

      assert
        .dom(
          '[data-test-fileDetails-dynamicScanDrawer-manualDast-devicePrefTable-filterSelect]'
        )
        .exists();

      // Sanity check for table items
      const deviceElemList = findAll(
        '[data-test-fileDetails-dynamicScanDrawer-devicePrefTable-row]'
      );

      assert.strictEqual(deviceElemList.length, this.availableDevices.length);

      const deviceCapabilitiesMap = {
        has_sim: 'sim',
        has_vpn: 'vpn',
        has_pin_lock: 'pinLock',
        // has_vnc: 'vnc',
      };

      const deviceSelectRadioSelector =
        '[data-test-fileDetails-dynamicScanDrawer-devicePrefTable-deviceSelectRadioInput]';

      deviceElemList.forEach((deviceElem, idx) => {
        const device = this.availableDevices[idx];

        const deviceTypeLabel = deviceType([
          device.is_tablet
            ? ENUMS.DEVICE_TYPE.TABLET_REQUIRED
            : ENUMS.DEVICE_TYPE.PHONE_REQUIRED,
        ]);

        // Verify device basic info
        assert
          .dom(deviceElem)
          .containsText(device.device_identifier)
          .containsText(t(deviceTypeLabel));

        // Verify device capabilities
        Object.entries(deviceCapabilitiesMap).forEach(([key, label]) => {
          if (device[key]) {
            const labelValue = t(label);

            assert
              .dom(
                `[data-test-fileDetails-dynamicScanDrawer-devicePrefTable-capabilityId='${labelValue}']`,
                deviceElem
              )
              .hasText(labelValue);
          }
        });

        // Verify radio button state
        assert.dom(deviceSelectRadioSelector, deviceElem).isNotChecked();
      });

      // Select device
      await click(deviceElemList[1].querySelector(deviceSelectRadioSelector));

      // Verify final selection
      assert.dom(deviceSelectRadioSelector, deviceElemList[1]).isChecked();
    });

    test.each(
      'it filters devices in device preferences table',
      [
        {
          label: () => t('modalCard.dynamicScan.devicesWithSim'),
          value: 'has_sim',
        },
        {
          label: () => t('modalCard.dynamicScan.devicesWithVPN'),
          value: 'has_vpn',
        },
        {
          label: () => t('modalCard.dynamicScan.devicesWithLock'),
          value: 'has_pin_lock',
        },
      ],
      async function (assert, filter) {
        this.server.get(
          '/v2/profiles/:id/ds_manual_device_preference',
          (schema, req) => {
            return schema.dsManualDevicePreferences
              .find(`${req.params.id}`)
              ?.toJSON();
          }
        );

        this.server.get(
          '/v2/projects/:id/available_manual_devices',
          (schema, req) => {
            const results = schema.availableManualDevices.all().models;

            this.set('queryParams', req.queryParams);

            return {
              count: results.length,
              next: null,
              previous: null,
              results,
            };
          }
        );

        this.server.get('/profiles/:id', (schema, req) =>
          schema.profiles.find(`${req.params.id}`)?.toJSON()
        );

        this.server.get('/profiles/:id/api_scan_options', (_, req) => {
          return { api_url_filters: '', id: req.params.id };
        });

        this.server.get('/profiles/:id/proxy_settings', (_, req) => {
          return { id: req.params.id, host: '', port: '', enabled: false };
        });

        await render(hbs`
        <FileDetails::DynamicScan::Manual @file={{this.file}} @dynamicScanText={{this.dynamicScanText}} />
      `);

        // open the drawer
        await click('[data-test-fileDetails-dynamicScanAction="startBtn"]');

        assert
          .dom(
            '[data-test-fileDetails-dynamicScanDrawer-manualDast-devicePrefTable-root]'
          )
          .exists();

        assert
          .dom(
            '[data-test-fileDetails-dynamicScanDrawer-manualDast-devicePrefTableHeaderTitle]'
          )
          .hasText(t('modalCard.dynamicScan.selectSpecificDevice'));

        assert
          .dom(
            '[data-test-fileDetails-dynamicScanDrawer-manualDast-devicePrefTable-filterSelect]'
          )
          .exists();

        // default all avilable devices selected
        assert
          .dom(
            `[data-test-fileDetails-dynamicScanDrawer-manualDast-devicePrefTable-filterSelect] .${classes.trigger}`
          )
          .hasText(t('modalCard.dynamicScan.allAvailableDevices'));

        await selectChoose(
          `[data-test-fileDetails-dynamicScanDrawer-manualDast-devicePrefTable-filterSelect] .${classes.trigger}`,
          filter.label()
        );

        assert
          .dom(
            `[data-test-fileDetails-dynamicScanDrawer-manualDast-devicePrefTable-filterSelect] .${classes.trigger}`
          )
          .hasText(filter.label());

        assert.strictEqual(
          this.queryParams[filter.value],
          'true',
          `filter ${filter.label()} applied`
        );
      }
    );

    test.each(
      'dynamic scan extend time',
      [
        { canExtend: false, autoShutdownMinutes: 30 },
        { canExtend: true, autoShutdownMinutes: 15 },
      ],
      async function (assert, { canExtend, autoShutdownMinutes }) {
        const dynamicscan = this.server.create('dynamicscan', {
          file: '10',
          mode: ENUMS.DYNAMIC_MODE.MANUAL,
          status: ENUMS.DYNAMIC_SCAN_STATUS.READY_FOR_INTERACTION,

          auto_shutdown_on: dayjs()
            .add(autoShutdownMinutes, 'minutes')
            .toISOString(),

          ended_on: null,
        });

        // create file with latest dynamic scan
        this.file = this.store.push(
          this.store.normalize(
            'file',
            this.server
              .create('file', {
                id: '10',
                last_manual_dynamic_scan: dynamicscan.id,
                is_active: true,
              })
              .toJSON()
          )
        );

        this.server.get('/v2/dynamicscans/:id', (schema, req) => {
          return schema.dynamicscans.find(`${req.params.id}`).toJSON();
        });

        this.server.put('/v2/dynamicscans/:id/extend', (schema, req) => {
          const data = JSON.parse(req.requestBody);

          assert.strictEqual(data.time, 15);

          return schema.dynamicscans
            .find(`${req.params.id}`)
            .update({
              auto_shutdown_on: dayjs()
                .add(autoShutdownMinutes + data.time, 'minutes')
                .toISOString(),
            })
            .toJSON();
        });

        await render(hbs`
          <FileDetails::DynamicScan::Manual @file={{this.file}} @dynamicScanText={{this.dynamicScanText}} />
        `);

        assert
          .dom('[data-test-fileDetails-dynamicScanAction="stopBtn"]')
          .isNotDisabled();

        assert.dom('[data-test-vncviewer-root]').exists();
        assert.dom('[data-test-novncrfb-canvascontainer]').exists();

        assert.dom('[data-test-filedetails-dynamicscan-expiry]').exists();

        const expiryInfoTooltip =
          '[data-test-filedetails-dynamicscan-expiry-tooltip]';

        assert.dom(expiryInfoTooltip).exists();

        await triggerEvent(expiryInfoTooltip, 'mouseenter');

        assert
          .dom('[data-test-ak-tooltip-content]')
          .hasText(t('dynamicScanTitleTooltip'));

        await triggerEvent(expiryInfoTooltip, 'mouseleave');

        assert
          .dom('[data-test-filedetails-dynamicscan-expiry-time]')
          .containsText(`${autoShutdownMinutes - 1}:`);

        const extendbtn =
          '[data-test-filedetails-dynamicscan-expiry-extendbtn]';

        if (canExtend) {
          assert.dom(extendbtn).isNotDisabled();
        } else {
          assert.dom(extendbtn).isDisabled();
        }

        await triggerEvent(
          '[data-test-fileDetails-dynamicScan-expiry-extendBtn-tooltip]',
          'mouseenter'
        );

        if (canExtend) {
          assert.dom('[data-test-ak-tooltip-content]').doesNotExist();
        } else {
          assert
            .dom('[data-test-ak-tooltip-content]')
            .hasText(t('dynamicScanExtentionLimit'));
        }

        await triggerEvent(
          '[data-test-fileDetails-dynamicScan-expiry-extendBtn-tooltip]',
          'mouseleave'
        );

        if (canExtend) {
          await click(extendbtn);

          assert
            .dom(
              '[data-test-filedetails-dynamicscan-expiry-extendtime-menu-item]'
            )
            .exists({ count: 3 });

          const timeOptions = findAll(
            '[data-test-filedetails-dynamicscan-expiry-extendtime-menu-item] button'
          );

          [5, 15, 30].forEach((time, idx) => {
            assert.dom(timeOptions[idx]).hasText(`${time} mins`);
          });

          await click(timeOptions[1]);
        }
      }
    );
  }
);
