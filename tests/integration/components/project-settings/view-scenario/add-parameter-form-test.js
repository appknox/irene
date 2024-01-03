import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, fillIn, render, triggerEvent } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import Service from '@ember/service';
import { Response } from 'ember-cli-mirage';

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
  addParamBtnSelector: '[data-test-projectSettings-viewScenario-addParamerBtn]',
  inputTypeTextField:
    '[data-test-projectSettings-viewScenario-inputTypeTextField]',
  inputTypeClearBtn:
    '[data-test-projectSettings-viewScenario-inputTypeTextField-clearBtn]',
  inputValueClearBtn:
    '[data-test-projectSettings-viewScenario-inputValueTextField-clearBtn]',
  inputValueTextField:
    '[data-test-projectSettings-viewScenario-inputValueTextField]',
  inputTypeErrorIcon:
    '[data-test-projectSettings-viewScenario-inputValueTextField]',
  inputTypeErrorTooltip:
    '[data-test-projectSettings-viewScenario-inputTypeTextField-errorTooltip]',
  dupInputTypeErrorText:
    '[data-test-projectSettings-viewScenario-inputTypeTextField-errorText]',
};

module(
  'Integration | Component | project-settings/view-scenario/add-parameter-form',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks);

    hooks.beforeEach(async function () {
      this.owner.register('service:notifications', NotificationsStub);

      const store = this.owner.lookup('service:store');

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
        scenario: store.push(normalizedScenario),
        reloadParameterList: () => {},
        inputType: 'input type',
        inputValue: 'input value',
      });
    });

    test('it renders', async function (assert) {
      await render(hbs`
        <ProjectSettings::ViewScenario::AddParameterForm 
          @scenario={{this.scenario}} 
          @reloadParameterList={{this.reloadParameterList}} 
        />
      `);

      assert
        .dom(selectors.addParamBtnSelector)
        .exists()
        .containsText('t:add:()')
        .hasAttribute('disabled');

      assert.dom(selectors.inputTypeTextField).exists();
      assert.dom(selectors.inputValueTextField).exists();
    });

    test('it enables add button if input type and value textfields are filled', async function (assert) {
      await render(hbs`
        <ProjectSettings::ViewScenario::AddParameterForm 
          @scenario={{this.scenario}} 
          @reloadParameterList={{this.reloadParameterList}} 
        />
      `);

      assert
        .dom(selectors.addParamBtnSelector)
        .exists()
        .hasAttribute('disabled');

      await fillIn(selectors.inputTypeTextField, this.inputType);
      await fillIn(selectors.inputValueTextField, this.inputValue);

      assert.dom(selectors.inputTypeTextField).hasValue(this.inputType);
      assert.dom(selectors.inputValueTextField).hasValue(this.inputValue);

      assert
        .dom(selectors.addParamBtnSelector)
        .exists()
        .doesNotHaveAttribute('disabled');
    });

    test('it adds parameter to scenario', async function (assert) {
      assert.expect(10);

      this.setProperties({
        // triggers parameter list reload if parameter is added successfully
        reloadParameterList: () => {
          assert.ok(true);
        },
      });

      const inputType = 'input type';
      const inputValue = 'input value';

      this.server.post(
        '/v2/scan_parameter_groups/:groupId/scan_parameters',
        function (schema, request) {
          const { name, value } = JSON.parse(request.requestBody);

          assert.strictEqual(name, inputType);
          assert.strictEqual(value, inputValue);

          return schema.scanParameters
            .create({
              name,
              value,
              is_secure: false,
              scanParameterGroup: request.params.groupId,
            })
            .toJSON();
        }
      );

      await render(hbs`
        <ProjectSettings::ViewScenario::AddParameterForm 
          @scenario={{this.scenario}} 
          @reloadParameterList={{this.reloadParameterList}} 
        />
      `);

      await fillIn(selectors.inputTypeTextField, inputType);
      await fillIn(selectors.inputValueTextField, inputValue);

      await click(selectors.addParamBtnSelector);

      assert.dom(selectors.inputTypeTextField).hasValue('');
      assert.dom(selectors.inputValueTextField).hasValue('');

      const notify = this.owner.lookup('service:notifications');

      assert.strictEqual(notify.successMsg, t('dastAutomation.parameterAdded'));

      assert.strictEqual(this.server.db.scanParameters.length, 1);

      const createdScanParameter = this.server.db.scanParameters[0];

      assert.strictEqual(createdScanParameter.name, inputType);
      assert.strictEqual(createdScanParameter.value, inputValue);
      assert.notOk(createdScanParameter.is_secure);
    });

    test('it shows parameter name errors in inputType textfield helper if thrown', async function (assert) {
      const duplicateNameError = 'Name already exists';

      this.server.post(
        '/v2/scan_parameter_groups/:groupId/scan_parameters',
        function () {
          return new Response(
            400,
            {},
            {
              name: duplicateNameError,
            }
          );
        }
      );

      await render(hbs`
        <ProjectSettings::ViewScenario::AddParameterForm 
          @scenario={{this.scenario}} 
          @reloadParameterList={{this.reloadParameterList}} 
        />
      `);

      await fillIn(selectors.inputTypeTextField, this.inputType);
      await fillIn(selectors.inputValueTextField, this.inputValue);

      await click(selectors.addParamBtnSelector);

      assert
        .dom('[data-test-helper-text]')
        .exists()
        .containsText(duplicateNameError);

      assert.dom(selectors.inputTypeErrorIcon).exists();

      await triggerEvent(selectors.inputTypeErrorTooltip, 'mouseenter');

      assert
        .dom(selectors.dupInputTypeErrorText)
        .containsText(
          t('dastAutomation.paramTypeDupText', { type: this.inputType })
        );
    });

    test('it clears input type and value textfields onClear button click', async function (assert) {
      await render(hbs`
        <ProjectSettings::ViewScenario::AddParameterForm 
          @scenario={{this.scenario}} 
          @reloadParameterList={{this.reloadParameterList}} 
        />
      `);

      assert
        .dom(selectors.addParamBtnSelector)
        .exists()
        .hasAttribute('disabled');

      await fillIn(selectors.inputTypeTextField, this.inputType);
      await fillIn(selectors.inputValueTextField, this.inputValue);

      assert.dom(selectors.inputTypeTextField).hasValue(this.inputType);
      assert.dom(selectors.inputValueTextField).hasValue(this.inputValue);

      assert
        .dom(selectors.addParamBtnSelector)
        .exists()
        .doesNotHaveAttribute('disabled');

      await click(selectors.inputTypeClearBtn);
      await click(selectors.inputValueClearBtn);

      assert.dom(selectors.inputTypeTextField).hasValue('');
      assert.dom(selectors.inputValueTextField).hasValue('');

      assert
        .dom(selectors.addParamBtnSelector)
        .exists()
        .hasAttribute('disabled');
    });
  }
);
