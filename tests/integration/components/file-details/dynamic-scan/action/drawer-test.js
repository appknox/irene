import {
  click,
  fillIn,
  find,
  findAll,
  render,
  triggerEvent,
} from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';
import Service from '@ember/service';
import { Response } from 'miragejs';
import { selectChoose } from 'ember-power-select/test-support';
import { faker } from '@faker-js/faker';

import ENUMS from 'irene/enums';
import { dsManualDevicePref } from 'irene/helpers/ds-manual-device-pref';
import { dsAutomatedDevicePref } from 'irene/helpers/ds-automated-device-pref';
import { deviceType } from 'irene/helpers/device-type';
import { objectifyEncodedReqBody } from 'irene/tests/test-utils';

import styles from 'irene/components/ak-select/index.scss';

const classes = {
  dropdown: styles['ak-select-dropdown'],
  trigger: styles['ak-select-trigger'],
  triggerError: styles['ak-select-trigger-error'],
};

// const dynamicScanStatusText = {
//   [ENUMS.DYNAMIC_STATUS.INQUEUE]: 't:deviceInQueue:()',
//   [ENUMS.DYNAMIC_STATUS.BOOTING]: 't:deviceBooting:()',
//   [ENUMS.DYNAMIC_STATUS.DOWNLOADING]: 't:deviceDownloading:()',
//   [ENUMS.DYNAMIC_STATUS.INSTALLING]: 't:deviceInstalling:()',
//   [ENUMS.DYNAMIC_STATUS.LAUNCHING]: 't:deviceLaunching:()',
//   [ENUMS.DYNAMIC_STATUS.HOOKING]: 't:deviceHooking:()',
//   [ENUMS.DYNAMIC_STATUS.SHUTTING_DOWN]: 't:deviceShuttingDown:()',
//   [ENUMS.DYNAMIC_STATUS.COMPLETED]: 't:deviceCompleted:()',
// };

class NotificationsStub extends Service {
  errorMsg = null;
  successMsg = null;
  infoMsg = null;

  error(msg) {
    this.errorMsg = msg;
  }

  success(msg) {
    this.successMsg = msg;
  }

  info(msg) {
    this.infoMsg = msg;
  }
}

class PollServiceStub extends Service {
  callback = null;
  interval = null;

  startPolling(cb, interval) {
    function stop() {}

    this.callback = cb;
    this.interval = interval;

    return stop;
  }
}

