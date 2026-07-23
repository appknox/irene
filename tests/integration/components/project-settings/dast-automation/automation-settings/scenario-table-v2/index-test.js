import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, findAll, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import Service from '@ember/service';

class RouterStub extends Service {
  transitionToArgs = null;

  transitionTo(...args) {
    this.transitionToArgs = args;
  }
}

// ─── Selectors ───────────────────────────────────────────────────────────────

const selectors = {
  loader:
    '[data-test-projectSettings-dastAutomationSettings-scenarioV2ListLoader]',
  emptyList:
    '[data-test-projectSettings-dastAutomationSettings-scenariosV2ListEmpty]',
  tableHeader:
    '[data-test-projectSettings-dastAutomationSettings-scenarioV2TableHeader]',
  tableRow:
    '[data-test-projectSettings-dastAutomationSettings-scenarioV2TableRow]',
  toggleInput:
    '[data-test-projectSettings-dastScenarioV2-toggle] [data-test-toggle-input]',
  editTrigger:
    '[data-test-projectSettings-dastAutomation-scenarioViewV2-editScenario-modalTrigger]',
};

// ─── Template ────────────────────────────────────────────────────────────────

const TEMPLATE = hbs`
  <ProjectSettings::DastAutomation::AutomationSettings::ScenarioTableV2
    @project={{this.project}}
    @scenarioList={{this.scenarioList}}
    @loadingScenarioList={{this.loadingScenarioList}}
    @reloadScenarioList={{this.reloadScenarioList}}
  />
`;

// ─── Test suite ──────────────────────────────────────────────────────────────

module(
  'Integration | Component | project-settings/dast-automation/automation-settings/scenario-table-v2',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en');

    hooks.beforeEach(async function () {
      this.owner.unregister('service:router');
      this.owner.register('service:router', RouterStub);

      const store = this.owner.lookup('service:store');

      const file = this.server.create('file', 1);

      const project = this.server.create('project', {
        id: 1,
        last_file: file,
      });

      const normalizedProject = store.normalize('project', project.toJSON());

      this.setProperties({
        project: store.push(normalizedProject),
        scenarioList: [],
        loadingScenarioList: false,
        reloadScenarioList: () => {},
      });
    });

    // ─── Loading state ──────────────────────────────────────────────────────────

    test('shows loader when loadingScenarioList is true', async function (assert) {
      this.set('loadingScenarioList', true);

      await render(TEMPLATE);

      assert.dom(selectors.loader).exists();
      assert.dom(selectors.emptyList).doesNotExist();
      assert.dom(selectors.tableHeader).doesNotExist();
    });

    // ─── Empty state ────────────────────────────────────────────────────────────

    test('shows empty list when scenarioList is empty', async function (assert) {
      await render(TEMPLATE);

      assert
        .dom(selectors.emptyList)
        .containsText(t('dastAutomation.noScenariosFound'));

      assert.dom(selectors.loader).doesNotExist();
      assert.dom(selectors.tableHeader).doesNotExist();
    });

    // ─── Table rendering ────────────────────────────────────────────────────────

    test('renders table with correct header and one row per scenario', async function (assert) {
      const store = this.owner.lookup('service:store');

      const scenarios = [
        this.server.create('scenario', { type: 0, is_active: true }),
        this.server.create('scenario', { type: 1, is_active: true }),
        this.server.create('scenario', { type: 1, is_active: false }),
      ].map((s) => store.push(store.normalize('scenario', s.toJSON())));

      this.set('scenarioList', scenarios);

      await render(TEMPLATE);

      assert.dom(selectors.tableHeader).containsText(t('scenario'));
      assert.dom(selectors.tableHeader).containsText(t('action'));

      const rows = findAll(selectors.tableRow);

      assert.strictEqual(rows.length, 3, 'renders one row per scenario');

      scenarios.forEach((scenario, i) => {
        assert.dom(rows[i]).containsText(scenario.name);

        assert
          .dom(selectors.toggleInput, rows[i])
          [scenario.isActive ? 'isChecked' : 'isNotChecked']();

        assert
          .dom(selectors.editTrigger, rows[i])
          [scenario.isLoginType ? 'isDisabled' : 'isNotDisabled']();
      });
    });

    // ─── Row click ──────────────────────────────────────────────────────────────

    test('clicking a row navigates to the scenario view route', async function (assert) {
      const store = this.owner.lookup('service:store');

      const scenario = this.server.create('scenario');
      const normalizedScenario = store.normalize('scenario', scenario.toJSON());
      const scenarioModel = store.push(normalizedScenario);

      this.set('scenarioList', [scenarioModel]);

      await render(TEMPLATE);

      await click(selectors.tableRow);

      const router = this.owner.lookup('service:router');

      assert.deepEqual(router.transitionToArgs, [
        'authenticated.dashboard.project.settings.dast-automation-scenario-v2',
        scenarioModel.id,
      ]);
    });
  }
);
