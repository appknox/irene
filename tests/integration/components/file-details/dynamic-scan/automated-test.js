import {
  render,
  click,
  find,
  triggerEvent,
  findAll,
  settled,
} from '@ember/test-helpers';

import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { setupBrowserFakes } from 'ember-browser-services/test-support';
import { module, test } from 'qunit';
import { faker } from '@faker-js/faker';
import { Response } from 'miragejs';

import ENUMS from 'irene/enums';
import { deviceType } from 'irene/helpers/device-type';
import { dsAutomatedDevicePref } from 'irene/helpers/ds-automated-device-pref';
import { setupFileModelEndpoints } from 'irene/tests/helpers/file-model-utils';

// ─── Selectors ────────────────────────────────────────────────────────────────

const SEL = {
  // Card & header
  deviceHeader: '[data-test-fileDetails-dynamicScan-deviceWrapper-headerText]',
  statusChip: '[data-test-fileDetails-dynamicScan-statusChip]',
  actionBtn: '[data-test-fileDetails-dynamicScanAction]',
  vncRoot: '[data-test-vncViewer-root]',
  deviceViewer:
    '[data-test-fileDetails-dynamicScan-deviceWrapper-deviceViewer]',

  interactionInfoIcon:
    '[data-test-fileDetails-dynamicScan-automated-interactionInfoIcon]',
  interactionInfoText:
    '[data-test-fileDetails-dynamicScan-automated-interactionInfoText]',

  // Upselling
  upselling: {
    container: '[data-test-automated-dast-upselling]',
    text: '[data-test-upselling-text]',
    btn: '[data-test-upselling-upgrade-now-button]',
    clicked: '[data-test-upselling-upgrade-clicked-text]',
  },

  // Disabled state
  disabled: {
    card: '[data-test-fileDetails-dynamicScan-automatedDast-disabledCard]',
    title: '[data-test-fileDetails-dynamicScan-automatedDast-disabledTitle]',
    desc: '[data-test-fileDetails-dynamicScan-automatedDast-disabledDesc]',
    actionBtn:
      '[data-test-fileDetails-dynamicScan-automatedDast-disabledActionBtn]',
  },

  // User role pills
  userRoles: {
    root: '[data-test-fileDetails-dynamicScan-automated-userRoles-root]',
    pills: '[data-test-fileDetails-dynamicScan-automated-userRoles-pill]',
    pill: (name) =>
      `[data-test-fileDetails-dynamicScan-automated-userRoles-pillWrapper='${name}']`,
  },

  // Navigation graph button
  navGraphBtn:
    '[data-test-fileDetails-dynamicScan-automated-viewNavigationGraphBtn]',

  // Drawer
  drawer: {
    container: '[data-test-fileDetails-dynamicScanDrawer-drawerContainer]',
    title: '[data-test-fileDetails-dynamicScanDrawer-drawerContainer-title]',
    startBtn: '[data-test-fileDetails-dynamicScanDrawer-startBtn]',
    settingsLink:
      '[data-test-fileDetails-dynamicScanDrawer-settingsPageRedirectLink]',
    deviceRequirementsHeader:
      '[data-test-fileDetails-dynamicScanDrawer-automatedDast-headerDeviceRequirements]',
    osInfoDesc:
      '[data-test-fileDetails-dynamicScanDrawer-automatedDast-headerOSInfoDesc]',
    osInfoValue:
      '[data-test-fileDetails-dynamicScanDrawer-automatedDast-headerOSInfoValue]',
    devicePrefHeader:
      '[data-test-fileDetails-dynamicScanDrawer-automatedDast-headerDevicePreference]',
    devicePref: (id) =>
      `[data-test-fileDetails-dynamicScanDrawer-automatedDast-devicePreference='${id}']`,

    apiFilterContainer:
      '[data-test-fileDetails-dynamicScanDrawer-automatedDast-apiFilterContainer]',
    apiFilterTitle:
      '[data-test-fileDetails-dynamicScanDrawer-automatedDast-apiFilter-title]',
    apiFilterTooltipIcon:
      '[data-test-fileDetails-dynamicScanDrawer-automatedDast-apiURLFilter-iconTooltip]',
    apiFilterEmpty:
      '[data-test-fileDetails-dynamicScanDrawer-automatedDast-apiURLFiltersEmptyContainer]',
    apiFilterItem: (url) =>
      `[data-test-fileDetails-dynamicScanDrawer-automatedDast-apiURLFilter='${url}']`,
    apiFilterIcon:
      '[data-test-fileDetails-dynamicScanDrawer-automatedDast-apiURLFilterIcon]',

    scenariosTitle:
      '[data-test-fileDetails-dynamicScanDrawer-automatedDast-projectScenariosTitle]',
    scenariosEmpty:
      '[data-test-fileDetails-dynamicScanDrawer-automatedDast-scenariosEmptyContainer]',
    scenarioItem: (id) =>
      `[data-test-fileDetails-dynamicScanDrawer-automatedDast-projectScenario='${id}']`,
    scenarioIcon:
      '[data-test-fileDetails-dynamicScanDrawer-automatedDast-projectScenarioIcon]',

    proxyHeader:
      '[data-test-fileDetails-dynamicScanDrawer-automatedDast-proxySettingsHeader]',
    proxyEnabledChip:
      '[data-test-fileDetails-dynamicScanDrawer-automatedDast-proxySettingsEnabledChip]',
    proxyRoutingInfo:
      '[data-test-fileDetails-dynamicScanDrawer-automatedDast-proxySettingsRoutingInfo]',
    proxyContainer:
      '[data-test-fileDetails-dynamicScanDrawer-automatedDast-proxySettingsContainer]',

    tooltipContent: '[data-test-ak-tooltip-content]',
  },
};

