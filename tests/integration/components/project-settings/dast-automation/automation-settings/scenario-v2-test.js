import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import {
  click,
  fillIn,
  find,
  findAll,
  render,
  waitFor,
  waitUntil,
} from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { Response } from 'miragejs';
import Service from '@ember/service';

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

// ─── Selectors ───────────────────────────────────────────────────────────────

const selectors = {
  root: '[data-test-projectSettings-dastAutomationSettings-scenariosV2-root]',

  headerText:
    '[data-test-projectSettings-dastAutomationSettings-scenariosV2HeaderText]',
  headerDesc:
    '[data-test-projectSettings-dastAutomationSettings-scenariosV2HeaderListDesc]',
  addBtn: '[data-test-projectSettings-dastAutomationSettings-scenarioV2AddBtn]',
  loader:
    '[data-test-projectSettings-dastAutomationSettings-scenarioV2ListLoader]',
  emptyList:
    '[data-test-projectSettings-dastAutomationSettings-scenariosV2ListEmpty]',
  tableRow:
    '[data-test-projectSettings-dastAutomationSettings-scenarioV2TableRow]',
  rowToggle:
    '[data-test-projectSettings-dastScenarioV2-toggle] [data-test-toggle-input]',

  modal: {
    nameLabel:
      '[data-test-projectSettings-dastAutomationSettings-scenarioV2AddModal-scenarioNameTextfieldTitle]',
    nameField:
      '[data-test-projectSettings-dastAutomationSettings-scenarioV2AddModal-scenarioNameTextfield]',
    statusLabel:
      '[data-test-projectSettings-dastAutomationSettings-scenarioV2AddModal-scenarioStatusTitle]',
    statusToggle:
      '[data-test-projectSettings-dastAutomationSettings-scenarioV2AddModal-scenarioStatusToggle] [data-test-toggle-input]',
    cancelBtn:
      '[data-test-projectSettings-dastAutomationSettings-scenarioV2AddModal-cancelBtn]',
    confirmBtn:
      '[data-test-projectSettings-dastAutomationSettings-scenarioV2AddModal-confirmBtn]',
  },
};

// ─── Template ────────────────────────────────────────────────────────────────

const TEMPLATE = hbs`
  <ProjectSettings::DastAutomation::AutomationSettings::ScenarioV2
    @project={{this.project}}
  />
`;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function stubScenariosRoute(server, scenarios = [], timing = 0) {
  server.get(
    '/v2/projects/:projectId/scenarios',
    () => ({
      count: scenarios.length,
      next: null,
      previous: null,
      results: scenarios,
    }),
    { timing }
  );
}

// ─── Test suite ──────────────────────────────────────────────────────────────

