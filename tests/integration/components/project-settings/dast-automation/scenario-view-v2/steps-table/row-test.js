import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';

import {
  click,
  fillIn,
  find,
  findAll,
  render,
  triggerEvent,
} from '@ember/test-helpers';

import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import Service from '@ember/service';
import { Response } from 'miragejs';

import { ScenarioStepAction } from 'irene/models/scenario-step';

import {
  STEP_ACTION_CONFIGS,
  CHECK_OPTIONS,
  DIRECTION_OPTIONS,
} from 'irene/components/project-settings/dast-automation/scenario-view-v2/steps-table/step-actions';

import {
  assertAkSelectTriggerExists,
  assertAkSelectOptionSelected,
  chooseAkSelectOption,
  findAkSelectTrigger,
  getAllAkSelectOptions,
} from 'irene/tests/helpers/mirage-utils';

// ─── Stubs ───────────────────────────────────────────────────────────────────

class NotificationsStub extends Service {
  successMsg = null;
  errorMsg = null;

  success(msg) {
    this.successMsg = msg;
  }

  error(msg) {
    this.errorMsg = msg;
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeDndMock(items = []) {
  return {
    draggingIndex: null,
    dragOverIndex: null,
    isDragging: false,
    items,
    onDragStart: () => {},
    onDragOver: () => {},
    onDragLeave: () => {},
    onDrop: () => {},
    onDragEnd: () => {},
  };
}

// ─── Selectors ───────────────────────────────────────────────────────────────

const selectors = {
  rowOrder: '[data-test-dastAutomationScenario-stepsTable-rowOrder]',
  dragHandle: '[data-test-dastAutomationScenario-stepsTable-rowDragHandle]',
  actionSelect: '[data-test-dastAutomationScenario-stepsTable-rowActionSelect]',
  identifier: '[data-test-dastAutomationScenario-stepsTable-rowIdentifier]',
  value: '[data-test-dastAutomationScenario-stepsTable-rowValue]',
  valueUnit: '[data-test-dastAutomationScenario-stepsTable-rowValueUnit]',
  hoverActions: '[data-test-dastAutomationScenario-stepsTable-rowHoverActions]',
  inputError: '[data-test-dastAutomationScenario-stepsTable-inputError]',
  rowLockBtn: '[data-test-dastAutomationScenario-stepsTable-rowLockBtn]',
  rowDeleteBtn: '[data-test-dastAutomationScenario-stepsTable-rowDeleteBtn]',

  inputErrorIcon:
    '[data-test-dastAutomationScenario-stepsTable-inputErrorIcon]',

  inputErrorTooltipContent:
    '[data-test-dastAutomationScenario-stepsTable-inputErrorTooltipContent]',

  enterInputInfoIcon:
    '[data-test-dastAutomationScenario-stepsTable-rowEnterInputInfoIcon]',

  enterInputInfoTooltip:
    '[data-test-dastAutomationScenario-stepsTable-rowEnterInputInfoTooltip]',

  row: (index) =>
    `[data-test-dastAutomationScenario-stepsTable-row="${index}"]`,
};

// ─── Template ────────────────────────────────────────────────────────────────

const TEMPLATE = hbs`
  <ProjectSettings::DastAutomation::ScenarioViewV2::StepsTable::Row
    @step={{this.step}}
    @index={{this.index}}
    @dnd={{this.dnd}}
    @isReadOnly={{this.isReadOnly}}
    @isActiveSample={{this.isActiveSample}}
    @stepErrors={{this.stepErrors}}
    @scenarioDetail={{this.scenarioDetail}}
    @onActionChange={{this.onActionChange}}
    @onDelete={{this.onDelete}}
    @clearStepError={{this.clearStepError}}
  />
`;

// ─── Test suite ──────────────────────────────────────────────────────────────

module(
  'Integration | Component | project-settings/dast-automation/scenario-view-v2/steps-table/row',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en');

    hooks.beforeEach(async function () {
      const store = this.owner.lookup('service:store');

      const stepRecord = this.server.create('scenario-step', {
        action: ScenarioStepAction.TAP,
        is_secure: false,
      });

      const step = store.push(
        store.normalize('scenario-step', stepRecord.toJSON())
      );

      const scenarioRecord = this.server.create('scenario-detail', { type: 1 });

      const scenarioDetail = store.push(
        store.normalize('scenario-detail', scenarioRecord.toJSON())
      );

      this.setProperties({
        step,
        scenarioDetail,
        index: 0,
        dnd: makeDndMock([step, step]),
        isReadOnly: false,
        isActiveSample: false,
        stepErrors: null,
        onActionChangedWith: null,
        clearStepErrorCalledWith: null,
        onDeleteCalledWith: null,
        onActionChange: (...args) => this.set('onActionChangedWith', args),
        onDelete: (step) => this.set('onDeleteCalledWith', step),
        clearStepError: (...args) => this.set('clearStepErrorCalledWith', args),
      });
    });

    // ─── Basic rendering ──────────────────────────────────────────────────────

    test('renders row with correct 1-based order number', async function (assert) {
      assert.expect(4);
      this.set('index', 2);

      await render(TEMPLATE);

      assert.dom(selectors.rowOrder).containsText(`#${this.index + 1}`);
      assert.dom(selectors.dragHandle).exists();

      assertAkSelectTriggerExists(assert, selectors.actionSelect);

      assert.dom(selectors.identifier).exists();
    });

    // ─── Read-only mode ───────────────────────────────────────────────────────

    test('disables identifier, value, and action select when isReadOnly', async function (assert) {
      assert.expect(3);

      this.set('isReadOnly', true);

      await render(TEMPLATE);

      assert.dom(selectors.identifier).isDisabled();
      assert.dom(selectors.value).isDisabled();

      const actionTrigger = findAkSelectTrigger(assert, selectors.actionSelect);

      assert.dom(actionTrigger).hasAria('disabled', 'true');
    });

    test('hides hover actions when isReadOnly and isActiveSample is false', async function (assert) {
      this.set('isReadOnly', true);

      await render(TEMPLATE);

      assert.dom(selectors.hoverActions).doesNotExist();
    });

    test('shows hover actions when isActiveSample is true even if isReadOnly', async function (assert) {
      this.setProperties({ isReadOnly: true, isActiveSample: true });

      await render(TEMPLATE);

      assert.dom(selectors.hoverActions).exists();
    });

    test('shows hover actions when not isReadOnly', async function (assert) {
      await render(TEMPLATE);

      assert.dom(selectors.hoverActions).exists();
    });

    test('disables the delete button when dnd has only one step', async function (assert) {
      this.set('dnd', makeDndMock([this.step]));

      await render(TEMPLATE);

      assert.dom(selectors.rowDeleteBtn).isDisabled();
    });

    test('clicking the delete button calls onDelete with the step', async function (assert) {
      await render(TEMPLATE);

      await click(selectors.rowDeleteBtn);

      assert.strictEqual(this.onDeleteCalledWith, this.step);
    });

    // ─── Value cell by action type ────────────────────────────────────────────

    test.each(
      'renders correct identifier and value fields matching step data for each action type',
      [
        {
          action: ScenarioStepAction.TAP,
          stepAttrs: {
            identifier: 'login-button',
            value: '3',
            is_secure: false,
          },
          valueType: 'input',
          unitOptions: null,
        },
        {
          action: ScenarioStepAction.SELECT,
          stepAttrs: {
            identifier: 'dropdown-id',
            value: 'Option A',
            is_secure: false,
          },
          valueType: 'input',
          unitOptions: null,
        },
        {
          action: ScenarioStepAction.ENTER_TEXT,
          stepAttrs: {
            identifier: 'password-field',
            value: 'mypassword',
            is_secure: false,
          },
          valueType: 'input',
          infoIcon: true,
          unitOptions: null,
        },
        {
          action: ScenarioStepAction.CHECK,
          stepAttrs: {
            identifier: 'accept-checkbox',
            value: 'true',
            is_secure: false,
          },
          valueType: 'select',
          options: CHECK_OPTIONS,
          selectedOptionLabel: 'dastAutomation.checkOptions.checked',
          unitOptions: null,
        },
        {
          action: ScenarioStepAction.WAIT,
          stepAttrs: { identifier: 'wait-step', value: '2', is_secure: false },
          valueType: 'input',
          unitOptions: ['dastAutomation.units.seconds'],
        },
        {
          action: ScenarioStepAction.LONG_PRESS,
          stepAttrs: {
            identifier: 'hold-button',
            value: '500',
            is_secure: false,
          },
          valueType: 'input',
          unitOptions: ['dastAutomation.units.milliseconds'],
        },
        {
          action: ScenarioStepAction.SWIPE,
          stepAttrs: {
            identifier: 'swipe-area',
            value: 'left',
            is_secure: false,
          },
          valueType: 'select',
          options: DIRECTION_OPTIONS,
          selectedOptionLabel: 'dastAutomation.directions.left',
          unitOptions: null,
        },
      ],
      async function (
        assert,
        {
          action,
          stepAttrs,
          valueType,
          options,
          selectedOptionLabel,
          infoIcon,
          unitOptions,
        }
      ) {
        const store = this.owner.lookup('service:store');

        const stepRecord = this.server.create('scenario-step', {
          action,
          ...stepAttrs,
        });

        const step = store.push(
          store.normalize('scenario-step', stepRecord.toJSON())
        );

        this.setProperties({ step, dnd: makeDndMock([step, step]) });

        await render(TEMPLATE);

        // Check the identifier field
        assert.dom(selectors.identifier).hasValue(stepAttrs.identifier);

        // Check the value field
        if (valueType === 'input') {
          assert.dom(selectors.value).hasValue(String(stepAttrs.value));
        } else {
          await assertAkSelectOptionSelected({
            assert,
            selector: selectors.value,
            label: t(selectedOptionLabel),
          });

          const valueOptions = await getAllAkSelectOptions(selectors.value);

          assert.strictEqual(valueOptions.length, options.length);

          options.forEach((opt, i) =>
            assert.dom(valueOptions[i]).containsText(t(opt.label))
          );
        }

        // Check the info icon for ENTER_TEXT action
        if (infoIcon) {
          assert.dom(selectors.enterInputInfoIcon).hasAttribute('icon', /info/);
        }

        // Check the unit options for WAIT and LONG_PRESS actions
        if (unitOptions) {
          const units = await getAllAkSelectOptions(selectors.valueUnit);

          assert.strictEqual(units.length, unitOptions.length);

          unitOptions.forEach((key, i) =>
            assert.dom(units[i]).containsText(t(key))
          );
        } else {
          assert.dom(selectors.valueUnit).doesNotExist();
        }
      }
    );

    test('hovering the ENTER_TEXT info icon shows the tooltip', async function (assert) {
      this.step.action = ScenarioStepAction.ENTER_TEXT;

      await render(TEMPLATE);

      await triggerEvent(find(selectors.enterInputInfoTooltip), 'mouseenter');

      assert
        .dom('[data-test-ak-tooltip-content]')
        .containsText(t('dastAutomation.enterInputTypeInfo'));
    });

    // ─── Action select options ────────────────────────────────────────────────

    test('action select lists all step action configs', async function (assert) {
      await render(TEMPLATE);

      const options = await getAllAkSelectOptions(selectors.actionSelect);

      assert.strictEqual(options.length, STEP_ACTION_CONFIGS.length);

      STEP_ACTION_CONFIGS.forEach((config, i) => {
        assert.dom(options[i]).containsText(t(config.label));
      });
    });

    test('selecting an action calls onActionChange with the step and config', async function (assert) {
      const checkConfig = STEP_ACTION_CONFIGS.find(
        (c) => c.action === ScenarioStepAction.CHECK
      );

      await render(TEMPLATE);

      await chooseAkSelectOption({
        selectTriggerClass: selectors.actionSelect,
        labelToSelect: t('dastAutomation.stepActions.check'),
      });

      assert.deepEqual(this.onActionChangedWith, [this.step, checkConfig]);
    });

    // ─── Field interactions ───────────────────────────────────────────────────

    test('typing into the identifier field calls clearStepError with identifier', async function (assert) {
      await render(TEMPLATE);

      await fillIn(find(selectors.identifier), 'element-id');

      assert.deepEqual(this.clearStepErrorCalledWith, [
        this.step,
        'identifier',
      ]);
    });

    test.each(
      'changing the value field calls clearStepError for all action types',
      [
        [ScenarioStepAction.TAP, 'input', '5', null],
        [ScenarioStepAction.SELECT, 'input', 'new-text', null],
        [ScenarioStepAction.ENTER_TEXT, 'input', 'some-input', null],
        [
          ScenarioStepAction.CHECK,
          'select',
          null,
          'dastAutomation.checkOptions.unchecked',
        ],
        [ScenarioStepAction.WAIT, 'input', '3', null],
        [ScenarioStepAction.LONG_PRESS, 'input', '100', null],
        [
          ScenarioStepAction.SWIPE,
          'select',
          null,
          'dastAutomation.directions.down',
        ],
      ],
      async function (assert, [action, inputType, inputValue, selectLabel]) {
        this.step.action = action;

        await render(TEMPLATE);

        if (inputType === 'input') {
          const valueField = find(selectors.value);
          await fillIn(valueField, inputValue);
        } else {
          await chooseAkSelectOption({
            selectTriggerClass: selectors.value,
            labelToSelect: t(selectLabel),
          });
        }

        assert.deepEqual(this.clearStepErrorCalledWith, [this.step, 'value']);
      }
    );

    // ─── Secure text focus / blur ─────────────────────────────────────────────

    test('focusing a secure ENTER_TEXT field clears the value and calls clearStepError', async function (assert) {
      const store = this.owner.lookup('service:store');

      const stepRecord = this.server.create('scenario-step', {
        action: ScenarioStepAction.ENTER_TEXT,
        is_secure: true,
      });

      const step = store.push(
        store.normalize('scenario-step', stepRecord.toJSON())
      );

      this.setProperties({ step, dnd: makeDndMock([step, step]) });

      await render(TEMPLATE);

      await triggerEvent(find(selectors.value), 'focus');

      assert.dom(selectors.value).hasValue('');
      assert.false(this.step.isSecure);
      assert.deepEqual(this.clearStepErrorCalledWith, [this.step, 'value']);
    });

    test('blurring a secure ENTER_TEXT field while empty restores the original value', async function (assert) {
      const store = this.owner.lookup('service:store');

      const stepRecord = this.server.create('scenario-step', {
        action: ScenarioStepAction.ENTER_TEXT,
        is_secure: true,
      });

      const step = store.push(
        store.normalize('scenario-step', stepRecord.toJSON())
      );

      this.setProperties({ step, dnd: makeDndMock([step, step]) });

      await render(TEMPLATE);

      assert.dom(selectors.value).hasValue(this.step.value);

      await triggerEvent(find(selectors.value), 'focus');
      await triggerEvent(find(selectors.value), 'blur');

      assert.dom(selectors.value).hasValue(this.step.value);
      assert.true(this.step.isSecure);
    });

    test('blurring a secure ENTER_TEXT field after typing keeps the new value', async function (assert) {
      const store = this.owner.lookup('service:store');

      const stepRecord = this.server.create('scenario-step', {
        action: ScenarioStepAction.ENTER_TEXT,
        is_secure: true,
      });

      const step = store.push(
        store.normalize('scenario-step', stepRecord.toJSON())
      );

      this.setProperties({ step, dnd: makeDndMock([step, step]) });

      await render(TEMPLATE);

      assert.dom(selectors.value).hasValue(this.step.value);

      await triggerEvent(find(selectors.value), 'focus');
      await fillIn(find(selectors.value), 'new-password');
      await triggerEvent(find(selectors.value), 'blur');

      assert.dom(selectors.value).hasValue('new-password');
      assert.false(this.step.isSecure);
    });

    // ─── Validation errors ────────────────────────────────────────────────────

    test.each(
      'shows correct error icon count and tooltip message per validation error',
      [
        {
          errors: {
            identifier: 'dastAutomation.validation.identifierRequired',
          },
          expectedCount: 1,
          tooltipKeys: ['dastAutomation.validation.identifierRequired'],
        },
        {
          errors: { value: 'dastAutomation.validation.valueRequired' },
          expectedCount: 1,
          tooltipKeys: ['dastAutomation.validation.valueRequired'],
        },
        {
          errors: {
            identifier: 'dastAutomation.validation.identifierRequired',
            value: 'dastAutomation.validation.valueRequired',
          },
          expectedCount: 2,
          tooltipKeys: [
            'dastAutomation.validation.identifierRequired',
            'dastAutomation.validation.valueRequired',
          ],
        },
      ],
      async function (assert, { errors, expectedCount, tooltipKeys }) {
        this.set('stepErrors', new Map([[this.step, errors]]));

        await render(TEMPLATE);

        assert.dom(selectors.inputError).exists({ count: expectedCount });

        const errorWrappers = findAll(selectors.inputError);

        for (let i = 0; i < errorWrappers.length; i++) {
          await triggerEvent(
            errorWrappers[i].querySelector(selectors.inputErrorIcon),
            'mouseenter'
          );

          assert
            .dom(selectors.inputErrorTooltipContent, errorWrappers[i])
            .containsText(t(tooltipKeys[i]));
        }
      }
    );

    // ─── Step masking ─────────────────────────────────────────────────────────

    test('clicking the lock button masks the step and shows a success notification', async function (assert) {
      this.owner.register('service:notifications', NotificationsStub);

      const store = this.owner.lookup('service:store');

      const projectRecord = this.server.create('project');
      store.push(store.normalize('project', projectRecord.toJSON()));

      const stepRecord = this.server.create('scenario-step', {
        action: ScenarioStepAction.ENTER_TEXT,
        is_secure: false,
      });

      const step = store.push(
        store.normalize('scenario-step', stepRecord.toJSON())
      );

      const scenarioRecord = this.server.create('scenario-detail', { type: 1 });
      const scenarioJSON = scenarioRecord.toJSON();

      scenarioJSON.project = projectRecord.id;

      const scenarioDetail = store.push(
        store.normalize('scenario-detail', scenarioJSON)
      );

      const SECRET_VALUE = '***********';

      this.server.patch(
        '/v2/projects/:projectId/scenarios/:scenarioId/steps/:stepId',
        () => ({
          ...stepRecord.toJSON(),
          is_secure: true,
          value: SECRET_VALUE,
        })
      );

      this.setProperties({
        step,
        scenarioDetail,
        dnd: makeDndMock([step, step]),
      });

      await render(TEMPLATE);

      assert.false(this.step.isSecure);
      assert.dom(selectors.value).hasValue(this.step.value);

      await click(selectors.rowLockBtn);

      assert.true(this.step.isSecure);
      assert.dom(selectors.value).hasValue(SECRET_VALUE);

      const notifications = this.owner.lookup('service:notifications');

      assert.strictEqual(
        notifications.successMsg,
        t('dastAutomation.stepMaskedSuccessfully')
      );
    });

    test('a maskStep API error shows an error notification', async function (assert) {
      this.owner.register('service:notifications', NotificationsStub);

      const store = this.owner.lookup('service:store');

      const projectRecord = this.server.create('project');
      store.push(store.normalize('project', projectRecord.toJSON()));

      const stepRecord = this.server.create('scenario-step', {
        action: ScenarioStepAction.ENTER_TEXT,
        is_secure: false,
      });

      const step = store.push(
        store.normalize('scenario-step', stepRecord.toJSON())
      );

      const scenarioRecord = this.server.create('scenario-detail', { type: 1 });
      const scenarioJSON = scenarioRecord.toJSON();

      scenarioJSON.project = projectRecord.id;

      const ERROR_MESSAGE = 'Bad Request';

      const scenarioDetail = store.push(
        store.normalize('scenario-detail', scenarioJSON)
      );

      this.server.patch(
        '/v2/projects/:projectId/scenarios/:scenarioId/steps/:stepId',
        () => new Response(400, {}, { error: ERROR_MESSAGE })
      );

      this.setProperties({
        step,
        scenarioDetail,
        dnd: makeDndMock([step, step]),
      });

      await render(TEMPLATE);

      assert.false(this.step.isSecure);
      assert.dom(selectors.value).hasValue(this.step.value);

      await click(selectors.rowLockBtn);

      const notifications = this.owner.lookup('service:notifications');

      assert.strictEqual(notifications.errorMsg, ERROR_MESSAGE);
      assert.false(this.step.isSecure);
      assert.dom(selectors.value).hasValue(this.step.value);
    });
  }
);