// ─── Fixtures & helpers ───────────────────────────────────────────────────────

/**
 * Builds an automated dynamicscan payload for the
 * `/v3/files/:id/last_automated_dynamic_scan` endpoint. `fileId` is stamped
 * in from the request URL at stub time; everything else has a sensible
 * default that individual tests override.
 */
function makeAutomatedScan(fileId, overrides = {}) {
  return {
    id: '101',
    status: ENUMS.DYNAMIC_SCAN_STATUS.NOT_STARTED,
    mode: ENUMS.DYNAMIC_MODE.AUTOMATED,
    engine: ENUMS.DYNAMIC_SCAN_ENGINE.AUTOPILOT,
    file: fileId,
    scenario_user_role: null,
    ...overrides,
  };
}

/** Stubs the last-automated-scans endpoint with a fixed list of overrides. */
function stubLastAutomatedScans(server, scanOverrides) {
  server.get('/v3/files/:id/last_automated_dynamic_scan', (_, req) =>
    scanOverrides.map((o) => makeAutomatedScan(req.params.id, o))
  );
}

const graphOk = () => ({ id: '1', nodes: [], edges: [] });
const graphMissing = () => new Response(404, {}, {});

/**
 * Stubs the navigation-graph endpoint. `resolver(id)` decides per-scan
 * whether to return a graph or a 404 — pass `graphOk`, `graphMissing`, or a
 * custom resolver for per-id logic.
 */
function stubNavigationGraph(server, resolver) {
  server.get('/v2/dynamicscans/:id/navigation_graph', (_, req) =>
    resolver(req.params.id)
  );
}

/**
 * Registers the five mirage endpoints the drawer test needs. Collapses ~30
 * lines of inline stub setup into a single call per test invocation.
 */
