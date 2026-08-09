import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, fillIn, find, render, waitUntil } from '@ember/test-helpers';
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
  editTrigger:
    '[data-test-projectSettings-dastAutomation-scenarioViewV2-editScenario-modalTrigger]',
  modal: {
    nameField:
      '[data-test-projectSettings-dastAutomation-scenarioViewV2-editScenario-nameTextField]',
    saveBtn:
      '[data-test-projectSettings-dastAutomation-scenarioViewV2-editScenario-saveBtn]',
    cancelBtn:
      '[data-test-projectSettings-dastAutomation-scenarioViewV2-editScenario-cancelBtn]',
  },
};

// ─── Template ────────────────────────────────────────────────────────────────

const TEMPLATE = hbs`
  <ProjectSettings::DastAutomation::AutomationSettings::ScenarioTableV2::Actions
    @project={{this.project}}
    @scenario={{this.scenario}}
    @reloadScenarioList={{this.reloadScenarioList}}
  />
`;

// ─── Test suite ──────────────────────────────────────────────────────────────

module(
  'Integration | Component | project-settings/dast-automation/automation-settings/scenario-table-v2/actions',
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

      const scenario = this.server.create('scenario');
      const normalizedScenario = store.normalize('scenario', scenario.toJSON());

      this.setProperties({
        reloadCallCount: 0,
        project: store.push(normalizedProject),
        scenario: store.push(normalizedScenario),

        reloadScenarioList: () =>
          this.set('reloadCallCount', this.reloadCallCount + 1),
      });
    });

    // ─── Rendering ─────────────────────────────────────────────────────────────

    test('renders the edit trigger button', async function (assert) {
      await render(TEMPLATE);

      assert.dom(selectors.editTrigger).exists();
    });

    test('edit button is disabled for login-type (default) scenarios', async function (assert) {
      const store = this.owner.lookup('service:store');

      const loginScenario = this.server.create('scenario', {
        is_active: false,
        type: 0, // LOGIN Scenario Type
      });

      const normalizedScenario = store.normalize(
        'scenario',
        loginScenario.toJSON()
      );

      this.set('scenario', store.push(normalizedScenario));

      await render(TEMPLATE);

      assert.dom(selectors.editTrigger).isDisabled();
    });

    // ─── Modal open / close ────────────────────────────────────────────────────

    test('clicking edit trigger opens modal pre-filled with scenario name', async function (assert) {
      await render(TEMPLATE);

      assert.dom(selectors.modal.nameField).doesNotExist();

      await click(selectors.editTrigger);

      assert.dom(selectors.modal.nameField).hasValue(this.scenario.name);
    });

    test('cancel closes the modal without saving', async function (assert) {
      await render(TEMPLATE);

      await click(selectors.editTrigger);
      assert.dom(selectors.modal.nameField).exists();

      await click(selectors.modal.cancelBtn);
      assert.dom(selectors.modal.nameField).doesNotExist();
    });

    // ─── Save success / failure ────────────────────────────────────────────────

    test('save success closes modal and calls reloadScenarioList', async function (assert) {
      this.server.put(
        '/v2/projects/:projectId/scenarios/:id',
        (schema, request) => {
          const { name, is_active, description } = JSON.parse(
            request.requestBody
          );

          return {
            id: request.params.id,
            name,
            is_active,
            description,
          };
        }
      );

      await render(TEMPLATE);

      await click(selectors.editTrigger);
      await fillIn(selectors.modal.nameField, 'Renamed Scenario');
      await click(selectors.modal.saveBtn);

      // Wait until the modal is closed
      await waitUntil(() => !find(selectors.modal.nameField));

      assert.strictEqual(this.reloadCallCount, 1);

      const notify = this.owner.lookup('service:notifications');

      assert.strictEqual(
        notify.successMsg,
        t('dastAutomation.scenarioUpdated')
      );
    });

    test('save failure shows error and does not call reloadScenarioList', async function (assert) {
      const errorMessage = 'Server error';

      this.server.put(
        '/v2/projects/:projectId/scenarios/:id',
        () => new Response(400, {}, { detail: errorMessage })
      );

      await render(TEMPLATE);

      await click(selectors.editTrigger);
      await fillIn(selectors.modal.nameField, 'Renamed Scenario');
      await click(selectors.modal.saveBtn);

      const notify = this.owner.lookup('service:notifications');

      // Wait until the save button is enabled
      await waitUntil(() => !find(selectors.modal.saveBtn).disabled, {
        timeout: 1000,
      });

      assert.strictEqual(this.reloadCallCount, 0);
      assert.strictEqual(notify.errorMsg, errorMessage);
    });
  }
);
