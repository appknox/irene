import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, render, waitFor } from '@ember/test-helpers';
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
  toggle:
    '[data-test-projectSettings-dastScenarioV2-toggle] [data-test-toggle-input]',
  loader: '[data-test-projectSettings-dastScenarioV2-statusToggleLoading]',
};

// ─── Template ────────────────────────────────────────────────────────────────

const TEMPLATE = hbs`
  <ProjectSettings::DastAutomation::AutomationSettings::ScenarioTableV2::Status
    @project={{this.project}}
    @scenario={{this.scenario}}
  />
`;

// ─── Test suite ──────────────────────────────────────────────────────────────

module(
  'Integration | Component | project-settings/dast-automation/automation-settings/scenario-table-v2/status',
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

      const scenario = this.server.create('scenario', { is_active: false });
      const normalizedScenario = store.normalize('scenario', scenario.toJSON());

      this.setProperties({
        project: store.push(normalizedProject),
        scenario: store.push(normalizedScenario),
      });
    });

    // ─── Toggle state ──────────────────────────────────────────────────────────

    test('renders toggle reflecting isActive=false', async function (assert) {
      await render(TEMPLATE);

      assert.dom(selectors.toggle).isNotChecked();
    });

    test('renders toggle reflecting isActive=true', async function (assert) {
      const store = this.owner.lookup('service:store');

      const activeScenario = this.server.create('scenario', {
        is_active: true,
      });

      const normalizedScenario = store.normalize(
        'scenario',
        activeScenario.toJSON()
      );

      this.set('scenario', store.push(normalizedScenario));

      await render(TEMPLATE);

      assert.dom(selectors.toggle).isChecked();
    });

    test('loader is never shown (hideToggleLoader is always true)', async function (assert) {
      this.server.put(
        '/v2/projects/:projectId/scenarios/:id',
        (schema, request) => {
          const { is_active } = JSON.parse(request.requestBody);

          return {
            id: request.params.id,
            is_active,
          };
        },
        { timing: 200 }
      );

      await render(TEMPLATE);

      click(selectors.toggle);

      await waitFor(selectors.toggle, { timeout: 100 });

      assert.dom(selectors.loader).doesNotExist();
    });

    // ─── Success / failure ─────────────────────────────────────────────────────

    test('successful toggle updates state and shows success notification', async function (assert) {
      this.server.put(
        '/v2/projects/:projectId/scenarios/:id',
        (schema, request) => {
          const { is_active } = JSON.parse(request.requestBody);

          return {
            id: request.params.id,
            is_active,
          };
        }
      );

      await render(TEMPLATE);

      assert.dom(selectors.toggle).isNotChecked();

      await click(selectors.toggle);

      assert.dom(selectors.toggle).isChecked();

      const notify = this.owner.lookup('service:notifications');

      assert.strictEqual(
        notify.successMsg,
        t('dastAutomation.scenarioStatusUpdated')
      );
    });

    test('failed toggle reverts state and shows error notification', async function (assert) {
      const errorMessage = 'Something went wrong';

      this.server.put(
        '/v2/projects/:projectId/scenarios/:id',
        () => new Response(400, {}, { detail: errorMessage })
      );

      await render(TEMPLATE);

      assert.dom(selectors.toggle).isNotChecked();

      await click(selectors.toggle);

      assert.dom(selectors.toggle).isNotChecked();

      const notify = this.owner.lookup('service:notifications');

      assert.ok(notify.errorMsg);
    });
  }
);