function stubDrawerEndpoints(server, opts = {}) {
  const { apiUrlFilters = [], proxyEnabled = false, scenarios = [] } = opts;

  server.get('/v2/profiles/:id/ds_automated_device_preference', (schema, req) =>
    schema.dsAutomatedDevicePreferences.find(`${req.params.id}`)?.toJSON()
  );

  server.get('/profiles/:id', (schema, req) =>
    schema.profiles.find(`${req.params.id}`)?.toJSON()
  );

  server.get('/profiles/:id/api_scan_options', (_, req) => ({
    ds_api_capture_filters: apiUrlFilters,
    id: req.params.id,
  }));

  server.get('/profiles/:id/proxy_settings', (_, req) => ({
    id: req.params.id,
    host: faker.internet.ip(),
    port: faker.internet.port(),
    enabled: proxyEnabled,
  }));

  server.get('/v2/projects/:projectId/scenarios', () => ({
    count: scenarios.length,
    next: null,
    previous: null,
    results: scenarios,
  }));
}

/** Standard component render. Args resolve against the test context. */
async function renderAutomatedScanTemplate() {
  return render(hbs`
    <FileDetails::DynamicScan::Automated
      @file={{this.file}}
      @profileId={{this.file.project.activeProfileId}}
    />
  `);
}

/** Asserts whether a user role pill is currently in the "selected" state. */
function assertPillSelected(assert, name, expected) {
  const pill = find(SEL.userRoles.pill(name));
  const selected = /selected/.test(pill.className);

  assert.strictEqual(
    selected,
    expected,
    `${name} pill selected state: ${expected}`
  );
}

// ─── Module ───────────────────────────────────────────────────────────────────

