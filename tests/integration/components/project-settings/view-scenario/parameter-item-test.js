import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import {
  click,
  fillIn,
  find,
  render,
  triggerEvent,
  waitFor,
  waitUntil,
} from '@ember/test-helpers';
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
  paramItemRoot: '[data-test-projectSettings-viewScenario-parameterItem-root]',
  paramName: '[data-test-projectSettings-viewScenario-parameterItem-name]',
  paramValueTextField:
    '[data-test-projectSettings-viewScenario-parameterItem-valueTextField]',
  paramValueTextFieldToolTip:
    '[data-test-projectSettings-viewScenario-parameterItem-valueTextFieldTooltip]',
  paramValueTextFieldSecureIcon:
    '[data-test-projectSettings-parameterItem-valueTextField-secureIcon]',
  paramDeleteBtn:
    '[data-test-projectSettings-viewScenario-parameterItem-deleteButton]',
  paramDeleteBtnIcon:
    '[data-test-projectSettings-viewScenario-parameterItem-deleteButtonIcon]',
  paramEditCancelBtn:
    '[data-test-projectSettings-parameterItem-valueTextField-editCancelButton]',
  paramEditCancelBtnIcon:
    '[data-test-projectSettings-parameterItem-valueTextField-editCancelBtnIcon]',
  paramEditSaveBtn:
    '[data-test-projectSettings-parameterItem-valueTextField-editSaveButton]',
  paramEditSaveBtnIcon:
    '[data-test-projectSettings-parameterItem-valueTextField-editSaveBtnIcon]',
  paramEditSaveLoader:
    '[data-test-projectSettings-viewScenario-parameterItem-editSaveLoader]',
  maskParameterText:
    '[data-test-projectSettings-viewScenario-maskFieldModal-maskParameterText]',
  maskSaveBtn:
    '[data-test-projectSettings-viewScenario-maskFieldModal-maskSaveBtn]',
  maskCancelBtn:
    '[data-test-projectSettings-viewScenario-maskFieldModal-maskCancelBtn]',
  deleteConfirmText:
    '[data-test-projectSettings-viewScenario-deleteParamModal-confirmText]',
  deleteInputValueInfo:
    '[data-test-projectSettings-viewScenario-deleteParamModal-inputValueInfo]',
  deleteInputTypeInfo:
    '[data-test-projectSettings-viewScenario-deleteParamModal-inputTypeInfo]',
  deleteCancelBtn:
    '[data-test-projectSettings-viewScenario-deleteParamModal-deleteCancelBtn]',
  deleteConfirmBtn:
    '[data-test-projectSettings-viewScenario-deleteParamModal-deleteConfirmBtn]',
};

