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
  async connect() {}

  async configure() {}
}

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
};

module(
  'Acceptance | project settings/dynamicscan automation settings',
  function (hooks) {
    setupApplicationTest(hooks);
    setupMirage(hooks);

    hooks.beforeEach(async function () {
      const { vulnerabilities, organization } = await setupRequiredEndpoints(
        this.server
      );

      organization.update({
        features: {
          dynamicscan_automation: true,
        },
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
        last_file_id: file.id,
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
      this.server.get('/v2/files/:id', (schema, req) => {
        const data = schema.files.find(`${req.params.id}`)?.toJSON();

        return { ...data, project: project.id };
      });

      this.server.get('/v2/projects/:id', (schema, req) => {
        return schema.projects.find(req.params.id).toJSON();
      });

      this.server.get('/profiles/:id', (schema, req) =>
        schema.profiles.find(`${req.params.id}`)?.toJSON()
      );

      this.server.get('v2/profiles/:id/automation_preference', (_, req) => {
        return { id: req.params.id, dynamic_scan_automation_enabled: true };
      });

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
        '/v2/profiles/:id/ds_manual_device_preference',
        (schema, req) => {
          return schema.dsManualDevicePreferences
            .find(`${req.params.id}`)
            ?.toJSON();
        }
      );

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
  }
);