module(
  'Integration | Component | file-details/dynamic-scan/automated',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en');
    setupBrowserFakes(hooks, { window: true, localStorage: true });

    hooks.beforeEach(async function () {
      setupFileModelEndpoints(this.server);

      const store = this.owner.lookup('service:store');
      const dsService = this.owner.lookup('service:dynamic-scan');

      const organization = this.server.create('organization', {
        features: { dynamicscan_automation: true },
      });

      this.server.create('organization-me', { id: organization.id });

      const profile = this.server.create('profile', { id: '100' });

      const file = this.server.create('file', {
        id: 1,
        project: '1',
        profile: profile.id,
        is_active: true,
      });

      const project = this.server.create('project', {
        last_file: file,
        id: '1',
        active_profile_id: profile.id,
      });

      const devicePreference = this.server.create(
        'ds-automated-device-preference',
        { id: profile.id }
      );

      // Shared endpoints — individual tests may override any of these.
      this.server.get('/v2/files/:id/dynamicscans', (schema, req) => {
        const { limit, mode } = req.queryParams || {};

        const models = schema.dynamicscans.where({
          file: req.params.id,
          ...(mode ? { mode: Number(mode) } : {}),
        }).models;

        const results = limit ? models.slice(0, Number(limit)) : models;

        return {
          count: results.length,
          next: null,
          previous: null,
          results,
        };
      });

      this.server.get('/v2/profiles/:id/automation_preference', (_, req) => ({
        id: req.params.id,
        dynamic_scan_automation_enabled: true,
      }));

      this.server.get('/organizations/:id/me', (schema, req) =>
        schema.organizationMes.find(`${req.params.id}`)?.toJSON()
      );

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
      this.server.create('dynamicscan', {
        file: this.file.id,
        status: ENUMS.DYNAMIC_SCAN_STATUS.NOT_STARTED,
        mode: ENUMS.DYNAMIC_MODE.AUTOMATED,
      });

      // In real scenario this is called from the root component.
      this.dsService.fetchLatestScans(this.file);

      await renderAutomatedScanTemplate();

      assert.dom(SEL.deviceHeader).hasText(t('realDevice'));
      assert.dom(SEL.statusChip).hasText(t('notStarted'));

      assert
        .dom(SEL.actionBtn)
        .isNotDisabled()
        .hasText(t('dastTabs.automatedDAST'));

      assert.dom(SEL.deviceViewer).exists();
      assert.dom(SEL.vncRoot).exists();
    });

    test('it renders upselling when feature is disabled', async function (assert) {
      // Load the organization to ensure the feature is disabled
      this.organization.update({
        features: { dynamicscan_automation: false },
      });

      await this.owner.lookup('service:organization').load();
      const windowService = this.owner.lookup('service:browser/window');

      // Stub the feature request endpoint
      this.server.post('/v2/feature_request/automated_dast', () => ({}));

      await renderAutomatedScanTemplate();

      assert.dom(SEL.upselling.container).exists();
      assert.dom(SEL.upselling.text).hasText(t('upsellingDastAutomation'));
      assert.dom(SEL.upselling.btn).isNotDisabled().hasText(t('imInterested'));
      assert.dom(SEL.upselling.clicked).doesNotExist();

      await click(SEL.upselling.btn);

      assert
        .dom(SEL.upselling.clicked)
        .hasText(t('upsellingDastAutomationWhenClicked'));

      assert.dom(SEL.upselling.btn).doesNotExist();
      assert.dom(SEL.upselling.text).doesNotExist();

      assert.strictEqual(
        windowService.localStorage.getItem('automatedDastRequest'),
        'true'
      );
    });

    test('it renders disabled state when automation preference is disabled', async function (assert) {
      this.server.get('/v2/profiles/:id/automation_preference', (_, req) => ({
        id: req.params.id,
        dynamic_scan_automation_enabled: false,
      }));

      await renderAutomatedScanTemplate();

      assert.dom(SEL.disabled.card).exists();
      assert.dom(SEL.disabled.title).hasText(t('toggleAutomatedDAST'));
      assert.dom(SEL.disabled.desc).exists();
      assert.dom(SEL.disabled.actionBtn).hasText(t('goToSettings'));
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

        const scenarios = [
          { id: '1', name: 'Scenario 1', is_active: hasActiveScenarios },
          { id: '2', name: 'Scenario 2', is_active: hasActiveScenarios },
        ];

        this.server.create('dynamicscan', {
          file: this.file.id,
          status: ENUMS.DYNAMIC_SCAN_STATUS.NOT_STARTED,
          mode: ENUMS.DYNAMIC_MODE.AUTOMATED,
        });

        stubDrawerEndpoints(this.server, {
          apiUrlFilters,
          proxyEnabled: withApiProxy,
          scenarios,
        });

        this.dsService.fetchLatestScans(this.file);

        await renderAutomatedScanTemplate();
        await click(SEL.actionBtn);

        // ── Drawer frame ──
        assert.dom(SEL.drawer.container).exists('Drawer container exists');

        assert
          .dom(SEL.drawer.title)
          .hasText(t('dastTabs.automatedDAST'), 'Drawer has correct title');

        // ── Device requirements ──
        assert
          .dom(SEL.drawer.deviceRequirementsHeader)
          .hasText(
            t('modalCard.dynamicScan.deviceRequirements'),
            'Device requirements header exists'
          );

        assert
          .dom(SEL.drawer.osInfoDesc)
          .hasText(t('modalCard.dynamicScan.osVersion'), 'OS version label');

        assert
          .dom(SEL.drawer.osInfoValue)
          .containsText(this.file.project.get('platformDisplay'))
          .containsText(this.file.minOsVersion)
          .containsText(
            t('modalCard.dynamicScan.orAbove'),
            'OS info shows correct values'
          );

        assert
          .dom(SEL.drawer.devicePrefHeader)
          .hasText(t('devicePreferences'), 'Device preferences header');

        // ── Device preferences ──
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
                  ENUMS.DS_DEVICE_TYPE.NO_PREFERENCE,
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
            .dom(SEL.drawer.devicePref(pref.id))
            .containsText(String(pref.value))
            .containsText(pref.title);
        });

        // ── API URL filters ──
        assert
          .dom(SEL.drawer.apiFilterContainer)
          .exists('API filter container exists');

        assert
          .dom(SEL.drawer.apiFilterTitle)
          .exists()
          .hasText(t('templates.apiScanURLFilter'));

        const tooltipIcon = find(SEL.drawer.apiFilterTooltipIcon);

        await triggerEvent(tooltipIcon, 'mouseenter');

        assert
          .dom(SEL.drawer.tooltipContent)
          .hasText(t('modalCard.dynamicScan.apiScanUrlFilterTooltipText'));

        await triggerEvent(tooltipIcon, 'mouseleave');

        if (hasApiFilters) {
          apiUrlFilters.forEach((url) => {
            const filterElem = find(SEL.drawer.apiFilterItem(url));

            assert.dom(filterElem).hasText(url);
            assert.dom(SEL.drawer.apiFilterIcon, filterElem).exists();
          });
        } else {
          assert
            .dom(SEL.drawer.apiFilterEmpty)
            .containsText(t('modalCard.dynamicScan.emptyAPIListHeaderText'))
            .containsText(t('modalCard.dynamicScan.emptyAPIListSubText'));

          const settingsLinks = findAll(SEL.drawer.settingsLink);

          assert
            .dom(settingsLinks[1])
            .hasText(
              t('modalCard.dynamicScan.goToGeneralSettings'),
              'Settings link text'
            )
            .hasAttribute('target', '_blank', 'Settings link opens in new tab')
            .hasAttribute(
              'href',
              `/dashboard/project/${this.file.project.id}/settings`,
              'Settings link href'
            );
        }

        // ── Active scenarios ──
        assert
          .dom(SEL.drawer.scenariosTitle)
          .hasText(t('modalCard.dynamicScan.activeScenarios'));

        if (hasActiveScenarios) {
          scenarios.forEach((scenario) => {
            const scenarioElem = find(SEL.drawer.scenarioItem(scenario.id));

            assert.dom(scenarioElem).hasText(scenario.name);
            assert.dom(SEL.drawer.scenarioIcon, scenarioElem).exists();
          });
        } else {
          assert
            .dom(SEL.drawer.scenariosEmpty)
            .containsText(
              t('modalCard.dynamicScan.emptyActiveScenariosHeaderText')
            )
            .containsText(
              t('modalCard.dynamicScan.emptyActiveScenariosSubText')
            );

          assert
            .dom(SEL.drawer.settingsLink)
            .hasText(
              t('modalCard.dynamicScan.goToDastAutomationSettings'),
              'Settings link text'
            )
            .hasAttribute('target', '_blank', 'Settings link opens in new tab')
            .hasAttribute(
              'href',
              `/dashboard/project/${this.file.project.id}/settings/dast-automation`,
              'Settings link href'
            );
        }

        // ── Proxy settings ──
        const proxySetting = this.store.peekRecord(
          'proxy-setting',
          this.file.profile.get('id')
        );

        if (withApiProxy) {
          assert
            .dom(SEL.drawer.proxyHeader)
            .containsText(`${t('enable')} ${t('proxySettingsTitle')}`);

          assert.dom(SEL.drawer.proxyEnabledChip).hasText(t('enabled'));

          assert
            .dom(SEL.drawer.proxyRoutingInfo)
            .containsText(t('modalCard.dynamicScan.apiRoutingText'))
            .containsText(proxySetting.host);
        } else {
          assert.dom(SEL.drawer.proxyContainer).doesNotExist();
        }

        // ── Action button ──
        assert
          .dom(SEL.drawer.startBtn)
          .isNotDisabled()
          .hasText(t('scheduleAutomation'), 'Start scan button text');
      }
    );

    // ─── User Roles ──────────────────────────────────────────────────────────

    test('does not render user roles when the single scan has no user role', async function (assert) {
      this.server.create('dynamicscan', {
        file: this.file.id,
        status: ENUMS.DYNAMIC_SCAN_STATUS.NOT_STARTED,
        mode: ENUMS.DYNAMIC_MODE.AUTOMATED,
      });

      await renderAutomatedScanTemplate();

      assert.dom(SEL.userRoles.root).doesNotExist();
    });

    test('renders user role pills for multi-scan set and auto-selects the first scan', async function (assert) {
      assert.expect(6);

      stubLastAutomatedScans(this.server, [
        { id: '101', scenario_user_role: { id: '1', name: 'Admin' } },
        { id: '102', scenario_user_role: { id: '2', name: 'Guest' } },
      ]);

      await renderAutomatedScanTemplate();

      assert.dom(SEL.userRoles.root).exists();

      assert.strictEqual(
        findAll(SEL.userRoles.pills).length,
        2,
        'two role pills rendered'
      );

      assert.dom(SEL.userRoles.pill('Admin')).exists('Admin pill exists');
      assert.dom(SEL.userRoles.pill('Guest')).exists('Guest pill exists');

      assertPillSelected(assert, 'Admin', true);
      assertPillSelected(assert, 'Guest', false);
    });

    test('clicking a different role pill switches the selected scan', async function (assert) {
      assert.expect(2);

      stubLastAutomatedScans(this.server, [
        { id: '101', scenario_user_role: { id: '1', name: 'Admin' } },
        { id: '102', scenario_user_role: { id: '2', name: 'Guest' } },
      ]);

      await renderAutomatedScanTemplate();
      await click(SEL.userRoles.pill('Guest'));

      assertPillSelected(assert, 'Guest', true);
      assertPillSelected(assert, 'Admin', false);
    });

    // ─── Navigation Graph ────────────────────────────────────────────────────

    test('shows the navigation graph button when the completed scan has a graph', async function (assert) {
      stubLastAutomatedScans(this.server, [
        { id: '101', status: ENUMS.DYNAMIC_SCAN_STATUS.ANALYSIS_COMPLETED },
      ]);

      stubNavigationGraph(this.server, graphOk);

      await renderAutomatedScanTemplate();

      assert.dom(SEL.navGraphBtn).exists();
    });

    test('hides the navigation graph button when the completed scan has no graph', async function (assert) {
      stubLastAutomatedScans(this.server, [
        { id: '101', status: ENUMS.DYNAMIC_SCAN_STATUS.ANALYSIS_COMPLETED },
      ]);

      stubNavigationGraph(this.server, graphMissing);

      await renderAutomatedScanTemplate();

      assert.dom(SEL.navGraphBtn).doesNotExist();
    });

    test('navigation graph button appears and disappears when switching between scans', async function (assert) {
      stubLastAutomatedScans(this.server, [
        {
          id: '101',
          status: ENUMS.DYNAMIC_SCAN_STATUS.ANALYSIS_COMPLETED,
          scenario_user_role: { id: '1', name: 'Admin' },
        },
        {
          id: '102',
          status: ENUMS.DYNAMIC_SCAN_STATUS.ANALYSIS_COMPLETED,
          scenario_user_role: { id: '2', name: 'Guest' },
        },
      ]);

      // Only scan 101 has a graph — switching pills toggles the button.
      stubNavigationGraph(this.server, (id) =>
        id === '101' ? graphOk() : graphMissing()
      );

      await renderAutomatedScanTemplate();

      assert
        .dom(SEL.navGraphBtn)
        .exists('button shown for Admin scan which has a nav graph');

      await click(SEL.userRoles.pill('Guest'));

      assert
        .dom(SEL.navGraphBtn)
        .doesNotExist(
          'button hidden after switching to Guest scan which has no graph'
        );

      await click(SEL.userRoles.pill('Admin'));

      assert
        .dom(SEL.navGraphBtn)
        .exists('button reappears after switching back to Admin scan');
    });

    // ─── WS Events ───────────────────────────────────────────────────────────

    test('navigation graph button appears after a WS event completes the scan', async function (assert) {
      stubLastAutomatedScans(this.server, [
        { id: '103', status: ENUMS.DYNAMIC_SCAN_STATUS.AUTOPILOT_RUNNING },
      ]);

      stubNavigationGraph(this.server, graphOk);

      await renderAutomatedScanTemplate();

      assert
        .dom(SEL.navGraphBtn)
        .doesNotExist('button absent while scan is still running');

      // Mark the scan as completed in the store, then fire the WS event.
      const scan = this.store.push(
        this.store.normalize('dynamicscan', {
          id: '103',
          status: ENUMS.DYNAMIC_SCAN_STATUS.ANALYSIS_COMPLETED,
          engine: ENUMS.DYNAMIC_SCAN_ENGINE.AUTOPILOT,
          file: String(this.file.id),
        })
      );

      this.owner
        .lookup('service:event-bus')
        .trigger('ws:dynamicscan:update', scan);

      await settled();

      assert
        .dom(SEL.navGraphBtn)
        .exists('button appears after scan is marked complete via WS');
    });

    // ─── showActionButton ────────────────────────────────────────────────────

    test.each(
      'hides the action button when the scan is running and scheduled internal',
      [
        ENUMS.DYNAMIC_SCAN_STATUS.READY_FOR_INTERACTION,
        ENUMS.DYNAMIC_SCAN_STATUS.AUTOPILOT_RUNNING,
        ENUMS.DYNAMIC_SCAN_STATUS.AUTOPILOT_COMPLETED,
      ],
      async function (assert, status) {
        stubLastAutomatedScans(this.server, [
          {
            id: '104',
            status,
            engine: ENUMS.DYNAMIC_SCAN_ENGINE.INTERNAL_MANUAL,
          },
        ]);

        await renderAutomatedScanTemplate();

        assert.dom(SEL.actionBtn).doesNotExist();
      }
    );

    test.each(
      'shows the action button when the scan is running and autopiloted',
      [
        ENUMS.DYNAMIC_SCAN_STATUS.READY_FOR_INTERACTION,
        ENUMS.DYNAMIC_SCAN_STATUS.AUTOPILOT_RUNNING,
        ENUMS.DYNAMIC_SCAN_STATUS.AUTOPILOT_COMPLETED,
      ],
      async function (assert, status) {
        stubLastAutomatedScans(this.server, [{ id: '105', status }]);

        await renderAutomatedScanTemplate();

        assert.dom(SEL.actionBtn).exists();
      }
    );

    // ─── showInteractionInfo ─────────────────────────────────────────────────

    test.each(
      'shows the correct interaction info banner for an autopiloted scan',
      [
        {
          status: ENUMS.DYNAMIC_SCAN_STATUS.HOOKING,
          expectedText: () => t('dynamicScanDeviceInteractionStarting'),
        },
        {
          status: ENUMS.DYNAMIC_SCAN_STATUS.AUTOPILOT_RUNNING,
          expectedText: () => t('dynamicScanDeviceInteractionDisabled'),
        },
      ],
      async function (assert, { status, expectedText }) {
        stubLastAutomatedScans(this.server, [{ id: '106', status }]);

        await renderAutomatedScanTemplate();

        assert.dom(SEL.interactionInfoText).exists().hasText(expectedText());
      }
    );

    test.each(
      'hides the interaction info banner for a scheduled internal scan in an active state',
      [
        ENUMS.DYNAMIC_SCAN_STATUS.HOOKING,
        ENUMS.DYNAMIC_SCAN_STATUS.READY_FOR_INTERACTION,
      ],
      async function (assert, status) {
        stubLastAutomatedScans(this.server, [
          {
            id: '107',
            status,
            engine: ENUMS.DYNAMIC_SCAN_ENGINE.INTERNAL_MANUAL,
          },
        ]);

        await renderAutomatedScanTemplate();

        assert.dom(SEL.interactionInfoIcon).doesNotExist();
        assert.dom(SEL.interactionInfoText).doesNotExist();
      }
    );
  }
);
