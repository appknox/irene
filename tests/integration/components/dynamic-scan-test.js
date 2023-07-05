import { click, fillIn, find, findAll, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';
import Service from '@ember/service';
import { Response } from 'miragejs';
import { selectChoose } from 'ember-power-select/test-support';
import faker from 'faker';

import ENUMS from 'irene/enums';
import { deviceType } from 'irene/helpers/device-type';
import styles from 'irene/components/ak-select/index.scss';

const classes = {
  dropdown: styles['ak-select-dropdown'],
  trigger: styles['ak-select-trigger'],
  triggerError: styles['ak-select-trigger-error'],
};

const dynamicScanStatusText = {
  [ENUMS.DYNAMIC_STATUS.INQUEUE]: 't:deviceInQueue:()',
  [ENUMS.DYNAMIC_STATUS.BOOTING]: 't:deviceBooting:()',
  [ENUMS.DYNAMIC_STATUS.DOWNLOADING]: 't:deviceDownloading:()',
  [ENUMS.DYNAMIC_STATUS.INSTALLING]: 't:deviceInstalling:()',
  [ENUMS.DYNAMIC_STATUS.LAUNCHING]: 't:deviceLaunching:()',
  [ENUMS.DYNAMIC_STATUS.HOOKING]: 't:deviceHooking:()',
  [ENUMS.DYNAMIC_STATUS.SHUTTING_DOWN]: 't:deviceShuttingDown:()',
  [ENUMS.DYNAMIC_STATUS.COMPLETED]: 't:deviceCompleted:()',
};

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

module(
  'Integration | Component | file-details/scan-actions/dynamic-scan',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks);

    hooks.beforeEach(async function () {
      this.server.createList('organization', 1);

      const store = this.owner.lookup('service:store');

      const profile = this.server.create('profile', { id: '100' });

      const file = this.server.create('file', {
        project: '1',
        profile: profile.id,
      });

      const availableDevices = [
        ...this.server.createList('available-device', 5, {
          is_tablet: true,
          platform: 0,
        }),
        ...this.server.createList('available-device', 5, {
          is_tablet: true,
          platform: 1,
        }),
        ...this.server.createList('available-device', 5, {
          is_tablet: false,
          platform: 0,
        }),
        ...this.server.createList('available-device', 5, {
          is_tablet: false,
          platform: 1,
        }),
      ];

      const devicePreference = this.server.create('device-preference', {
        id: profile.id,
      });

      this.server.create('project', { file: file.id, id: '1' });

      this.setProperties({
        file: store.push(store.normalize('file', file.toJSON())),
        dynamicScanText: 'Start',
        devicePreference,
        availableDevices,
        store,
      });

      await this.owner.lookup('service:organization').load();
      this.owner.register('service:notifications', NotificationsStub);
    });

    test.each(
      'test different states of dynamic scan',
      ENUMS.DYNAMIC_STATUS.VALUES,
      async function (assert, status) {
        if (status === ENUMS.DYNAMIC_STATUS.COMPLETED) {
          this.file.dynamicStatus = ENUMS.DYNAMIC_STATUS.NONE;
          this.file.isDynamicDone = true;
        } else {
          this.file.dynamicStatus = status;
          this.file.isDynamicDone = false;
        }

        // make sure file is active
        this.file.isActive = true;

        this.server.get('/v2/projects/:id', (schema, req) => {
          return schema.projects.find(`${req.params.id}`)?.toJSON();
        });

        await render(hbs`
            <DynamicScan @file={{this.file}} @dynamicScanText={{this.dynamicScanText}} />
        `);

        if (this.file.dynamicStatus === ENUMS.DYNAMIC_STATUS.ERROR) {
          assert
            .dom('[data-test-dynamicScan-startBtn]')
            .hasText('t:errored:()');

          assert.dom('[data-test-dynamicScan-restartBtn]').isNotDisabled();
        } else if (
          this.file.dynamicStatus === ENUMS.DYNAMIC_STATUS.NONE &&
          this.file.isDynamicDone
        ) {
          assert
            .dom('[data-test-dynamicScan-startBtn]')
            .hasText('t:completed:()');

          assert.dom('[data-test-dynamicScan-restartBtn]').isNotDisabled();
        } else if (this.file.dynamicStatus === ENUMS.DYNAMIC_STATUS.NONE) {
          assert
            .dom('[data-test-dynamicScan-startBtn]')
            .hasText(this.dynamicScanText);

          assert.dom('[data-test-dynamicScan-restartBtn]').doesNotExist();
        } else if (this.file.dynamicStatus === ENUMS.DYNAMIC_STATUS.READY) {
          assert.dom('[data-test-dynamicScan-stopBtn]').hasText('t:stop:()');

          assert.dom('[data-test-dynamicScan-restartBtn]').doesNotExist();
        } else {
          assert.strictEqual(
            this.file.statusText,
            dynamicScanStatusText[this.file.dynamicStatus] || 'Unknown Status'
          );

          assert
            .dom('[data-test-dynamicScan-startBtn]')
            .isNotDisabled()
            .hasText(this.file.statusText);

          if (
            status === ENUMS.DYNAMIC_STATUS.INQUEUE &&
            this.file.canRunAutomatedDynamicscan
          ) {
            assert.dom('[data-test-dynamicScan-restartBtn]').isNotDisabled();
          }
        }
      }
    );

    test.each(
      'it should render dynamic scan modal',
      [
        { withApiProxySetting: true },
        { withApiScan: true },
        { withDeviceRequirements: true },
        { withAutomatedDynamicScan: true },
      ],
      async function (
        assert,
        {
          withApiProxySetting,
          withApiScan,
          withDeviceRequirements,
          withAutomatedDynamicScan,
        }
      ) {
        this.file.dynamicStatus = ENUMS.DYNAMIC_STATUS.NONE;
        this.file.isDynamicDone = false;

        if (withDeviceRequirements) {
          this.file.minOsVersion = '10.0';
          this.file.supportedCpuArchitectures = 'arm64';
          this.file.supportedDeviceTypes = 'iPhone';
        }

        if (withAutomatedDynamicScan) {
          this.file.canRunAutomatedDynamicscan = true;
        }

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
          const results = schema.availableDevices.all().models;

          return { count: results.length, next: null, previous: null, results };
        });

        this.server.get('/profiles/:id/api_scan_options', (_, req) => {
          return { api_url_filters: '', id: req.params.id };
        });

        this.server.get('/profiles/:id/proxy_settings', (_, req) => {
          return {
            id: req.params.id,
            host: withApiProxySetting ? faker.internet.ip() : '',
            port: withApiProxySetting ? faker.internet.port() : '',
            enabled: false,
          };
        });

        await render(hbs`
            <DynamicScan @file={{this.file}} @dynamicScanText={{this.dynamicScanText}} />
        `);

        assert
          .dom('[data-test-dynamicScan-startBtn]')
          .hasText(this.dynamicScanText);

        assert.dom('[data-test-dynamicScan-restartBtn]').doesNotExist();

        await click('[data-test-dynamicScan-startBtn]');

        assert
          .dom('[data-test-ak-modal-header]')
          .hasText('t:modalCard.dynamicScan.title:()');

        assert
          .dom('[data-test-dynamicScanModal-warningAlert]')
          .hasText('t:modalCard.dynamicScan.warning:()');

        if (this.file.minOsVersion) {
          assert
            .dom('[data-test-dynamicScanModal-deviceRequirementContainer]')
            .exists();

          const deviceRequirements = [
            {
              type: 't:modalCard.dynamicScan.osVersion:()',
              value: `${this.file.project.get('platformDisplay')} ${
                this.file.minOsVersion
              } t:modalCard.dynamicScan.orAbove:()`,
            },
            {
              type: 't:modalCard.dynamicScan.processorArchitecture:()',
              value: this.file.supportedCpuArchitectures,
            },
            {
              type: 't:modalCard.dynamicScan.deviceTypes:()',
              value: this.file.supportedDeviceTypes,
            },
          ];

          deviceRequirements.forEach(({ type, value }) => {
            const container = find(
              `[data-test-dynamicScanModal-deviceRequirementGroup="${type}"]`
            );

            assert
              .dom(
                '[data-test-dynamicScanModal-deviceRequirementType]',
                container
              )
              .hasText(type);

            assert
              .dom(
                '[data-test-dynamicScanModal-deviceRequirementValue]',
                container
              )
              .hasText(value);
          });
        } else {
          assert
            .dom('[data-test-dynamicScanModal-deviceRequirementContainer]')
            .doesNotExist();
        }

        assert
          .dom('[data-test-projectPreference-title]')
          .hasText('t:devicePreferences:()');

        assert
          .dom('[data-test-projectPreference-description]')
          .hasText('t:otherTemplates.selectPreferredDevice:()');

        assert
          .dom(
            '[data-test-projectPreference-deviceTypeSelect] [data-test-form-label]'
          )
          .hasText('t:deviceType:()');

        assert
          .dom(
            `[data-test-projectPreference-deviceTypeSelect] .${classes.trigger}`
          )
          .hasText(`t:${deviceType([this.devicePreference.device_type])}:()`);

        assert
          .dom(
            '[data-test-projectPreference-osVersionSelect] [data-test-form-label]'
          )
          .hasText('t:osVersion:()');

        assert
          .dom(
            `[data-test-projectPreference-osVersionSelect] .${classes.trigger}`
          )
          .hasText(this.devicePreference.platform_version);

        assert
          .dom(
            '[data-test-dynamicScanModal-runApiScanFormControl] [data-test-ak-form-label]'
          )
          .hasText('t:modalCard.dynamicScan.runApiScan:()');

        assert
          .dom(
            '[data-test-dynamicScanModal-runApiScanFormControl] [data-test-dynamicScanModal-runApiScanCheckbox]'
          )
          .isNotDisabled()
          .isNotChecked();

        if (withApiScan) {
          await click(
            '[data-test-dynamicScanModal-runApiScanFormControl] [data-test-dynamicScanModal-runApiScanCheckbox]'
          );

          assert
            .dom(
              '[data-test-dynamicScanModal-runApiScanFormControl] [data-test-dynamicScanModal-runApiScanCheckbox]'
            )
            .isNotDisabled()
            .isChecked();

          assert
            .dom('[data-test-dynamicScanModal-apiSettingsContainer]')
            .exists();

          assert
            .dom('[data-test-dynamicScanModal-apiSettingScanDescription]')
            .hasText('t:modalCard.dynamicScan.apiScanDescription:()');

          assert
            .dom('[data-test-apiFilter-title]')
            .hasText('t:templates.apiScanURLFilter:()');

          assert
            .dom('[data-test-apiFilter-description]')
            .hasText('t:otherTemplates.specifyTheURL:()');

          assert
            .dom('[data-test-apiFilter-apiEndpointInput]')
            .isNotDisabled()
            .hasNoValue();

          assert
            .dom('[data-test-apiFilter-addApiEndpointBtn]')
            .isNotDisabled()
            .hasText('t:templates.addNewUrlFilter:()');

          assert.dom('[data-test-apiFilter-table]').doesNotExist();
        } else {
          assert
            .dom('[data-test-dynamicScanModal-apiSettingsContainer]')
            .doesNotExist();
        }

        const proxySetting = this.store.peekRecord(
          'proxy-setting',
          this.file.profile.get('id')
        );

        if (proxySetting.hasProxyUrl) {
          assert.dom('[data-test-proxySettingsView-container]').exists();

          assert
            .dom(
              '[data-test-proxySettingsView-enableApiProxyToggle] [data-test-toggle-input]'
            )
            .isNotDisabled()
            .isNotChecked();

          assert
            .dom('[data-test-proxySettingsView-enableApiProxyLabel]')
            .hasText('t:enable:() t:proxySettingsTitle:()');

          assert
            .dom('[data-test-proxySettingsView-editSettings]')
            .hasTagName('a')
            .hasAttribute('href', '/project/1/settings')
            .hasText('t:edit:()');

          assert
            .dom('[data-test-proxySettingsView-proxySettingRoute]')
            .hasText(
              `t:proxySettingsRouteVia:() ${proxySetting.host}:${proxySetting.port}`
            );
        } else {
          assert.dom('[data-test-proxySettingsView-container]').doesNotExist();
        }

        if (this.file.canRunAutomatedDynamicscan) {
          assert
            .dom('[data-test-dynamicScanModal-automatedDynamicScanContainer]')
            .exists();

          assert
            .dom('[data-test-dynamicScanModal-automatedDynamicScanTitle]')
            .hasText('t:dynamicScanAutomation:()');

          assert
            .dom('[data-test-dynamicScanModal-automatedDynamicScanChip]')
            .hasText('t:experimentalFeature:()');

          assert
            .dom('[data-test-dynamicScanModal-automatedDynamicScanDescription]')
            .hasText('t:scheduleDynamicscanDesc:()');

          assert
            .dom('[data-test-dynamicScanModal-automatedDynamicScanAppiumNote]')
            .hasText('t:appiumScriptsNote:()');

          assert
            .dom('[data-test-dynamicScanModal-automatedDynamicScanScheduleBtn]')
            .isNotDisabled()
            .hasText('t:scheduleDynamicscan:()');
        } else {
          assert
            .dom('[data-test-dynamicScanModal-automatedDynamicScanContainer]')
            .doesNotExist();
        }

        assert
          .dom('[data-test-dynamicScanModal-cancelBtn]')
          .isNotDisabled()
          .hasText('t:cancel:()');

        assert
          .dom('[data-test-dynamicScanModal-startBtn]')
          .isNotDisabled()
          .hasText('t:modalCard.dynamicScan.start:()');
      }
    );

    test('test add & delete of api filter endpoint', async function (assert) {
      this.file.dynamicStatus = ENUMS.DYNAMIC_STATUS.NONE;
      this.file.isDynamicDone = false;

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
        const results = schema.availableDevices.all().models;

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
        <DynamicScan @file={{this.file}} @dynamicScanText={{this.dynamicScanText}} />
      `);

      assert
        .dom('[data-test-dynamicScan-startBtn]')
        .hasText(this.dynamicScanText);

      assert.dom('[data-test-dynamicScan-restartBtn]').doesNotExist();

      await click('[data-test-dynamicScan-startBtn]');

      await click(
        '[data-test-dynamicScanModal-runApiScanFormControl] [data-test-dynamicScanModal-runApiScanCheckbox]'
      );

      assert
        .dom(
          '[data-test-dynamicScanModal-runApiScanFormControl] [data-test-dynamicScanModal-runApiScanCheckbox]'
        )
        .isNotDisabled()
        .isChecked();

      assert.dom('[data-test-dynamicScanModal-apiSettingsContainer]').exists();

      assert
        .dom('[data-test-dynamicScanModal-apiSettingScanDescription]')
        .hasText('t:modalCard.dynamicScan.apiScanDescription:()');

      assert
        .dom('[data-test-apiFilter-title]')
        .hasText('t:templates.apiScanURLFilter:()');

      assert
        .dom('[data-test-apiFilter-description]')
        .hasText('t:otherTemplates.specifyTheURL:()');

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

      // confirm box is 2nd modal
      assert
        .dom(findAll('[data-test-ak-modal-header]')[1])
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

    test('test enable api proxy toggle', async function (assert) {
      assert.expect(10);

      this.file.dynamicStatus = ENUMS.DYNAMIC_STATUS.NONE;
      this.file.isDynamicDone = false;

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
        const results = schema.availableDevices.all().models;

        return { count: results.length, next: null, previous: null, results };
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
        <DynamicScan @file={{this.file}} @dynamicScanText={{this.dynamicScanText}} />
      `);

      assert
        .dom('[data-test-dynamicScan-startBtn]')
        .hasText(this.dynamicScanText);

      assert.dom('[data-test-dynamicScan-restartBtn]').doesNotExist();

      await click('[data-test-dynamicScan-startBtn]');

      const proxySetting = this.store.peekRecord(
        'proxy-setting',
        this.file.profile.get('id')
      );

      assert.dom('[data-test-proxySettingsView-container]').exists();

      assert
        .dom(
          '[data-test-proxySettingsView-enableApiProxyToggle] [data-test-toggle-input]'
        )
        .isNotDisabled()
        .isNotChecked();

      await click(
        '[data-test-proxySettingsView-enableApiProxyToggle] [data-test-toggle-input]'
      );

      assert
        .dom(
          '[data-test-proxySettingsView-enableApiProxyToggle] [data-test-toggle-input]'
        )
        .isNotDisabled()
        .isChecked();

      assert.true(proxySetting.enabled);

      const notify = this.owner.lookup('service:notifications');

      assert.strictEqual(notify.infoMsg, 't:proxyTurned:() T:ON:()');
    });

    test.each(
      'test start dynamic scan',
      [{ automatedScan: false }, { automatedScan: true }],
      async function (assert, { automatedScan }) {
        this.file.dynamicStatus = ENUMS.DYNAMIC_STATUS.NONE;
        this.file.isDynamicDone = false;

        if (automatedScan) {
          this.file.canRunAutomatedDynamicscan = true;
        }

        this.server.get('/v2/projects/:id', (schema, req) => {
          return {
            ...schema.projects.find(`${req.params.id}`)?.toJSON(),
            platform: 0,
          };
        });

        this.server.get('/v2/files/:id', (schema, req) => {
          return schema.files.find(`${req.params.id}`)?.toJSON();
        });

        this.server.get('/profiles/:id', (schema, req) =>
          schema.profiles.find(`${req.params.id}`)?.toJSON()
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

        this.server.get('/projects/:id/available-devices', (schema) => {
          const results = schema.availableDevices.all().models;

          return { count: results.length, next: null, previous: null, results };
        });

        this.server.get('/profiles/:id/api_scan_options', (_, req) => {
          return {
            api_url_filters: 'api.example.com,api.example2.com',
            id: req.params.id,
          };
        });

        this.server.get('/profiles/:id/proxy_settings', (_, req) => {
          return {
            id: req.params.id,
            host: faker.internet.ip(),
            port: faker.internet.port(),
            enabled: false,
          };
        });

        this.server.put('/dynamicscan/:id', (schema, req) => {
          schema.db.files.update(`${req.params.id}`, {
            dynamic_status: ENUMS.DYNAMIC_STATUS.BOOTING,
          });

          return new Response(200);
        });

        this.server.post(
          '/dynamicscan/:id/schedule_automation',
          (schema, req) => {
            schema.db.files.update(`${req.params.id}`, {
              dynamic_status: ENUMS.DYNAMIC_STATUS.INQUEUE,
            });

            return new Response(201);
          }
        );

        await render(hbs`
        <DynamicScan @file={{this.file}} @dynamicScanText={{this.dynamicScanText}} />
      `);

        assert
          .dom('[data-test-dynamicScan-startBtn]')
          .hasText(this.dynamicScanText);

        assert.dom('[data-test-dynamicScan-restartBtn]').doesNotExist();

        await click('[data-test-dynamicScan-startBtn]');

        // choose device type and os version
        assert
          .dom(
            `[data-test-projectPreference-deviceTypeSelect] .${classes.trigger}`
          )
          .hasText(`t:${deviceType([ENUMS.DEVICE_TYPE.TABLET_REQUIRED])}:()`);

        assert
          .dom(
            `[data-test-projectPreference-osVersionSelect] .${classes.trigger}`
          )
          .hasText(this.devicePreference.platform_version);

        await selectChoose(
          `[data-test-projectPreference-deviceTypeSelect] .${classes.trigger}`,
          `t:${deviceType([ENUMS.DEVICE_TYPE.PHONE_REQUIRED])}:()`
        );

        // verify ui
        assert
          .dom(
            `[data-test-projectPreference-deviceTypeSelect] .${classes.trigger}`
          )
          .hasText(`t:${deviceType([ENUMS.DEVICE_TYPE.PHONE_REQUIRED])}:()`);

        // verify network data
        assert.strictEqual(
          this.requestBody.device_type,
          `${ENUMS.DEVICE_TYPE.PHONE_REQUIRED}`
        );

        const filteredDevices = this.availableDevices.filter(
          (it) => it.platform === 0 && !it.is_tablet
        );

        await selectChoose(
          `[data-test-projectPreference-osVersionSelect] .${classes.trigger}`,
          filteredDevices[1].platform_version
        );

        // verify ui
        assert
          .dom(
            `[data-test-projectPreference-osVersionSelect] .${classes.trigger}`
          )
          .hasText(filteredDevices[1].platform_version);

        // verify network data
        assert.strictEqual(
          this.requestBody.platform_version,
          filteredDevices[1].platform_version
        );

        // enable api catpure
        await click(
          '[data-test-dynamicScanModal-runApiScanFormControl] [data-test-dynamicScanModal-runApiScanCheckbox]'
        );

        // verify api-filter render
        let apiFilterRows = findAll('[data-test-apiFilter-row]');

        assert.strictEqual(apiFilterRows.length, 2);

        assert
          .dom(
            apiFilterRows[0].querySelectorAll('[data-test-apiFilter-cell]')[0]
          )
          .hasText('api.example.com');

        assert
          .dom(
            apiFilterRows[1].querySelectorAll('[data-test-apiFilter-cell]')[0]
          )
          .hasText('api.example2.com');

        if (automatedScan) {
          assert
            .dom('[data-test-dynamicScanModal-automatedDynamicScanScheduleBtn]')
            .isNotDisabled()
            .hasText('t:scheduleDynamicscan:()');

          await click(
            '[data-test-dynamicScanModal-automatedDynamicScanScheduleBtn]'
          );
        } else {
          assert
            .dom('[data-test-dynamicScanModal-startBtn]')
            .isNotDisabled()
            .hasText('t:modalCard.dynamicScan.start:()');

          await click('[data-test-dynamicScanModal-startBtn]');
        }

        const notify = this.owner.lookup('service:notifications');

        assert.strictEqual(
          notify.successMsg,
          automatedScan
            ? 't:scheduleDynamicscanSuccess:()'
            : 't:startingScan:()'
        );

        // assert.strictEqual(
        //   this.file.dynamicStatus,
        //   automatedScan
        //     ? ENUMS.DYNAMIC_STATUS.INQUEUE
        //     : ENUMS.DYNAMIC_STATUS.BOOTING
        // );

        // modal should close
        assert.dom('[data-test-ak-modal-header]').doesNotExist();

        // assert
        //   .dom('[data-test-dynamicScan-startBtn]')
        //   .hasText(
        //     dynamicScanStatusText[
        //       automatedScan
        //         ? ENUMS.DYNAMIC_STATUS.INQUEUE
        //         : ENUMS.DYNAMIC_STATUS.BOOTING
        //     ]
        //   );
      }
    );

    test('test stop dynamic scan', async function (assert) {
      this.file.dynamicStatus = ENUMS.DYNAMIC_STATUS.READY;
      this.file.isDynamicDone = false;

      // make sure file is active
      this.file.isActive = true;

      this.server.get('/v2/projects/:id', (schema, req) => {
        return schema.projects.find(`${req.params.id}`)?.toJSON();
      });

      this.server.delete('/dynamicscan/:id', () => new Response(204));

      await render(hbs`
        <DynamicScan @file={{this.file}} @dynamicScanText={{this.dynamicScanText}} />
      `);

      assert.dom('[data-test-dynamicScan-stopBtn]').hasText('t:stop:()');
      assert.dom('[data-test-dynamicScan-restartBtn]').doesNotExist();

      await click('[data-test-dynamicScan-stopBtn]');
    });
  }
);
