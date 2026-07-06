import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, find, render, triggerEvent } from '@ember/test-helpers';
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

class RouterStub extends Service {
  transitionToArgs = null;

  transitionTo(...args) {
    this.transitionToArgs = args;
  }
}

// ─── Selectors ───────────────────────────────────────────────────────────────

const selectors = {
  root: '[data-test-projectSettings-viewScenario-header-root]',
  scenarioName:
    '[data-test-projectSettings-viewScenarioHeader-scenarioName]',
  scenarioStatus:
    '[data-test-projectSettings-viewScenarioHeader-scenarioStatus]',
  deleteTooltip:
    '[data-test-projectSettings-viewScenarioHeader-deleteDefaultScenarioInfo-tooltip]',
  deleteModalTrigger:
    '[data-test-projectSettings-viewScenarioHeader-deleteScenarioModalTrigger]',
  deleteConfirmText:
    '[data-test-projectSettings-viewScenario-deleteScenarioConfirmText]',
  deleteCancelBtn:
    '[data-test-projectSettings-viewScenario-deleteScenarioCancelBtn]',
  deleteConfirmBtn:
    '[data-test-projectSettings-viewScenario-deleteScenarioDeleteBtn]',
};

// ─── Template ────────────────────────────────────────────────────────────────

const TEMPLATE = hbs`
  <ProjectSettings::DastAutomation::ScenarioView::Header
    @project={{this.project}}
    @scenario={{this.scenario}}
  />
`;

// ─── Test suite ──────────────────────────────────────────────────────────────

module(
  'Integration | Component | project-settings/dast-automation/scenario-view/header',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en');

    hooks.beforeEach(async function () {
      this.owner.register('service:notifications', NotificationsStub);
      this.owner.unregister('service:router');
      this.owner.register('service:router', RouterStub);

      const store = this.owner.lookup('service:store');
      const projectRecord = this.server.create('project');
      const project = store.push(
        store.normalize('project', projectRecord.toJSON())
      );

      const scenarioRecord = this.server.create('scan-parameter-group', {
        name: 'Login Flow',
        is_default: false,
        is_active: false,
      });
      const scenario = store.push(
        store.normalize('scan-parameter-group', scenarioRecord.toJSON())
      );

      this.setProperties({ project, scenario, store });
    });

    // ─── Render ──────────────────────────────────────────────────────────────

    test('renders scenario name and status section', async function (assert) {
      await render(TEMPLATE);

      assert.dom(selectors.root).exists();
      assert.dom(selectors.scenarioName).containsText(t('scenario'));
      assert.dom(selectors.scenarioName).containsText(this.scenario.name);
      assert.dom(selectors.scenarioStatus).containsText(t('enabled'));
      assert
        .dom('[data-test-toggle-input]', find(selectors.scenarioStatus))
        .isNotChecked();
    });

    // ─── Delete button state ──────────────────────────────────────────────────

    test('delete button is disabled and tooltip is shown for a default scenario', async function (assert) {
      const store = this.store;
      const defaultScenario = store.push(
        store.normalize(
          'scan-parameter-group',
          this.server.create('scan-parameter-group', {
            name: 'Default Scenario',
            is_default: true,
          }).toJSON()
        )
      );

      this.set('scenario', defaultScenario);
      await render(TEMPLATE);

      assert.dom(selectors.deleteModalTrigger).isDisabled();

      await triggerEvent(find(selectors.deleteTooltip), 'mouseenter');
      assert
        .dom('[data-test-ak-tooltip-content]')
        .containsText(t('dastAutomation.deleteDefaultScenarioInfo'));
    });

    test('delete button is enabled and tooltip is absent for a non-default scenario', async function (assert) {
      await render(TEMPLATE);

      assert.dom(selectors.deleteModalTrigger).isNotDisabled();

      await triggerEvent(find(selectors.deleteTooltip), 'mouseenter');
      assert.dom('[data-test-ak-tooltip-content]').doesNotExist();
    });

    // ─── Delete modal ─────────────────────────────────────────────────────────

    test('clicking delete opens modal with confirmation text; cancel closes it without deleting', async function (assert) {
      await render(TEMPLATE);

      // ── Pre-state ──────────────────────────────────────────────────────────
      assert.dom(selectors.deleteConfirmText).doesNotExist();

      await click(selectors.deleteModalTrigger);

      // ── Modal open ─────────────────────────────────────────────────────────
      assert.dom(selectors.deleteConfirmText).exists();
      assert
        .dom(selectors.deleteCancelBtn)
        .containsText(t('cancel'));
      assert
        .dom(selectors.deleteConfirmBtn)
        .containsText(t('yesDelete'));

      await click(selectors.deleteCancelBtn);

      // ── Post-cancel ────────────────────────────────────────────────────────
      assert.dom(selectors.deleteConfirmText).doesNotExist();
    });

    // ─── Delete success ───────────────────────────────────────────────────────

    test('confirming delete shows success notification and transitions to project settings', async function (assert) {
      this.server.del(
        '/v2/projects/:projectId/scan_parameter_groups/:id',
        () => ({})
      );

      await render(TEMPLATE);

      await click(selectors.deleteModalTrigger);

      assert.dom(selectors.deleteConfirmBtn).exists();

      await click(selectors.deleteConfirmBtn);

      const notify = this.owner.lookup('service:notifications');
      assert.ok(notify.successMsg, 'shows success notification');
      assert.ok(
        notify.successMsg.includes(this.scenario.name),
        'success message includes the scenario name'
      );

      const router = this.owner.lookup('service:router');
      assert.ok(router.transitionToArgs, 'router.transitionTo was called');
      assert.strictEqual(
        router.transitionToArgs[0],
        'authenticated.dashboard.project.settings',
        'transitions to project settings'
      );
    });

    // ─── Delete error ─────────────────────────────────────────────────────────

    test('API error on delete shows error notification without transitioning', async function (assert) {
      this.server.del(
        '/v2/projects/:projectId/scan_parameter_groups/:id',
        () => new Response(500)
      );

      await render(TEMPLATE);

      await click(selectors.deleteModalTrigger);
      await click(selectors.deleteConfirmBtn);

      const notify = this.owner.lookup('service:notifications');
      assert.ok(notify.errorMsg, 'shows error notification');

      const router = this.owner.lookup('service:router');
      assert.strictEqual(
        router.transitionToArgs,
        null,
        'router.transitionTo was not called'
      );
    });
  }
);