module(
  'Integration | Component | file-details/dynamic-scan/action/drawer',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks);

    hooks.beforeEach(async function () {
      this.server.createList('organization', 1);

      const store = this.owner.lookup('service:store');

      const profile = this.server.create('profile', {
        id: '100',
      });

      const file = this.server.create('file', {
        project: '1',
        profile: profile.id,
      });

      const project = this.server.create('project', { file: file.id, id: '1' });

      // Project Available Devices
      const getDeviceCapabilities = () => ({
        has_sim: faker.datatype.boolean(),
        has_vpn: faker.datatype.boolean(),
        has_pin_lock: faker.datatype.boolean(),
        device_identifier: faker.string.alphanumeric(7).toUpperCase(),
        platform_version: faker.helpers.arrayElement(['13', '12', '14']),
      });

      const availableDevices = [
        ...this.server.createList('project-available-device', 1, {
          is_tablet: true,
          platform: 0,
          ...getDeviceCapabilities(),
        }),
        ...this.server.createList('project-available-device', 1, {
          is_tablet: true,
          platform: 1,
          ...getDeviceCapabilities(),
        }),
        ...this.server.createList('project-available-device', 1, {
          is_tablet: false,
          platform: 0,
          ...getDeviceCapabilities(),
        }),
        ...this.server.createList('project-available-device', 1, {
          is_tablet: false,
          platform: 1,
          ...getDeviceCapabilities(),
        }),
      ];

      this.server.get('/profiles/:id', (schema, req) =>
        schema.profiles.find(`${req.params.id}`)?.toJSON()
      );

      this.server.get('/profiles/:id/device_preference', (schema, req) => {
        return schema.devicePreferences.find(`${req.params.id}`)?.toJSON();
      });

      this.server.get('/projects/:id/available-devices', (schema) => {
        const results = schema.projectAvailableDevices.all().models;

        return { count: results.length, next: null, previous: null, results };
      });

      this.server.get('/profiles/:id/api_scan_options', (_, req) => {
        return { api_url_filters: '', id: req.params.id };
      });

      this.server.get('v2/profiles/:id/ds_automated_device_preference', () => {
        return {};
      });

      this.server.get('v2/profiles/:id/ds_manual_device_preference', () => {
        return {};
      });

      this.server.get('/profiles/:id/proxy_settings', (_, req) => {
        return {
          id: req.params.id,
          host: faker.internet.ip(),
          port: faker.internet.port(),
          enabled: false,
        };
      });

      const devicePreference = this.server.create('device-preference', {
        id: profile.id,
        device_type: ENUMS.DEVICE_TYPE.TABLET_REQUIRED,
      });

      this.setProperties({
        file: store.push(store.normalize('file', file.toJSON())),
        project: store.push(store.normalize('project', project.toJSON())),
        profile: store.push(store.normalize('profile', profile.toJSON())),
        onClose: () => {},
        devicePreference,
        availableDevices,
        store,
      });

      await this.owner.lookup('service:organization').load();
      this.owner.register('service:notifications', NotificationsStub);
      this.owner.register('service:poll', PollServiceStub);
    });

    test('manual DAST: it renders dynamic scan modal', async function (assert) {
      assert.expect();

      this.server.get('v2/profiles/:id/ds_manual_device_preference', () => {
        return {
          ds_manual_device_selection:
            ENUMS.DS_MANUAL_DEVICE_SELECTION.ANY_DEVICE,

          ds_manual_device_identifier: faker.string.alphanumeric({
            casing: 'upper',
            length: 6,
          }),
        };
      });

      this.server.get('/v2/projects/:id', (schema, req) => {
        return schema.projects.find(`${req.params.id}`)?.toJSON();
      });

      await render(hbs`
        <ProjectPreferences::Provider
          @profileId={{this.profile.id}}
          @platform={{this.file.project.platform}}
          @project={{this.file.project}}
          as |dpContext|
        >
          <FileDetails::DynamicScan::Action::Drawer
            @onClose={{this.onClose}}
            @file={{this.file}}
            @dpContext={{dpContext}}
          />
        </ProjectPreferences::Provider>
      `);

      assert
        .dom('[data-test-fileDetails-dynamicScanDrawer-drawerContainer-title]')
        .exists()
        .hasText('t:dastTabs.manualDAST:()');

      assert
        .dom(
          '[data-test-fileDetails-dynamicScanDrawer-drawerContainer-closeBtn]'
        )
        .exists();

      // CTA Buttons
      assert
        .dom('[data-test-fileDetails-dynamicScanDrawer-startBtn]')
        .exists()
        .hasText('t:start:()');

      assert
        .dom('[data-test-fileDetails-dynamicScanDrawer-cancelBtn]')
        .exists()
        .hasText('t:cancel:()');

      assert
        .dom('[data-test-fileDetails-dynamicScanDrawer-manualDast-header]')
        .exists();

      assert
        .dom(
          '[data-test-fileDetails-dynamicScanDrawer-manualDast-modalBodyWrapper]'
        )
        .exists();

      assert
        .dom(
          '[data-test-fileDetails-dynamicScanDrawer-manualDast-headerDeviceRequirements]'
        )
        .exists()
        .hasText('t:modalCard.dynamicScan.deviceRequirements:()');

      assert
        .dom(
          '[data-test-fileDetails-dynamicScanDrawer-manualDast-headerOSInfoDesc]'
        )
        .exists()
        .containsText('t:modalCard.dynamicScan.osVersion:()');

      assert
        .dom(
          '[data-test-fileDetails-dynamicScanDrawer-manualDast-headerOSInfoValue]'
        )
        .exists()
        .containsText(this.file.project.get('platformDisplay'))
        .containsText('t:modalCard.dynamicScan.orAbove:()')
        .containsText(this.file.minOsVersion);

      assert
        .dom(
          '[data-test-fileDetails-dynamicScanDrawer-manualDast-devicePrefHeaderDesc]'
        )
        .exists()
        .containsText('t:devicePreferences:()');

      assert
        .dom(
          '[data-test-fileDetails-dynamicScanDrawer-manualDast-devicePrefSelect]'
        )
        .exists();

      await click(`.${classes.trigger}`);

      assert.dom(`.${classes.dropdown}`).exists();

      // Select options for manual dast device seletion
      let selectListItems = findAll('.ember-power-select-option');

      const manualDastBaseChoiceValues =
        ENUMS.DS_MANUAL_DEVICE_SELECTION.BASE_VALUES;

      assert.strictEqual(
        selectListItems.length,
        manualDastBaseChoiceValues.length
      );

      for (let i = 0; i < selectListItems.length; i++) {
        const optionElement = selectListItems[i];
        const deviceSelection = manualDastBaseChoiceValues[i];

        assert.strictEqual(
          optionElement.textContent?.trim(),
          `t:${dsManualDevicePref([deviceSelection])}:()`
        );
      }

      // Default selected is any device or nothing
      // This means the available devices do not show up
      assert
        .dom(
          '[data-test-fileDetails-dynamicScanDrawer-manualDast-devicePrefTable-root]'
        )
        .doesNotExist();

      assert.dom('[data-test-fileDetails-proxySettings-container]').exists();

      assert
        .dom(
          '[data-test-fileDetails-dynamicScanDrawer-manualDast-enableAPICapture]'
        )
        .exists()
        .containsText('t:modalCard.dynamicScan.runApiScan:()');

      assert
        .dom(
          '[data-test-fileDetails-dynamicScanDrawer-manualDast-enableAPICaptureCheckbox]'
        )
        .exists()
        .isNotChecked();

      // Sanity check for API URL filter section (Already tested)
      assert
        .dom(
          '[data-test-fileDetails-dynamicScanDrawer-manualDast-apiFilter-title]'
        )
        .hasText('t:templates.apiScanURLFilter:()');

      assert.dom('[data-test-apiFilter-description]').doesNotExist();

      assert
        .dom('[data-test-apiFilter-apiEndpointInput]')
        .isNotDisabled()
        .hasNoValue();

      assert
        .dom('[data-test-apiFilter-addApiEndpointBtn]')
        .isNotDisabled()
        .hasText('t:templates.addNewUrlFilter:()');

      const apiURLTitleTooltip = find(
        '[data-test-fileDetails-dynamicScanDrawer-manualDast-apiURLFilter-iconTooltip]'
      );

      await triggerEvent(apiURLTitleTooltip, 'mouseenter');

      assert
        .dom('[data-test-ak-tooltip-content]')
        .exists()
        .containsText('t:modalCard.dynamicScan.apiScanUrlFilterTooltipText:()');

      await triggerEvent(apiURLTitleTooltip, 'mouseleave');
    });

    test('manual DAST: test add & delete of api filter endpoint', async function (assert) {
      this.server.get('/v2/projects/:id', (schema, req) => {
        return schema.projects.find(`${req.params.id}`)?.toJSON();
      });

      this.server.get('/profiles/:id', (schema, req) =>
        schema.profiles.find(`${req.params.id}`)?.toJSON()
      );

      this.server.get('/profiles/:id/device_preference', (schema, req) => {
        return schema.devicePreferences.find(`${req.params.id}`)?.toJSON();
      });

      this.server.get('/projects/:id/available-devices', (schema) => {
        const results = schema.projectAvailableDevices.all().models;

        return { count: results.length, next: null, previous: null, results };
      });

      this.server.get('/profiles/:id/api_scan_options', (_, req) => {
        return { api_url_filters: '', id: req.params.id };
      });

      this.server.get('/profiles/:id/proxy_settings', (_, req) => {
        return {
          id: req.params.id,
          host: '',
          port: '',
          enabled: false,
        };
      });

      await render(hbs`        
        <ProjectPreferences::Provider
          @profileId={{this.profile.id}}
          @platform={{this.file.project.platform}}
          @project={{this.file.project}}
          as |dpContext|
        >
          <FileDetails::DynamicScan::Action::Drawer
            @onClose={{this.onClose}}
            @file={{this.file}}
            @dpContext={{dpContext}}
          />
        </ProjectPreferences::Provider>
      `);

      assert
        .dom(
          '[data-test-fileDetails-dynamicScanDrawer-manualDast-apiFilter-title]'
        )
        .hasText('t:templates.apiScanURLFilter:()');

      assert.dom('[data-test-apiFilter-description]').doesNotExist();

      assert
        .dom('[data-test-apiFilter-apiEndpointInput]')
        .isNotDisabled()
        .hasNoValue();

      assert
        .dom('[data-test-apiFilter-addApiEndpointBtn]')
        .isNotDisabled()
        .hasText('t:templates.addNewUrlFilter:()');

      assert.dom('[data-test-apiFilter-table]').doesNotExist();

      const notify = this.owner.lookup('service:notifications');

      // empty input
      await click('[data-test-apiFilter-addApiEndpointBtn]');

      assert.strictEqual(notify.errorMsg, 't:emptyURLFilter:()');

      // invalid url
      await fillIn(
        '[data-test-apiFilter-apiEndpointInput]',
        'https://api.example.com'
      );

      await click('[data-test-apiFilter-addApiEndpointBtn]');

      assert.strictEqual(
        notify.errorMsg,
        'https://api.example.com t:invalidURL:()'
      );

      await fillIn('[data-test-apiFilter-apiEndpointInput]', 'api.example.com');

      await click('[data-test-apiFilter-addApiEndpointBtn]');

      assert.strictEqual(notify.successMsg, 't:urlUpdated:()');
      assert.dom('[data-test-apiFilter-table]').exists();

      await fillIn(
        '[data-test-apiFilter-apiEndpointInput]',
        'api.example2.com'
      );

      await click('[data-test-apiFilter-addApiEndpointBtn]');

      const headers = findAll('[data-test-apiFilter-thead] th');

      assert.strictEqual(headers.length, 2);
      assert.dom(headers[0]).hasText('t:apiURLFilter:()');
      assert.dom(headers[1]).hasText('t:action:()');

      let rows = findAll('[data-test-apiFilter-row]');

      assert.strictEqual(rows.length, 2);

      const firstRowCells = rows[0].querySelectorAll(
        '[data-test-apiFilter-cell]'
      );

      assert.dom(firstRowCells[0]).hasText('api.example.com');

      assert
        .dom('[data-test-apiFilter-deleteBtn]', firstRowCells[1])
        .isNotDisabled();

      // delete first url
      await click(
        firstRowCells[1].querySelector('[data-test-apiFilter-deleteBtn]')
      );

      assert
        .dom(findAll('[data-test-ak-modal-header]')[0])
        .exists()
        .hasText('t:confirm:()');

      assert
        .dom('[data-test-confirmbox-description]')
        .hasText('t:confirmBox.removeURL:()');

      assert
        .dom('[data-test-confirmbox-confirmBtn]')
        .isNotDisabled()
        .hasText('t:yes:()');

      await click('[data-test-confirmbox-confirmBtn]');

      rows = findAll('[data-test-apiFilter-row]');

      assert.strictEqual(notify.successMsg, 't:urlUpdated:()');
      assert.strictEqual(rows.length, 1);
    });

    test('manual DAST: test enable api proxy toggle', async function (assert) {
      assert.expect(16);

      this.server.get('/v2/projects/:id', (schema, req) => {
        return schema.projects.find(`${req.params.id}`)?.toJSON();
      });

      this.server.get('/profiles/:id', (schema, req) =>
        schema.profiles.find(`${req.params.id}`)?.toJSON()
      );

      this.server.get('/profiles/:id/device_preference', (schema, req) => {
        return schema.devicePreferences.find(`${req.params.id}`)?.toJSON();
      });

      this.server.get('/projects/:id/available-devices', (schema) => {
        const results = schema.projectAvailableDevices.all().models;

        return { count: results.length, next: null, previous: null, results };
      });

      this.server.get('/profiles/:id/api_scan_options', (_, req) => {
        return { api_url_filters: '', id: req.params.id };
      });

      this.server.get('/profiles/:id/proxy_settings', (_, req) => {
        return {
          id: req.params.id,
          host: faker.internet.ip(),
          port: faker.internet.port(),
          enabled: false,
        };
      });

      this.server.put('/profiles/:id/proxy_settings', (_, req) => {
        const data = JSON.parse(req.requestBody);

        assert.true(data.enabled);

        return {
          id: req.params.id,
          ...data,
        };
      });

      await render(hbs`        
        <ProjectPreferences::Provider
          @profileId={{this.profile.id}}
          @platform={{this.file.project.platform}}
          @project={{this.file.project}}
          as |dpContext|
        >
          <FileDetails::DynamicScan::Action::Drawer
            @onClose={{this.onClose}}
            @file={{this.file}}
            @dpContext={{dpContext}}
          />
        </ProjectPreferences::Provider>
      `);

      const proxySetting = this.store.peekRecord(
        'proxy-setting',
        this.file.profile.get('id')
      );

      assert.notOk(proxySetting.enabled);

      assert.dom('[data-test-fileDetails-proxySettings-container]').exists();

      const proxySettingsTooltip = find(
        '[data-test-fileDetails-proxySettings-helpIcon]'
      );

      await triggerEvent(proxySettingsTooltip, 'mouseenter');

      assert
        .dom('[data-test-fileDetails-proxySettings-helpTooltipContent]')
        .exists()
        .containsText('t:proxySettingsRouteVia:()')
        .containsText(proxySetting.port)
        .containsText(proxySetting.host);

      await triggerEvent(proxySettingsTooltip, 'mouseleave');

      assert
        .dom('[data-test-fileDetails-proxySettings-enableApiProxyLabel]')
        .exists()
        .containsText('t:enable:()')
        .containsText('t:proxySettingsTitle:()');

      const proxySettingsToggle =
        '[data-test-fileDetails-proxySettings-enableApiProxyToggle] [data-test-toggle-input]';

      assert.dom(proxySettingsToggle).isNotDisabled().isNotChecked();

      await click(proxySettingsToggle);

      assert.dom(proxySettingsToggle).isNotDisabled().isChecked();

      assert.true(proxySetting.enabled);

      const notify = this.owner.lookup('service:notifications');

      assert.strictEqual(notify.infoMsg, 't:proxyTurned:() T:ON:()');
    });

    test('manual DAST: it selects a device preference', async function (assert) {
      assert.expect();

      const DEFAULT_CHECKED_DEVICE_IDX = 0;
      const DEVICE_IDX_TO_SELECT = 1;

      const defaultSelectedDeviceId =
        this.availableDevices[DEFAULT_CHECKED_DEVICE_IDX].device_identifier;

      this.server.put(
        'v2/profiles/:id/ds_manual_device_preference',
        (_, req) => {
          const { ds_manual_device_identifier } = JSON.parse(req.requestBody);

          if (ds_manual_device_identifier) {
            const deviceId =
              this.availableDevices[DEVICE_IDX_TO_SELECT].device_identifier;

            // eslint-disable-next-line qunit/no-conditional-assertions
            assert.strictEqual(deviceId, ds_manual_device_identifier);
          }

          return {
            ds_manual_device_selection:
              ENUMS.DS_MANUAL_DEVICE_SELECTION.ANY_DEVICE,
            ds_manual_device_identifier: ds_manual_device_identifier,
          };
        }
      );

      this.server.get('v2/profiles/:id/ds_manual_device_preference', () => {
        return {
          ds_manual_device_selection:
            ENUMS.DS_MANUAL_DEVICE_SELECTION.ANY_DEVICE,
          ds_manual_device_identifier: defaultSelectedDeviceId,
        };
      });

      this.server.get('v2/projects/:id/available_manual_devices', (schema) => {
        const results = schema.projectAvailableDevices.all().models;

        return { count: results.length, next: null, previous: null, results };
      });

      await render(hbs`        
        <ProjectPreferences::Provider
          @profileId={{this.profile.id}}
          @platform={{this.file.project.platform}}
          @project={{this.file.project}}
          as |dpContext|
        >
          <FileDetails::DynamicScan::Action::Drawer
            @onClose={{this.onClose}}
            @file={{this.file}}
            @dpContext={{dpContext}}
          />
        </ProjectPreferences::Provider>
      `);

      assert
        .dom(
          '[data-test-fileDetails-dynamicScanDrawer-manualDast-devicePrefSelect]'
        )
        .exists();

      await click(`.${classes.trigger}`);

      assert.dom(`.${classes.dropdown}`).exists();

      // Select options for manual dast device seletion
      let selectListItems = findAll('.ember-power-select-option');

      const manualDastBaseChoiceValues =
        ENUMS.DS_MANUAL_DEVICE_SELECTION.BASE_VALUES;

      assert.strictEqual(
        selectListItems.length,
        manualDastBaseChoiceValues.length
      );

      for (let i = 0; i < selectListItems.length; i++) {
        const optionElement = selectListItems[i];
        const deviceSelection = manualDastBaseChoiceValues[i];

        assert.strictEqual(
          optionElement.textContent?.trim(),
          `t:${dsManualDevicePref([deviceSelection])}:()`
        );
      }

      const anyDeviceLabel = `t:${dsManualDevicePref([ENUMS.DS_MANUAL_DEVICE_SELECTION.ANY_DEVICE])}:()`;

      // Select "Any Device"
      await selectChoose(`.${classes.trigger}`, anyDeviceLabel);

      await click(`.${classes.trigger}`);
      selectListItems = findAll('.ember-power-select-option');

      //  "Any Device" is first option
      assert.dom(selectListItems[0]).hasAria('selected', 'true');

      //  Select 'Specific Device'
      const specificDeviceLabel = `t:${dsManualDevicePref([ENUMS.DS_MANUAL_DEVICE_SELECTION.SPECIFIC_DEVICE])}:()`;

      await selectChoose(`.${classes.trigger}`, specificDeviceLabel);

      await click(`.${classes.trigger}`);

      //  "Specific Device" is second option
      selectListItems = findAll('.ember-power-select-option');

      assert.dom(selectListItems[1]).hasAria('selected', 'true');

      await click(`.${classes.trigger}`);

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
        .containsText('t:modalCard.dynamicScan.selectSpecificDevice:()');

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
        has_vnc: 'vnc',
      };

      const deviceSelectRadioElement =
        '[data-test-fileDetails-dynamicScanDrawer-devicePrefTable-deviceSelectRadioInput]';

      for (let idx = 0; idx < deviceElemList.length; idx++) {
        const deviceElem = deviceElemList[idx];
        const deviceModel = this.availableDevices[idx];

        const deviceTypeLabel = deviceType([
          deviceModel.is_tablet
            ? ENUMS.DEVICE_TYPE.TABLET_REQUIRED
            : ENUMS.DEVICE_TYPE.PHONE_REQUIRED,
        ]);

        assert.dom(deviceElem).exists();

        assert.dom(deviceElem).containsText(`${deviceModel.device_identifier}`);

        assert.dom(deviceElem).containsText(`${deviceTypeLabel}`);

        assert
          .dom(deviceElem)
          .exists()
          .containsText(`${deviceModel.device_identifier}`);

        // Check for device capability list
        Object.keys(deviceCapabilitiesMap).forEach((key) => {
          if (deviceModel[key]) {
            const capabilityLabel = deviceCapabilitiesMap[key];

            assert
              .dom(
                `[data-test-fileDetails-dynamicScanDrawer-devicePrefTable-capabilityId='${capabilityLabel}']`,
                deviceElem
              )
              .containsText(t(capabilityLabel));
          }
        });

        // Check default selected
        if (defaultSelectedDeviceId === deviceModel.device_identifier) {
          assert.dom(deviceSelectRadioElement, deviceElem).isChecked();
        } else {
          assert.dom(deviceSelectRadioElement, deviceElem).isNotChecked();
        }

        if (DEVICE_IDX_TO_SELECT === idx) {
          // Check a selected device
          await click(deviceElem.querySelector(deviceSelectRadioElement));
        }
      }

      // Check that the select device idx is checked
      const checkedElem = deviceElemList[DEVICE_IDX_TO_SELECT];

      assert.dom(deviceSelectRadioElement, checkedElem).isChecked();
    });

    test.each(
      'automated DAST: it renders dynamic scan modal',
      [{ showProxyPreference: true }, { showProxyPreference: false }],
      async function (assert, { showProxyPreference }) {
        assert.expect();

        const dsAutomatedDevicePreference = {
          ds_automated_device_selection: faker.helpers.arrayElement([0, 1]),
          ds_automated_platform_version_min: faker.number.int({ max: 9 }),
        };

        this.server.get(
          'v2/profiles/:id/ds_automated_device_preference',
          () => {
            return dsAutomatedDevicePreference;
          }
        );

        this.server.get('/v2/projects/:id', (schema, req) => {
          return schema.projects.find(`${req.params.id}`)?.toJSON();
        });

        this.server.get('/profiles/:id/proxy_settings', (_, req) => {
          return {
            id: req.params.id,
            host: faker.internet.ip(),
            port: faker.internet.port(),
            enabled: showProxyPreference,
          };
        });

        await render(hbs`
          <ProjectPreferences::Provider
            @profileId={{this.profile.id}}
            @platform={{this.file.project.platform}}
            @project={{this.file.project}}
            as |dpContext|
          >
            <FileDetails::DynamicScan::Action::Drawer
              @onClose={{this.onClose}}
              @file={{this.file}}
              @dpContext={{dpContext}}
              @isAutomatedScan={{true}}
            />
          </ProjectPreferences::Provider>
        `);

        assert
          .dom(
            '[data-test-fileDetails-dynamicScanDrawer-drawerContainer-title]'
          )
          .exists()
          .hasText('t:dastTabs.automatedDAST:()');

        assert
          .dom(
            '[data-test-fileDetails-dynamicScanDrawer-drawerContainer-closeBtn]'
          )
          .exists();

        // CTA Buttons
        assert
          .dom('[data-test-fileDetails-dynamicScanDrawer-startBtn]')
          .exists()
          .hasText('t:modalCard.dynamicScan.restartScan:()');

        assert
          .dom(
            '[data-test-fileDetails-dynamicScanDrawer-settingsPageRedirectBtn]'
          )
          .exists()
          .hasText('t:modalCard.dynamicScan.goToGeneralSettings:()')
          .hasAttribute('target', '_blank')
          .hasAttribute(
            'href',
            `/dashboard/project/${this.file.project.id}/settings`
          );

        assert
          .dom(
            '[data-test-fileDetails-dynamicScanDrawer-automatedDast-headerDeviceRequirements]'
          )
          .exists()
          .hasText('t:modalCard.dynamicScan.deviceRequirements:()');

        assert
          .dom(
            '[data-test-fileDetails-dynamicScanDrawer-automatedDast-headerOSInfoDesc]'
          )
          .exists()
          .containsText('t:modalCard.dynamicScan.osVersion:()');

        assert
          .dom(
            '[data-test-fileDetails-dynamicScanDrawer-automatedDast-headerOSInfoValue]'
          )
          .exists()
          .containsText(this.file.project.get('platformDisplay'))
          .containsText('t:modalCard.dynamicScan.orAbove:()')
          .containsText(this.file.minOsVersion);

        // Device Preferences
        const devicePrefProps = [
          {
            id: 'selectedPref',
            title: t('modalCard.dynamicScan.selectedPref'),
            value: t(
              dsAutomatedDevicePref([
                dsAutomatedDevicePreference.ds_automated_device_selection ||
                  ENUMS.DS_AUTOMATED_DEVICE_SELECTION.FILTER_CRITERIA,
              ])
            ),
          },
          {
            id: 'minOSVersion',
            title: t('minOSVersion'),
            value:
              dsAutomatedDevicePreference.ds_automated_platform_version_min,
          },
        ];

        devicePrefProps.forEach((pref) => {
          assert
            .dom(
              `[data-test-fileDetails-dynamicScanDrawer-automatedDast-devicePreference='${pref.id}']`
            )
            .exists()
            .containsText(String(pref.value))
            .containsText(pref.title);
        });

        // Proxy settings
        const proxySetting = this.store.peekRecord(
          'proxy-setting',
          this.file.profile.get('id')
        );

        if (proxySetting.enabled) {
          assert
            .dom(
              '[data-test-fileDetails-dynamicScanDrawer-automatedDast-proxySettingsHeader]'
            )
            .exists()
            .containsText('t:enable:() t:proxySettingsTitle:()');

          assert
            .dom(
              '[data-test-fileDetails-dynamicScanDrawer-automatedDast-proxySettingsEnabledChip]'
            )
            .exists()
            .hasText('t:enabled:()');

          assert
            .dom(
              '[data-test-fileDetails-dynamicScanDrawer-automatedDast-proxySettingsRoutingInfo]'
            )
            .exists()
            .containsText('t:modalCard.dynamicScan.apiRoutingText:()')
            .containsText(proxySetting.host);
        } else {
          assert
            .dom(
              '[data-test-fileDetails-dynamicScanDrawer-automatedDast-proxySettingsContainer]'
            )
            .doesNotExist();
        }
      }
    );

    test.each(
      'automated DAST: api url filters',
      [{ empty: false }, { empty: true }],
      async function (assert, { empty }) {
        assert.expect();

        const URL_FILTERS = empty ? '' : 'testurl1.com,testurl2.com';

        const apiScanOptions = this.store.push(
          this.store.normalize(
            'api-scan-options',
            this.server
              .create('api-scan-options', { api_url_filters: URL_FILTERS })
              .toJSON()
          )
        );

        this.server.get('/v2/projects/:id', (schema, req) => {
          return schema.projects.find(`${req.params.id}`)?.toJSON();
        });

        this.server.get('/profiles/:id/api_scan_options', (schema, req) => {
          return { id: req.params.id, api_url_filters: URL_FILTERS };
        });

        this.server.get('/profiles/:id/proxy_settings', (_, req) => {
          return {
            id: req.params.id,
            host: faker.internet.ip(),
            port: faker.internet.port(),
            enabled: false,
          };
        });

        await render(hbs`
          <ProjectPreferences::Provider
            @profileId={{this.profile.id}}
            @platform={{this.file.project.platform}}
            @project={{this.file.project}}
            as |dpContext|
          >
            <FileDetails::DynamicScan::Action::Drawer
              @onClose={{this.onClose}}
              @file={{this.file}}
              @dpContext={{dpContext}}
              @isAutomatedScan={{true}}
            />
          </ProjectPreferences::Provider>
        `);

        assert
          .dom(
            '[data-test-fileDetails-dynamicScanDrawer-automatedDast-modalBodyWrapper]'
          )
          .exists();

        assert
          .dom(
            '[data-test-fileDetails-dynamicScanDrawer-automatedDast-apiFilter-title]'
          )
          .exists()
          .hasText('t:templates.apiScanURLFilter:()');

        const apiURLTitleTooltip = find(
          '[data-test-fileDetails-dynamicScanDrawer-automatedDast-apiURLFilter-iconTooltip]'
        );

        await triggerEvent(apiURLTitleTooltip, 'mouseenter');

        assert
          .dom('[data-test-ak-tooltip-content]')
          .exists()
          .containsText(
            't:modalCard.dynamicScan.apiScanUrlFilterTooltipText:()'
          );

        await triggerEvent(apiURLTitleTooltip, 'mouseleave');

        if (empty) {
          assert
            .dom(
              '[data-test-fileDetails-dynamicScanDrawer-automatedDast-apiURLFiltersEmptyContainer]'
            )
            .exists()
            .containsText('t:modalCard.dynamicScan.emptyAPIListHeaderText:()')
            .containsText('t:modalCard.dynamicScan.emptyAPIListSubText:()');
        } else {
          apiScanOptions.apiUrlFilterItems.forEach((url) => {
            const filterElem = find(
              `[data-test-fileDetails-dynamicScanDrawer-automatedDast-apiURLFilter='${url}']`
            );

            assert.dom(filterElem).exists().containsText(url);

            assert
              .dom(
                '[data-test-fileDetails-dynamicScanDrawer-automatedDast-apiURLFilterIcon]',
                filterElem
              )
              .exists();
          });
        }
      }
    );

    test.each(
      'automated DAST: active scenarios',
      [{ emptyActiveList: false }, { emptyActiveList: true }],
      async function (assert, { emptyActiveList }) {
        assert.expect();

        this.server.get(
          '/v2/projects/:projectId/scan_parameter_groups',
          function (schema) {
            const data = schema.scanParameterGroups.all().models;

            return {
              count: data.length,
              next: null,
              previous: null,
              results: data,
            };
          }
        );

        // Scenario Models
        const scenarios = this.server.createList('scan-parameter-group', 2, {
          project: this.file.project.id,
          is_active: emptyActiveList ? false : true,
        });

        await render(hbs`
          <ProjectPreferences::Provider
            @profileId={{this.profile.id}}
            @platform={{this.file.project.platform}}
            @project={{this.file.project}}
            as |dpContext|
          >
            <FileDetails::DynamicScan::Action::Drawer
              @onClose={{this.onClose}}
              @file={{this.file}}
              @dpContext={{dpContext}}
              @isAutomatedScan={{true}}
            />
          </ProjectPreferences::Provider>
        `);

        assert
          .dom(
            '[data-test-fileDetails-dynamicScanDrawer-automatedDast-modalBodyWrapper]'
          )
          .exists();

        assert
          .dom(
            '[data-test-fileDetails-dynamicScanDrawer-automatedDast-projectScenariosTitle]'
          )
          .exists()
          .hasText('t:modalCard.dynamicScan.activeScenarios:()');

        if (emptyActiveList) {
          assert
            .dom(
              '[data-test-fileDetails-dynamicScanDrawer-automatedDast-scenariosEmptyContainer]'
            )
            .exists()
            .containsText(
              't:modalCard.dynamicScan.emptyActiveScenariosHeaderText:()'
            )
            .containsText(
              't:modalCard.dynamicScan.emptyActiveScenariosSubText:()'
            );
        } else {
          scenarios.forEach((scenario) => {
            const scenarioElem = find(
              `[data-test-fileDetails-dynamicScanDrawer-automatedDast-projectScenario='${scenario.id}']`
            );

            assert.dom(scenarioElem).exists().containsText(scenario.name);

            assert
              .dom(
                '[data-test-fileDetails-dynamicScanDrawer-automatedDast-projectScenarioIcon]',
                scenarioElem
              )
              .exists();
          });
        }
      }
    );

    test.each(
      'test start dynamic scan',
      [
        { isAutomated: false, enableApiCapture: false },
        // { isAutomated: true, enableApiCapture: true },
      ],
      async function (assert, { isAutomated, enableApiCapture }) {
        const file = this.server.create('file', {
          project: '1',
          profile: '100',
          dynamic_status: ENUMS.DYNAMIC_STATUS.NONE,
          is_dynamic_done: false,
          can_run_automated_dynamicscan: isAutomated,
          is_active: true,
        });

        this.set('isAutomated', isAutomated);

        this.set(
          'file',
          this.store.push(this.store.normalize('file', file.toJSON()))
        );

        this.server.get('/profiles/:id/device_preference', (schema, req) => {
          return {
            ...schema.devicePreferences.find(`${req.params.id}`)?.toJSON(),
            device_type: ENUMS.DEVICE_TYPE.TABLET_REQUIRED,
          };
        });

        this.server.put('/profiles/:id/device_preference', (_, req) => {
          const data = req.requestBody
            .split('&')
            .map((it) => it.split('='))
            .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

          this.set('requestBody', data);

          return new Response(200);
        });

        this.server.get(
          'v2/projects/:id/available_manual_devices',
          (schema) => {
            const results = schema.projectAvailableDevices.all().models;

            return {
              count: results.length,
              next: null,
              previous: null,
              results,
            };
          }
        );

        this.server.get('/profiles/:id/api_scan_options', (_, req) => {
          return {
            api_url_filters: 'api.example.com,api.example2.com',
            id: req.params.id,
          };
        });

        this.server.put(
          'v2/profiles/:id/ds_manual_device_preference',
          (_, req) => {
            const { ds_manual_device_identifier } = JSON.parse(req.requestBody);

            return {
              ds_manual_device_selection:
                ENUMS.DS_MANUAL_DEVICE_SELECTION.ANY_DEVICE,
              ds_manual_device_identifier: ds_manual_device_identifier,
            };
          }
        );

        this.server.get('v2/profiles/:id/ds_manual_device_preference', () => {
          return {
            ds_manual_device_selection:
              ENUMS.DS_MANUAL_DEVICE_SELECTION.SPECIFIC_DEVICE,
            ds_manual_device_identifier: '',
          };
        });

        this.server.post('/v2/files/:id/dynamicscans', (_, req) => {
          const reqBody = objectifyEncodedReqBody(req.requestBody);

          assert.strictEqual(
            reqBody.mode,
            isAutomated ? 'Automated' : 'Manual'
          );

          if (enableApiCapture) {
            assert.strictEqual(reqBody.enable_api_capture, 'true');
          } else {
            assert.strictEqual(reqBody.enable_api_capture, 'false');
          }

          return new Response(200);
        });

        await render(hbs`        
          <ProjectPreferences::Provider
            @profileId={{this.profile.id}}
            @platform={{this.file.project.platform}}
            @project={{this.file.project}}
            as |dpContext|
          >
            <FileDetails::DynamicScan::Action::Drawer
              @onClose={{this.onClose}}
              @file={{this.file}}
              @dpContext={{dpContext}}
              @isAutomatedScan={{this.isAutomated}}
            />
          </ProjectPreferences::Provider>
        `);

        if (!isAutomated) {
          // Since device selection is undefined, start button should be disabled
          assert
            .dom('[data-test-fileDetails-dynamicScanDrawer-startBtn]')
            .exists()
            .isDisabled();

          // Select "Any Device"
          const anyDeviceLabel = `t:${dsManualDevicePref([ENUMS.DS_MANUAL_DEVICE_SELECTION.ANY_DEVICE])}:()`;

          await selectChoose(`.${classes.trigger}`, anyDeviceLabel);

          if (enableApiCapture) {
            // enable api catpure
            await click(
              '[data-test-fileDetails-dynamicScanDrawer-manualDast-enableAPICaptureCheckbox]'
            );
          }

          // Start button should be enabled
          assert
            .dom('[data-test-fileDetails-dynamicScanDrawer-startBtn]')
            .isNotDisabled();

          await click('[data-test-fileDetails-dynamicScanDrawer-startBtn]');
        }
      }
    );
  }
);
