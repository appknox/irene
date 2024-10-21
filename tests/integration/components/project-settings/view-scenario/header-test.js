import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
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

const selectors = {
  headerRoot: '[data-test-projectSettings-viewScenario-header-root]',
  headerScenarioName:
    '[data-test-projectSettings-viewScenarioHeader-scenarioName]',
  headerScenarioStatus:
    '[data-test-projectSettings-viewScenarioHeader-scenarioStatus]',
  statusToggleSelector:
    '[data-test-projectSettings-viewScenarioHeader-scenarioStatus] [data-test-toggle-input]',
  deleteScenarioModalTrigger:
    '[data-test-projectSettings-viewScenarioHeader-deleteScenarioModalTrigger]',
  deleteConfirmTextSelector:
    '[data-test-projectSettings-viewScenario-deleteScenarioConfirmText]',
  deleteBtnSelector:
    '[data-test-projectSettings-viewScenario-deleteScenarioDeleteBtn]',
  deleteCancelBtnSelector:
    '[data-test-projectSettings-viewScenario-deleteScenarioCancelBtn]',
  deleteDefaultScenarioTooltip:
    '[data-test-projectSettings-viewScenarioHeader-deleteDefaultScenarioInfo-tooltip]',
};

module(
  'Integration | Component | project-settings/view-scenario/header',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks);

    hooks.beforeEach(async function () {
      this.owner.register('service:notifications', NotificationsStub);

      // Server mocks
      this.server.get('/organizations/:id/members', (schema) => {
        const results = schema.organizationMembers.all().models;
        return { count: results.length, next: null, previous: null, results };
      });

      this.server.get('/organizations/:id/me', (schema, req) =>
        schema.organizationMes.find(`${req.params.id}`)?.toJSON()
      );

      this.server.get('/organizations/:id/users', (schema, req) =>
        schema.organizationUsers.find(`${req.params.id}`)?.toJSON()
      );

      this.server.get('/v2/projects/:id', (schema, req) => {
        return schema.projects.find(req.params.id).toJSON();
      });

      this.server.get('/v2/files/:id', (schema, req) => {
        return schema.files.find(`${req.params.id}`)?.toJSON();
      });

      this.server.get('/v2/scan_parameter_groups/:id', (schema, req) =>
        schema.scanParameterGroups.find(req.params.id).toJSON()
      );

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

      // Scenario Model - Sets default to true
      const scenario = this.server.create('scan-parameter-group', {
        id: 'default',
        project: 1,
        name: 'Default',
        is_active: false,
        is_default: true,
      });

      const normalizedScenario = store.normalize('scan-parameter-group', {
        ...scenario.toJSON(),
      });

      this.setProperties({
        store,
        project: store.push(normalizedProject),
        scenario: store.push(normalizedScenario),
      });
    });

    test('it renders with the right properties', async function (assert) {
      await render(hbs`
        <ProjectSettings::ViewScenario::Header 
          @project={{this.project}} 
          @scenario={{this.scenario}} 
        />
      `);

      assert.dom(selectors.headerRoot).exists();

      assert
        .dom(selectors.headerScenarioName)
        .exists()
        .containsText(t('scenario'))
        .containsText(this.scenario.name);

      assert
        .dom(selectors.headerScenarioStatus)
        .exists()
        .containsText(t('enabled'));

      assert.dom(selectors.statusToggleSelector).exists().isNotChecked();

      // Tootlip selector for default scenario
      assert
        .dom(selectors.deleteScenarioModalTrigger)
        .exists()
        .hasAttribute('disabled');
    });
  }
);
