import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import {
  click,
  fillIn,
  find,
  findAll,
  render,
  triggerEvent,
  waitFor,
  waitUntil,
} from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import Service from '@ember/service';
import { Response } from 'ember-cli-mirage';

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

class RouterStub extends Service {
  currentRouteName = 'authenticated.project.settings';
  scenarioId = '';

  transitionTo(routeName, scenarioId) {
    this.currentRouteName = routeName;
    this.scenarioId = scenarioId;
  }
}

const selectors = {
  scenariosRoot: '[data-test-genSettings-dynScanAutoSettings-scenarios-root]',
  scenariosListEmpty:
    '[data-test-genSettings-dynScanAutoSettings-scenariosListEmpty]',
  scenarioListLoader:
    '[data-test-genSettings-dynScanAutoSettings-scenarioListLoader]',
  scenariosHeaderText:
    '[data-test-genSettings-dynScanAutoSettings-scenariosHeaderText]',
  scenariosListDesc:
    '[data-test-genSettings-dynScanAutoSettings-scenariosHeaderListDesc]',
  addScenarioBtn: '[data-test-genSettings-dynScanAutoSettings-scenarioAddBtn]',
  addScenarioBtnIcon:
    '[data-test-genSettings-dynScanAutoSettings-scenarioAddBtnIcon]',

  // Modal Selectors
  scenarioNameTextfieldTitle:
    '[data-test-genSettings-dynScanAutoSettings-scenarioAddModal-scenarioNameTextfieldTitle]',
  scenarioNameTextfield:
    '[data-test-genSettings-dynScanAutoSettings-scenarioAddModal-scenarioNameTextfield]',
  scenarioStatusTitle:
    '[data-test-genSettings-dynScanAutoSettings-scenarioAddModal-scenarioStatusTitle]',
  scenarioAddConfirmBtn:
    '[data-test-genSettings-dynScanAutoSettings-scenarioAddModal-confirmBtn]',
  scenarioAddCancelBtn:
    '[data-test-genSettings-dynScanAutoSettings-scenarioAddModal-cancelBtn]',
  scenarioAddStatusToggle:
    '[data-test-genSettings-dynScanAutoSettings-scenarioAddModal-scenarioStatusToggle] [data-test-toggle-input]',

  // Scenarios Table specific
  statusHeaderTooltip:
    '[data-test-genSettings-dynScanAutoSettings-statusColumnHeader-tooltip]',
  statusHeaderTooltipContent:
    '[data-test-genSettings-dynScanAutoSettings-statusColumnHeader-tooltipContent]',
  statusHeaderTooltipIcon:
    '[data-test-genSettings-dynScanAutoSettings-statusColumnHeader-tooltipIcon]',
  scenarioListEmpty:
    '[data-test-genSettings-dynScanAutoSettings-scenariosListEmpty]',
  scenarioStatusToggle:
    '[data-test-projectSettings-dastScenario-toggle] [data-test-toggle-input]',
  scenarioTableHeader:
    '[data-test-genSettings-dynScanAutoSettings-scenarioTableHeader] th',
  scenarioTableRow:
    '[data-test-genSettings-dynScanAutoSettings-scenarioTableRow]',
};