module(
  'Integration | Component | project-settings/dast-automation/automation-settings/scenario-v2',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en');

    hooks.beforeEach(async function () {
      this.owner.register('service:notifications', NotificationsStub);

      const store = this.owner.lookup('service:store');
      const file = this.server.create('file', 1);

      const project = this.server.create('project', {
        id: 1,
        last_file: file,
      });

      const normalizedProject = store.normalize('project', project.toJSON());

      this.setProperties({
        project: store.push(normalizedProject),
      });
    });

    // ─── Rendering ─────────────────────────────────────────────────────────────

    test('renders header, description, and add button', async function (assert) {
      stubScenariosRoute(this.server);

      await render(TEMPLATE);

      assert.dom(selectors.root).exists();

      assert
        .dom(selectors.headerText)
        .containsText(t('dastAutomation.automationScenarios'))
        .containsText(t('dastAutomation.superUserOnly'));

      assert
        .dom(selectors.headerDesc)
        .containsText(t('dastAutomation.scenarioListDesc'));

      assert
        .dom(selectors.addBtn)
        .containsText(t('dastAutomation.addScenario'));
    });

    // ─── Loading state ──────────────────────────────────────────────────────────

    test('shows loader while fetching scenarios', async function (assert) {
      stubScenariosRoute(this.server, [], 150);

      render(TEMPLATE);

      await waitFor(selectors.loader, { timeout: 200 });

      assert.dom(selectors.loader).exists();
      assert.dom(selectors.emptyList).doesNotExist();

      await waitUntil(() => !find(selectors.loader), { timeout: 500 });

      assert.dom(selectors.loader).doesNotExist();
      assert.dom(selectors.emptyList).exists();
    });

    // ─── Empty state ────────────────────────────────────────────────────────────

    test('shows empty list when no scenarios exist', async function (assert) {
      stubScenariosRoute(this.server);

      await render(TEMPLATE);

      assert
        .dom(selectors.emptyList)
        .containsText(t('dastAutomation.noScenariosFound'));

      assert.dom(selectors.tableRow).doesNotExist();
    });

    // ─── Table rendering ────────────────────────────────────────────────────────

    test('renders a row per scenario returned from the server', async function (assert) {
      const s1 = this.server.create('scenario');
      const s2 = this.server.create('scenario');

      stubScenariosRoute(this.server, [s1.toJSON(), s2.toJSON()]);

      await render(TEMPLATE);

      const rows = findAll(selectors.tableRow);

      assert.strictEqual(rows.length, 2, 'renders one row per scenario');

      assert.dom(rows[0]).containsText(s1.name);
      assert.dom(rows[1]).containsText(s2.name);
    });

    // ─── Add modal ─────────────────────────────────────────────────────────────

    test('clicking the add button opens the modal with form fields', async function (assert) {
      stubScenariosRoute(this.server);

      await render(TEMPLATE);

      assert.dom(selectors.modal.nameField).doesNotExist();

      await click(selectors.addBtn);

      assert.dom(selectors.modal.nameLabel).containsText(t('scenario'));
      assert.dom(selectors.modal.nameField).exists();
      assert.dom(selectors.modal.statusLabel).containsText(t('status'));
      assert.dom(selectors.modal.statusToggle).exists();
      assert.dom(selectors.modal.cancelBtn).containsText(t('cancel'));
      assert.dom(selectors.modal.confirmBtn).containsText(t('add'));
    });

    test('add button is disabled when scenario name is empty', async function (assert) {
      stubScenariosRoute(this.server);

      await render(TEMPLATE);

      await click(selectors.addBtn);

      assert.dom(selectors.modal.confirmBtn).isDisabled();
    });

    test('cancel closes the modal without saving', async function (assert) {
      const existing = this.server.create('scenario', { is_active: true });

      stubScenariosRoute(this.server, [existing.toJSON()]);

      await render(TEMPLATE);

      // Sanity check on the scenario list before the modal is opened
      const rowsBefore = findAll(selectors.tableRow);

      assert.strictEqual(rowsBefore.length, 1, 'one scenario before cancel');
      assert.dom(rowsBefore[0]).containsText(existing.name);
      assert.dom(selectors.rowToggle, rowsBefore[0]).isChecked();

      await click(selectors.addBtn);

      await fillIn(selectors.modal.nameField, 'Draft Scenario');
      await click(selectors.modal.statusToggle);

      assert.dom(selectors.modal.nameField).hasValue('Draft Scenario');
      assert.dom(selectors.modal.statusToggle).isChecked();
      assert.dom(selectors.modal.confirmBtn).isNotDisabled();

      await click(selectors.modal.cancelBtn);

      assert.dom(selectors.modal.nameField).doesNotExist();

      // Sanity check on the scenario list after the modal is closed
      const rowsAfter = findAll(selectors.tableRow);

      assert.strictEqual(rowsAfter.length, 1);
      assert.dom(rowsAfter[0]).containsText(existing.name);
      assert.dom(selectors.rowToggle, rowsAfter[0]).isChecked();
    });

    // ─── Add scenario success ───────────────────────────────────────────────────

    test('successfully adding a scenario closes modal, shows notification and reloads the list', async function (assert) {
      this.server.get('/v2/projects/:projectId/scenarios', (schema) => {
        const results = schema.scenarios.all().models.map((s) => s.toJSON());

        return { count: results.length, next: null, previous: null, results };
      });

      this.server.post(
        '/v2/projects/:projectId/scenarios',
        (schema, request) => {
          const { name, is_active, description } = JSON.parse(
            request.requestBody
          );

          return schema.scenarios
            .create({ name, is_active, description })
            .toJSON();
        }
      );

      await render(TEMPLATE);

      assert.dom(selectors.tableRow).doesNotExist();

      await click(selectors.addBtn);
      await fillIn(selectors.modal.nameField, 'New Scenario');
      await click(selectors.modal.confirmBtn);

      await waitUntil(() => !find(selectors.modal.nameField));

      const notify = this.owner.lookup('service:notifications');

      assert.strictEqual(notify.successMsg, t('dastAutomation.scenarioAdded'));
      assert.dom(selectors.modal.nameField).doesNotExist();

      await waitUntil(() => findAll(selectors.tableRow).length === 1);

      const rows = findAll(selectors.tableRow);

      assert.strictEqual(rows.length, 1, 'new scenario appears in the list');
      assert.dom(rows[0]).containsText('New Scenario');
    });

    // ─── Add scenario failure ───────────────────────────────────────────────────

    test('failed add shows error notification and keeps modal open', async function (assert) {
      const errorMessage = 'Scenario name already exists';

      stubScenariosRoute(this.server);

      this.server.post(
        '/v2/projects/:projectId/scenarios',
        () => new Response(400, {}, { detail: errorMessage })
      );

      await render(TEMPLATE);

      await click(selectors.addBtn);
      await fillIn(selectors.modal.nameField, 'Duplicate Scenario');
      await click(selectors.modal.confirmBtn);

      await waitUntil(() => !find(selectors.modal.confirmBtn).disabled, {
        timeout: 1000,
      });

      const notify = this.owner.lookup('service:notifications');

      assert.strictEqual(notify.errorMsg, errorMessage);
      assert.dom(selectors.modal.nameField).exists();
    });
  }
);
