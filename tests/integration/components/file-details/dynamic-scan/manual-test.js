/* eslint-disable qunit/no-conditional-assertions */
import { click, fillIn, find, findAll, render } from '@ember/test-helpers';
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
import { deviceType } from 'irene/helpers/device-type';
import styles from 'irene/components/ak-select/index.scss';
import { compareInnerHTMLWithIntlTranslation } from 'irene/tests/test-utils';

const classes = {
  dropdown: styles['ak-select-dropdown'],
  trigger: styles['ak-select-trigger'],
  triggerError: styles['ak-select-trigger-error'],
};

const dynamicScanStatusText = () => ({
  [ENUMS.DYNAMIC_STATUS.INQUEUE]: t('deviceInQueue'),
  [ENUMS.DYNAMIC_STATUS.BOOTING]: t('deviceBooting'),
  [ENUMS.DYNAMIC_STATUS.DOWNLOADING]: t('deviceDownloading'),
  [ENUMS.DYNAMIC_STATUS.INSTALLING]: t('deviceInstalling'),
  [ENUMS.DYNAMIC_STATUS.LAUNCHING]: t('deviceLaunching'),
  [ENUMS.DYNAMIC_STATUS.HOOKING]: t('deviceHooking'),
  [ENUMS.DYNAMIC_STATUS.SHUTTING_DOWN]: t('deviceShuttingDown'),
  [ENUMS.DYNAMIC_STATUS.COMPLETED]: t('deviceCompleted'),
});

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
  'Integration | Component | file-details/dynamic-scan/manual',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en');

    hooks.beforeEach(async function () {
      // Server mocks
      this.server.get('/dynamicscan/:id', (schema, req) => {
        return schema.dynamicscanOlds.find(`${req.params.id}`)?.toJSON();
      });

      this.server.get('/v2/projects/:id', (schema, req) => {
        return schema.projects.find(`${req.params.id}`)?.toJSON();
      });

      this.server.get('/profiles/:id/proxy_settings', (_, req) => {
        return {
          id: req.params.id,
          host: faker.internet.ip(),
          port: faker.internet.port(),
          enabled: false,
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
          device_type: ENUMS.DEVICE_TYPE.NO_PREFERENCE,
        };
      });

      this.server.put('/profiles/:id/device_preference', (_, req) => {
        const data = JSON.parse(req.requestBody);

        this.set('requestBody', data);

        return new Response(200);
      });

      this.server.get('/projects/:id/available-devices', (schema) => {
        const results = schema.projectAvailableDevices.all().models;

        return { count: results.length, next: null, previous: null, results };
      });

      this.server.get('/profiles/:id/api_scan_options', (_, req) => {
        return {
          api_url_filters: 'api.example.com,api.example2.com',
          id: req.params.id,
        };
      });

      this.server.createList('organization', 1);
      this.server.create('dynamicscan-old');

      const store = this.owner.lookup('service:store');

      const profile = this.server.create('profile', { id: '100' });

      const file = this.server.create('file', {
        project: '1',
        profile: profile.id,
      });

      const project = this.server.create('project', {
        last_file_id: file.id,
        id: '1',
      });

      const availableDevices = [
        ...this.server.createList('project-available-device', 5, {
          is_tablet: true,
          platform: 1,
        }),
        ...this.server.createList('project-available-device', 5, {
          is_tablet: false,
          platform: 0,
        }),
        ...this.server.createList('project-available-device', 5, {
          is_tablet: false,
          platform: 1,
        }),
      ];

      // choose a random device for preference
      const randomDevice = faker.helpers.arrayElement(
        availableDevices.filter((it) => it.platform === project.platform)
      );

      const devicePreference = this.server.create('device-preference', {
        id: profile.id,
        device_type: randomDevice.is_tablet
          ? ENUMS.DEVICE_TYPE.TABLET_REQUIRED
          : ENUMS.DEVICE_TYPE.PHONE_REQUIRED,
        platform_version: randomDevice.platform_version,
      });

      this.setProperties({
        file: store.push(store.normalize('file', file.toJSON())),
        dynamicScanText: t('modalCard.dynamicScan.title'),
        profile,
        project,
        devicePreference,
        availableDevices,
        store,
      });

      await this.owner.lookup('service:organization').load();
      this.owner.register('service:notifications', NotificationsStub);
      this.owner.register('service:poll', PollServiceStub);
    });

    test.each(
      'test different states of dynamic scan status and button',
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
          <ProjectPreferencesOld::Provider
            @profileId={{this.file.profile.id}}
            @project={{this.file.project}}
            @file={{this.file}}
            as |dpContext|
          >
            <FileDetails::DynamicScan::Manual @file={{this.file}} @dynamicScanText={{this.dynamicScanText}} @dpContext={{dpContext}} />
          </ProjectPreferencesOld::Provider>
        `);

        if (this.file.dynamicStatus === ENUMS.DYNAMIC_STATUS.ERROR) {
          assert
            .dom('[data-test-fileDetails-dynamicScan-statusChip]')
            .exists()
            .hasText(t('errored'));

          assert
            .dom('[data-test-fileDetails-dynamicScanAction-restartBtn]')
            .exists()
            .hasText(this.dynamicScanText)
            .isNotDisabled();
        } else if (
          (this.file.isDynamicStatusReady ||
            this.file.isDynamicStatusInProgress) &&
          this.file.dynamicStatus !== ENUMS.DYNAMIC_STATUS.READY
        ) {
          assert
            .dom('[data-test-fileDetails-dynamicScan-statusChip]')
            .exists()
            .hasText(this.file.statusText);

          assert
            .dom('[data-test-fileDetails-dynamicScanAction-restartBtn]')
            .doesNotExist();
        } else if (this.file.dynamicStatus === ENUMS.DYNAMIC_STATUS.READY) {
          assert
            .dom('[data-test-fileDetails-dynamicScan-statusChip]')
            .doesNotExist();
          assert
            .dom('[data-test-fileDetails-dynamicScanAction-restartBtn]')
            .doesNotExist();

          assert
            .dom('[data-test-fileDetails-dynamicScanAction-stopBtn]')
            .exists()
            .hasText(t('stop'));
        } else if (
          this.file.dynamicStatus === ENUMS.DYNAMIC_STATUS.NONE &&
          this.file.isDynamicDone
        ) {
          assert
            .dom('[data-test-fileDetails-dynamicScan-statusChip]')
            .exists()
            .hasText(t('completed'));

          assert
            .dom('[data-test-fileDetails-dynamicScanAction-restartBtn]')
            .isNotDisabled();
        } else if (this.file.dynamicStatus === ENUMS.DYNAMIC_STATUS.NONE) {
          assert
            .dom('[data-test-fileDetails-dynamicScanAction-startBtn]')
            .hasText(this.dynamicScanText);

          assert
            .dom('[data-test-fileDetails-dynamicScanAction-restartBtn]')
            .doesNotExist();
        } else {
          assert.strictEqual(
            this.file.statusText,
            dynamicScanStatusText()[this.file.dynamicStatus] || 'Unknown Status'
          );

          assert
            .dom('[data-test-fileDetails-dynamicScanAction-startBtn]')
            .isNotDisabled()
            .hasText(this.file.statusText);

          if (
            status === ENUMS.DYNAMIC_STATUS.INQUEUE &&
            this.file.canRunAutomatedDynamicscan
          ) {
            assert
              .dom('[data-test-fileDetails-dynamicScanAction-restartBtn]')
              .isNotDisabled();
          }
        }
      }
    );

    test.each(
      'it should render dynamic scan modal',
      [
        { withApiProxySetting: true },
        { withApiScan: true },
        { withAutomatedDynamicScan: true },
      ],
      async function (
        assert,
        { withApiProxySetting, withApiScan, withAutomatedDynamicScan }
      ) {
        assert.expect();

        this.file.dynamicStatus = ENUMS.DYNAMIC_STATUS.NONE;
        this.file.isDynamicDone = false;
        this.file.isActive = true;

        // make sure all available devices are not filtered based on minOsVersion
        this.file.minOsVersion = this.devicePreference.platform_version;

        if (ENUMS.PLATFORM.IOS === this.project.platform) {
          this.file.supportedCpuArchitectures = 'arm64';
          this.file.supportedDeviceTypes = 'iPhone, iPad';
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
          const results = schema.projectAvailableDevices.all().models;

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
          <ProjectPreferencesOld::Provider
            @profileId={{this.file.profile.id}}
            @project={{this.file.project}}
            @file={{this.file}}
            as |dpContext|
          >
            <FileDetails::DynamicScan::Manual @file={{this.file}} @dynamicScanText={{this.dynamicScanText}} @dpContext={{dpContext}} />
          </ProjectPreferencesOld::Provider>
        `);

        assert
          .dom('[data-test-fileDetails-dynamicScanAction-startBtn]')
          .hasText(this.dynamicScanText);

        assert
          .dom('[data-test-fileDetails-dynamicScanAction-restartBtn]')
          .doesNotExist();

        await click('[data-test-fileDetails-dynamicScanAction-startBtn]');

        assert
          .dom('[data-test-ak-appbar]')
          .hasText(t('modalCard.dynamicScan.title'));

        assert
          .dom('[data-test-fileDetails-dynamicScanDrawerOld-warningAlert]')
          .hasText(t('modalCard.dynamicScan.warning'));

        if (this.file.minOsVersion) {
          assert
            .dom(
              '[data-test-fileDetails-dynamicScanDrawerOld-deviceRequirementContainer]'
            )
            .exists();

          const deviceRequirements = [
            {
              type: t('modalCard.dynamicScan.osVersion'),
              value: `${this.file.project.get('platformDisplay')} ${
                this.file.minOsVersion
              } ${t('modalCard.dynamicScan.orAbove')}`,
            },
            this.file.supportedCpuArchitectures && {
              type: t('modalCard.dynamicScan.processorArchitecture'),
              value: this.file.supportedCpuArchitectures,
            },
            this.file.supportedDeviceTypes && {
              type: t('modalCard.dynamicScan.deviceTypes'),
              value: this.file.supportedDeviceTypes,
            },
          ].filter(Boolean);

          deviceRequirements.forEach(({ type, value }) => {
            const container = find(
              `[data-test-fileDetails-dynamicScanDrawerOld-deviceRequirementGroup="${type}"]`
            );

            assert
              .dom(
                '[data-test-fileDetails-dynamicScanDrawerOld-deviceRequirementType]',
                container
              )
              .hasText(type);

            assert
              .dom(
                '[data-test-fileDetails-dynamicScanDrawerOld-deviceRequirementValue]',
                container
              )
              .hasText(value);
          });
        } else {
          assert
            .dom(
              '[data-test-fileDetails-dynamicScanDrawerOld-deviceRequirementContainer]'
            )
            .doesNotExist();
        }

        assert
          .dom('[data-test-projectPreference-title]')
          .hasText(t('devicePreferences'));

        assert
          .dom('[data-test-projectPreference-description]')
          .hasText(t('otherTemplates.selectPreferredDevice'));

        assert
          .dom(
            '[data-test-projectPreference-deviceTypeSelect] [data-test-form-label]'
          )
          .hasText(t('deviceType'));

        assert
          .dom(
            `[data-test-projectPreference-deviceTypeSelect] .${classes.trigger}`
          )
          .hasText(t(deviceType([this.devicePreference.device_type])));

        assert
          .dom(
            '[data-test-projectPreference-osVersionSelect] [data-test-form-label]'
          )
          .hasText(t('osVersion'));

        assert
          .dom(
            `[data-test-projectPreference-osVersionSelect] .${classes.trigger}`
          )
          .hasText(this.devicePreference.platform_version);

        assert
          .dom(
            '[data-test-fileDetails-dynamicScanDrawerOld-runApiScanFormControl] [data-test-ak-form-label]'
          )
          .hasText(t('modalCard.dynamicScan.runApiScan'));

        assert
          .dom(
            '[data-test-fileDetails-dynamicScanDrawerOld-runApiScanFormControl] [data-test-fileDetails-dynamicScanDrawerOld-runApiScanCheckbox]'
          )
          .isNotDisabled()
          .isNotChecked();

        if (withApiScan) {
          await click(
            '[data-test-fileDetails-dynamicScanDrawerOld-runApiScanFormControl] [data-test-fileDetails-dynamicScanDrawerOld-runApiScanCheckbox]'
          );

          assert
            .dom(
              '[data-test-fileDetails-dynamicScanDrawerOld-runApiScanFormControl] [data-test-fileDetails-dynamicScanDrawerOld-runApiScanCheckbox]'
            )
            .isNotDisabled()
            .isChecked();

          assert
            .dom(
              '[data-test-fileDetails-dynamicScanDrawerOld-apiSettingsContainer]'
            )
            .exists();

          compareInnerHTMLWithIntlTranslation(assert, {
            selector:
              '[data-test-fileDetails-dynamicScanDrawerOld-apiSettingScanDescription]',
            message: t('modalCard.dynamicScan.apiScanDescription'),
          });

          assert
            .dom('[data-test-apiFilter-title]')
            .hasText(t('templates.apiScanURLFilter'));

          assert
            .dom('[data-test-apiFilter-description]')
            .hasText(t('otherTemplates.specifyTheURL'));

          assert
            .dom('[data-test-apiFilter-apiEndpointInput]')
            .isNotDisabled()
            .hasNoValue();

          assert
            .dom('[data-test-apiFilter-addApiEndpointBtn]')
            .isNotDisabled()
            .hasText(t('templates.addNewUrlFilter'));

          assert.dom('[data-test-apiFilter-table]').doesNotExist();
        } else {
          assert
            .dom(
              '[data-test-fileDetails-dynamicScanDrawerOld-apiSettingsContainer]'
            )
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
            .hasText(`${t('enable')} ${t('proxySettingsTitle')}`);

          assert
            .dom('[data-test-proxySettingsView-editSettings]')
            .hasTagName('a')
            .hasAttribute('href', '/dashboard/project/1/settings')
            .hasText(t('edit'));

          assert
            .dom('[data-test-proxySettingsView-proxySettingRoute]')
            .hasText(
              `${t('proxySettingsRouteVia')} ${proxySetting.host}:${proxySetting.port}`
            );
        } else {
          assert.dom('[data-test-proxySettingsView-container]').doesNotExist();
        }

        if (this.file.canRunAutomatedDynamicscan) {
          assert
            .dom(
              '[data-test-fileDetails-dynamicScanDrawerOld-device-settings-warning]'
            )
            .doesNotExist();

          assert
            .dom(
              '[data-test-fileDetails-dynamicScanDrawerOld-automatedDynamicScanContainer]'
            )
            .exists();

          assert
            .dom(
              '[data-test-fileDetails-dynamicScanDrawerOld-automatedDynamicScanTitle]'
            )
            .hasText(t('dynamicScanAutomation'));

          assert
            .dom(
              '[data-test-fileDetails-dynamicScanDrawerOld-automatedDynamicScanChip]'
            )
            .hasText(t('experimentalFeature'));

          assert
            .dom(
              '[data-test-fileDetails-dynamicScanDrawerOld-automatedDynamicScanDescription]'
            )
            .hasText(t('scheduleDynamicscanDesc'));

          assert
            .dom(
              '[data-test-fileDetails-dynamicScanDrawerOld-automatedDynamicScanScheduleBtn]'
            )
            .isNotDisabled()
            .hasText(t('scheduleDynamicscan'));
        } else {
          assert
            .dom(
              '[data-test-fileDetails-dynamicScanDrawerOld-device-settings-warning]'
            )
            .hasText(
              `${t('note')}: ${t('modalCard.dynamicScan.deviceSettingsWarning')}`
            );

          assert
            .dom(
              '[data-test-fileDetails-dynamicScanDrawerOld-automatedDynamicScanContainer]'
            )
            .doesNotExist();
        }

        assert
          .dom('[data-test-fileDetails-dynamicScanDrawerOld-cancelBtn]')
          .isNotDisabled()
          .hasText(t('cancel'));

        assert
          .dom('[data-test-fileDetails-dynamicScanDrawerOld-startBtn]')
          .isNotDisabled()
          .hasText(t('modalCard.dynamicScan.start'));
      }
    );

    test('test add & delete of api filter endpoint', async function (assert) {
      assert.expect(29);

      this.file.dynamicStatus = ENUMS.DYNAMIC_STATUS.NONE;
      this.file.isDynamicDone = false;
      this.file.isActive = true;

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
        <ProjectPreferencesOld::Provider
          @profileId={{this.file.profile.id}}
          @project={{this.file.project}}
          @file={{this.file}}
          as |dpContext|
        >
          <FileDetails::DynamicScan::Manual @file={{this.file}} @dynamicScanText={{this.dynamicScanText}} @dpContext={{dpContext}} />
        </ProjectPreferencesOld::Provider>
      `);

      assert
        .dom('[data-test-fileDetails-dynamicScanAction-startBtn]')
        .hasText(this.dynamicScanText);

      assert
        .dom('[data-test-fileDetails-dynamicScanAction-restartBtn]')
        .doesNotExist();

      await click('[data-test-fileDetails-dynamicScanAction-startBtn]');

      await click(
        '[data-test-fileDetails-dynamicScanDrawerOld-runApiScanFormControl] [data-test-fileDetails-dynamicScanDrawerOld-runApiScanCheckbox]'
      );

      assert
        .dom(
          '[data-test-fileDetails-dynamicScanDrawerOld-runApiScanFormControl] [data-test-fileDetails-dynamicScanDrawerOld-runApiScanCheckbox]'
        )
        .isNotDisabled()
        .isChecked();

      assert
        .dom(
          '[data-test-fileDetails-dynamicScanDrawerOld-apiSettingsContainer]'
        )
        .exists();

      compareInnerHTMLWithIntlTranslation(assert, {
        selector:
          '[data-test-fileDetails-dynamicScanDrawerOld-apiSettingScanDescription]',
        message: t('modalCard.dynamicScan.apiScanDescription'),
      });

      assert
        .dom('[data-test-apiFilter-title]')
        .hasText(t('templates.apiScanURLFilter'));

      assert
        .dom('[data-test-apiFilter-description]')
        .hasText(t('otherTemplates.specifyTheURL'));

      assert
        .dom('[data-test-apiFilter-apiEndpointInput]')
        .isNotDisabled()
        .hasNoValue();

      assert
        .dom('[data-test-apiFilter-addApiEndpointBtn]')
        .isNotDisabled()
        .hasText(t('templates.addNewUrlFilter'));

      assert.dom('[data-test-apiFilter-table]').doesNotExist();

      const notify = this.owner.lookup('service:notifications');

      // empty input
      await click('[data-test-apiFilter-addApiEndpointBtn]');

      assert.strictEqual(notify.errorMsg, t('emptyURLFilter'));

      // invalid url
      await fillIn(
        '[data-test-apiFilter-apiEndpointInput]',
        'https://api.example.com'
      );

      await click('[data-test-apiFilter-addApiEndpointBtn]');

      assert.strictEqual(
        notify.errorMsg,
        `https://api.example.com ${t('invalidURL')}`
      );

      await fillIn('[data-test-apiFilter-apiEndpointInput]', 'api.example.com');

      await click('[data-test-apiFilter-addApiEndpointBtn]');

      assert.strictEqual(notify.successMsg, t('urlUpdated'));
      assert.dom('[data-test-apiFilter-table]').exists();

      await fillIn(
        '[data-test-apiFilter-apiEndpointInput]',
        'api.example2.com'
      );

      await click('[data-test-apiFilter-addApiEndpointBtn]');

      const headers = findAll('[data-test-apiFilter-thead] th');

      assert.strictEqual(headers.length, 2);
      assert.dom(headers[0]).hasText(t('apiURLFilter'));
      assert.dom(headers[1]).hasText(t('action'));

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
      assert.dom(findAll('[data-test-ak-appbar]')[1]).hasText(t('confirm'));

      assert
        .dom('[data-test-confirmbox-description]')
        .hasText(t('confirmBox.removeURL'));

      assert
        .dom('[data-test-confirmbox-confirmBtn]')
        .isNotDisabled()
        .hasText(t('yes'));

      await click('[data-test-confirmbox-confirmBtn]');

      rows = findAll('[data-test-apiFilter-row]');

      assert.strictEqual(notify.successMsg, t('urlUpdated'));
      assert.strictEqual(rows.length, 1);
    });

    test('test enable api proxy toggle', async function (assert) {
      assert.expect(10);

      this.file.dynamicStatus = ENUMS.DYNAMIC_STATUS.NONE;
      this.file.isDynamicDone = false;
      this.file.isActive = true;

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

      this.server.put('/profiles/:id/proxy_settings', (_, req) => {
        const data = JSON.parse(req.requestBody);

        assert.true(data.enabled);

        return {
          id: req.params.id,
          ...data,
        };
      });

      await render(hbs`
        <ProjectPreferencesOld::Provider
          @profileId={{this.file.profile.id}}
          @project={{this.file.project}}
          @file={{this.file}}
          as |dpContext|
        >
          <FileDetails::DynamicScan::Manual @file={{this.file}} @dynamicScanText={{this.dynamicScanText}} @dpContext={{dpContext}} />
        </ProjectPreferencesOld::Provider>
      `);

      assert
        .dom('[data-test-fileDetails-dynamicScanAction-startBtn]')
        .hasText(this.dynamicScanText);

      assert
        .dom('[data-test-fileDetails-dynamicScanAction-restartBtn]')
        .doesNotExist();

      await click('[data-test-fileDetails-dynamicScanAction-startBtn]');

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

      assert.strictEqual(
        notify.infoMsg,
        `${t('proxyTurned')} ${t('on').toUpperCase()}`
      );
    });

    test.each(
      'test start dynamic scan',
      [{ automatedScan: false }, { automatedScan: true }],
      async function (assert, { automatedScan }) {
        const isIOS = ENUMS.PLATFORM.IOS === this.project.platform;

        const file = this.server.create('file', {
          project: this.project.id,
          profile: '100',
          dynamic_status: ENUMS.DYNAMIC_STATUS.NONE,
          is_dynamic_done: false,
          can_run_automated_dynamicscan: automatedScan,
          is_active: true,
          min_os_version: '0', // so that we can select any option for version
          supported_cpu_architectures: isIOS ? 'arm64' : '',
          supported_device_types: isIOS ? 'iPhone, iPad' : '', // required for Ios to show device types
        });

        // update project with latest file
        this.project.update({
          last_file_id: file.id,
        });

        // set the file
        this.set(
          'file',
          this.store.push(this.store.normalize('file', file.toJSON()))
        );

        // server mocks
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
          <ProjectPreferencesOld::Provider
            @profileId={{this.file.profile.id}}
            @project={{this.file.project}}
            @file={{this.file}}
            as |dpContext|
          >
            <FileDetails::DynamicScan::Manual @file={{this.file}} @dynamicScanText={{this.dynamicScanText}} @dpContext={{dpContext}} />
          </ProjectPreferencesOld::Provider>
        `);

        assert
          .dom('[data-test-fileDetails-dynamicScanAction-startBtn]')
          .hasText(this.dynamicScanText);

        assert
          .dom('[data-test-fileDetails-dynamicScanAction-restartBtn]')
          .doesNotExist();

        await click('[data-test-fileDetails-dynamicScanAction-startBtn]');

        // choose device type and os version
        assert
          .dom(
            `[data-test-projectPreference-deviceTypeSelect] .${classes.trigger}`
          )
          .hasText(t(deviceType([ENUMS.DEVICE_TYPE.NO_PREFERENCE])));

        assert
          .dom(
            `[data-test-projectPreference-osVersionSelect] .${classes.trigger}`
          )
          .hasText(`${this.devicePreference.platform_version}`);

        await selectChoose(
          `[data-test-projectPreference-deviceTypeSelect] .${classes.trigger}`,
          t(deviceType([ENUMS.DEVICE_TYPE.PHONE_REQUIRED]))
        );

        // verify ui
        assert
          .dom(
            `[data-test-projectPreference-deviceTypeSelect] .${classes.trigger}`
          )
          .hasText(t(deviceType([ENUMS.DEVICE_TYPE.PHONE_REQUIRED])));

        // verify network data
        assert.strictEqual(
          this.requestBody.device_type,
          ENUMS.DEVICE_TYPE.PHONE_REQUIRED
        );

        const filteredDevices = this.availableDevices.filter(
          (it) => it.platform === this.project.platform && !it.is_tablet
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
          .hasText(`${filteredDevices[1].platform_version}`);

        // verify network data
        assert.strictEqual(
          this.requestBody.platform_version,
          `${filteredDevices[1].platform_version}`
        );

        // enable api catpure
        await click(
          '[data-test-fileDetails-dynamicScanDrawerOld-runApiScanFormControl] [data-test-fileDetails-dynamicScanDrawerOld-runApiScanCheckbox]'
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
            .dom(
              '[data-test-fileDetails-dynamicScanDrawerOld-automatedDynamicScanScheduleBtn]'
            )
            .isNotDisabled()
            .hasText(t('scheduleDynamicscan'));

          await click(
            '[data-test-fileDetails-dynamicScanDrawerOld-automatedDynamicScanScheduleBtn]'
          );
        } else {
          assert
            .dom('[data-test-fileDetails-dynamicScanDrawerOld-startBtn]')
            .isNotDisabled()
            .hasText(t('modalCard.dynamicScan.start'));

          await click('[data-test-fileDetails-dynamicScanDrawerOld-startBtn]');
        }

        const notify = this.owner.lookup('service:notifications');
        const poll = this.owner.lookup('service:poll');

        assert.strictEqual(
          notify.successMsg,
          automatedScan ? t('scheduleDynamicscanSuccess') : t('startingScan')
        );

        // simulate polling
        if (poll.callback) {
          await poll.callback();
        }

        assert.strictEqual(
          this.file.dynamicStatus,
          automatedScan
            ? ENUMS.DYNAMIC_STATUS.INQUEUE
            : ENUMS.DYNAMIC_STATUS.BOOTING
        );

        // modal should close
        assert.dom('[data-test-ak-appbar]').doesNotExist();
        assert
          .dom('[data-test-fileDetails-dynamicScanAction-startBtn]')
          .doesNotExist();

        assert
          .dom('[data-test-fileDetails-dynamicScan-statusChip]')
          .exists()
          .hasText(
            dynamicScanStatusText()[
              automatedScan
                ? ENUMS.DYNAMIC_STATUS.INQUEUE
                : ENUMS.DYNAMIC_STATUS.BOOTING
            ]
          );
      }
    );

    test('test stop dynamic scan', async function (assert) {
      const file = this.server.create('file', {
        project: '1',
        profile: '100',
        dynamic_status: ENUMS.DYNAMIC_STATUS.NONE,
        is_dynamic_done: false,
        is_active: true,
      });

      this.server.create('dynamicscan-old', { id: file.id });

      this.set(
        'file',
        this.store.push(this.store.normalize('file', file.toJSON()))
      );

      this.server.get('/profiles/:id/proxy_settings', (_, req) => {
        return {
          id: req.params.id,
          host: faker.internet.ip(),
          port: faker.internet.port(),
          enabled: false,
        };
      });

      this.server.get('/profiles/:id/device_preference', (schema, req) => {
        return { device_type: 1, id: req.params.id, platform_version: '0' };
      });

      this.server.put('/dynamicscan/:id', (schema, req) => {
        schema.db.files.update(`${req.params.id}`, {
          dynamic_status: ENUMS.DYNAMIC_STATUS.READY,
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

      this.server.delete('/dynamicscan/:id', (schema, req) => {
        schema.db.files.update(`${req.params.id}`, {
          dynamic_status: ENUMS.DYNAMIC_STATUS.NONE,
          is_dynamic_done: true,
        });

        return new Response(204);
      });

      await render(hbs`
        <ProjectPreferencesOld::Provider
          @profileId={{this.file.profile.id}}
          @project={{this.file.project}}
          @file={{this.file}}
          as |dpContext|
        >
          <FileDetails::DynamicScan::Manual @file={{this.file}} @dynamicScanText={{this.dynamicScanText}} @dpContext={{dpContext}} />
        </ProjectPreferencesOld::Provider>
      `);

      assert
        .dom('[data-test-fileDetails-dynamicScanAction-startBtn]')
        .hasText(this.dynamicScanText);

      assert
        .dom('[data-test-fileDetails-dynamicScanAction-restartBtn]')
        .doesNotExist();

      // Open dynamic scan drawer
      await click('[data-test-fileDetails-dynamicScanAction-startBtn]');

      // Start dynamic scan
      await click('[data-test-fileDetails-dynamicScanDrawerOld-startBtn]');

      const poll = this.owner.lookup('service:poll');

      // simulate polling
      if (poll.callback) {
        await poll.callback();
      }

      assert
        .dom('[data-test-fileDetails-dynamicScanAction-stopBtn]')
        .hasText(t('stop'));
      assert
        .dom('[data-test-fileDetails-dynamicScanAction-restartBtn]')
        .doesNotExist();

      await click('[data-test-fileDetails-dynamicScanAction-stopBtn]');

      assert
        .dom('[data-test-fileDetails-dynamicScanAction-startBtn]')
        .doesNotExist();

      assert
        .dom('[data-test-fileDetails-dynamicScan-statusChip]')
        .exists()
        .hasText(dynamicScanStatusText()[ENUMS.DYNAMIC_STATUS.SHUTTING_DOWN]);

      // simulate polling
      if (poll.callback) {
        await poll.callback();
      }

      assert
        .dom('[data-test-fileDetails-dynamicScan-statusChip]')
        .hasText(t('completed'));

      assert
        .dom('[data-test-fileDetails-dynamicScanAction-restartBtn]')
        .exists()
        .hasText(this.dynamicScanText);
    });

    test.each(
      'test device unavailability scenarios',
      [
        {
          scenario: 'preferred device not available',
          removePreferredOnly: true,
          expectedError: () =>
            t('modalCard.dynamicScan.preferredDeviceNotAvailable'),
        },
        {
          scenario: 'all devices allocated',
          removePreferredOnly: false,
          expectedError: () =>
            t('modalCard.dynamicScan.allDevicesAreAllocated'),
        },
        {
          scenario: 'minimum OS version is unsupported (Android)',
          removePreferredOnly: false,
          minAndroidOsVersion: 15, // Current min supported android OS is 14
          expectedError: () =>
            t('modalCard.dynamicScan.minOSVersionUnsupported'),
        },
        {
          scenario: 'minimum OS version is unsupported (iOS)',
          removePreferredOnly: false,
          minIOSOSVersion: 18, // Current min supported android OS is 17
          expectedError: () =>
            t('modalCard.dynamicScan.minOSVersionUnsupported'),
        },
      ],
      async function (
        assert,
        {
          removePreferredOnly,
          expectedError,
          minAndroidOsVersion,
          minIOSOSVersion,
        }
      ) {
        const preferredDeviceType = this.devicePreference.device_type;
        const preferredPlatformVersion = this.devicePreference.platform_version;

        if (removePreferredOnly) {
          // Remove only preferred devices
          const preferredDeviceList =
            this.server.db.projectAvailableDevices.where(
              (ad) =>
                ad.platform_version === preferredPlatformVersion &&
                (ad.is_tablet
                  ? preferredDeviceType === ENUMS.DEVICE_TYPE.TABLET_REQUIRED
                  : preferredDeviceType === ENUMS.DEVICE_TYPE.PHONE_REQUIRED)
            );

          preferredDeviceList.forEach(({ id }) => {
            this.server.db.projectAvailableDevices.remove(id);
          });
        } else {
          // Remove all devices
          this.server.db.projectAvailableDevices.remove();
        }

        const file = this.server.create('file', {
          project: '1',
          profile: '100',
          dynamic_status: ENUMS.DYNAMIC_STATUS.NONE,
          is_dynamic_done: false,
          can_run_automated_dynamicscan: false,
          is_active: true,
          min_os_version: minAndroidOsVersion
            ? minAndroidOsVersion
            : minIOSOSVersion
              ? minIOSOSVersion
              : faker.number.int({ min: 9, max: 12 }),
        });

        this.set(
          'file',
          this.store.push(this.store.normalize('file', file.toJSON()))
        );

        // Server mocks
        this.server.get('/v2/projects/:id', (schema, req) => {
          const project = schema.projects.find(`${req.params.id}`)?.toJSON();

          return {
            ...project,
            platform: minIOSOSVersion
              ? ENUMS.PLATFORM.IOS
              : minAndroidOsVersion
                ? ENUMS.PLATFORM.ANDROID
                : project.platform,
          };
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

        this.server.get('/profiles/:id/proxy_settings', (_, req) => {
          return {
            id: req.params.id,
            host: '',
            port: '',
            enabled: false,
          };
        });

        await render(hbs`
          <ProjectPreferencesOld::Provider
            @profileId={{this.file.profile.id}}
            @project={{this.file.project}}
            @file={{this.file}}
            as |dpContext|
          >
            <FileDetails::DynamicScan::Manual @file={{this.file}} @dynamicScanText={{this.dynamicScanText}} @dpContext={{dpContext}} />
          </ProjectPreferencesOld::Provider>
        `);

        assert
          .dom('[data-test-fileDetails-dynamicScanAction-startBtn]')
          .hasText(this.dynamicScanText);

        assert
          .dom('[data-test-fileDetails-dynamicScanDrawerOld-startBtn]')
          .doesNotExist();

        await click('[data-test-fileDetails-dynamicScanAction-startBtn]');

        // Verify error states
        assert
          .dom(
            `[data-test-projectPreference-deviceTypeSelect] .${classes.trigger}`
          )
          .hasClass(classes.triggerError);

        assert
          .dom(
            `[data-test-projectPreference-osVersionSelect] .${classes.trigger}`
          )
          .hasClass(classes.triggerError);

        assert
          .dom('[data-test-projectPreference-deviceUnavailableError]')
          .hasText(expectedError());

        assert
          .dom('[data-test-fileDetails-dynamicScanDrawerOld-startBtn]')
          .isDisabled();
      }
    );

    test('test os version filtering based on min os version', async function (assert) {
      this.file.dynamicStatus = ENUMS.DYNAMIC_STATUS.NONE;
      this.file.isDynamicDone = false;
      this.file.isActive = true;
      this.file.minOsVersion = '14.0'; // Update file's min_os_version

      // Clear existing devices and create new ones with specific versions
      this.server.db.projectAvailableDevices.remove();

      this.server.createList('project-available-device', 2, {
        platform: this.project.platform,
        platform_version: '13.0 (d10)',
        is_tablet: false,
      });

      this.server.createList('project-available-device', 2, {
        platform: this.project.platform,
        platform_version: '14.2',
        is_tablet: false,
      });

      this.server.createList('project-available-device', 2, {
        platform: this.project.platform,
        platform_version: '15.0 (d101) sim',
        is_tablet: false,
      });

      await render(hbs`
        <ProjectPreferencesOld::Provider
          @profileId={{this.file.profile.id}}
          @project={{this.file.project}}
          @file={{this.file}}
          as |dpContext|
        >
          <FileDetails::DynamicScan::Manual @file={{this.file}} @dynamicScanText={{this.dynamicScanText}} @dpContext={{dpContext}} />
        </ProjectPreferencesOld::Provider>
      `);

      assert
        .dom('[data-test-fileDetails-dynamicScanAction-startBtn]')
        .hasText(this.dynamicScanText);

      await click('[data-test-fileDetails-dynamicScanAction-startBtn]');

      // Open OS version dropdown
      await click(
        `[data-test-projectPreference-osVersionSelect] .${classes.trigger}`
      );

      const options = findAll(`.${classes.dropdown} [data-option-index]`);
      const versions = Array.from(options).map((el) => el.textContent.trim());

      // Should only include "Any Version" (0) and versions >= 14.0
      assert.deepEqual(
        versions,
        [t('anyVersion'), '15.0 (d101) sim', '14.2'],
        'Only shows versions >= min_os_version and "Any Version" option'
      );

      // Versions below min_os_version should not be present
      assert.notOk(
        versions.includes('13.0 (d10)'),
        'Does not show versions below min_os_version'
      );
    });

    test.each(
      'test device type filtering based on platform and supported types',
      [
        {
          platform: ENUMS.PLATFORM.IOS,
          supportedDeviceTypes: 'iPhone, iPad',
          expectedTypes: ['No Preference', 'Phone Required', 'Tablet Required'],
        },
        {
          platform: ENUMS.PLATFORM.IOS,
          supportedDeviceTypes: 'iPhone',
          expectedTypes: ['No Preference', 'Phone Required'],
        },
        {
          platform: ENUMS.PLATFORM.IOS,
          supportedDeviceTypes: 'iPad',
          expectedTypes: ['No Preference', 'Tablet Required'],
        },
        {
          platform: ENUMS.PLATFORM.ANDROID,
          supportedDeviceTypes: '',
          expectedTypes: ['No Preference', 'Phone Required'],
        },
      ],
      async function (
        assert,
        { platform, supportedDeviceTypes, expectedTypes }
      ) {
        // Update project platform
        this.project.update({ platform });

        this.file.dynamicStatus = ENUMS.DYNAMIC_STATUS.NONE;
        this.file.isDynamicDone = false;
        this.file.isActive = true;
        // Update file's supported device types
        this.file.supportedDeviceTypes = supportedDeviceTypes;

        await render(hbs`
          <ProjectPreferencesOld::Provider
            @profileId={{this.file.profile.id}}
            @project={{this.file.project}}
            @file={{this.file}}
            as |dpContext|
          >
            <FileDetails::DynamicScan::Manual @file={{this.file}} @dynamicScanText={{this.dynamicScanText}} @dpContext={{dpContext}} />
          </ProjectPreferencesOld::Provider>
        `);

        await click('[data-test-fileDetails-dynamicScanAction-startBtn]');

        // Open device type dropdown
        await click(
          `[data-test-projectPreference-deviceTypeSelect] .${classes.trigger}`
        );

        const options = findAll(`.${classes.dropdown} [data-option-index]`);

        const deviceTypes = Array.from(options).map((el) =>
          el.textContent.trim()
        );

        assert.deepEqual(
          deviceTypes,
          expectedTypes.map((type) =>
            t(
              deviceType([
                ENUMS.DEVICE_TYPE[type.replace(' ', '_').toUpperCase()],
              ])
            )
          ),
          `Shows correct device types for ${platform === ENUMS.PLATFORM.IOS ? 'iOS' : 'Android'} with supported types: ${supportedDeviceTypes || 'Phone'}`
        );
      }
    );

    test('test selects random phone device type and version if any device is selected and resets after scan starts', async function (assert) {
      assert.expect();

      const isIOS = ENUMS.PLATFORM.IOS === this.project.platform;

      const file = this.server.create('file', {
        project: this.project.id,
        profile: '100',
        dynamic_status: ENUMS.DYNAMIC_STATUS.NONE,
        is_dynamic_done: false,
        is_active: true,
        min_os_version: '0', // so that we can select any option for version
        supported_cpu_architectures: isIOS ? 'arm64' : '',
        supported_device_types: isIOS ? 'iPhone, iPad' : '', // required for Ios to show device types
      });

      // update project with latest file
      this.project.update({
        last_file_id: file.id,
      });

      // set the file
      this.set(
        'file',
        this.store.push(this.store.normalize('file', file.toJSON()))
      );

      // server mocks
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

      this.server.put('/profiles/:id/device_preference', (schema, req) => {
        const data = JSON.parse(req.requestBody);

        this.set('requestBody', data);

        // Preference should be reset after dynamic scan enters an in progress state
        if (this.checkPreferenceReset) {
          const windowService = this.owner.lookup('service:browser/window');

          const actualDevicePrefData = JSON.parse(
            windowService.localStorage.getItem('actualDevicePrefData')
          );

          assert.strictEqual(
            data.device_type,
            actualDevicePrefData.device_type
          );

          assert.strictEqual(
            data.platform_version,
            String(actualDevicePrefData.platform_version)
          );
        }
        // When dynamic scan is started, the phone device type is selected with an random device version
        else if (this.verifyPreferenceChange) {
          assert.notEqual(data.platform_version, '0'); // Device OS version should not be any device

          assert.strictEqual(
            data.device_type,
            ENUMS.DEVICE_TYPE.PHONE_REQUIRED
          );

          this.set('checkPreferenceReset', true);
        }

        return new Response(200);
      });

      await render(hbs`
        <ProjectPreferencesOld::Provider
          @profileId={{this.file.profile.id}}
          @project={{this.file.project}}
          @file={{this.file}}
          as |dpContext|
        >
          <FileDetails::DynamicScan::Manual @file={{this.file}} @dynamicScanText={{this.dynamicScanText}} @dpContext={{dpContext}} />
        </ProjectPreferencesOld::Provider>
      `);

      await click('[data-test-fileDetails-dynamicScanAction-startBtn]');

      const deviceTypeTrigger = `[data-test-projectPreference-deviceTypeSelect] .${classes.trigger}`;

      const anyDeviceTypeLabel = t(
        deviceType([ENUMS.DEVICE_TYPE.NO_PREFERENCE])
      );

      // Open device type dropdown
      await click(deviceTypeTrigger);

      await selectChoose(deviceTypeTrigger, anyDeviceTypeLabel);

      assert.dom(deviceTypeTrigger).hasText(anyDeviceTypeLabel);

      const osVersionSelectTrigger = `[data-test-projectPreference-osVersionSelect] .${classes.trigger}`;
      const anyOSVersionLabel = t('anyVersion');

      // Open OS version dropdown
      await click(osVersionSelectTrigger);

      await selectChoose(osVersionSelectTrigger, anyOSVersionLabel);

      // verify ui
      assert.dom(osVersionSelectTrigger).hasText(anyOSVersionLabel);

      this.set('verifyPreferenceChange', true);

      assert
        .dom('[data-test-fileDetails-dynamicScanDrawerOld-startBtn]')
        .isNotDisabled()
        .hasText(t('modalCard.dynamicScan.start'));

      await click('[data-test-fileDetails-dynamicScanDrawerOld-startBtn]');

      const notify = this.owner.lookup('service:notifications');
      const poll = this.owner.lookup('service:poll');

      assert.strictEqual(notify.successMsg, t('startingScan'));

      // simulate polling
      if (poll.callback) {
        await poll.callback();
      }

      // modal should close
      assert.dom('[data-test-ak-appbar]').doesNotExist();

      assert
        .dom('[data-test-fileDetails-dynamicScanAction-startBtn]')
        .doesNotExist();

      assert
        .dom('[data-test-fileDetails-dynamicScan-statusChip]')
        .exists()
        .hasText(dynamicScanStatusText()[ENUMS.DYNAMIC_STATUS.BOOTING]);

      // Preference should be deleted from local storage
      const windowService = this.owner.lookup('service:browser/window');

      const actualDevicePrefData = JSON.parse(
        windowService.localStorage.getItem('actualDevicePrefData')
      );

      assert.notOk(actualDevicePrefData);
    });
  }
);
