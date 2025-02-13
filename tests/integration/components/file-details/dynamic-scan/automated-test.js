import {
  render,
  click,
  find,
  triggerEvent,
  findAll,
} from '@ember/test-helpers';

import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { setupBrowserFakes } from 'ember-browser-services/test-support';
import { module, test } from 'qunit';
import { faker } from '@faker-js/faker';

import ENUMS from 'irene/enums';
import { deviceType } from 'irene/helpers/device-type';
import { dsAutomatedDevicePref } from 'irene/helpers/ds-automated-device-pref';

module(
  'Integration | Component | file-details/dynamic-scan/automated',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en');
    setupBrowserFakes(hooks, { window: true, localStorage: true });

    hooks.beforeEach(async function () {
      const store = this.owner.lookup('service:store');
      const dsService = this.owner.lookup('service:dynamic-scan');

      // Create organization
      const organization = this.server.create('organization', {
        features: {
          dynamicscan_automation: true,
        },
      });

      // Create file
      const profile = this.server.create('profile', {
        id: '100',
      });

      const file = this.server.create('file', {
        id: 1,
        project: '1',
        profile: profile.id,
        is_active: true,
      });

      const project = this.server.create('project', {
        file: file.id,
        id: '1',
        active_profile_id: profile.id,
      });

      const devicePreference = this.server.create(
        'ds-automated-device-preference',
        {
          id: profile.id,
        }
      );

      // Server mocks
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

      this.server.get('/v2/profiles/:id/automation_preference', (_, req) => {
        return {
          id: req.params.id,
          dynamic_scan_automation_enabled: true,
        };
      });

      // Set properties
      this.setProperties({
        file: store.push(store.normalize('file', file.toJSON())),
        project: store.push(store.normalize('project', project.toJSON())),
        organization,
        devicePreference,
        store,
        dsService,
      });

      await this.owner.lookup('service:organization').load();
    });

    test('it renders when dast automation is enabled', async function (assert) {
      // Create a dynamic scan
      this.server.create('dynamicscan', {
        file: this.file.id,
        status: ENUMS.DYNAMIC_SCAN_STATUS.NOT_STARTED,
        mode: ENUMS.DYNAMIC_MODE.AUTOMATED,
      });

      // In real scenario this will be called in the root component
      this.dsService.fetchLatestScans(this.file);

      await render(hbs`
        <FileDetails::DynamicScan::Automated 
          @file={{this.file}} 
          @profileId={{this.file.project.activeProfileId}} 
        />
      `);

      assert
        .dom('[data-test-fileDetails-dynamicScan-deviceWrapper-headerText]')
        .hasText(t('realDevice'));

      // Verify status chip
      assert
        .dom('[data-test-fileDetails-dynamicScan-statusChip]')
        .hasText(t('notStarted'));

      // Verify action buttons
      assert
        .dom('[data-test-fileDetails-dynamicScanAction]')
        .isNotDisabled()
        .hasText(t('dastTabs.automatedDAST'));

      // Verfiy vnc
      assert
        .dom('[data-test-fileDetails-dynamicScan-deviceWrapper-deviceViewer]')
        .exists();

      assert.dom('[data-test-vncViewer-root]').exists();
    });

    test('it renders upselling when feature is disabled', async function (assert) {
      this.organization.update({
        features: {
          dynamicscan_automation: false,
        },
      });

      await this.owner.lookup('service:organization').load();

      // window service
      const windowService = this.owner.lookup('service:browser/window');

      // Stub ajax endpoint
      this.server.post('/v2/feature_request/automated_dast', () => {
        return {};
      });

      await render(hbs`
        <FileDetails::DynamicScan::Automated @file={{this.file}} @profileId={{this.file.project.activeProfileId}} />
      `);

      assert.dom('[data-test-automated-dast-upselling]').exists();

      assert
        .dom('[data-test-upselling-text]')
        .hasText(t('upsellingDastAutomation'));

      assert
        .dom('[data-test-upselling-upgrade-now-button]')
        .isNotDisabled()
        .hasText(t('imInterested'));

      assert.dom('[data-test-upselling-upgrade-clicked-text]').doesNotExist();

      // Click upgrade button
      await click('[data-test-upselling-upgrade-now-button]');

      // Verify post-click state
      assert
        .dom('[data-test-upselling-upgrade-clicked-text]')
        .exists()
        .hasText(t('upsellingDastAutomationWhenClicked'));

      assert.dom('[data-test-upselling-upgrade-now-button]').doesNotExist();
      assert.dom('[data-test-upselling-text]').doesNotExist();

      assert.strictEqual(
        windowService.localStorage.getItem('automatedDastRequest'),
        'true'
      );
    });

    test('it renders disabled state when automation preference is disabled', async function (assert) {
      // Create automation preference with disabled state
      this.server.get('/v2/profiles/:id/automation_preference', (_, req) => {
        return {
          id: req.params.id,
          dynamic_scan_automation_enabled: false,
        };
      });

      await render(hbs`
        <FileDetails::DynamicScan::Automated 
          @file={{this.file}} 
          @profileId={{this.file.project.activeProfileId}}
        />
      `);

      assert
        .dom('[data-test-fileDetails-dynamicScan-automatedDast-disabledCard]')
        .exists();

      assert
        .dom('[data-test-fileDetails-dynamicScan-automatedDast-disabledTitle]')
        .exists()
        .hasText(t('toggleAutomatedDAST'));

      assert
        .dom('[data-test-fileDetails-dynamicScan-automatedDast-disabledDesc]')
        .exists();

      assert
        .dom(
          '[data-test-fileDetails-dynamicScan-automatedDast-disabledActionBtn]'
        )
        .exists()
        .hasText(t('goToSettings'));
    });

    test.each(
      'it renders action drawer with different states',
      [
        {
          anyDeviceSelected: true,
          withApiProxy: true,
          hasApiFilters: true,
          hasActiveScenarios: true,
          assertions: 29,
        },
        {
          anyDeviceSelected: false,
          withApiProxy: false,
          hasApiFilters: false,
          hasActiveScenarios: false,
          assertions: 30,
        },
      ],
      async function (
        assert,
        {
          anyDeviceSelected,
          withApiProxy,
          hasApiFilters,
          hasActiveScenarios,
          assertions,
        }
      ) {
        assert.expect(assertions);

        this.devicePreference.update({
          ds_automated_device_selection: anyDeviceSelected
            ? ENUMS.DS_AUTOMATED_DEVICE_SELECTION.ANY_DEVICE
            : ENUMS.DS_AUTOMATED_DEVICE_SELECTION.FILTER_CRITERIA,
          ds_automated_device_type: 0,
          ds_automated_platform_version_min: '10.0',
        });

        const apiUrlFilters = hasApiFilters
          ? ['api.example.com', 'api.example2.com']
          : [];

        // Create a dynamic scan
        this.server.create('dynamicscan', {
          file: this.file.id,
          status: ENUMS.DYNAMIC_SCAN_STATUS.NOT_STARTED,
          mode: ENUMS.DYNAMIC_MODE.AUTOMATED,
        });

        const scenarios = this.server.createList('scan-parameter-group', 2, {
          project: this.file.project.id,
          is_active: hasActiveScenarios,
        });

        this.server.get(
          '/v2/profiles/:id/ds_automated_device_preference',
          (schema, req) => {
            return schema.dsAutomatedDevicePreferences
              .find(`${req.params.id}`)
              ?.toJSON();
          }
        );

        this.server.get('/profiles/:id', (schema, req) =>
          schema.profiles.find(`${req.params.id}`)?.toJSON()
        );

        this.server.get('/profiles/:id/api_scan_options', (_, req) => {
          return {
            ds_api_capture_filters: apiUrlFilters,
            id: req.params.id,
          };
        });

        this.server.get('/profiles/:id/proxy_settings', (_, req) => {
          return {
            id: req.params.id,
            host: faker.internet.ip(),
            port: faker.internet.port(),
            enabled: withApiProxy,
          };
        });

        this.server.get(
          '/v2/projects/:projectId/scan_parameter_groups',
          function (schema) {
            const results = schema.scanParameterGroups.all().models;
            return {
              count: results.length,
              next: null,
              previous: null,
              results,
            };
          }
        );

        // In real scenario this will be called in the root component
        this.dsService.fetchLatestScans(this.file);

        await render(hbs`
          <FileDetails::DynamicScan::Automated 
            @file={{this.file}} 
            @profileId={{this.file.project.activeProfileId}} 
          />
        `);

        // Click action button to open drawer
        await click('[data-test-fileDetails-dynamicScanAction]');

        // Basic drawer assertions
        assert
          .dom('[data-test-fileDetails-dynamicScanDrawer-drawerContainer]')
          .exists('Drawer container exists');

        assert
          .dom(
            '[data-test-fileDetails-dynamicScanDrawer-drawerContainer-title]'
          )
          .hasText(t('dastTabs.automatedDAST'), 'Drawer has correct title');

        // Device requirements section
        assert
          .dom(
            '[data-test-fileDetails-dynamicScanDrawer-automatedDast-headerDeviceRequirements]'
          )
          .hasText(
            t('modalCard.dynamicScan.deviceRequirements'),
            'Device requirements header exists'
          );

        assert
          .dom(
            '[data-test-fileDetails-dynamicScanDrawer-automatedDast-headerOSInfoDesc]'
          )
          .hasText(
            t('modalCard.dynamicScan.osVersion'),
            'OS version label exists'
          );

        assert
          .dom(
            '[data-test-fileDetails-dynamicScanDrawer-automatedDast-headerOSInfoValue]'
          )
          .containsText(this.file.project.get('platformDisplay'))
          .containsText(this.file.minOsVersion)
          .containsText(
            t('modalCard.dynamicScan.orAbove'),
            'OS info shows correct values'
          );

        assert
          .dom(
            '[data-test-fileDetails-dynamicScanDrawer-automatedDast-headerDevicePreference]'
          )
          .hasText(t('devicePreferences'), 'Device preferences header exists');

        // Device Preferences
        const devicePrefProps = [
          {
            id: 'selectedPref',
            title: t('modalCard.dynamicScan.selectedPref'),
            value: t(
              dsAutomatedDevicePref([
                this.devicePreference.ds_automated_device_selection,
              ])
            ),
            hidden: !anyDeviceSelected,
          },
          {
            id: 'deviceType',
            title: t('deviceType'),
            value: t(
              deviceType([
                this.automatedDastDevicePreferences?.dsAutomatedDeviceType ??
                  ENUMS.DS_AUTOMATED_DEVICE_TYPE.NO_PREFERENCE,
              ])
            ),
            hidden: anyDeviceSelected,
          },
          {
            id: 'minOSVersion',
            title: t('minOSVersion'),
            value: this.devicePreference.ds_automated_platform_version_min,
            hidden: anyDeviceSelected,
          },
        ].filter((it) => !it.hidden);

        devicePrefProps.forEach((pref) => {
          assert
            .dom(
              `[data-test-fileDetails-dynamicScanDrawer-automatedDast-devicePreference='${pref.id}']`
            )
            .containsText(String(pref.value))
            .containsText(pref.title);
        });

        // API URL Filters section
        assert
          .dom(
            '[data-test-fileDetails-dynamicScanDrawer-automatedDast-apiFilterContainer]'
          )
          .exists('API filter container exists');

        assert
          .dom(
            '[data-test-fileDetails-dynamicScanDrawer-automatedDast-apiFilter-title]'
          )
          .exists()
          .hasText(t('templates.apiScanURLFilter'));

        const apiURLTitleTooltip = find(
          '[data-test-fileDetails-dynamicScanDrawer-automatedDast-apiURLFilter-iconTooltip]'
        );

        await triggerEvent(apiURLTitleTooltip, 'mouseenter');

        assert
          .dom('[data-test-ak-tooltip-content]')
          .hasText(t('modalCard.dynamicScan.apiScanUrlFilterTooltipText'));

        await triggerEvent(apiURLTitleTooltip, 'mouseleave');

        if (hasApiFilters) {
          apiUrlFilters.forEach((url) => {
            const filterElem = find(
              `[data-test-fileDetails-dynamicScanDrawer-automatedDast-apiURLFilter='${url}']`
            );

            assert.dom(filterElem).hasText(url);

            assert
              .dom(
                '[data-test-fileDetails-dynamicScanDrawer-automatedDast-apiURLFilterIcon]',
                filterElem
              )
              .exists();
          });
        } else {
          assert
            .dom(
              '[data-test-fileDetails-dynamicScanDrawer-automatedDast-apiURLFiltersEmptyContainer]'
            )
            .containsText(t('modalCard.dynamicScan.emptyAPIListHeaderText'))
            .containsText(t('modalCard.dynamicScan.emptyAPIListSubText'));

          const settingsLink = findAll(
            '[data-test-fileDetails-dynamicScanDrawer-settingsPageRedirectLink]'
          );

          assert
            .dom(settingsLink[1])
            .hasText(
              t('modalCard.dynamicScan.goToGeneralSettings'),
              'Settings link has correct text'
            )
            .hasAttribute(
              'target',
              '_blank',
              'Settings button opens in new tab'
            )
            .hasAttribute(
              'href',
              `/dashboard/project/${this.file.project.id}/settings`,
              'Settings link has correct href'
            );
        }

        // Active scenarios section
        assert
          .dom(
            '[data-test-fileDetails-dynamicScanDrawer-automatedDast-projectScenariosTitle]'
          )
          .hasText(t('modalCard.dynamicScan.activeScenarios'));

        if (hasActiveScenarios) {
          scenarios.forEach((scenario) => {
            const scenarioElem = find(
              `[data-test-fileDetails-dynamicScanDrawer-automatedDast-projectScenario='${scenario.id}']`
            );

            assert.dom(scenarioElem).hasText(scenario.name);

            assert
              .dom(
                '[data-test-fileDetails-dynamicScanDrawer-automatedDast-projectScenarioIcon]',
                scenarioElem
              )
              .exists();
          });
        } else {
          assert
            .dom(
              '[data-test-fileDetails-dynamicScanDrawer-automatedDast-scenariosEmptyContainer]'
            )
            .containsText(
              t('modalCard.dynamicScan.emptyActiveScenariosHeaderText')
            )
            .containsText(
              t('modalCard.dynamicScan.emptyActiveScenariosSubText')
            );

          assert
            .dom(
              '[data-test-fileDetails-dynamicScanDrawer-settingsPageRedirectLink]'
            )
            .hasText(
              t('modalCard.dynamicScan.goToDastAutomationSettings'),
              'Settings link has correct text'
            )
            .hasAttribute(
              'target',
              '_blank',
              'Settings button opens in new tab'
            )
            .hasAttribute(
              'href',
              `/dashboard/project/${this.file.project.id}/settings/dast-automation`,
              'Settings link has correct href'
            );
        }

        // Proxy settings section
        const proxySetting = this.store.peekRecord(
          'proxy-setting',
          this.file.profile.get('id')
        );

        if (withApiProxy) {
          assert
            .dom(
              '[data-test-fileDetails-dynamicScanDrawer-automatedDast-proxySettingsHeader]'
            )
            .containsText(`${t('enable')} ${t('proxySettingsTitle')}`);

          assert
            .dom(
              '[data-test-fileDetails-dynamicScanDrawer-automatedDast-proxySettingsEnabledChip]'
            )
            .hasText(t('enabled'));

          assert
            .dom(
              '[data-test-fileDetails-dynamicScanDrawer-automatedDast-proxySettingsRoutingInfo]'
            )
            .containsText(t('modalCard.dynamicScan.apiRoutingText'))
            .containsText(proxySetting.host);
        } else {
          assert
            .dom(
              '[data-test-fileDetails-dynamicScanDrawer-automatedDast-proxySettingsContainer]'
            )
            .doesNotExist();
        }

        // Action buttons
        assert
          .dom('[data-test-fileDetails-dynamicScanDrawer-startBtn]')
          .isNotDisabled()
          .hasText(
            t('scheduleAutomation'),
            'Start scan button has correct text'
          );
      }
    );
  }
);
