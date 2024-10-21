import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, find, render, waitFor, waitUntil } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import Service from '@ember/service';
import { Response } from 'miragejs';

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

module(
  'Integration | Component | project-settings/dast-scenario-toggle',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks);

    hooks.beforeEach(async function () {
      this.owner.register('service:notifications', NotificationsStub);
      const store = this.owner.lookup('service:store');

      // Project Model
      const file = this.server.create('file', 1);
      const project = this.server.create('project', {
        id: 1,
        last_file_id: file.id,
      });

      const normalizedProject = store.normalize('project', {
        ...project.toJSON(),
      });

      // Scenario Model
      const scenario = this.server.create('scan-parameter-group', {
        id: 'default',
        project: 1,
        name: 'Default',
        is_active: false,
      });

      const normalizedScenario = store.normalize('scan-parameter-group', {
        ...scenario.toJSON(),
      });

      // Selectors
      const statusToggleSelector =
        '[data-test-projectSettings-dastScenario-toggle] [data-test-toggle-input]';

      const statusToggleLoaderSelector =
        '[data-test-projectSettings-dastScenario-statusToggleLoading]';

      this.setProperties({
        project: store.push(normalizedProject),
        scenario: store.push(normalizedScenario),
        statusToggleSelector,
        statusToggleLoaderSelector,
      });
    });

    test('it renders and toggles dast scenario successfully', async function (assert) {
      this.server.put(
        '/v2/projects/:projectId/scan_parameter_groups/:id',
        function (schema, request) {
          const { is_active, ...rest } = JSON.parse(request.requestBody);
          const id = request.params.id;

          return schema.scanParameterGroups
            .find(id)
            .update({ is_active, ...rest })
            .toJSON();
        },
        { timing: 150 }
      );

      await render(
        hbs`<ProjectSettings::DastScenarioToggle @project={{this.project}} @scenario={{this.scenario}} />`
      );

      assert.dom(this.statusToggleSelector).exists().isNotChecked();

      click(this.statusToggleSelector);

      await waitFor(this.statusToggleLoaderSelector, {
        timeout: 150,
      });

      assert.dom(this.statusToggleLoaderSelector).exists();

      await waitUntil(() => !find(this.statusToggleLoaderSelector), {
        timeout: 150,
      });

      assert.dom(this.statusToggleSelector).exists().isChecked();

      const notify = this.owner.lookup('service:notifications');

      assert.strictEqual(
        notify.successMsg,
        t('dastAutomation.scenarioStatusUpdated')
      );
    });

    test('it reverts toggle state if request fails', async function (assert) {
      const errorMessage = 'disconnect error';

      this.server.put(
        '/v2/projects/:projectId/scan_parameter_groups/:id',
        () => new Response(400, {}, { detail: errorMessage })
      );

      await render(
        hbs`<ProjectSettings::DastScenarioToggle @project={{this.project}} @scenario={{this.scenario}} />`
      );

      assert.dom(this.statusToggleSelector).exists().isNotChecked();

      await click(this.statusToggleSelector);

      assert.dom(this.statusToggleSelector).exists().isNotChecked();

      const notify = this.owner.lookup('service:notifications');

      assert.strictEqual(notify.errorMsg, errorMessage);
    });
  }
);
