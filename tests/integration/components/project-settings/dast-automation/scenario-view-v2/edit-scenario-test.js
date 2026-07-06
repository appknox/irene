import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, fillIn, render, waitUntil, find } from '@ember/test-helpers';
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
  nameLabel:
    '[data-test-projectSettings-dastAutomation-scenarioViewV2-editScenario-nameLabel]',
  nameField:
    '[data-test-projectSettings-dastAutomation-scenarioViewV2-editScenario-nameTextField]',
  cancelBtn:
    '[data-test-projectSettings-dastAutomation-scenarioViewV2-editScenario-cancelBtn]',
  saveBtn:
    '[data-test-projectSettings-dastAutomation-scenarioViewV2-editScenario-saveBtn]',
};

// ─── Template ────────────────────────────────────────────────────────────────

const TEMPLATE = hbs`
  <ProjectSettings::DastAutomation::ScenarioViewV2::EditScenario
    @project={{this.project}}
    @scenario={{this.scenario}}
    @onSuccess={{this.onSuccess}}
  />
`;

// ─── Test suite ──────────────────────────────────────────────────────────────

module(
  'Integration | Component | project-settings/dast-automation/scenario-view-v2/edit-scenario',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en');

    hooks.beforeEach(async function () {
      this.owner.register('service:notifications', NotificationsStub);

      // Server mocks
      this.server.put(
        '/v2/projects/:projectId/scenarios/:id',
        (schema, request) => {
          const { name, is_active, description } = JSON.parse(
            request.requestBody
          );

          return { id: request.params.id, name, is_active, description };
        }
      );

      // Model
      const store = this.owner.lookup('service:store');

      const file = this.server.create('file', 1);

      const project = this.server.create('project', {
        id: 1,
        last_file: file,
      });

      const normalizedProject = store.normalize('project', project.toJSON());

      const scenario = this.server.create('scenario', {
        type: 1,
        is_active: true,
      });

      const normalizedScenario = store.normalize('scenario', scenario.toJSON());

      this.setProperties({
        onSuccessCallCount: 0,
        project: store.push(normalizedProject),
        scenario: store.push(normalizedScenario),
        onSuccess: () =>
          this.set('onSuccessCallCount', this.onSuccessCallCount + 1),
      });
    });

    // ─── Rendering ─────────────────────────────────────────────────────────────

    test('renders the edit trigger and modal is closed by default', async function (assert) {
      await render(TEMPLATE);

      assert.dom(selectors.editTrigger).exists();
      assert.dom(selectors.nameField).doesNotExist();
    });

    test('edit trigger is disabled for LOGIN-type scenario', async function (assert) {
      const store = this.owner.lookup('service:store');

      const loginScenario = this.server.create('scenario', {
        type: 0,
        is_active: false,
      });

      const normalizedScenario = store.normalize(
        'scenario',
        loginScenario.toJSON()
      );

      this.set('scenario', store.push(normalizedScenario));

      await render(TEMPLATE);

      assert.dom(selectors.editTrigger).isDisabled();
    });

    // ─── Modal open ────────────────────────────────────────────────────────────

    test('clicking the trigger opens the modal pre-filled with scenario name', async function (assert) {
      await render(TEMPLATE);

      await click(selectors.editTrigger);

      assert.dom(selectors.nameLabel).hasText(t('scenario'));
      assert.dom(selectors.nameField).hasValue(this.scenario.name);
      assert.dom(selectors.cancelBtn).hasText(t('cancel'));
      assert.dom(selectors.saveBtn).hasText(t('save'));
    });

    // ─── Save button disabled states ───────────────────────────────────────────

    test('save button is disabled when name is unchanged', async function (assert) {
      await render(TEMPLATE);

      await click(selectors.editTrigger);

      assert.dom(selectors.saveBtn).isDisabled();
    });

    test('save button is disabled when name is cleared', async function (assert) {
      await render(TEMPLATE);

      await click(selectors.editTrigger);
      await fillIn(selectors.nameField, '');

      assert.dom(selectors.saveBtn).isDisabled();
    });

    test('save button is enabled when name is changed to a new value', async function (assert) {
      await render(TEMPLATE);

      await click(selectors.editTrigger);
      await fillIn(selectors.nameField, 'Renamed Scenario');

      assert.dom(selectors.saveBtn).isNotDisabled();
    });

    // ─── Cancel ────────────────────────────────────────────────────────────────

    test('cancel closes the modal without saving', async function (assert) {
      await render(TEMPLATE);

      await click(selectors.editTrigger);

      assert.dom(selectors.nameField).exists();

      await click(selectors.cancelBtn);

      assert.dom(selectors.nameField).doesNotExist();
    });

    // ─── Save success ──────────────────────────────────────────────────────────

    test('save success closes modal, shows success notification and calls onSuccess', async function (assert) {
      await render(TEMPLATE);

      await click(selectors.editTrigger);
      await fillIn(selectors.nameField, 'Renamed Scenario');
      await click(selectors.saveBtn);

      await waitUntil(() => !find(selectors.nameField));

      const notify = this.owner.lookup('service:notifications');

      assert.strictEqual(
        notify.successMsg,
        t('dastAutomation.scenarioUpdated')
      );

      assert.strictEqual(this.onSuccessCallCount, 1);
    });

    // ─── Save failure ──────────────────────────────────────────────────────────

    test('save failure shows error notification, keeps modal open and reverts name', async function (assert) {
      const errorMessage = 'Update failed';

      this.server.put(
        '/v2/projects/:projectId/scenarios/:id',
        () => new Response(400, {}, { detail: errorMessage })
      );

      const originalName = this.scenario.name;

      await render(TEMPLATE);

      await click(selectors.editTrigger);
      await fillIn(selectors.nameField, 'Renamed Scenario');
      await click(selectors.saveBtn);

      await waitUntil(() => !find(selectors.saveBtn).disabled, {
        timeout: 1000,
      });

      const notify = this.owner.lookup('service:notifications');

      assert.strictEqual(notify.errorMsg, errorMessage);
      assert.dom(selectors.nameField).exists();
      assert.strictEqual(this.scenario.name, originalName);
    });
  }
);
