import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';

import {
  click,
  fillIn,
  find,
  findAll,
  render,
  settled,
  triggerEvent,
} from '@ember/test-helpers';

import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import Service from '@ember/service';
import { Response } from 'miragejs';

import ENUMS from 'irene/enums';
import { ScenarioStepAction } from 'irene/models/scenario-step';

import {
  STEP_ACTION_CONFIGS,
  CHECK_OPTIONS,
  DIRECTION_OPTIONS,
  IOS_OTP_APPS,
  ANDROID_OTP_APPS,
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

  otpCodeFrom: '[data-test-dastAutomationScenario-stepsTable-rowOtpCodeFrom]',
  otpAppCustom: '[data-test-dastAutomationScenario-stepsTable-rowOtpAppCustom]',
  otpNote: '[data-test-dastAutomationScenario-stepsTable-rowOtpNote]',

  row: (index) =>
    `[data-test-dastAutomationScenario-stepsTable-row="${index}"]`,
};

/** Pushes an Enter OTP step (and optionally a scenario on a platform) into the store. */
function setupOtpStep(context, stepAttrs = {}, platform = null) {
  const store = context.owner.lookup('service:store');

  const stepRecord = context.server.create('scenario-step', {
    action: ScenarioStepAction.ENTER_OTP,
    identifier: 'Verification code',
    value: '',
    is_secure: false,
    metadata: { source: 'app' },
    ...stepAttrs,
  });

  const step = store.push(
    store.normalize('scenario-step', stepRecord.toJSON())
  );

  context.setProperties({ step, dnd: makeDndMock([step, step]) });

  if (platform !== null) {
    const projectRecord = context.server.create('project', { platform });
    store.push(store.normalize('project', projectRecord.toJSON()));

    const scenarioJSON = context.server
      .create('scenario-detail', { type: 1 })
      .toJSON();

    scenarioJSON.project = projectRecord.id;

    context.set(
      'scenarioDetail',
      store.push(store.normalize('scenario-detail', scenarioJSON))
    );
  }

  return step;
}

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

    // ─── Enter OTP ────────────────────────────────────────────────────────────

    test('ENTER_OTP renders Code from in the field column and an empty value cell', async function (assert) {
      assert.expect(6);

      setupOtpStep(this);

      await render(TEMPLATE);

      assert.dom(selectors.identifier).doesNotExist();

      assert
        .dom(findAkSelectTrigger(assert, selectors.otpCodeFrom))
        .containsText(t('dastAutomation.otpCodeFrom'));

      assert.dom(selectors.otpAppCustom).doesNotExist();
      assert.dom(selectors.otpNote).doesNotExist();
      assert.dom(selectors.value).doesNotExist();
      assert.deepEqual(this.step.metadata, { source: 'app' });
    });

    test.each(
      'ENTER_OTP Code from lists the platform apps, then Other app, then Authenticator key',
      [
        [ENUMS.PLATFORM.IOS, IOS_OTP_APPS],
        [ENUMS.PLATFORM.ANDROID, ANDROID_OTP_APPS],
      ],
      async function (assert, [platform, apps]) {
        setupOtpStep(this, {}, platform);

        await render(TEMPLATE);

        const options = await getAllAkSelectOptions(selectors.otpCodeFrom);

        assert.strictEqual(options.length, apps.length + 2);

        apps.forEach((app, i) => assert.dom(options[i]).hasText(app.label));

        assert
          .dom(options[apps.length])
          .hasText(t('dastAutomation.otpApps.other'));

        assert
          .dom(options[apps.length + 1])
          .hasText(t('dastAutomation.otpSources.authenticatorKey'));
      }
    );

    test('ENTER_OTP picking an app stores its bundle id as the value', async function (assert) {
      setupOtpStep(this, {}, ENUMS.PLATFORM.IOS);

      await render(TEMPLATE);

      await chooseAkSelectOption({
        selectTriggerClass: selectors.otpCodeFrom,
        optionIndex: 0,
      });

      assert.strictEqual(this.step.value, IOS_OTP_APPS[0].value);
      assert.false(this.step.isSecure);
      assert.deepEqual(this.step.metadata, { source: 'app' });
      assert.deepEqual(this.clearStepErrorCalledWith, [this.step, 'value']);

      await assertAkSelectOptionSelected({
        assert,
        selector: selectors.otpCodeFrom,
        label: IOS_OTP_APPS[0].label,
      });

      assert.dom(selectors.otpNote).exists().hasValue('');
      assert.dom(selectors.otpAppCustom).doesNotExist();
      assert.dom(selectors.value).doesNotExist();
    });

    test('ENTER_OTP instructions are stored in metadata.note and omitted when empty', async function (assert) {
      setupOtpStep(
        this,
        { value: 'com.apple.MobileSMS', metadata: { source: 'app', extra: 1 } },
        ENUMS.PLATFORM.IOS
      );

      await render(TEMPLATE);

      await fillIn(selectors.otpNote, 'Open the AuthLab entry');

      assert.deepEqual(this.step.metadata, {
        source: 'app',
        extra: 1,
        note: 'Open the AuthLab entry',
      });

      assert.strictEqual(this.step.value, 'com.apple.MobileSMS');
      assert.deepEqual(this.clearStepErrorCalledWith, [this.step, 'value']);

      await fillIn(selectors.otpNote, '');

      assert.deepEqual(this.step.metadata, { source: 'app', extra: 1 });
    });

    test('ENTER_OTP a saved app step shows its instructions', async function (assert) {
      setupOtpStep(
        this,
        {
          value: 'com.apple.MobileSMS',
          metadata: { source: 'app', note: 'Open the AuthLab entry' },
        },
        ENUMS.PLATFORM.IOS
      );

      await render(TEMPLATE);

      assert.dom(selectors.otpNote).hasValue('Open the AuthLab entry');
    });

    test('ENTER_OTP choosing Other app shows a text field for a custom app id', async function (assert) {
      setupOtpStep(this, { value: 'com.apple.MobileSMS' }, ENUMS.PLATFORM.IOS);

      await render(TEMPLATE);

      assert.dom(selectors.otpAppCustom).doesNotExist();

      await chooseAkSelectOption({
        selectTriggerClass: selectors.otpCodeFrom,
        labelToSelect: t('dastAutomation.otpApps.other'),
      });

      assert.dom(selectors.otpAppCustom).exists().hasValue('');
      assert.dom(selectors.otpNote).doesNotExist();
      assert.strictEqual(this.step.value, '');
      assert.deepEqual(this.step.metadata, { source: 'app' });

      await fillIn(selectors.otpAppCustom, 'com.example.mail');

      assert.strictEqual(this.step.value, 'com.example.mail');
      assert.dom(selectors.otpAppCustom).exists();
    });

    test('ENTER_OTP with an unknown saved app id shows Other app with the id prefilled', async function (assert) {
      setupOtpStep(this, { value: 'com.example.mail' }, ENUMS.PLATFORM.IOS);

      await render(TEMPLATE);

      await assertAkSelectOptionSelected({
        assert,
        selector: selectors.otpCodeFrom,
        label: t('dastAutomation.otpApps.other'),
      });

      assert.dom(selectors.otpAppCustom).hasValue('com.example.mail');
    });

    test('ENTER_OTP a saved key step shows Authenticator key with the masked value', async function (assert) {
      setupOtpStep(this, {
        value: '************',
        is_secure: true,
        metadata: { source: 'authenticator_key' },
      });

      await render(TEMPLATE);

      await assertAkSelectOptionSelected({
        assert,
        selector: selectors.otpCodeFrom,
        label: t('dastAutomation.otpSources.authenticatorKey'),
      });

      assert
        .dom(selectors.value)
        .hasAttribute('type', 'password')
        .hasValue('************');

      await triggerEvent(selectors.value, 'focus');

      assert.dom(selectors.value).hasValue('');

      await triggerEvent(selectors.value, 'blur');

      assert.strictEqual(this.step.value, '************');
      assert.true(this.step.isSecure);
    });

    test('ENTER_OTP switching between app and key clears value and note, toggles is_secure and keeps other metadata', async function (assert) {
      setupOtpStep(this, {
        value: 'com.apple.MobileSMS',
        metadata: { source: 'app', note: 'Open the AuthLab entry', extra: 1 },
      });

      await render(TEMPLATE);

      await chooseAkSelectOption({
        selectTriggerClass: selectors.otpCodeFrom,
        labelToSelect: t('dastAutomation.otpSources.authenticatorKey'),
      });

      assert.strictEqual(this.step.value, '');
      assert.true(this.step.isSecure);

      assert.deepEqual(this.step.metadata, {
        source: 'authenticator_key',
        extra: 1,
      });

      assert.dom(selectors.otpNote).doesNotExist();
      assert.dom(selectors.otpAppCustom).doesNotExist();
      assert.dom(selectors.value).hasAttribute('type', 'password').hasValue('');

      await fillIn(selectors.value, 'GEZDGNBVGY3TQOJQ');

      assert.strictEqual(this.step.value, 'GEZDGNBVGY3TQOJQ');
      assert.true(this.step.isSecure);

      await chooseAkSelectOption({
        selectTriggerClass: selectors.otpCodeFrom,
        labelToSelect: t('dastAutomation.otpApps.other'),
      });

      assert.strictEqual(this.step.value, '');
      assert.false(this.step.isSecure);
      assert.deepEqual(this.step.metadata, { source: 'app', extra: 1 });

      assert.dom(selectors.value).doesNotExist();
      assert.dom(selectors.otpAppCustom).exists().hasValue('');
    });

    test('ENTER_OTP shows a missing selection error on Code from and a note error on the instructions', async function (assert) {
      setupOtpStep(this, {}, ENUMS.PLATFORM.IOS);

      this.set(
        'stepErrors',
        new Map([
          [this.step, { value: 'dastAutomation.validation.valueRequired' }],
        ])
      );

      await render(TEMPLATE);

      assert
        .dom(selectors.inputError)
        .exists({ count: 1 })
        .hasAttribute('data-test-dastAutomationScenario-stepsTable-inputError');

      assert.dom(selectors.otpNote).doesNotExist();

      this.step.value = IOS_OTP_APPS[0].value;

      this.set(
        'stepErrors',
        new Map([
          [this.step, { value: 'dastAutomation.validation.otpNoteTooLong' }],
        ])
      );

      await triggerEvent(
        find(selectors.inputError).querySelector(selectors.inputErrorIcon),
        'mouseenter'
      );

      assert
        .dom(selectors.inputErrorTooltipContent)
        .containsText(t('dastAutomation.validation.otpNoteTooLong'));

      assert.dom(selectors.otpNote).exists();
    });

    test('ENTER_OTP disables every control when isReadOnly', async function (assert) {
      assert.expect(3);

      setupOtpStep(this, { value: 'com.example.mail' });
      this.set('isReadOnly', true);

      await render(TEMPLATE);

      assert
        .dom(findAkSelectTrigger(assert, selectors.otpCodeFrom))
        .hasAria('disabled', 'true');

      assert.dom(selectors.otpAppCustom).isDisabled();

      this.step.value = '';
      this.step.metadata = { source: 'authenticator_key' };

      await settled();

      assert.dom(selectors.value).isDisabled();
    });

    test('hovering the ENTER_OTP info icon shows the OTP tooltip', async function (assert) {
      setupOtpStep(this);

      await render(TEMPLATE);

      await triggerEvent(find(selectors.enterInputInfoTooltip), 'mouseenter');

      assert
        .dom('[data-test-ak-tooltip-content]')
        .containsText(t('dastAutomation.enterOtpInfo'));
    });
  }
);