module(
  'Integration | Component | project-settings/view-scenario/parameter-item',
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

      // Parameter Model
      const parameter = this.server.create('scan-parameter', {
        id: 1,
        scanParameterGroup: 'default',
        name: 'Parameter',
        value: 'Parameter Value',
      });

      const normalizedParameter = store.normalize('scan-parameter', {
        ...parameter.toJSON(),
      });

      this.setProperties({
        scenario: store.push(normalizedScenario),
        parameter: store.push(normalizedParameter),
        reloadParameterList: () => {},
      });
    });

    test('it renders', async function (assert) {
      await render(hbs`
        <ProjectSettings::ViewScenario::ParameterItem 
          @parameter={{this.parameter}}
          @scenario={{this.scenario}}
          @reloadParameterList={{this.reloadParameterList}} 
        />
      `);

      assert.dom(selectors.paramItemRoot).exists();
      assert.dom(selectors.paramName).exists().hasText(this.parameter.name);

      assert
        .dom(selectors.paramValueTextField)
        .exists()
        .hasValue(this.parameter.value);

      assert
        .dom(selectors.paramValueTextFieldSecureIcon)
        .exists()
        .hasClass(this.parameter.isSecure ? /lock/ : /lock-open/);

      assert.dom(selectors.paramDeleteBtn).exists();
      assert.dom(selectors.paramDeleteBtnIcon).exists();

      await triggerEvent(selectors.paramValueTextFieldToolTip, 'mouseenter');

      assert
        .dom('[data-test-ak-tooltip-content]')
        .exists()
        .containsText(t('dastAutomation.clickToEdit'));
    });

    test.each(
      'it edits a parameter value',
      [true, false],
      async function (assert, is_secure) {
        const valueToEditTo = 'edited value';
        this.parameter.set('isSecure', is_secure);

        this.server.put(
          '/v2/scan_parameter_groups/:groupId/scan_parameters/:id',
          function (schema, request) {
            const { is_secure, ...rest } = JSON.parse(request.requestBody);
            const id = request.params.id;

            // Checks to see if value to edit to is correct
            assert.strictEqual(
              valueToEditTo,
              rest.value,
              'Edits with correct parameter value'
            );

            return schema.scanParameters
              .find(id)
              .update({ is_secure: is_secure === 'true', ...rest });
          },
          { timing: 150 }
        );

        await render(hbs`
          <ProjectSettings::ViewScenario::ParameterItem 
            @parameter={{this.parameter}}
            @scenario={{this.scenario}}
            @reloadParameterList={{this.reloadParameterList}} 
          />
        `);

        assert
          .dom(selectors.paramValueTextField)
          .exists()
          .hasValue(this.parameter.value)
          .hasAttribute('type', this.parameter.isSecure ? 'password' : 'text');

        await triggerEvent(selectors.paramValueTextField, 'focus');

        assert.dom(selectors.paramEditCancelBtn).exists();
        assert.dom(selectors.paramEditCancelBtnIcon).exists();

        assert.dom(selectors.paramEditSaveBtn).exists();
        assert.dom(selectors.paramEditSaveBtnIcon).exists();

        assert
          .dom(selectors.paramValueTextField)

          .hasValue(this.parameter.isSecure ? '' : this.parameter.value)
          .hasAttribute('type', 'text');

        await fillIn(selectors.paramValueTextField, valueToEditTo);

        // Cancel resets input value to default and hides edit ctas
        await click(selectors.paramEditCancelBtn);

        assert
          .dom(selectors.paramValueTextField)
          .hasValue(this.parameter.value);

        assert.dom(selectors.paramEditSaveBtn).doesNotExist();
        assert.dom(selectors.paramEditCancelBtn).doesNotExist();

        // Refill input value field
        await triggerEvent(selectors.paramValueTextField, 'focus');
        await fillIn(selectors.paramValueTextField, valueToEditTo);

        // Save triggers edit loader
        click(selectors.paramEditSaveBtn);

        await waitFor(selectors.paramEditSaveLoader, {
          timeout: 150,
        });

        assert.dom(selectors.paramEditSaveLoader).exists();

        await waitUntil(() => !find(selectors.paramEditSaveLoader), {
          timeout: 150,
        });

        assert.dom(selectors.paramValueTextField).hasValue(valueToEditTo);

        const notify = this.owner.lookup('service:notifications');

        assert.strictEqual(
          notify.successMsg,
          t('dastAutomation.paramEditSuccess')
        );
      }
    );

    test('it toggles secure field', async function (assert) {
      assert.expect(8);

      // Default secure state
      const isSecure = false;
      this.parameter.set('isSecure', isSecure);

      this.server.put(
        '/v2/scan_parameter_groups/:groupId/scan_parameters/:id',
        (schema, request) => {
          const id = request.params.id;
          const { is_secure, ...rest } = JSON.parse(request.requestBody);

          // Sets the value of paramter
          this.parameter.set('isSecure', is_secure);

          return schema.scanParameters.find(id).update({ is_secure, ...rest });
        }
      );

      await render(hbs`
        <ProjectSettings::ViewScenario::ParameterItem 
          @parameter={{this.parameter}}
          @scenario={{this.scenario}}
          @reloadParameterList={{this.reloadParameterList}} 
        />
      `);

      assert
        .dom(selectors.paramValueTextFieldSecureIcon)
        .exists()
        .hasClass(/lock-open/);

      await click(selectors.paramValueTextFieldSecureIcon);

      assert
        .dom(selectors.maskParameterText)
        .hasText(t('dastAutomation.maskParameterText'));

      assert.dom(selectors.maskCancelBtn).hasText(t('cancel'));
      assert.dom(selectors.maskSaveBtn).hasText(t('yesSecure'));

      await click(selectors.maskSaveBtn);

      assert
        .dom(selectors.paramValueTextFieldSecureIcon)
        .doesNotHaveClass(/lock-open/)
        .hasClass(/lock/);

      const notify = this.owner.lookup('service:notifications');

      assert.strictEqual(
        notify.successMsg,
        t('dastAutomation.paramEditSuccess')
      );
    });

    test('it deletes a parameter', async function (assert) {
      assert.expect(14);

      // Default secure state
      const isSecure = false;
      this.parameter.set('isSecure', isSecure);

      this.server.delete(
        '/v2/scan_parameter_groups/:groupId/scan_parameters/:id',
        () => {
          assert.ok(true, 'It deletes successfully');

          return new Response(204, {}, '');
        }
      );

      await render(hbs`
        <ProjectSettings::ViewScenario::ParameterItem 
          @parameter={{this.parameter}}
          @scenario={{this.scenario}}
          @reloadParameterList={{this.reloadParameterList}} 
        />
      `);

      await click(selectors.paramDeleteBtn);

      assert
        .dom(selectors.deleteConfirmText)
        .exists()
        .hasText(
          t('dastAutomation.parameterDeleteConfirm', {
            scenarioName: this.scenario.name,
          })
        );

      assert
        .dom(selectors.deleteInputTypeInfo)
        .exists()
        .containsText(t('dastAutomation.inputType'))
        .containsText(this.parameter.name);

      assert
        .dom(selectors.deleteInputValueInfo)
        .exists()
        .containsText(t('dastAutomation.inputValue'))
        .containsText(this.parameter.value);

      assert.dom(selectors.deleteCancelBtn).exists().containsText(t('cancel'));

      assert
        .dom(selectors.deleteConfirmBtn)
        .exists()
        .containsText(t('yesDelete'));

      await click(selectors.deleteCancelBtn); // Closes modal

      await click(selectors.paramDeleteBtn);
      await click(selectors.deleteConfirmBtn);

      const notify = this.owner.lookup('service:notifications');

      assert.strictEqual(
        notify.successMsg,
        t('dastAutomation.paramDeleteSuccess')
      );
    });
  }
);
