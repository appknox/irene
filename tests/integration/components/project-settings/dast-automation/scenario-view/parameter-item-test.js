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

// ─── Selectors ───────────────────────────────────────────────────────────────

const selectors = {
  root: '[data-test-projectSettings-viewScenario-parameterItem-root]',
  name: '[data-test-projectSettings-viewScenario-parameterItem-name]',
  valueTextField:
    '[data-test-projectSettings-viewScenario-parameterItem-valueTextField]',
  valueTextFieldTooltip:
    '[data-test-projectSettings-viewScenario-parameterItem-valueTextFieldTooltip]',
  editSaveLoader:
    '[data-test-projectSettings-viewScenario-parameterItem-editSaveLoader]',
  secureIcon:
    '[data-test-projectSettings-parameterItem-valueTextField-secureIcon]',
  secureTooltip:
    '[data-test-projectSettings-parameterItem-valueTextField-secureTooltip]',
  editCancelBtn:
    '[data-test-projectSettings-parameterItem-valueTextField-editCancelButton]',
  editSaveBtn:
    '[data-test-projectSettings-parameterItem-valueTextField-editSaveButton]',
  deleteBtn:
    '[data-test-projectSettings-viewScenario-parameterItem-deleteButton]',
  deleteConfirmText:
    '[data-test-projectSettings-viewScenario-deleteParamModal-confirmText]',
  deleteInputTypeInfo:
    '[data-test-projectSettings-viewScenario-deleteParamModal-inputTypeInfo]',
  deleteInputValueInfo:
    '[data-test-projectSettings-viewScenario-deleteParamModal-inputValueInfo]',
  deleteModalCancelBtn:
    '[data-test-projectSettings-viewScenario-deleteParamModal-deleteCancelBtn]',
  deleteModalConfirmBtn:
    '[data-test-projectSettings-viewScenario-deleteParamModal-deleteConfirmBtn]',
  maskModalText:
    '[data-test-projectSettings-viewScenario-maskFieldModal-maskParameterText]',
  maskModalCancelBtn:
    '[data-test-projectSettings-viewScenario-maskFieldModal-maskCancelBtn]',
  maskModalConfirmBtn:
    '[data-test-projectSettings-viewScenario-maskFieldModal-maskSaveBtn]',
};

// ─── Template ────────────────────────────────────────────────────────────────

const TEMPLATE = hbs`
  <ProjectSettings::DastAutomation::ScenarioView::ParameterItem
    @parameter={{this.parameter}}
    @scenario={{this.scenario}}
    @reloadParameterList={{this.reloadParameterList}}
  />
`;

// ─── Test suite ──────────────────────────────────────────────────────────────

