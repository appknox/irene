import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { find, findAll, render, waitFor, waitUntil } from '@ember/test-helpers';
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

// Selectors
const selectors = {
  scenarioHeaderRoot: '[data-test-projectSettings-viewScenario-header-root]',
  addParamerRoot: '[data-test-projectSettings-viewScenario-addParameterRoot]',
  paramListLoader: '[data-test-projectSettings-viewScenario-paramListLoader]',
  paramListEmpty: '[data-test-projectSettings-viewScenario-paramListEmpty]',
  paramListEmptyIllustration:
    '[data-test-projectSettings-viewScenario-paramListEmptyIllustration]',
  paramListEmptyHeaderText:
    '[data-test-projectSettings-viewScenario-paramListEmptyHeaderText]',
  paramListEmptyDescText:
    '[data-test-projectSettings-viewScenario-paramListEmptyDescText]',

  // Parameter item selectors
  paramItemRoot: '[data-test-projectSettings-viewScenario-parameterItem-root]',
  paramName: '[data-test-projectSettings-viewScenario-parameterItem-name]',
  paramValueTextField:
    '[data-test-projectSettings-viewScenario-parameterItem-valueTextField]',
  paramValueTextFieldSecureIcon:
    '[data-test-projectSettings-parameterItem-valueTextField-secureIcon]',
  paramDeleteBtn:
    '[data-test-projectSettings-viewScenario-parameterItem-deleteButton]',
  paramDeleteBtnIcon:
    '[data-test-projectSettings-viewScenario-parameterItem-deleteButtonIcon]',
};

module(
  'Integration | Component | project-settings/view-scenario',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en');

    hooks.beforeEach(async function () {
      this.owner.register('service:notifications', NotificationsStub);
      const store = this.owner.lookup('service:store');

      // Project Model
      const file = this.server.create('file', 1);

      const project = this.server.create('project', {
        id: 1,
        last_file: file,
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
        project: store.push(normalizedProject),
        scenario: store.push(normalizedScenario),
      });

      // Server mocks
      this.server.get(
        '/v2/scan_parameter_groups/:groupId/scan_parameters',
        (schema, request) => {
          const data = schema.scanParameters
            .all()
            .models.filter(
              (_) => _.scanParameterGroup === request.params.groupId
            );

          let limit = data.length;
          let offset = 0;

          if (request.queryParams.limit) {
            limit = request.queryParams.limit;
          }

          if (request.queryParams.offset) {
            offset = request.queryParams.offset;
          }

          const retdata = data.slice(offset, offset + limit);

          return {
            count: data.length,
            next: null,
            previous: null,
            results: retdata,
          };
        }
      );
    });

    test('it renders with loading and empty state', async function (assert) {
      render(
        hbs`<ProjectSettings::ViewScenario @project={{this.project}} @scenario={{this.scenario}} />`
      );

      await waitFor(selectors.paramListLoader, {
        timeout: 100,
      });

      assert.dom(selectors.paramListLoader).exists();

      await waitUntil(() => !find(selectors.paramListLoader), {
        timeout: 100,
      });

      assert.dom(selectors.scenarioHeaderRoot).exists();
      assert.dom(selectors.addParamerRoot).exists();

      assert.dom(selectors.paramListEmptyIllustration).exists();

      assert
        .dom(selectors.paramListEmptyHeaderText)
        .exists()
        .hasText(t('noDataAvailable'));

      assert
        .dom(selectors.paramListEmptyDescText)
        .exists()
        .hasText(t('dastAutomation.noParamaterAvailable'));
    });

    test('it renders with scan parameter list', async function (assert) {
      this.server.db.loadData({
        scanParameters: [
          {
            name: 'Scan parameter 1',
            value: 'Scan parameter 1 Value',
            is_secure: false,
            scanParameterGroup: 'default',
          },
          {
            name: 'Scan parameter 2',
            value: 'Scan parameter 2 Value',
            is_secure: true,
            scanParameterGroup: 'default',
          },
        ],
      });

      await render(
        hbs`<ProjectSettings::ViewScenario @project={{this.project}} @scenario={{this.scenario}} />`
      );

      const scenarioParams = findAll(selectors.paramItemRoot);

      assert.strictEqual(
        scenarioParams.length,
        this.server.db.scanParameters.length
      );

      assert.strictEqual(
        scenarioParams.length,
        this.server.db.scanParameters.length
      );

      // assert first item
      const firstItemElement = scenarioParams[0];
      const firstItemRecord = this.server.db.scanParameters[0];

      assert
        .dom(selectors.paramName, firstItemElement)
        .exists()
        .hasText(firstItemRecord.name);

      assert
        .dom(selectors.paramValueTextField, firstItemElement)
        .exists()
        .hasValue(firstItemRecord.value);

      assert
        .dom(selectors.paramValueTextFieldSecureIcon, firstItemElement)
        .exists()
        .hasAttribute('icon', 'material-symbols:lock-open-outline');

      assert.dom(selectors.paramDeleteBtn, firstItemElement).exists();
      assert.dom(selectors.paramDeleteBtnIcon, firstItemElement).exists();

      // assert second item
      const secondItemElement = scenarioParams[1];
      const secondItemRecord = this.server.db.scanParameters[1];

      assert
        .dom(selectors.paramName, secondItemElement)
        .exists()
        .hasText(secondItemRecord.name);

      assert
        .dom(selectors.paramValueTextField, secondItemElement)
        .exists()
        .hasValue(secondItemRecord.value);

      assert
        .dom(selectors.paramValueTextFieldSecureIcon, secondItemElement)
        .exists()
        .hasAttribute('icon', 'material-symbols:lock');

      assert.dom(selectors.paramDeleteBtn, secondItemElement).exists();
      assert.dom(selectors.paramDeleteBtnIcon, secondItemElement).exists();
    });
  }
);
