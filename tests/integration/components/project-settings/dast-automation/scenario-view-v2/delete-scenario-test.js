import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, render, waitUntil, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { Response } from 'miragejs';
import Service from '@ember/service';
import { compareInnerHTMLWithIntlTranslation } from 'irene/tests/test-utils';

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
  replaceWithArgs = null;

  replaceWith(...args) {
    this.replaceWithArgs = args;
  }
}

// ─── Selectors ───────────────────────────────────────────────────────────────

const selectors = {
  deleteTrigger:
    '[data-test-projectSettings-dastAutomation-scenarioViewV2-deleteScenario-modalTrigger]',
  confirmText:
    '[data-test-projectSettings-dastAutomation-scenarioViewV2-deleteScenario-confirmText]',
  cancelBtn:
    '[data-test-projectSettings-dastAutomation-scenarioViewV2-deleteScenario-cancelBtn]',
  deleteBtn:
    '[data-test-projectSettings-dastAutomation-scenarioViewV2-deleteScenario-deleteBtn]',
};

// ─── Template ────────────────────────────────────────────────────────────────

const TEMPLATE = hbs`
  <ProjectSettings::DastAutomation::ScenarioViewV2::DeleteScenario
    @project={{this.project}}
    @scenarioDetail={{this.scenarioDetail}}
  />
`;

// ─── Test suite ──────────────────────────────────────────────────────────────

module(
  'Integration | Component | project-settings/dast-automation/scenario-view-v2/delete-scenario',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en');

    hooks.beforeEach(async function () {
      this.owner.register('service:notifications', NotificationsStub);
      this.owner.unregister('service:router');
      this.owner.register('service:router', RouterStub);

      const store = this.owner.lookup('service:store');

      const file = this.server.create('file', 1);

      const project = this.server.create('project', {
        id: 1,
        last_file: file,
      });

      const normalizedProject = store.normalize('project', project.toJSON());

      const scenarioDetail = this.server.create('scenario-detail', {
        type: 1,
        is_active: true,
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

    test('renders the delete trigger and modal is closed by default', async function (assert) {
      await render(TEMPLATE);

      assert.dom(selectors.deleteTrigger).exists();
      assert.dom(selectors.confirmText).doesNotExist();
    });

    // ─── Modal open ────────────────────────────────────────────────────────────

    test('clicking the trigger opens the confirmation modal', async function (assert) {
      assert.expect(3);

      await render(TEMPLATE);

      await click(selectors.deleteTrigger);

      compareInnerHTMLWithIntlTranslation(assert, {
        selector: selectors.confirmText,
        message: t('dastAutomation.scenarioDeleteConfirm', {
          scenarioName: this.scenarioDetail.name,
        }),
        doIncludesCheck: true,
      });

      assert.dom(selectors.cancelBtn).hasText(t('cancel'));
      assert.dom(selectors.deleteBtn).hasText(t('yesDelete'));
    });

    // ─── Cancel ────────────────────────────────────────────────────────────────

    test('cancel closes the modal without deleting', async function (assert) {
      await render(TEMPLATE);

      await click(selectors.deleteTrigger);

      assert.dom(selectors.confirmText).exists();

      await click(selectors.cancelBtn);

      assert.dom(selectors.confirmText).doesNotExist();
    });

    // ─── Delete success ────────────────────────────────────────────────────────

    test('confirming delete shows success notification and navigates away', async function (assert) {
      this.server.del('/v2/projects/:projectId/scenarios/:id', () => ({}));

      await render(TEMPLATE);

      await click(selectors.deleteTrigger);
      await click(selectors.deleteBtn);

      // This means the delete request was successful
      await waitUntil(() => !find(selectors.deleteBtn).disabled);

      const notify = this.owner.lookup('service:notifications');
      const router = this.owner.lookup('service:router');

      assert.strictEqual(
        notify.successMsg,
        t('dastAutomation.scenarioDeleted', {
          scenarioName: this.scenarioDetail.name,
        })
      );

      assert.deepEqual(router.replaceWithArgs, [
        'authenticated.dashboard.project.settings.dast-automation',
        this.project.id,
      ]);
    });

    // ─── Delete failure ────────────────────────────────────────────────────────

    test('failed delete shows error notification and keeps modal open', async function (assert) {
      const errorMessage = 'Delete failed';

      this.server.del(
        '/v2/projects/:projectId/scenarios/:id',
        () => new Response(400, {}, { detail: errorMessage })
      );

      await render(TEMPLATE);

      await click(selectors.deleteTrigger);
      await click(selectors.deleteBtn);

      await waitUntil(() => !find(selectors.deleteBtn).disabled, {
        timeout: 1000,
      });

      const notify = this.owner.lookup('service:notifications');

      assert.strictEqual(notify.errorMsg, errorMessage);
      assert.dom(selectors.confirmText).exists();
    });
  }
);
