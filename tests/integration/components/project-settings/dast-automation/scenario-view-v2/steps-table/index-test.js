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

import { ScenarioStepAction } from 'irene/models/scenario-step';
import { STEP_ACTION_CONFIGS } from 'irene/components/project-settings/dast-automation/scenario-view-v2/steps-table/step-actions';
import { MAX_STEPS } from 'irene/components/project-settings/dast-automation/scenario-view-v2/steps-table/index';
import { MAX_LOGIN_ROLES } from 'irene/components/project-settings/dast-automation/scenario-view-v2/index';
import { chooseAkSelectOption } from 'irene/tests/helpers/mirage-utils';

// ─── Selectors ───────────────────────────────────────────────────────────────

const selectors = {
  root: '[data-test-dastAutomationScenario-stepsTable-root]',
  roleName: '[data-test-dastAutomationScenario-stepsTable-roleName]',

  editRoleNameBtn:
    '[data-test-dastAutomationScenario-stepsTable-editRoleNameBtn]',

  roleNameInput: '[data-test-dastAutomationScenario-stepsTable-roleNameInput]',

  cancelRoleNameBtn:
    '[data-test-dastAutomationScenario-stepsTable-cancelRoleNameBtn]',

  confirmRoleNameBtn:
    '[data-test-dastAutomationScenario-stepsTable-confirmRoleNameBtn]',

  deleteRoleBtn: '[data-test-dastAutomationScenario-stepsTable-deleteRoleBtn]',

  header: '[data-test-dastAutomationScenario-stepsTable-header]',
  addStepsBtn: '[data-test-dastAutomationScenario-stepsTable-addStepsBtn]',

  newUserRoleBtn:
    '[data-test-dastAutomationScenario-stepsTable-newUserRoleBtn]',

  newUserRoleTooltip:
    '[data-test-dastAutomationScenario-stepsTable-newUserRoleTooltip]',

  addStepsPopover:
    '[data-test-dastAutomationScenario-stepsTable-addStepsPopover]',

  addStepsPopoverItem: (label) =>
    `[data-test-dastAutomationScenario-stepsTable-addStepsPopoverItem="${label}"]`,

  allPopoverItems:
    '[data-test-dastAutomationScenario-stepsTable-addStepsPopoverItem]',

  confirmBoxConfirmBtn: '[data-test-confirmbox-confirmBtn]',
  confirmBoxCancelBtn: '[data-test-confirmbox-cancelBtn]',
  tooltipContent: '[data-test-ak-tooltip-content]',

  allRows: '[data-test-dastAutomationScenario-stepsTable-row]',
  row: (index) =>
    `[data-test-dastAutomationScenario-stepsTable-row="${index}"]`,

  rowOrder: '[data-test-dastAutomationScenario-stepsTable-rowOrder]',

  rowDragHandle: (index) =>
    `[data-test-dastAutomationScenario-stepsTable-row="${index}"] [data-test-dastAutomationScenario-stepsTable-rowDragHandle]`,

  rowDeleteBtn: '[data-test-dastAutomationScenario-stepsTable-rowDeleteBtn]',

  rowActionSelect:
    '[data-test-dastAutomationScenario-stepsTable-rowActionSelect]',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function pushRecord(store, modelName, mirageRecord) {
  return store.push(store.normalize(modelName, mirageRecord.toJSON()));
}

// ─── Template ────────────────────────────────────────────────────────────────

const TEMPLATE = hbs`
  <ProjectSettings::DastAutomation::ScenarioViewV2::StepsTable
    @userRole={{this.userRole}}
    @steps={{this.steps}}
    @scenarioDetail={{this.scenarioDetail}}
    @isReadOnly={{this.isReadOnly}}
    @isLastRole={{this.isLastRole}}
    @activeSampleIndex={{this.activeSampleIndex}}
    @stepErrors={{this.stepErrors}}
    @canAddRole={{this.canAddRole}}
    @onAddRole={{this.onAddRole}}
    @onDeleteRole={{this.onDeleteRole}}
    @onStepsChange={{this.onStepsChange}}
    @clearStepError={{this.clearStepError}}
  />
`;

// ─── Test suite ──────────────────────────────────────────────────────────────

module(
  'Integration | Component | project-settings/dast-automation/scenario-view-v2/steps-table',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en');

    hooks.beforeEach(async function () {
      const store = this.owner.lookup('service:store');

      const scenarioDetail = pushRecord(
        store,
        'scenario-detail',
        this.server.create('scenario-detail')
      );

      // step1 uses factory defaults (action=TAP, is_secure=false); only order is explicit
      const step1 = pushRecord(
        store,
        'scenario-step',
        this.server.create('scenario-step', { order: 1, is_secure: false })
      );

      // step2 sets SELECT so the two rows have distinct actions for action-change tests
      const step2 = pushRecord(
        store,
        'scenario-step',
        this.server.create('scenario-step', {
          order: 2,
          action: ScenarioStepAction.SELECT,
        })
      );

      this.setProperties({
        step1,
        step2,
        scenarioDetail,
        userRole: null,
        steps: [step1, step2],
        isReadOnly: false,
        isLastRole: false,
        activeSampleIndex: null,
        stepErrors: null,
        canAddRole: true,
        onAddRoleFired: false,
        onDeleteRoleCalledWith: null,
        onStepsChangedWith: null,
        clearStepErrorCalledWith: null,
        onAddRole: () => this.set('onAddRoleFired', true),
        onStepsChange: (steps) => this.set('onStepsChangedWith', steps),
        clearStepError: (step) => this.set('clearStepErrorCalledWith', step),
        onDeleteRole: (role) => this.set('onDeleteRoleCalledWith', role),
      });
    });

    // ─── Rendering ────────────────────────────────────────────────────────────────

    test('renders root without role section or table when there is no userRole and no steps', async function (assert) {
      this.set('steps', []);

      await render(TEMPLATE);

      assert.dom(selectors.root).exists();
      assert.dom(selectors.roleName).doesNotExist();
      assert.dom(selectors.deleteRoleBtn).doesNotExist();
      assert.dom(selectors.header).doesNotExist();

      assert.strictEqual(findAll(selectors.allRows).length, 0);

      assert.dom(selectors.addStepsBtn).containsText(t('steps'));
      assert.dom(selectors.addStepsBtn).isNotDisabled();
      assert.dom(selectors.newUserRoleBtn).doesNotExist();
    });

    test('renders table header with all column labels and one row per step', async function (assert) {
      // steps = [step1, step2] from beforeEach
      await render(TEMPLATE);

      assert.dom(selectors.roleName).doesNotExist();
      assert.dom(selectors.header).exists();
      assert.dom(selectors.header).containsText(t('order'));
      assert.dom(selectors.header).containsText(t('action'));

      assert
        .dom(selectors.header)
        .containsText(t('dastAutomation.tableHeaders.onButtonField'));

      assert
        .dom(selectors.header)
        .containsText(t('dastAutomation.tableHeaders.inputOccurrenceValue'));

      const rows = findAll(selectors.allRows);

      assert.strictEqual(rows.length, 2);
      assert.dom(selectors.rowOrder, rows[0]).containsText('#1');
      assert.dom(selectors.rowOrder, rows[1]).containsText('#2');
    });

    test('renders role name section in display mode when userRole is provided', async function (assert) {
      const store = this.owner.lookup('service:store');

      const userRole = pushRecord(
        store,
        'scenario-user-role',
        this.server.create('scenario-user-role')
      );

      this.setProperties({ userRole, steps: [] });

      await render(TEMPLATE);

      assert.dom(selectors.roleName).containsText(userRole.name);

      assert.dom(selectors.editRoleNameBtn).isNotDisabled();

      assert
        .dom(`${selectors.editRoleNameBtn} [data-test-ak-icon]`)
        .hasAttribute('icon', /edit/);

      assert.dom(selectors.deleteRoleBtn).exists();

      assert
        .dom(`${selectors.deleteRoleBtn} [data-test-ak-icon]`)
        .hasAttribute('icon', /delete/);

      assert.dom(selectors.roleNameInput).doesNotExist();
      assert.dom(selectors.cancelRoleNameBtn).doesNotExist();
      assert.dom(selectors.confirmRoleNameBtn).doesNotExist();
      assert.dom(selectors.header).doesNotExist();
    });

    test('renders both role name section and table when userRole and steps are present', async function (assert) {
      const store = this.owner.lookup('service:store');

      const userRole = pushRecord(
        store,
        'scenario-user-role',
        this.server.create('scenario-user-role')
      );

      this.set('userRole', userRole);

      await render(TEMPLATE);

      assert.dom(selectors.roleName).containsText(userRole.name);
      assert.dom(selectors.header).exists();
      assert.strictEqual(findAll(selectors.allRows).length, 2);
    });

    // ─── Read-only state ──────────────────────────────────────────────────────────

    test('disables edit, delete role, and add steps buttons when isReadOnly with a userRole', async function (assert) {
      const store = this.owner.lookup('service:store');

      const userRole = pushRecord(
        store,
        'scenario-user-role',
        this.server.create('scenario-user-role')
      );

      this.setProperties({ userRole, isReadOnly: true });

      await render(TEMPLATE);

      assert.dom(selectors.editRoleNameBtn).isDisabled();
      assert.dom(selectors.deleteRoleBtn).isDisabled();
      assert.dom(selectors.addStepsBtn).isDisabled();
    });

    test('disables only the add steps button when isReadOnly and no userRole', async function (assert) {
      this.setProperties({ isReadOnly: true, steps: [] });

      await render(TEMPLATE);

      assert.dom(selectors.roleName).doesNotExist();
      assert.dom(selectors.addStepsBtn).isDisabled();
    });

    // ─── Role name editing ────────────────────────────────────────────────────────

    test('clicking edit shows input pre-filled with role name and hides the display elements', async function (assert) {
      const store = this.owner.lookup('service:store');

      const userRole = pushRecord(
        store,
        'scenario-user-role',
        this.server.create('scenario-user-role')
      );

      this.setProperties({ userRole, steps: [] });

      await render(TEMPLATE);

      // Pre: display mode
      assert.dom(selectors.roleName).containsText(userRole.name);
      assert.dom(selectors.editRoleNameBtn).exists();
      assert.dom(selectors.roleNameInput).doesNotExist();
      assert.dom(selectors.cancelRoleNameBtn).doesNotExist();
      assert.dom(selectors.confirmRoleNameBtn).doesNotExist();

      await click(selectors.editRoleNameBtn);

      // Post: editing mode
      assert.dom(selectors.roleNameInput).hasValue(userRole.name);

      assert
        .dom(`${selectors.cancelRoleNameBtn} [data-test-ak-icon]`)
        .hasAttribute('icon', /close/);

      assert
        .dom(`${selectors.confirmRoleNameBtn} [data-test-ak-icon]`)
        .hasAttribute('icon', /check/);

      assert.dom(selectors.roleName).doesNotExist();
      assert.dom(selectors.editRoleNameBtn).doesNotExist();
    });

    test('cancelling role name edit restores display mode with the original name unchanged', async function (assert) {
      const store = this.owner.lookup('service:store');

      const userRole = pushRecord(
        store,
        'scenario-user-role',
        this.server.create('scenario-user-role')
      );

      this.setProperties({ userRole, steps: [] });

      await render(TEMPLATE);

      await click(selectors.editRoleNameBtn);

      // Pre: editing, input shows factory-generated name
      assert.dom(selectors.roleNameInput).hasValue(userRole.name);

      await fillIn(find(selectors.roleNameInput), 'Changed Name');

      assert.dom(selectors.roleNameInput).hasValue('Changed Name');

      await click(selectors.cancelRoleNameBtn);

      // Post: display mode, original name unchanged
      assert.dom(selectors.roleName).containsText(userRole.name);
      assert.dom(selectors.roleNameInput).doesNotExist();
      assert.dom(selectors.cancelRoleNameBtn).doesNotExist();
      assert.dom(selectors.editRoleNameBtn).exists();
    });

    test('confirming role name edit updates the displayed name (trimmed) and exits editing mode', async function (assert) {
      const store = this.owner.lookup('service:store');

      const userRole = pushRecord(
        store,
        'scenario-user-role',
        this.server.create('scenario-user-role')
      );

      this.setProperties({ userRole, steps: [] });

      await render(TEMPLATE);

      await click(selectors.editRoleNameBtn);

      // Pre: editing, input shows factory-generated name
      assert.dom(selectors.roleNameInput).hasValue(userRole.name);

      await fillIn(find(selectors.roleNameInput), '  New Role Name  ');

      await click(selectors.confirmRoleNameBtn);

      // Post: display mode, name updated and trimmed
      assert.dom(selectors.roleName).containsText('New Role Name');
      assert.dom(selectors.roleNameInput).doesNotExist();
      assert.dom(selectors.editRoleNameBtn).exists();
    });

    test('confirming with whitespace-only input exits editing without changing the name', async function (assert) {
      const store = this.owner.lookup('service:store');

      const userRole = pushRecord(
        store,
        'scenario-user-role',
        this.server.create('scenario-user-role')
      );

      this.setProperties({ userRole, steps: [] });

      await render(TEMPLATE);

      await click(selectors.editRoleNameBtn);

      assert.dom(selectors.roleNameInput).hasValue(userRole.name);

      await fillIn(find(selectors.roleNameInput), '   ');

      await click(selectors.confirmRoleNameBtn);

      // Post: editing ends, original factory name preserved
      assert.dom(selectors.roleName).containsText(userRole.name);
      assert.dom(selectors.roleNameInput).doesNotExist();
      assert.dom(selectors.editRoleNameBtn).exists();
    });

    // ─── Delete role flow ─────────────────────────────────────────────────────────

    test('clicking the delete role button opens the confirm box with a delete action', async function (assert) {
      const store = this.owner.lookup('service:store');

      const userRole = pushRecord(
        store,
        'scenario-user-role',
        this.server.create('scenario-user-role')
      );

      this.setProperties({ userRole, steps: [] });

      await render(TEMPLATE);

      // Pre: confirm box absent
      assert.dom(selectors.confirmBoxConfirmBtn).doesNotExist();
      assert.dom(selectors.confirmBoxCancelBtn).doesNotExist();

      await click(selectors.deleteRoleBtn);

      // Post: confirm box visible with correct action label
      assert.dom(selectors.confirmBoxConfirmBtn).containsText(t('delete'));
      assert.dom(selectors.confirmBoxCancelBtn).exists();
    });

    test('cancelling the confirm box closes it without calling onDeleteRole', async function (assert) {
      const store = this.owner.lookup('service:store');

      const userRole = pushRecord(
        store,
        'scenario-user-role',
        this.server.create('scenario-user-role')
      );

      this.setProperties({ userRole, steps: [] });

      await render(TEMPLATE);

      await click(selectors.deleteRoleBtn);

      // Pre: confirm box open
      assert.dom(selectors.confirmBoxConfirmBtn).exists();

      await click(selectors.confirmBoxCancelBtn);

      // Post: confirm box gone, callback not called
      assert.dom(selectors.confirmBoxConfirmBtn).doesNotExist();
      assert.dom(selectors.confirmBoxCancelBtn).doesNotExist();
      assert.strictEqual(this.onDeleteRoleCalledWith, null);
    });

    test('confirming role deletion calls onDeleteRole with the role and closes the confirm box', async function (assert) {
      const store = this.owner.lookup('service:store');

      const userRole = pushRecord(
        store,
        'scenario-user-role',
        this.server.create('scenario-user-role')
      );

      this.setProperties({ userRole, steps: [] });

      await render(TEMPLATE);

      await click(selectors.deleteRoleBtn);

      // Pre: confirm box open, callback not yet fired
      assert.dom(selectors.confirmBoxConfirmBtn).exists();
      assert.strictEqual(this.onDeleteRoleCalledWith, null);

      await click(selectors.confirmBoxConfirmBtn);

      // Post: confirm box gone, onDeleteRole called with the correct role
      assert.dom(selectors.confirmBoxConfirmBtn).doesNotExist();
      assert.strictEqual(this.onDeleteRoleCalledWith, userRole);
    });

    // ─── Add steps button ─────────────────────────────────────────────────────────

    test('add steps button is enabled and labelled when step count is below the maximum', async function (assert) {
      // 2 steps from beforeEach (below MAX_STEPS)
      await render(TEMPLATE);

      assert.dom(selectors.addStepsBtn).containsText(t('steps'));
      assert.dom(selectors.addStepsBtn).isNotDisabled();
    });

    test('add steps button is disabled when step count reaches MAX_STEPS', async function (assert) {
      const store = this.owner.lookup('service:store');

      const maxSteps = Array.from({ length: MAX_STEPS }, (_, i) =>
        pushRecord(
          store,
          'scenario-step',
          this.server.create('scenario-step', { order: i + 1 })
        )
      );

      this.set('steps', maxSteps);

      await render(TEMPLATE);

      assert.dom(selectors.addStepsBtn).isDisabled();
    });

    test('add steps button is disabled when isReadOnly regardless of step count', async function (assert) {
      this.set('isReadOnly', true);

      await render(TEMPLATE);

      assert.dom(selectors.addStepsBtn).isDisabled();
    });

    // ─── AddStepsPopover ──────────────────────────────────────────────────────────

    test('clicking the add steps button opens the popover listing all step action items', async function (assert) {
      await render(TEMPLATE);

      // Pre: popover absent
      assert.dom(selectors.addStepsPopover).doesNotExist();

      await click(selectors.addStepsBtn);

      // Post: popover open with all action configs
      assert.dom(selectors.addStepsPopover).exists();

      assert.strictEqual(
        findAll(selectors.allPopoverItems).length,
        STEP_ACTION_CONFIGS.length
      );

      STEP_ACTION_CONFIGS.forEach((config) => {
        assert
          .dom(selectors.addStepsPopoverItem(config.label))
          .containsText(t(config.label));
      });
    });

    test('selecting a step type creates a new step with correct attributes, closes the popover, and notifies the parent', async function (assert) {
      //  Component already has 2 steps from beforeEach
      const tapConfig = STEP_ACTION_CONFIGS.find(
        (c) => c.action === ScenarioStepAction.TAP
      );

      await render(TEMPLATE);

      await click(selectors.addStepsBtn);

      // Pre: popover open, no onStepsChange yet
      assert.dom(selectors.addStepsPopover).exists();
      assert.strictEqual(this.onStepsChangedWith, null);

      await click(selectors.addStepsPopoverItem(tapConfig.label));

      // Post: popover closed, onStepsChange called with [step1, step2, newStep]
      assert.dom(selectors.addStepsPopover).doesNotExist();
      assert.strictEqual(this.onStepsChangedWith.length, 3);

      // 3rd step is the new step
      const newStep = this.onStepsChangedWith[2];

      assert.strictEqual(newStep.action, ScenarioStepAction.TAP);
      assert.strictEqual(newStep.order, 3);
      assert.strictEqual(newStep.identifier, '');
      assert.strictEqual(newStep.value, tapConfig.defaultValue);
      assert.false(newStep.isSecure);
    });

    // ─── New user role button ─────────────────────────────────────────────────────

    test('new user role button is absent when isLastRole is false', async function (assert) {
      // isLastRole = false from beforeEach
      await render(TEMPLATE);

      assert.dom(selectors.newUserRoleBtn).doesNotExist();
    });

    test('new user role button is visible and labelled correctly when isLastRole is true', async function (assert) {
      this.set('isLastRole', true);

      await render(TEMPLATE);

      assert.dom(selectors.newUserRoleBtn).exists();
      assert.dom(selectors.newUserRoleBtn).containsText(t('newUserRole'));
    });

    test('new user role button is enabled and shows no tooltip when canAddRole is true', async function (assert) {
      this.setProperties({ isLastRole: true, canAddRole: true });

      await render(TEMPLATE);

      assert.dom(selectors.newUserRoleBtn).isNotDisabled();

      await triggerEvent(find(selectors.newUserRoleTooltip), 'mouseenter');

      assert.dom(selectors.tooltipContent).doesNotExist();
    });

    test('new user role button is disabled with maxUserRolesReached tooltip when canAddRole is false', async function (assert) {
      this.setProperties({ isLastRole: true, canAddRole: false });

      await render(TEMPLATE);

      assert.dom(selectors.newUserRoleBtn).isDisabled();

      await triggerEvent(find(selectors.newUserRoleTooltip), 'mouseenter');

      assert
        .dom(selectors.tooltipContent)
        .containsText(
          t('dastAutomation.maxUserRolesReached', { maxRoles: MAX_LOGIN_ROLES })
        );
    });

    test('new user role button is disabled with addUserRoleDisabledReadOnly tooltip text when isReadOnly', async function (assert) {
      this.setProperties({
        isLastRole: true,
        canAddRole: true,
        isReadOnly: true,
      });

      await render(TEMPLATE);

      assert.dom(selectors.newUserRoleBtn).isDisabled();

      await triggerEvent(find(selectors.newUserRoleTooltip), 'mouseenter');

      assert
        .dom(selectors.tooltipContent)
        .containsText(t('dastAutomation.addUserRoleDisabledReadOnly'));
    });

    test('clicking the new user role button fires the onAddRole callback', async function (assert) {
      this.setProperties({ isLastRole: true, canAddRole: true });

      await render(TEMPLATE);

      // Pre: callback not yet fired
      assert.false(this.onAddRoleFired);

      await click(selectors.newUserRoleBtn);

      // Post: callback fired
      assert.true(this.onAddRoleFired);
    });

    // ─── deleteStep ───────────────────────────────────────────────────────────────

    test('delete step button is disabled when only one step remains', async function (assert) {
      this.set('steps', [this.step1]);

      await render(TEMPLATE);

      // Pre: single row visible and properly numbered
      const rows = findAll(selectors.allRows);

      assert.strictEqual(rows.length, 1);
      assert.dom(selectors.rowOrder, rows[0]).containsText('#1');

      // Delete button must be disabled — deleting the last step is not allowed
      assert.dom(`${selectors.row(0)} ${selectors.rowDeleteBtn}`).isDisabled();
    });

    test('deleting a step removes it, reassigns remaining orders, and notifies the parent via callbacks', async function (assert) {
      await render(TEMPLATE);

      // Pre: two rows, step1 at index 0 (#1), step2 at index 1 (#2)
      const rows = findAll(selectors.allRows);

      assert.strictEqual(rows.length, 2);
      assert.dom(selectors.rowOrder, rows[0]).containsText('#1');
      assert.dom(selectors.rowOrder, rows[1]).containsText('#2');

      assert.strictEqual(this.onStepsChangedWith, null);
      assert.strictEqual(this.clearStepErrorCalledWith, null);

      await click(`${selectors.row(0)} ${selectors.rowDeleteBtn}`);

      // Post: onStepsChange called with [step2], step2 re-numbered to 1, clearStepError called with deleted step
      assert.strictEqual(this.onStepsChangedWith.length, 1);
      assert.strictEqual(this.onStepsChangedWith[0], this.step2);
      assert.strictEqual(this.step2.order, 1);
      assert.strictEqual(this.clearStepErrorCalledWith, this.step1);
    });

    // ─── reorderSteps ─────────────────────────────────────────────────────────────

    test('drag-and-drop reorder reassigns step orders and notifies the parent with the new sequence', async function (assert) {
      await render(TEMPLATE);

      // Pre: step1 order=1, step2 order=2, no onStepsChange yet
      assert.strictEqual(this.step1.order, 1);
      assert.strictEqual(this.step2.order, 2);
      assert.strictEqual(this.onStepsChangedWith, null);

      // Drag row 0 (step1) onto row 1 (step2)
      await triggerEvent(find(selectors.rowDragHandle(0)), 'dragstart');
      await triggerEvent(find(selectors.row(1)), 'dragover');
      await triggerEvent(find(selectors.row(1)), 'drop');

      // Post: onStepsChange called with [step2, step1], orders updated
      assert.strictEqual(this.onStepsChangedWith[0], this.step2);
      assert.strictEqual(this.onStepsChangedWith[1], this.step1);
      assert.strictEqual(this.step2.order, 1);
      assert.strictEqual(this.step1.order, 2);
    });

    // ─── changeStepAction ─────────────────────────────────────────────────────────

    test('selecting a different action resets the step fields and calls clearStepError', async function (assert) {
      const selectConfig = STEP_ACTION_CONFIGS.find(
        (c) => c.action === ScenarioStepAction.SELECT
      );

      await render(TEMPLATE);

      // Pre: step1 has factory default TAP action, clearStepError not called
      assert.strictEqual(this.step1.action, ScenarioStepAction.TAP);
      assert.strictEqual(this.clearStepErrorCalledWith, null);

      await chooseAkSelectOption({
        selectTriggerClass: `${selectors.row(0)} ${selectors.rowActionSelect}`,
        labelToSelect: t(selectConfig.label),
      });

      // Post: step1 updated, fields reset, clearStepError called
      const expectedValue = selectConfig.defaultValue ?? '';

      assert.strictEqual(this.step1.action, ScenarioStepAction.SELECT);
      assert.strictEqual(this.step1.identifier, '');
      assert.strictEqual(this.step1.value, expectedValue);
      assert.false(this.step1.isSecure);
      assert.strictEqual(this.clearStepErrorCalledWith, this.step1);
    });

    test('selecting the same action leaves all step fields unchanged and does not call clearStepError', async function (assert) {
      const tapConfig = STEP_ACTION_CONFIGS.find(
        (c) => c.action === ScenarioStepAction.TAP
      );

      await render(TEMPLATE);

      // Capture factory-generated values before interaction
      const originalIdentifier = this.step1.identifier;
      const originalValue = this.step1.value;

      await chooseAkSelectOption({
        selectTriggerClass: `${selectors.row(0)} ${selectors.rowActionSelect}`,
        labelToSelect: t(tapConfig.label),
      });

      // Post: no fields changed, clearStepError not called
      assert.strictEqual(this.step1.action, ScenarioStepAction.TAP);
      assert.strictEqual(this.step1.identifier, originalIdentifier);
      assert.strictEqual(this.step1.value, originalValue);
      assert.strictEqual(this.clearStepErrorCalledWith, null);
    });
  }
);
