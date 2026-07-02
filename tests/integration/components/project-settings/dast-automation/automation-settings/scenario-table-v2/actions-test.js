import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, fillIn, render } from '@ember/test-helpers';
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
    '[data-test-projectSettings-viewScenarioHeader-editScenarioModalTrigger]',
  modal: {
    nameField:
      '[data-test-projectSettings-viewScenarioHeader-editScenarioModal-nameTextfield]',
    saveBtn:
      '[data-test-projectSettings-viewScenarioHeader-editScenarioModal-saveBtn]',
    cancelBtn:
      '[data-test-projectSettings-viewScenarioHeader-editScenarioModal-cancelBtn]',
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

      const normalizedProject = store.normalize('project', {
        ...project.toJSON(),
      });

      const normalizedScenario = store.normalize('scenario', {
        id: '1',
        name: 'My Scenario',
        is_active: false,
        type: 1,
        description: '',
      });

      this.reloadCallCount = 0;

      this.setProperties({
        project: store.push(normalizedProject),
        scenario: store.push(normalizedScenario),
        reloadScenarioList: () => this.reloadCallCount++,
      });
    });

    // ─── Rendering ─────────────────────────────────────────────────────────────

    test('renders the edit trigger button', async function (assert) {
      await render(TEMPLATE);

      assert.dom(selectors.editTrigger).exists();
    });

    test('edit button is disabled for login-type (default) scenarios', async function (assert) {
      const store = this.owner.lookup('service:store');

      const normalizedScenario = store.normalize('scenario', {
        id: '2',
        name: 'Login Scenario',
        is_active: false,
        type: 0,
        description: '',
      });

      this.set('scenario', store.push(normalizedScenario));

      await render(TEMPLATE);

      assert.dom(selectors.editTrigger).isDisabled();
    });

    // ─── Modal open / close ────────────────────────────────────────────────────

    test('clicking edit trigger opens modal pre-filled with scenario name', async function (assert) {
      await render(TEMPLATE);

      assert.dom(selectors.modal.nameField).doesNotExist();

      await click(selectors.editTrigger);

      assert.dom(selectors.modal.nameField).exists().hasValue('My Scenario');
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
      this.server.put('/v2/projects/:projectId/scenarios/:id', () => ({
        id: '1',
        name: 'Renamed Scenario',
        is_active: false,
        type: 1,
        description: '',
      }));

      await render(TEMPLATE);

      await click(selectors.editTrigger);
      await fillIn(selectors.modal.nameField, 'Renamed Scenario');
      await click(selectors.modal.saveBtn);

      assert.dom(selectors.modal.nameField).doesNotExist();
      assert.strictEqual(this.reloadCallCount, 1);

      const notify = this.owner.lookup('service:notifications');
      assert.strictEqual(notify.successMsg, t('dastAutomation.scenarioUpdated'));
    });

    test('save failure shows error and does not call reloadScenarioList', async function (assert) {
      this.server.put(
        '/v2/projects/:projectId/scenarios/:id',
        () => new Response(400, {}, { detail: 'Server error' })
      );

      await render(TEMPLATE);

      await click(selectors.editTrigger);
      await fillIn(selectors.modal.nameField, 'Renamed Scenario');
      await click(selectors.modal.saveBtn);

      assert.strictEqual(this.reloadCallCount, 0);

      const notify = this.owner.lookup('service:notifications');
      assert.ok(notify.errorMsg);
    });
  }
);
