import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, fillIn, find, render, triggerEvent } from '@ember/test-helpers';
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
  root: '[data-test-projectSettings-viewScenario-addParameterRoot]',
  typeInput: '[data-test-projectSettings-viewScenario-inputTypeTextField]',
  valueInput: '[data-test-projectSettings-viewScenario-inputValueTextField]',
  addBtn: '[data-test-projectSettings-viewScenario-addParamerBtn]',
  typeClearBtn:
    '[data-test-projectSettings-viewScenario-inputTypeTextField-clearBtn]',
  valueClearBtn:
    '[data-test-projectSettings-viewScenario-inputValueTextField-clearBtn]',
  errorIcon:
    '[data-test-projectSettings-viewScenario-inputTypeTextField-errorIcon]',
  errorTooltip:
    '[data-test-projectSettings-viewScenario-inputTypeTextField-errorTooltip]',
  errorText:
    '[data-test-projectSettings-viewScenario-inputTypeTextField-errorText]',
};

// ─── Template ────────────────────────────────────────────────────────────────

const TEMPLATE = hbs`
  <ProjectSettings::DastAutomation::ScenarioView::AddParameterForm
    @scenario={{this.scenario}}
    @reloadParameterList={{this.reloadParameterList}}
  />
`;

// ─── Test suite ──────────────────────────────────────────────────────────────

module(
  'Integration | Component | project-settings/dast-automation/scenario-view/add-parameter-form',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en');

    hooks.beforeEach(async function () {
      this.owner.register('service:notifications', NotificationsStub);

      const store = this.owner.lookup('service:store');
      const scenarioRecord = this.server.create('scan-parameter-group', {
        name: 'Login Flow',
      });
      const scenario = store.push(
        store.normalize('scan-parameter-group', scenarioRecord.toJSON())
      );

      this.setProperties({
        scenario,
        reloadParameterListCalled: false,
        reloadParameterList: () => this.set('reloadParameterListCalled', true),
      });
    });

    // ─── Render ──────────────────────────────────────────────────────────────

    test('renders both text fields and an add button', async function (assert) {
      await render(TEMPLATE);

      assert.dom(selectors.root).exists();
      assert.dom(selectors.typeInput).exists();
      assert.dom(selectors.valueInput).exists();
      assert.dom(selectors.addBtn).containsText(t('add'));
    });

    // ─── Button state ─────────────────────────────────────────────────────────

    test('add button is disabled when both fields are empty', async function (assert) {
      await render(TEMPLATE);

      assert.dom(selectors.addBtn).isDisabled();
    });

    test('add button is disabled when only one field is filled', async function (assert) {
      await render(TEMPLATE);

      await fillIn(find(selectors.typeInput), 'username');
      assert.dom(selectors.addBtn).isDisabled();
    });

    test('add button is enabled when both fields are filled', async function (assert) {
      await render(TEMPLATE);

      await fillIn(find(selectors.typeInput), 'username');
      await fillIn(find(selectors.valueInput), 'admin');

      assert.dom(selectors.addBtn).isNotDisabled();
    });

    // ─── Successful add ───────────────────────────────────────────────────────

    test('successful add shows success notification, clears fields, and calls reloadParameterList', async function (assert) {
      this.server.post(
        '/v2/scan_parameter_groups/:scenarioId/scan_parameters',
        () => ({
          id: '1',
          name: 'username',
          value: 'admin',
          is_secure: false,
        })
      );

      await render(TEMPLATE);

      await fillIn(find(selectors.typeInput), 'username');
      await fillIn(find(selectors.valueInput), 'admin');

      assert.dom(selectors.addBtn).isNotDisabled();

      await click(selectors.addBtn);

      const notify = this.owner.lookup('service:notifications');
      assert.strictEqual(
        notify.successMsg,
        t('dastAutomation.parameterAdded'),
        'shows parameterAdded notification'
      );

      assert.true(
        this.reloadParameterListCalled,
        'calls reloadParameterList after save'
      );

      // Fields are cleared after save
      assert.dom(selectors.typeClearBtn).doesNotExist();
      assert.dom(selectors.valueClearBtn).doesNotExist();
    });

    // ─── Clear buttons ────────────────────────────────────────────────────────

    test('clear buttons on both fields reset the values and disable the add button', async function (assert) {
      await render(TEMPLATE);

      await fillIn(find(selectors.typeInput), 'username');
      await fillIn(find(selectors.valueInput), 'admin');

      assert.dom(selectors.addBtn).isNotDisabled();
      assert.dom(selectors.typeClearBtn).exists();
      assert.dom(selectors.valueClearBtn).exists();

      await click(selectors.typeClearBtn);
      await click(selectors.valueClearBtn);

      assert.dom(selectors.typeInput).hasValue('');
      assert.dom(selectors.valueInput).hasValue('');
      assert.dom(selectors.addBtn).isDisabled();
    });

    // ─── Duplicate type error ─────────────────────────────────────────────────

    test('duplicate type API error shows inline validation error icon', async function (assert) {
      this.server.post(
        '/v2/scan_parameter_groups/:scenarioId/scan_parameters',
        () =>
          new Response(
            400,
            {},
            { name: 'Parameter with this name already exists.' }
          )
      );

      await render(TEMPLATE);

      // ── Pre-state ──────────────────────────────────────────────────────────
      assert.dom(selectors.errorIcon).doesNotExist();

      await fillIn(find(selectors.typeInput), 'username');
      await fillIn(find(selectors.valueInput), 'admin');
      await click(selectors.addBtn);

      // ── Post-error ─────────────────────────────────────────────────────────
      assert.dom(selectors.errorIcon).exists();

      assert
        .dom('[data-test-helper-text]')
        .containsText('Parameter with this name already exists.');

      await triggerEvent(find(selectors.errorTooltip), 'mouseenter');

      assert.dom(selectors.errorText).containsText('username');

      assert.false(
        this.reloadParameterListCalled,
        'does not call reloadParameterList on error'
      );
    });
  }
);