module(
  'Integration | Component | project-settings/general-settings/dynamicscan-automation-settings/scenario',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks);

    hooks.beforeEach(async function () {
      // Server mocks
      this.server.get('/v2/projects/:id', (schema, req) => {
        return schema.projects.find(req.params.id).toJSON();
      });

      this.server.get('/v2/files/:id', (schema, req) => {
        return schema.files.find(`${req.params.id}`)?.toJSON();
      });

      this.server.get('/v2/scan_parameter_groups/:id', (schema, req) =>
        schema.scanParameterGroups.find(req.params.id).toJSON()
      );

      this.server.get(
        '/v2/projects/:projectId/scan_parameter_groups/:id',
        (schema, req) => schema.scanParameterGroups.find(req.params.id).toJSON()
      );

      this.server.get(
        '/v2/projects/:projectId/scan_parameter_groups',
        function (schema, request) {
          const data = schema.scanParameterGroups.all().models;

          let limit = data.length;
          let offset = 0;

          if (request.queryParams.limit) {
            limit = request.queryParams.limit;
          }

          if (request.queryParams.offset) {
            offset = request.queryParams.offset;
          }

          const retdata = data.slice(offset, offset + limit);

          return {
            count: data.length,
            next: null,
            previous: null,
            results: retdata,
          };
        }
      );

      this.server.post(
        '/v2/projects/:projectId/scan_parameter_groups',
        function (schema, request) {
          const { name, description } = JSON.parse(request.requestBody);

          const nameIsAvailable = schema.scanParameterGroups
            .all()
            .models.find((g) => {
              return g.name.toLowerCase() === name.toLowerCase();
            });

          if (nameIsAvailable) {
            return new Response(
              400,
              {},
              {
                detail: 'Scenario Name already exists',
              }
            );
          }

          return schema.scanParameterGroups
            .create({
              name,
              description,
              project: request.params.projectId,
            })
            .toJSON();
        }
      );

      this.server.put(
        '/v2/projects/:projectId/scan_parameter_groups/:id',
        function (schema, request) {
          const { is_active, ...rest } = JSON.parse(request.requestBody);
          const id = request.params.id;

          return schema.scanParameterGroups
            .find(id)
            .update({ is_active, ...rest });
        }
      );

      this.server.delete(
        '/v2/projects/:projectId/scan_parameter_groups/:id',
        function (schema, request) {
          const scanParameterGroup = schema.scanParameterGroups.find(
            request.params.id
          );

          if (!scanParameterGroup) {
            return new Response(
              404,
              {},
              {
                detail: 'Not found.',
              }
            );
          }

          scanParameterGroup.destroy();
          return new Response(204, {}, '');
        }
      );

      // Service registers
      this.owner.register('service:notifications', NotificationsStub);
      this.owner.register('service:router', RouterStub);

      // Records
      const store = this.owner.lookup('service:store');
      const file = this.server.create('file', 1);
      const project = this.server.create('project', {
        id: 1,
        last_file_id: file.id,
      });

      const normalizedProject = store.normalize('project', {
        ...project.toJSON(),
      });

      this.setProperties({
        project: store.push(normalizedProject),
      });
    });

    test('it renders', async function (assert) {
      this.server.get(
        '/v2/projects/:projectId/scan_parameter_groups',
        function (schema, request) {
          const data = schema.scanParameterGroups.all().models;

          let limit = data.length;
          let offset = 0;

          if (request.queryParams.limit) {
            limit = request.queryParams.limit;
          }

          if (request.queryParams.offset) {
            offset = request.queryParams.offset;
          }

          const retdata = data.slice(offset, offset + limit);

          return {
            count: data.length,
            next: null,
            previous: null,
            results: retdata,
          };
        },
        { timing: 150 }
      );

      render(hbs`
        <ProjectSettings::GeneralSettings::DynamicscanAutomationSettings::Scenario
          @project={{this.project}} 
          @profileId={{this.project.activeProfileId}} 
        />
      `);

      await waitFor(selectors.scenarioListLoader, {
        timeout: 150,
      });

      assert.dom(selectors.scenarioListLoader).exists();

      await waitUntil(() => !find(selectors.scenarioListLoader), {
        timeout: 150,
      });

      assert.dom(selectors.scenariosRoot).exists();

      assert
        .dom(selectors.scenariosHeaderText)
        .exists()
        .containsText(t('dastAutomation.automationScenarios'));

      assert
        .dom(selectors.scenariosListDesc)
        .exists()
        .containsText(t('dastAutomation.scenarioListDesc'));

      assert
        .dom(selectors.addScenarioBtn)
        .exists()
        .containsText(t('dastAutomation.addScenario'));

      assert.dom(selectors.addScenarioBtnIcon).exists();
    });

    test('it adds and renders project scenarios', async function (assert) {
      const scenario1Name = 'New Scenario Name 1';
      const scenario2Name = 'New Scenario Name 2';

      await render(hbs`
        <ProjectSettings::GeneralSettings::DynamicscanAutomationSettings::Scenario
          @project={{this.project}} 
          @profileId={{this.project.activeProfileId}} 
        />
      `);

      assert
        .dom(selectors.scenarioListEmpty)
        .exists()
        .containsText(t('dastAutomation.noScenariosFound'));

      await click(selectors.addScenarioBtn);

      assert
        .dom(selectors.scenarioNameTextfieldTitle)
        .exists()
        .containsText(t('scenario'));

      assert.dom(selectors.scenarioNameTextfield).exists();

      assert
        .dom(selectors.scenarioStatusTitle)
        .exists()
        .containsText(t('status'));

      assert.dom(selectors.scenarioAddStatusToggle).exists().isNotChecked();

      assert
        .dom(selectors.scenarioAddConfirmBtn)
        .exists()
        .containsText(t('add'))
        .isDisabled();

      assert
        .dom(selectors.scenarioAddCancelBtn)
        .exists()
        .containsText(t('cancel'));

      assert
        .dom(selectors.scenarioListEmpty)
        .containsText(t('dastAutomation.noScenariosFound'));

      // Add first scenario
      await fillIn(selectors.scenarioNameTextfield, scenario1Name);

      assert.dom(selectors.scenarioAddConfirmBtn).isNotDisabled();

      await click(selectors.scenarioAddConfirmBtn);

      const notify = this.owner.lookup('service:notifications');
      assert.strictEqual(notify.successMsg, t('dastAutomation.scenarioAdded'));

      // Add second scenario
      await click(selectors.addScenarioBtn);

      await fillIn(selectors.scenarioNameTextfield, scenario2Name);

      await click(selectors.scenarioAddStatusToggle);
      assert.dom(selectors.scenarioAddStatusToggle).isChecked();

      await click(selectors.scenarioAddConfirmBtn);

      assert.dom(selectors.scenarioNameTextfieldTitle).doesNotExist();

      // Sanity Check for scenario header
      const scenariosHeaderCells = findAll(selectors.scenarioTableHeader);

      assert.strictEqual(scenariosHeaderCells.length, 2);

      assert.dom(scenariosHeaderCells[0]).containsText(t('scenario'));
      assert.dom(scenariosHeaderCells[1]).containsText(t('status'));

      assert
        .dom(
          scenariosHeaderCells[1].querySelector(
            selectors.statusHeaderTooltipIcon
          )
        )
        .exists();

      await triggerEvent(
        scenariosHeaderCells[1].querySelector(selectors.statusHeaderTooltip),
        'mouseenter'
      );

      assert
        .dom(selectors.statusHeaderTooltipContent)
        .exists()
        .containsText(t('dastAutomation.statusColumnToggleInfo'));

      // Sanity Check for scenario items
      const rows = findAll(selectors.scenarioTableRow);

      assert.strictEqual(
        rows.length,
        this.server.db.scanParameterGroups.length
      );

      // assert first row
      const firstRowCells = rows[0];

      assert.dom(firstRowCells).containsText(scenario1Name);
      assert.dom(selectors.scenarioStatusToggle, firstRowCells).isNotChecked();

      // assert second row
      const secondRowCells = rows[1];

      assert.dom(secondRowCells).containsText(scenario2Name);
      assert.dom(selectors.scenarioStatusToggle, secondRowCells).isChecked();
    });

    test('it throws an error when adding a scenario with the same name', async function (assert) {
      const scenario1Name = 'New Scenario Name 1';
      const dupNameError = 'Scenario Name already exists';

      this.server.post(
        '/v2/projects/:projectId/scan_parameter_groups',
        function (schema, request) {
          const { name, description } = JSON.parse(request.requestBody);

          const nameIsAvailable = schema.scanParameterGroups
            .all()
            .models.find((g) => {
              return g.name.toLowerCase() === name.toLowerCase();
            });

          if (nameIsAvailable) {
            return new Response(400, {}, { name: [dupNameError] });
          }

          return schema.scanParameterGroups
            .create({
              name,
              description,
              project: request.params.projectId,
            })
            .toJSON();
        }
      );

      await render(hbs`
        <ProjectSettings::GeneralSettings::DynamicscanAutomationSettings::Scenario
          @project={{this.project}} 
          @profileId={{this.project.activeProfileId}} 
        />
      `);

      await click(selectors.addScenarioBtn);

      // Add first scenario
      await fillIn(selectors.scenarioNameTextfield, scenario1Name);

      assert.dom(selectors.scenarioAddConfirmBtn).isNotDisabled();

      await click(selectors.scenarioAddConfirmBtn);

      const notify = this.owner.lookup('service:notifications');
      assert.strictEqual(notify.successMsg, t('dastAutomation.scenarioAdded'));

      // Add second scenario with same name
      await click(selectors.addScenarioBtn);

      await fillIn(selectors.scenarioNameTextfield, scenario1Name);

      await click(selectors.scenarioAddConfirmBtn);
      assert.strictEqual(notify.errorMsg, dupNameError);

      await click(selectors.scenarioAddCancelBtn);

      // Sanity Check for scenario items
      const rows = findAll(selectors.scenarioTableRow);

      assert.strictEqual(rows.length, 1);
      assert.strictEqual(this.server.db.scanParameterGroups.length, 1);

      // assert first row
      const firstRowCells = rows[0];

      assert.dom(firstRowCells).containsText(scenario1Name);
      assert.dom(selectors.scenarioStatusToggle, firstRowCells).isNotChecked();
    });

    test('it toggles project scenario statuses', async function (assert) {
      const scenario1Name = 'New Scenario Name 1';

      await render(hbs`
        <ProjectSettings::GeneralSettings::DynamicscanAutomationSettings::Scenario
          @project={{this.project}} 
          @profileId={{this.project.activeProfileId}} 
        />
      `);

      await click(selectors.addScenarioBtn);

      // Add first scenario with status of false
      await fillIn(selectors.scenarioNameTextfield, scenario1Name);

      assert.dom(selectors.scenarioAddConfirmBtn).isNotDisabled();

      await click(selectors.scenarioAddConfirmBtn);

      const notify = this.owner.lookup('service:notifications');
      assert.strictEqual(notify.successMsg, t('dastAutomation.scenarioAdded'));

      // Sanity Check for scenario items
      const rows = findAll(selectors.scenarioTableRow);

      // assert first row
      const firstRowCells = rows[0];

      assert.dom(firstRowCells).containsText(scenario1Name);
      assert.dom(selectors.scenarioStatusToggle, firstRowCells).isNotChecked();

      // Toggle first row status
      assert.notOk(this.server.db.scanParameterGroups[0].is_active);

      await click(firstRowCells.querySelector(selectors.scenarioStatusToggle));

      assert.dom(selectors.scenarioStatusToggle, firstRowCells).isChecked();

      assert.strictEqual(
        notify.successMsg,
        t('dastAutomation.scenarioStatusUpdated')
      );

      assert.ok(this.server.db.scanParameterGroups[0].is_active);
    });

    test('it navigates to project scenario page on scenario click', async function (assert) {
      const scenario1Name = 'New Scenario Name 1';

      await render(hbs`
        <ProjectSettings::GeneralSettings::DynamicscanAutomationSettings::Scenario
          @project={{this.project}} 
          @profileId={{this.project.activeProfileId}} 
        />
      `);
      const router = this.owner.lookup('service:router');

      // In Project settings route
      assert.strictEqual(
        router.currentRouteName,
        'authenticated.project.settings'
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
        router.currentRouteName,
        'authenticated.project.settings.dast-automation-scenario'
      );

      assert.strictEqual(
        router.scenarioId,
        this.server.db.scanParameterGroups[0].id
      );
    });
  }
);
