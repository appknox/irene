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

class RouterStub extends Service {
  transitionTo() {} //NOSONAR
}

// ─── Selectors ───────────────────────────────────────────────────────────────

const selectors = {
  loader: '[data-test-projectSettings-viewScenario-paramListLoader]',
  emptyContainer: '[data-test-projectSettings-viewScenario-paramListEmpty]',
  emptyIllustration:
    '[data-test-projectSettings-viewScenario-paramListEmptyIllustration]',
  emptyHeaderText:
    '[data-test-projectSettings-viewScenario-paramListEmptyHeaderText]',
  emptyDescText:
    '[data-test-projectSettings-viewScenario-paramListEmptyDescText]',
  parameterItem: '[data-test-projectSettings-viewScenario-parameterItem-root]',
};

// ─── Template ────────────────────────────────────────────────────────────────

const TEMPLATE = hbs`
  <ProjectSettings::DastAutomation::ScenarioView
    @project={{this.project}}
    @scenario={{this.scenario}}
  />
`;

// ─── Test suite ──────────────────────────────────────────────────────────────

module(
  'Integration | Component | project-settings/dast-automation/scenario-view/index',
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
      });

      const scenario = store.push(
        store.normalize('scan-parameter-group', scenarioRecord.toJSON())
      );

      this.setProperties({ project, scenario });
    });

    // ─── Loading state ────────────────────────────────────────────────────────

    test('shows the loader while scan parameters are being fetched', async function (assert) {
      this.server.get(
        '/v2/scan_parameter_groups/:groupId/scan_parameters',
        () => ({ count: 0, next: null, previous: null, results: [] }),
        { timing: 150 }
      );

      render(TEMPLATE);

      await waitFor(selectors.loader, { timeout: 200 });
      assert.dom(selectors.loader).exists();

      await waitUntil(() => !find(selectors.loader), { timeout: 500 });
      assert.dom(selectors.loader).doesNotExist();
    });

    // ─── Empty state ──────────────────────────────────────────────────────────

    test('shows empty state illustration, title, and description when no parameters exist', async function (assert) {
      this.server.get(
        '/v2/scan_parameter_groups/:groupId/scan_parameters',
        () => ({ count: 0, next: null, previous: null, results: [] })
      );

      await render(TEMPLATE);

      assert
        .dom('[data-test-projectSettings-viewScenario-header-root]')
        .exists();

      assert
        .dom('[data-test-projectSettings-viewScenario-addParameterRoot]')
        .exists();

      assert.dom(selectors.emptyContainer).exists();
      assert.dom(selectors.emptyIllustration).exists();
      assert.dom(selectors.emptyHeaderText).containsText(t('noDataAvailable'));

      assert
        .dom(selectors.emptyDescText)
        .containsText(t('dastAutomation.noParamaterAvailable'));

      assert.dom(selectors.parameterItem).doesNotExist();
    });

    // ─── Populated state ──────────────────────────────────────────────────────

    test('renders one ParameterItem per scan parameter returned by the API', async function (assert) {
      const params = [
        this.server.create('scan-parameter', {
          name: 'username',
          value: 'admin',
          is_secure: false,
        }),
        this.server.create('scan-parameter', {
          name: 'password',
          value: 'secret',
          is_secure: true,
        }),
      ];

      this.server.get(
        '/v2/scan_parameter_groups/:groupId/scan_parameters',
        () => ({
          count: params.length,
          next: null,
          previous: null,
          results: params.map((p) => p.toJSON()),
        })
      );

      await render(TEMPLATE);

      assert.dom(selectors.emptyContainer).doesNotExist();

      const items = findAll(selectors.parameterItem);

      assert.strictEqual(
        items.length,
        2,
        'renders the correct number of parameter items'
      );

      // First item (insecure)
      assert
        .dom(
          '[data-test-projectSettings-viewScenario-parameterItem-name]',
          items[0]
        )
        .containsText('username');

      assert
        .dom(
          '[data-test-projectSettings-viewScenario-parameterItem-valueTextField]',
          items[0]
        )
        .hasValue('admin');

      assert
        .dom(
          '[data-test-projectSettings-parameterItem-valueTextField-secureIcon]',
          items[0]
        )
        .hasAttribute('icon', /lock-open-outline/);

      // Second item (secure)
      assert
        .dom(
          '[data-test-projectSettings-viewScenario-parameterItem-name]',
          items[1]
        )
        .containsText('password');

      assert
        .dom(
          '[data-test-projectSettings-viewScenario-parameterItem-valueTextField]',
          items[1]
        )
        .hasValue('secret');

      assert
        .dom(
          '[data-test-projectSettings-parameterItem-valueTextField-secureIcon]',
          items[1]
        )
        .hasAttribute('icon', /lock/);
    });
  }
);