module(
  'Integration | Component | project-settings/dast-automation/scenario-view/parameter-item',
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

      const paramRecord = this.server.create('scan-parameter', {
        name: 'username',
        value: 'admin',
        is_secure: false,
      });

      const parameter = store.push(
        store.normalize('scan-parameter', paramRecord.toJSON())
      );

      this.setProperties({
        scenario,
        parameter,
        reloadParameterListCalled: false,
        reloadParameterList: () => this.set('reloadParameterListCalled', true),
      });
    });

    // ─── Render ──────────────────────────────────────────────────────────────

    test('renders parameter name and value', async function (assert) {
      await render(TEMPLATE);

      assert.dom(selectors.root).exists();
      assert.dom(selectors.name).containsText('username');
      assert.dom(selectors.valueTextField).hasValue('admin');
    });

    test('hovering the value field tooltip shows the click-to-edit hint', async function (assert) {
      await render(TEMPLATE);

      await triggerEvent(find(selectors.valueTextFieldTooltip), 'mouseenter');

      assert
        .dom('[data-test-ak-tooltip-content]')
        .containsText(t('dastAutomation.clickToEdit'));
    });

    // ─── Secure / insecure icon ───────────────────────────────────────────────

    test.each(
      'renders the correct lock icon and input type per secure state',
      [
        [false, /lock-open-outline/],
        [true, /lock/],
      ],
      async function (assert, [isSecure, iconRegex]) {
        const store = this.owner.lookup('service:store');

        const paramRecord = this.server.create('scan-parameter', {
          name: 'token',
          value: 'secret',
          is_secure: isSecure,
        });

        const parameter = store.push(
          store.normalize('scan-parameter', paramRecord.toJSON())
        );

        this.set('parameter', parameter);

        await render(TEMPLATE);

        assert.dom(selectors.secureIcon).hasAttribute('icon', iconRegex);
      }
    );

    // ─── Edit mode ────────────────────────────────────────────────────────────

    test('focusing the value field enters edit mode and shows cancel/save buttons', async function (assert) {
      await render(TEMPLATE);

      // ── Pre-state ──────────────────────────────────────────────────────────
      assert.dom(selectors.editCancelBtn).doesNotExist();
      assert.dom(selectors.editSaveBtn).doesNotExist();

      await triggerEvent(find(selectors.valueTextField), 'focus');

      // ── Post-focus ─────────────────────────────────────────────────────────
      assert.dom(selectors.editCancelBtn).exists();
      assert.dom(selectors.editSaveBtn).exists();
    });

    test('clicking cancel in edit mode reverts value and hides cancel/save buttons', async function (assert) {
      await render(TEMPLATE);

      await triggerEvent(find(selectors.valueTextField), 'focus');
      await fillIn(find(selectors.valueTextField), 'changed-value');

      assert.dom(selectors.editCancelBtn).exists();

      await click(selectors.editCancelBtn);

      // ── Post-cancel ────────────────────────────────────────────────────────
      assert.dom(selectors.valueTextField).hasValue('admin');
      assert.dom(selectors.editCancelBtn).doesNotExist();
      assert.dom(selectors.editSaveBtn).doesNotExist();
    });

    // ─── Save edit ────────────────────────────────────────────────────────────

    test('saving an edit calls PUT, shows success notification, and calls reloadParameterList', async function (assert) {
      this.server.put(
        '/v2/scan_parameter_groups/:scenarioId/scan_parameters/:id',
        (_, req) => {
          const body = JSON.parse(req.requestBody);

          return {
            id: req.params.id,
            name: 'username',
            value: body.value,
            is_secure: body.is_secure,
          };
        }
      );

      await render(TEMPLATE);

      await triggerEvent(find(selectors.valueTextField), 'focus');
      await fillIn(find(selectors.valueTextField), 'new-value');

      assert.false(
        this.reloadParameterListCalled,
        'reloadParameterList not yet called'
      );

      await click(selectors.editSaveBtn);

      const notify = this.owner.lookup('service:notifications');
      assert.strictEqual(
        notify.successMsg,
        t('dastAutomation.paramEditSuccess'),
        'shows paramEditSuccess notification'
      );
      assert.true(
        this.reloadParameterListCalled,
        'calls reloadParameterList after save'
      );
      assert.dom(selectors.editCancelBtn).doesNotExist();
    });

    test.each(
      'edit flow: correct input type, value on focus, cancel reverts, save shows loader',
      [false, true],
      async function (assert, isSecure) {
        const store = this.owner.lookup('service:store');
        const valueToEditTo = 'edited-value';

        const paramRecord = this.server.create('scan-parameter', {
          name: 'username',
          value: 'admin',
          is_secure: isSecure,
        });

        const parameter = store.push(
          store.normalize('scan-parameter', paramRecord.toJSON())
        );

        this.set('parameter', parameter);

        this.server.put(
          '/v2/scan_parameter_groups/:scenarioId/scan_parameters/:id',
          (_, req) => {
            const body = JSON.parse(req.requestBody);

            return {
              id: req.params.id,
              name: 'username',
              value: body.value,
              is_secure: body.is_secure,
            };
          },
          { timing: 150 }
        );

        await render(TEMPLATE);

        // Initial state: type reflects isSecure
        assert
          .dom(selectors.valueTextField)
          .hasValue('admin')
          .hasAttribute('type', isSecure ? 'password' : 'text');

        // Focus: secure clears the value; insecure keeps it; type always 'text'
        await triggerEvent(find(selectors.valueTextField), 'focus');

        assert
          .dom(selectors.valueTextField)
          .hasValue(isSecure ? '' : 'admin')
          .hasAttribute('type', 'text');

        await fillIn(find(selectors.valueTextField), valueToEditTo);

        // Cancel reverts to the original value and hides edit buttons
        await click(selectors.editCancelBtn);

        assert.dom(selectors.valueTextField).hasValue('admin');
        assert.dom(selectors.editSaveBtn).doesNotExist();
        assert.dom(selectors.editCancelBtn).doesNotExist();

        // Refocus, refill, then save without awaiting to catch the loader
        await triggerEvent(find(selectors.valueTextField), 'focus');
        await fillIn(find(selectors.valueTextField), valueToEditTo);

        click(selectors.editSaveBtn);

        await waitFor(selectors.editSaveLoader, { timeout: 150 });
        assert.dom(selectors.editSaveLoader).exists();

        await waitUntil(() => !find(selectors.editSaveLoader), {
          timeout: 150,
        });

        assert.dom(selectors.valueTextField).hasValue(valueToEditTo);

        const notify = this.owner.lookup('service:notifications');

        assert.strictEqual(
          notify.successMsg,
          t('dastAutomation.paramEditSuccess'),
          'shows paramEditSuccess notification after save'
        );
      }
    );

    // ─── Delete flow ──────────────────────────────────────────────────────────

    test('opening delete modal shows confirmation; cancel closes without deleting', async function (assert) {
      assert.expect(11);

      await render(TEMPLATE);

      // ── Pre-state ──────────────────────────────────────────────────────────
      assert.dom(selectors.deleteConfirmText).doesNotExist();

      await click(selectors.deleteBtn);

      assert.dom(selectors.deleteConfirmText).exists();

      compareInnerHTMLWithIntlTranslation(assert, {
        selector: selectors.deleteConfirmText,
        message: t('dastAutomation.parameterDeleteConfirm', {
          scenarioName: this.scenario.name,
        }),
        doIncludesCheck: true,
      });

      assert
        .dom(selectors.deleteInputTypeInfo)
        .containsText(t('dastAutomation.inputType'))
        .containsText(this.parameter.name);

      assert
        .dom(selectors.deleteInputValueInfo)
        .containsText(t('dastAutomation.inputValue'))
        .containsText(this.parameter.value);

      assert.dom(selectors.deleteModalCancelBtn).containsText(t('cancel'));
      assert.dom(selectors.deleteModalConfirmBtn).containsText(t('yesDelete'));

      await click(selectors.deleteModalCancelBtn);

      assert.dom(selectors.deleteConfirmText).doesNotExist();

      assert.false(
        this.reloadParameterListCalled,
        'reloadParameterList not called on cancel'
      );
    });

    test('confirming delete calls DELETE, shows success notification, and calls reloadParameterList', async function (assert) {
      this.server.del(
        '/v2/scan_parameter_groups/:scenarioId/scan_parameters/:id',
        () => ({})
      );

      await render(TEMPLATE);

      await click(selectors.deleteBtn);

      assert.false(
        this.reloadParameterListCalled,
        'reloadParameterList not yet called'
      );

      await click(selectors.deleteModalConfirmBtn);

      const notify = this.owner.lookup('service:notifications');

      assert.strictEqual(
        notify.successMsg,
        t('dastAutomation.paramDeleteSuccess'),
        'shows paramDeleteSuccess notification'
      );

      assert.true(
        this.reloadParameterListCalled,
        'calls reloadParameterList after delete'
      );
    });

    // ─── Mask (secure) flow ───────────────────────────────────────────────────

    test('clicking the lock icon on an insecure parameter opens the mask modal', async function (assert) {
      await render(TEMPLATE);

      // ── Pre-state ──────────────────────────────────────────────────────────
      assert.dom(selectors.maskModalText).doesNotExist();

      await click(selectors.secureIcon);

      assert
        .dom(selectors.maskModalText)
        .containsText(t('dastAutomation.maskParameterText'));

      assert.dom(selectors.maskModalCancelBtn).containsText(t('cancel'));
      assert.dom(selectors.maskModalConfirmBtn).containsText(t('yesSecure'));
    });

    test('confirming mask secures the parameter and shows success notification', async function (assert) {
      this.server.put(
        '/v2/scan_parameter_groups/:scenarioId/scan_parameters/:id',
        (_, req) => {
          const body = JSON.parse(req.requestBody);

          return {
            id: req.params.id,
            name: 'username',
            value: body.value,
            is_secure: body.is_secure,
          };
        }
      );

      await render(TEMPLATE);

      assert
        .dom(selectors.secureIcon)
        .hasAttribute('icon', /lock-open-outline/);

      await click(selectors.secureIcon);
      await click(selectors.maskModalConfirmBtn);

      const notify = this.owner.lookup('service:notifications');

      assert.strictEqual(
        notify.successMsg,
        t('dastAutomation.paramEditSuccess'),
        'shows paramEditSuccess after securing'
      );

      assert.dom(selectors.maskModalText).doesNotExist();

      assert
        .dom(selectors.secureIcon)
        .hasAttribute('icon', /material-symbols:lock$/);
    });

    test('clicking the lock icon on a secure parameter does not open the mask modal', async function (assert) {
      const store = this.owner.lookup('service:store');
      const paramRecord = this.server.create('scan-parameter', {
        name: 'token',
        value: 'secret',
        is_secure: true,
      });
      const parameter = store.push(
        store.normalize('scan-parameter', paramRecord.toJSON())
      );

      this.set('parameter', parameter);
      await render(TEMPLATE);

      await click(selectors.secureIcon);

      assert.dom(selectors.maskModalText).doesNotExist();
    });
  }
);
