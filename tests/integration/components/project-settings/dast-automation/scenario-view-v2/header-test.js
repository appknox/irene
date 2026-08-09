import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { find, render, triggerEvent } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
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
  root: '[data-test-projectSettings-dastAutomation-scenarioViewV2-header-root]',
  scenarioName:
    '[data-test-projectSettings-dastAutomation-scenarioViewV2-header-scenarioName]',
  scenarioStatus:
    '[data-test-projectSettings-dastAutomation-scenarioViewV2-header-scenarioStatus]',
  editTrigger:
    '[data-test-projectSettings-dastAutomation-scenarioViewV2-editScenario-modalTrigger]',
  editDefaultInfoTooltip:
    '[data-test-projectSettings-dastAutomation-scenarioViewV2-editScenario-defaultInfoTooltip]',
  editDefaultInfoTooltipContent: '[data-test-ak-tooltip-content]',
  deleteTrigger:
    '[data-test-projectSettings-dastAutomation-scenarioViewV2-deleteScenario-modalTrigger]',
  viewSampleBtn:
    '[data-test-projectSettings-dastAutomation-scenarioViewV2-loginScenarioSample-viewSampleBtn]',
  iconDivider:
    '[data-test-projectSettings-dastAutomation-scenarioViewV2-header-iconDivider]',
};

// ─── Template ────────────────────────────────────────────────────────────────

const TEMPLATE = hbs`
  <ProjectSettings::DastAutomation::ScenarioViewV2::Header
    @project={{this.project}}
    @scenarioDetail={{this.scenarioDetail}}
  />
`;

// ─── Test suite ──────────────────────────────────────────────────────────────

module(
  'Integration | Component | project-settings/dast-automation/scenario-view-v2/header',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en');

    hooks.beforeEach(async function () {
      this.owner.register('service:notifications', NotificationsStub);

      this.server.put('/v2/projects/:projectId/scenarios/:id', () => ({}));

      const store = this.owner.lookup('service:store');

      const file = this.server.create('file', 1);

      const project = this.server.create('project', {
        id: 1,
        last_file: file,
      });

      const normalizedProject = store.normalize('project', project.toJSON());

      const scenarioDetail = this.server.create('scenario-detail', {
        is_active: false,
        type: 1,
      });

      const normalizedScenarioDetail = store.normalize(
        'scenario-detail',
        scenarioDetail.toJSON()
      );

      this.setProperties({
        project: store.push(normalizedProject),
        scenarioDetail: store.push(normalizedScenarioDetail),
      });
    });

    // ─── Rendering ─────────────────────────────────────────────────────────────

    test('renders the scenario name and status section', async function (assert) {
      await render(TEMPLATE);

      assert.dom(selectors.root).exists();

      assert
        .dom(selectors.scenarioName)
        .containsText(t('scenario'))
        .containsText(this.scenarioDetail.name);

      assert.dom(selectors.scenarioStatus).containsText(t('status'));
    });

    // ─── OTHER-type scenario ───────────────────────────────────────────────────

    test('OTHER-type: shows edit and delete buttons, no view-sample button', async function (assert) {
      await render(TEMPLATE);

      assert.dom(selectors.editTrigger).exists();
      assert.dom(selectors.deleteTrigger).exists();
      assert.dom(selectors.iconDivider).exists();
      assert.dom(selectors.viewSampleBtn).doesNotExist();
    });

    // ─── LOGIN-type scenario ───────────────────────────────────────────────────

    test('LOGIN-type: shows view-sample and edit buttons (disabled), no delete button', async function (assert) {
      const store = this.owner.lookup('service:store');

      const loginScenario = this.server.create('scenario-detail', {
        is_active: false,
        type: 0,
      });

      const normalizedScenario = store.normalize(
        'scenario-detail',
        loginScenario.toJSON()
      );

      this.set('scenarioDetail', store.push(normalizedScenario));

      await render(TEMPLATE);

      assert.dom(selectors.viewSampleBtn).exists();
      assert.dom(selectors.editDefaultInfoTooltip).exists();

      await triggerEvent(find(selectors.editDefaultInfoTooltip), 'mouseenter');

      assert
        .dom(selectors.editDefaultInfoTooltipContent)
        .containsText(t('dastAutomation.editDefaultScenarioInfo'));

      assert.dom(selectors.editTrigger).isDisabled();
      assert.dom(selectors.iconDivider).exists();
      assert.dom(selectors.deleteTrigger).doesNotExist();
    });
  }
);
