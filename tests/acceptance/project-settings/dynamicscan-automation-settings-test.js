import { module, test } from 'qunit';

import {
  visit,
  currentURL,
  click,
  fillIn,
  findAll,
  triggerEvent,
  find,
} from '@ember/test-helpers';

import { setupApplicationTest } from 'ember-qunit';
import { setupRequiredEndpoints } from 'irene/tests/helpers/acceptance-utils';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { t } from 'ember-intl/test-support';
import Service from '@ember/service';
import { Response } from 'miragejs';

// ─── Service Stubs ──────────────────────────────────────────────────────────────────
class IntegrationStub extends Service {
  async configure(user) {
    this.currentUser = user;
  }

  isPendoEnabled() {
    return false;
  }

  isCrispEnabled() {
    return false;
  }
}

class WebsocketStub extends Service {
  async connect() {} //NOSONAR

  async configure() {} //NOSONAR
}

// ─── Selectors ────────────────────────────────────────────────────────────────
const selectors = {
  addScenarioBtn:
    '[data-test-projectSettings-dastAutomationSettings-scenarioAddBtn]',
  scenarioNameTextfield:
    '[data-test-projectSettings-dastAutomationSettings-scenarioAddModal-scenarioNameTextfield]',
  scenarioAddConfirmBtn:
    '[data-test-projectSettings-dastAutomationSettings-scenarioAddModal-confirmBtn]',
  scenarioTableRow:
    '[data-test-projectSettings-dastAutomationSettings-scenarioTableRow]',
  scenarioStatusToggle:
    '[data-test-projectSettings-dastScenario-toggle] [data-test-toggle-input]',
  deleteDefaultScenarioTooltip:
    '[data-test-projectSettings-viewScenarioHeader-deleteDefaultScenarioInfo-tooltip]',
  deleteScenarioModalTrigger:
    '[data-test-projectSettings-viewScenarioHeader-deleteScenarioModalTrigger]',
  deleteConfirmTextSelector:
    '[data-test-projectSettings-viewScenario-deleteScenarioConfirmText]',
  deleteBtnSelector:
    '[data-test-projectSettings-viewScenario-deleteScenarioDeleteBtn]',
  deleteCancelBtnSelector:
    '[data-test-projectSettings-viewScenario-deleteScenarioCancelBtn]',

  // AI DAST gating
  scenariosV1Root:
    '[data-test-projectSettings-dastAutomationSettings-scenarios-root]',
  scenariosV2Root:
    '[data-test-projectSettings-dastAutomationSettings-scenariosV2-root]',
  scenariosV2HeaderText:
    '[data-test-projectSettings-dastAutomationSettings-scenariosV2HeaderText]',
  scanWindowRoot:
    '[data-test-projectSettings-dastAutomationSettings-scanWindow-root]',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
/**
 * Registers Mirage handlers that the ScenarioV2 section and ScanWindow
 * component need when they are actually rendered.
 */
function setupV2AndScanWindowEndpoints(server) {
  server.get('/v2/projects/:projectId/scenarios', (schema) => {
    const results = schema.scenarios.all().models;

    return { count: results.length, next: null, previous: null, results };
  });

  server.get(
    '/v2/profiles/:profileId/ds_automated_scan_window_preference',
    (_, req) => ({
      id: req.params.profileId,
      scan_window_type: 'anytime',
      scan_window_start_at: null,
      scan_window_end_before: null,
      scan_window_timezone: '',
    })
  );
}

/** Stubs the single scenario-detail endpoint the V2 scenario route loads. */
function stubScenarioDetail(server) {
  server.get('/v2/projects/:projectId/scenarios/:id', (_, req) => ({
    id: req.params.id,
    name: 'V2 Scenario',
    type: 1,
    roles: [],
    steps: [],
  }));
}

module(
  'Acceptance | project settings/dynamicscan automation settings',
  function (hooks) {
    setupApplicationTest(hooks);
    setupMirage(hooks);

    hooks.beforeEach(async function () {
      const { vulnerabilities, organization, currentOrganizationMe } =
        await setupRequiredEndpoints(this.server);

      organization.update({
        features: {
          dynamicscan_automation: true,
        },
      });

      this.setProperties({
        organization,
        currentOrganizationMe,
      });

      const profile = this.server.create('profile');

      const analyses = vulnerabilities.map((v, id) =>
        this.server.create('analysis', { id, vulnerability: v.id }).toJSON()
      );

      // File Model
      const file = this.server.create('file', {
        id: 1,
        profile: profile.id,
        analyses,
      });

      const project = this.server.create('project', {
        id: 1,
        last_file: file,
      });

      this.setProperties({
        project,
      });

      this.server.create('ds-automated-device-preference', {
        id: profile.id,
      });

      this.server.create('proxy-setting', { id: profile.id });
      this.server.createList('available-automated-device', 3);

      // Register Services
      this.owner.register('service:integration', IntegrationStub);
      this.owner.register('service:websocket', WebsocketStub);

      // Server Mocks
      this.server.get('/v3/files/:id', (schema, req) => {
        const data = schema.files.find(`${req.params.id}`)?.toJSON();

        return { ...data, project: project.id };
      });

      this.server.get('/v3/projects/:id', (schema, req) => {
        return schema.projects.find(req.params.id).toJSON();
      });

      this.server.get('/profiles/:id', (schema, req) =>
        schema.profiles.find(`${req.params.id}`)?.toJSON()
      );

      this.server.get('v2/profiles/:id/automation_preference', (_, req) => {
        return { id: req.params.id, dynamic_scan_automation_enabled: true };
      });

      this.server.get(
        'v2/profiles/:id/ds_manual_device_preference',
        (_, req) => {
          return {
            id: req.params.id,
          };
        }
      );

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

      this.server.get(
        '/v2/profiles/:id/ds_automated_device_preference',
        (schema, req) => {
          return schema.dsAutomatedDevicePreferences
            .find(`${req.params.id}`)
            ?.toJSON();
        }
      );

      this.server.get('/v2/projects/:id/available_manual_devices', (schema) => {
        const results = schema.availableManualDevices.all().models;

        return { count: results.length, next: null, previous: null, results };
      });

      this.server.get(
        '/v2/projects/:id/available_automated_devices',
        (schema) => {
          const results = schema.availableAutomatedDevices.all().models;

          return { count: results.length, next: null, previous: null, results };
        }
      );

      this.server.get('/profiles/:id/proxy_settings', (schema, req) => {
        return schema.proxySettings.find(`${req.params.id}`)?.toJSON();
      });

      this.server.get('/profiles/:id/api_scan_options', (_, req) => ({
        id: req.params.id,
        ds_api_capture_filters: [],
      }));

      this.server.get(
        '/organizations/:id/projects/:projectId/collaborators',
        (schema) => {
          const results = schema.projectCollaborators.all().models;

          return { count: results.length, next: null, previous: null, results };
        }
      );

      this.server.get(
        '/organizations/:orgId/projects/:projectId/teams',
        (schema) => {
          const results = schema.projectTeams.all().models;

          return { count: results.length, next: null, previous: null, results };
        }
      );

      this.server.get('/v2/scan_parameter_groups/:id', (schema, req) =>
        schema.scanParameterGroups.find(req.params.id).toJSON()
      );

      this.server.get(
        '/v2/projects/:projectId/scan_parameter_groups/:id',
        (schema, req) => schema.scanParameterGroups.find(req.params.id).toJSON()
      );

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

      this.server.get(
        '/v2/scan_parameter_groups/:id/scan_parameters',
        (schema) => {
          const data = schema.scanParameters.all().models;

          return {
            count: data.length,
            next: null,
            previous: null,
            results: data,
          };
        }
      );

      this.server.get(
        '/organizations/:id/github_repos',
        () => new Response(404, {}, { detail: 'Github not integrated' })
      );

      this.server.get(
        '/projects/:id/github',
        () => new Response(400, {}, { detail: 'Github not integrated' })
      );

      this.server.get(
        '/organizations/:id/jira_projects',
        () => new Response(404, {}, { detail: 'JIRA not integrated' })
      );

      this.server.get(
        '/projects/:id/jira',
        () => new Response(404, {}, { detail: 'JIRA not integrated' })
      );

      // to dissmiss notification quickly
      const notify = this.owner.lookup('service:notifications');

      notify.setDefaultClearDuration(0);
    });

    test('it navigates to project scenario page on scenario click', async function (assert) {
      this.server.post(
        '/v2/projects/:projectId/scan_parameter_groups',
        function (schema, request) {
          const { name, description } = JSON.parse(request.requestBody);

          return schema.scanParameterGroups
            .create({
              name,
              description,
              project: request.params.projectId,
            })
            .toJSON();
        }
      );

      const scenario1Name = 'New Scenario Name 1';

      await visit(
        `/dashboard/project/${this.project.id}/settings/dast-automation`
      );

      await click(selectors.addScenarioBtn);

      // Add first scenario with status of false
      await fillIn(selectors.scenarioNameTextfield, scenario1Name);
      await click(selectors.scenarioAddConfirmBtn);

      // Sanity Check for scenario items
      const rows = findAll(selectors.scenarioTableRow);

      // assert first row
      const firstRowCells = rows[0];

      assert.dom(firstRowCells).containsText(scenario1Name);
      assert.dom(selectors.scenarioStatusToggle, firstRowCells).isNotChecked();

      // Click first row item
      await click(firstRowCells);

      // In DAST Automation route
      assert.strictEqual(
        currentURL(),
        `/dashboard/project/${this.project.id}/settings/dast-automation-scenario/1`
      );
    });

    test.each(
      'it deletes a scenario if not default',
      [true, false],
      async function (assert, is_default) {
        // Scenario Model - Sets default to true
        const scenario = this.server.create('scan-parameter-group', {
          project: this.project.id,
          name: is_default ? 'Default' : 'Test',
          is_active: false,
          is_default: is_default,
        });

        this.server.delete(
          '/v2/projects/:projectId/scan_parameter_groups/:id',
          function (schema, request) {
            schema.db.scanParameterGroups.remove(request.params.id);

            return new Response(204, {}, '');
          }
        );

        await visit(
          `/dashboard/project/${this.project.id}/settings/dast-automation-scenario/${scenario.id}`
        );

        if (is_default) {
          // Tootlip selector for default scenario
          assert
            .dom(selectors.deleteScenarioModalTrigger)
            .exists()
            .hasAttribute('disabled');

          const deleteDefaultScenarioInfoTooltip = find(
            selectors.deleteDefaultScenarioTooltip
          );

          await triggerEvent(deleteDefaultScenarioInfoTooltip, 'mouseenter');

          assert
            .dom('[data-test-ak-tooltip-content]')
            .exists()
            .containsText(t('dastAutomation.deleteDefaultScenarioInfo'));
        } else {
          assert
            .dom(selectors.deleteScenarioModalTrigger)
            .exists()
            .doesNotHaveAttribute('disabled');

          await click(selectors.deleteScenarioModalTrigger);

          assert
            .dom(selectors.deleteConfirmTextSelector)
            .exists()
            .containsText('Would you like to delete Scenario - Test?');

          assert
            .dom(selectors.deleteCancelBtnSelector)
            .exists()
            .containsText(t('cancel'));

          assert
            .dom(selectors.deleteBtnSelector)
            .exists()
            .containsText(t('yesDelete'));

          await click(selectors.deleteBtnSelector);

          // Navigates to project settings after delete
          assert.strictEqual(
            currentURL(),
            `/dashboard/project/${this.project.id}/settings`
          );
        }
      }
    );

    // ─── AI DAST feature-flag gating ──────────────────────────────────────────
    test('AI DAST disabled + regular user: shows only V1 scenarios; hides V2 and scan window', async function (assert) {
      this.currentOrganizationMe.update({ has_security_permission: false });

      await visit(
        `/dashboard/project/${this.project.id}/settings/dast-automation`
      );

      assert
        .dom(selectors.scenariosV1Root)
        .exists('V1 scenarios section shown');

      assert
        .dom(selectors.scenariosV2Root)
        .doesNotExist('V2 scenarios section hidden');

      assert.dom(selectors.scanWindowRoot).doesNotExist('scan window hidden');
    });

    test('AI DAST disabled + super user: shows both V1 and V2 scenarios, scan window, and "Super User Only" label', async function (assert) {
      this.currentOrganizationMe.update({ has_security_permission: true });

      setupV2AndScanWindowEndpoints(this.server);

      await visit(
        `/dashboard/project/${this.project.id}/settings/dast-automation`
      );

      assert
        .dom(selectors.scenariosV1Root)
        .exists('V1 scenarios section shown');

      assert
        .dom(selectors.scenariosV2Root)
        .exists('V2 scenarios section shown');

      assert.dom(selectors.scanWindowRoot).exists('scan window shown');

      assert
        .dom(selectors.scenariosV2HeaderText)
        .containsText(t('dastAutomation.superUserOnly'));
    });

    test('AI DAST enabled: shows only V2 scenarios and scan window; hides V1 and "Super User Only" label', async function (assert) {
      this.organization.update({
        ai_features: {
          ai_dast: true,
        },
      });

      setupV2AndScanWindowEndpoints(this.server);

      await visit(
        `/dashboard/project/${this.project.id}/settings/dast-automation`
      );

      assert.dom(selectors.scenariosV1Root).doesNotExist('V1 hidden');

      assert
        .dom(selectors.scenariosV2Root)
        .exists('V2 scenarios section shown');

      assert.dom(selectors.scanWindowRoot).exists('scan window shown');

      assert
        .dom(selectors.scenariosV2HeaderText)
        .doesNotContainText(t('dastAutomation.superUserOnly'));
    });

    // ─── AI DAST feature-flag gating (route level) ────────────────────────────

    test('AI DAST disabled + regular user: V2 scenario route redirects to settings', async function (assert) {
      this.currentOrganizationMe.update({ has_security_permission: false });

      await visit(
        `/dashboard/project/${this.project.id}/settings/dast-automation-scenario-v2/1`
      );

      assert.strictEqual(
        currentURL(),
        `/dashboard/project/${this.project.id}/settings/dast-automation`,
        'regular user is redirected away from the V2 scenario route'
      );
    });

    test('AI DAST disabled + super user: V2 scenario route is accessible', async function (assert) {
      this.currentOrganizationMe.update({ has_security_permission: true });

      stubScenarioDetail(this.server);

      await visit(
        `/dashboard/project/${this.project.id}/settings/dast-automation-scenario-v2/1`
      );

      assert.strictEqual(
        currentURL(),
        `/dashboard/project/${this.project.id}/settings/dast-automation-scenario-v2/1`,
        'super user stays on the V2 scenario route'
      );
    });

    test('AI DAST enabled: V2 scenario route is accessible for a regular user', async function (assert) {
      this.currentOrganizationMe.update({ has_security_permission: false });

      this.organization.update({ ai_features: { ai_dast: true } });

      stubScenarioDetail(this.server);

      await visit(
        `/dashboard/project/${this.project.id}/settings/dast-automation-scenario-v2/1`
      );

      assert.strictEqual(
        currentURL(),
        `/dashboard/project/${this.project.id}/settings/dast-automation-scenario-v2/1`,
        'stays on the V2 scenario route when AI DAST is enabled'
      );
    });

    test('AI DAST enabled: V1 scenario route redirects to settings', async function (assert) {
      this.organization.update({ ai_features: { ai_dast: true } });

      // Landing page after redirect renders the V2 flow + scan window.
      setupV2AndScanWindowEndpoints(this.server);

      const scenario = this.server.create('scan-parameter-group');

      await visit(
        `/dashboard/project/${this.project.id}/settings/dast-automation-scenario/${scenario.id}`
      );

      assert.strictEqual(
        currentURL(),
        `/dashboard/project/${this.project.id}/settings/dast-automation`,
        'V1 scenario route is blocked once AI DAST is enabled'
      );
    });

    test('AI DAST disabled: V1 scenario route is accessible', async function (assert) {
      const scenario = this.server.create('scan-parameter-group');

      await visit(
        `/dashboard/project/${this.project.id}/settings/dast-automation-scenario/${scenario.id}`
      );

      assert.strictEqual(
        currentURL(),
        `/dashboard/project/${this.project.id}/settings/dast-automation-scenario/${scenario.id}`,
        'stays on the V1 scenario route when AI DAST is disabled'
      );
    });
  }
);
