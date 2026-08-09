import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import {
  click,
  fillIn,
  find,
  findAll,
  render,
  triggerEvent,
  waitFor,
  waitUntil,
} from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { Response } from 'miragejs';
import Service from '@ember/service';
import { ScenarioStepAction } from 'irene/models/scenario-step';
import { MAX_LOGIN_ROLES } from 'irene/components/project-settings/dast-automation/scenario-view-v2/index';

// ScenarioType: LOGIN = 0, OTHER = 1
const LOGIN = 0;
const OTHER = 1;

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
  emptyContainer: '[data-test-dastAutomationScenario-stepsTable-empty]',
  emptyTitle: '[data-test-dastAutomationScenario-stepsTable-emptyTitle]',
  emptyDesc: '[data-test-dastAutomationScenario-stepsTable-emptyDesc]',
  emptyAddBtn: '[data-test-dastAutomationScenario-stepsTable-emptyAddStepsBtn]',
  stepsTableRoot: '[data-test-dastAutomationScenario-stepsTable-root]',
  footer: '[data-test-dastAutomationScenario-footer]',
  saveBtn: '[data-test-dastAutomationScenario-footer-saveBtn]',
  cancelBtn: '[data-test-dastAutomationScenario-footer-cancelBtn]',
  roleName: '[data-test-dastAutomationScenario-stepsTable-roleName]',

  identifierInput:
    '[data-test-dastAutomationScenario-stepsTable-rowIdentifier]',
  valueInput: '[data-test-dastAutomationScenario-stepsTable-rowValue]',

  deleteRoleBtn: '[data-test-dastAutomationScenario-stepsTable-deleteRoleBtn]',
  editRoleNameBtn:
    '[data-test-dastAutomationScenario-stepsTable-editRoleNameBtn]',
  roleNameInput: '[data-test-dastAutomationScenario-stepsTable-roleNameInput]',
  cancelRoleNameBtn:
    '[data-test-dastAutomationScenario-stepsTable-cancelRoleNameBtn]',
  confirmRoleNameBtn:
    '[data-test-dastAutomationScenario-stepsTable-confirmRoleNameBtn]',
  newUserRoleBtn:
    '[data-test-dastAutomationScenario-stepsTable-newUserRoleBtn]',
  newUserRoleTooltip:
    '[data-test-dastAutomationScenario-stepsTable-newUserRoleTooltip]',
  addStepsPopover:
    '[data-test-dastAutomationScenario-stepsTable-addStepsPopover]',
  addStepsPopoverItem: (label) =>
    `[data-test-dastAutomationScenario-stepsTable-addStepsPopoverItem="${label}"]`,
  inputError: '[data-test-dastAutomationScenario-stepsTable-inputError]',
  inputErrorTooltipContent:
    '[data-test-dastAutomationScenario-stepsTable-inputErrorTooltipContent]',

  confirmBoxConfirmBtn: '[data-test-confirmbox-confirmBtn]',
  confirmBoxCancelBtn: '[data-test-confirmbox-cancelBtn]',
};

// ─── Template ────────────────────────────────────────────────────────────────

const TEMPLATE = hbs`
  <ProjectSettings::DastAutomation::ScenarioViewV2
    @project={{this.project}}
    @scenarioDetail={{this.scenarioDetail}}
  />
`;

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Normalizes and pushes a scenario-detail Mirage record into the Ember store.
 * Accepts optional Mirage role and step records to embed as nested JSON.
 */
function pushScenarioDetail(store, sdRecord, { roles = [], steps = [] } = {}) {
  const sdJson = sdRecord.toJSON();

  if (roles.length) {
    sdJson.roles = roles.map((r) => r.toJSON());
  }

  if (steps.length) {
    sdJson.steps = steps.map((s) => s.toJSON());
  }

  return store.push(store.normalize('scenario-detail', sdJson));
}

// ─── Test suite ──────────────────────────────────────────────────────────────

module(
  'Integration | Component | project-settings/dast-automation/scenario-view-v2',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en');

    hooks.beforeEach(async function () {
      this.owner.register('service:notifications', NotificationsStub);

      const store = this.owner.lookup('service:store');
      const projectRecord = this.server.create('project');
      const project = store.push(
        store.normalize('project', projectRecord.toJSON())
      );

      this.setProperties({ project, store });
    });

    // ─── Empty states ─────────────────────────────────────────────────────────

    test('shows empty container with title, description, and add-steps button for OTHER type with no steps', async function (assert) {
      const sdRecord = this.server.create('scenario-detail', { type: OTHER });

      const scenarioDetail = pushScenarioDetail(this.store, sdRecord);

      this.set('scenarioDetail', scenarioDetail);
      await render(TEMPLATE);

      assert.dom(selectors.emptyContainer).exists();
      assert.dom(selectors.emptyTitle).containsText(t('noDataAvailable'));

      assert
        .dom(selectors.emptyDesc)
        .containsText(t('dastAutomation.noStepsAvailable'));

      assert.dom(selectors.emptyAddBtn).exists();
      assert.dom(selectors.footer).doesNotExist();
    });

    test('shows empty container for LOGIN type with no roles', async function (assert) {
      const sdRecord = this.server.create('scenario-detail', { type: LOGIN });

      const scenarioDetail = pushScenarioDetail(this.store, sdRecord);

      this.set('scenarioDetail', scenarioDetail);

      await render(TEMPLATE);

      assert.dom(selectors.emptyContainer).exists();
      assert.dom(selectors.footer).doesNotExist();
    });

    // ─── Empty-state AddStepsPopover ──────────────────────────────────────────

    test('selecting a step from the popover transitions OTHER scenario empty state to populated', async function (assert) {
      const sdRecord = this.server.create('scenario-detail', { type: OTHER });

      const scenarioDetail = pushScenarioDetail(this.store, sdRecord);

      this.set('scenarioDetail', scenarioDetail);

      await render(TEMPLATE);

      // ── Pre-state ──────────────────────────────────────────────────────────
      assert.dom(selectors.emptyContainer).exists();
      assert.dom(selectors.stepsTableRoot).doesNotExist();
      assert.dom(selectors.footer).doesNotExist();

      await click(selectors.emptyAddBtn);

      await click(
        selectors.addStepsPopoverItem('dastAutomation.stepActions.tap')
      );

      // ── Post-state ─────────────────────────────────────────────────────────
      assert.dom(selectors.emptyContainer).doesNotExist();
      assert.dom(selectors.stepsTableRoot).exists();
      assert.dom(selectors.footer).exists();
      assert.dom(selectors.saveBtn).isNotDisabled();
    });

    test('selecting a step from the empty-state popover on a LOGIN scenario auto-creates a role and exits empty state', async function (assert) {
      const sdRecord = this.server.create('scenario-detail', { type: LOGIN });
      const scenarioDetail = pushScenarioDetail(this.store, sdRecord);

      this.set('scenarioDetail', scenarioDetail);

      await render(TEMPLATE);

      // ── Pre-state ──────────────────────────────────────────────────────────
      assert.dom(selectors.emptyContainer).exists();
      assert.dom(selectors.stepsTableRoot).doesNotExist();
      assert.dom(selectors.footer).doesNotExist();

      await click(selectors.emptyAddBtn);

      await click(
        selectors.addStepsPopoverItem('dastAutomation.stepActions.tap')
      );

      // ── Post-state ─────────────────────────────────────────────────────────
      assert.dom(selectors.emptyContainer).doesNotExist();

      assert.strictEqual(
        findAll(selectors.roleName).length,
        1,
        'auto-creates one role'
      );

      assert.dom(selectors.stepsTableRoot).exists();
      assert.dom(selectors.footer).exists();
      assert.dom(selectors.saveBtn).isNotDisabled();
    });

    // ─── Populated states ─────────────────────────────────────────────────────

    test('shows steps table and footer with save disabled when OTHER type has steps', async function (assert) {
      const sdRecord = this.server.create('scenario-detail', { type: OTHER });

      const stepRecord = this.server.create('scenario-step', {
        action: ScenarioStepAction.TAP,
      });

      const scenarioDetail = pushScenarioDetail(this.store, sdRecord, {
        steps: [stepRecord],
      });

      this.set('scenarioDetail', scenarioDetail);

      await render(TEMPLATE);

      assert.dom(selectors.emptyContainer).doesNotExist();
      assert.dom(selectors.stepsTableRoot).exists();
      assert.dom(selectors.footer).exists();
      assert.dom(selectors.saveBtn).isDisabled();
      assert.dom(selectors.cancelBtn).exists();
    });

    test('shows one steps table per role for LOGIN type with roles', async function (assert) {
      const role1 = this.server.create('scenario-user-role');
      const role2 = this.server.create('scenario-user-role');

      const sdRecord = this.server.create('scenario-detail', { type: LOGIN });

      const scenarioDetail = pushScenarioDetail(this.store, sdRecord, {
        roles: [role1, role2],
      });

      this.set('scenarioDetail', scenarioDetail);

      await render(TEMPLATE);

      assert.dom(selectors.emptyContainer).doesNotExist();

      const roleNames = findAll(selectors.roleName);

      assert.strictEqual(roleNames.length, 2, 'renders one table per role');
      assert.dom(roleNames[0]).containsText(role1.name);
      assert.dom(roleNames[1]).containsText(role2.name);
    });

    // ─── Save flow (OTHER) ────────────────────────────────────────────────────

    test('dirtying a step enables the save button; save shows success and disables save', async function (assert) {
      const sdRecord = this.server.create('scenario-detail', { type: OTHER });

      const stepRecord = this.server.create('scenario-step', {
        action: ScenarioStepAction.TAP,
      });

      const scenarioDetail = pushScenarioDetail(this.store, sdRecord, {
        steps: [stepRecord],
      });

      this.set('scenarioDetail', scenarioDetail);

      this.server.put(
        '/v2/projects/:projectId/scenarios/:scenarioId/steps/bulk_update',
        (schema, request) => {
          return {
            id: request.params.scenarioId,
            type: OTHER,
            is_deleted: false,
            name: sdRecord.name,
            roles: [],
            steps: [
              {
                id: stepRecord.id,
                action: ScenarioStepAction.TAP,
                order: 1,
                identifier: 'new-id',
                value: '3',
                is_secure: false,
              },
            ],
          };
        }
      );

      await render(TEMPLATE);

      // ── Pre-state ──────────────────────────────────────────────────────────
      assert.dom(selectors.saveBtn).isDisabled();

      // Dirty the step
      await fillIn(find(selectors.identifierInput), 'new-id');
      await fillIn(find(selectors.valueInput), '3');

      // ── Post-dirty ─────────────────────────────────────────────────────────
      assert.dom(selectors.saveBtn).isNotDisabled();

      await click(selectors.saveBtn);

      const notify = this.owner.lookup('service:notifications');

      assert.strictEqual(
        notify.successMsg,
        t('dastAutomation.scenarioUpdated'),
        'shows save success notification'
      );

      assert.dom(selectors.saveBtn).isDisabled();
    });

    test('save button is loading and cancel is disabled while save is in progress', async function (assert) {
      const sdRecord = this.server.create('scenario-detail', { type: OTHER });

      const stepRecord = this.server.create('scenario-step', {
        action: ScenarioStepAction.TAP,
      });

      const scenarioDetail = pushScenarioDetail(this.store, sdRecord, {
        steps: [stepRecord],
      });

      this.set('scenarioDetail', scenarioDetail);

      this.server.put(
        '/v2/projects/:projectId/scenarios/:scenarioId/steps/bulk_update',
        () => ({
          id: sdRecord.id,
          type: OTHER,
          is_deleted: false,
          name: sdRecord.name,
          roles: [],
          steps: [
            {
              id: stepRecord.id,
              action: ScenarioStepAction.TAP,
              order: 1,
              identifier: 'new-id',
              value: '1',
              is_secure: false,
            },
          ],
        }),
        { timing: 200 }
      );

      await render(TEMPLATE);

      await fillIn(find(selectors.identifierInput), 'new-id');
      await fillIn(find(selectors.valueInput), '1');

      assert.dom(selectors.cancelBtn).isNotDisabled();

      click(selectors.saveBtn);

      await waitFor(`${selectors.cancelBtn}[disabled]`, { timeout: 300 });

      assert.dom(selectors.cancelBtn).isDisabled();

      await waitUntil(() => !find(`${selectors.cancelBtn}[disabled]`), {
        timeout: 500,
      });

      assert.dom(selectors.cancelBtn).isNotDisabled();
    });

    test('save API error shows error notification and keeps save button enabled', async function (assert) {
      const sdRecord = this.server.create('scenario-detail', { type: OTHER });

      const stepRecord = this.server.create('scenario-step', {
        action: ScenarioStepAction.TAP,
      });

      const scenarioDetail = pushScenarioDetail(this.store, sdRecord, {
        steps: [stepRecord],
      });

      this.set('scenarioDetail', scenarioDetail);

      this.server.put(
        '/v2/projects/:projectId/scenarios/:scenarioId/steps/bulk_update',
        () => new Response(500)
      );

      await render(TEMPLATE);

      await fillIn(find(selectors.identifierInput), 'new-id');
      await fillIn(find(selectors.valueInput), '1');

      await click(selectors.saveBtn);

      const notify = this.owner.lookup('service:notifications');

      assert.strictEqual(
        notify.errorMsg,
        'The backend responded with an error',
        'shows error notification'
      );

      assert.notOk(notify.successMsg, 'does not show success notification');

      assert.dom(selectors.saveBtn).isNotDisabled();
    });

    test('clicking save with an invalid step shows validation error and does not call the API', async function (assert) {
      const sdRecord = this.server.create('scenario-detail', { type: OTHER });

      const stepRecord = this.server.create('scenario-step', {
        action: ScenarioStepAction.TAP,
        identifier: 'btn',
        value: '1',
      });

      const scenarioDetail = pushScenarioDetail(this.store, sdRecord, {
        steps: [stepRecord],
      });

      this.set('scenarioDetail', scenarioDetail);

      let putCalled = false;

      this.server.put(
        '/v2/projects/:projectId/scenarios/:scenarioId/steps/bulk_update',
        () => {
          putCalled = true;

          return new Response(200, {}, {});
        }
      );

      await render(TEMPLATE);

      // Clear identifier to make the step dirty with an invalid empty value
      await fillIn(find(selectors.identifierInput), '');

      assert.dom(selectors.saveBtn).isNotDisabled();

      await click(selectors.saveBtn);

      const notify = this.owner.lookup('service:notifications');

      assert.strictEqual(
        notify.errorMsg,
        t('dastAutomation.validation.fixErrorsToSave'),
        'shows fixErrorsToSave error notification'
      );

      assert.false(putCalled, 'does not call the bulk update API');
      assert.dom(selectors.saveBtn).isNotDisabled();
    });

    // ─── Validation error display ─────────────────────────────────────────────

    test.each(
      'identifier errors surface with correct tooltip and clear on input',
      [
        ['', 'btn-fixed', 'dastAutomation.validation.identifierRequired'],
        [
          'a'.repeat(65),
          'btn-fixed',
          'dastAutomation.validation.identifierTooLong',
        ],
      ],
      async function (
        assert,
        [invalidValue, correctedValue, expectedErrorKey]
      ) {
        const sdRecord = this.server.create('scenario-detail', { type: OTHER });

        const stepRecord = this.server.create('scenario-step', {
          action: ScenarioStepAction.TAP,
          value: '1',
          is_secure: false,
        });

        const scenarioDetail = pushScenarioDetail(this.store, sdRecord, {
          steps: [stepRecord],
        });

        this.set('scenarioDetail', scenarioDetail);

        await render(TEMPLATE);

        // ── Pre-state ────────────────────────────────────────────────────────
        assert.dom(selectors.inputError).doesNotExist();

        // Enter the invalid identifier (makes step dirty)
        await fillIn(find(selectors.identifierInput), invalidValue);

        await click(selectors.saveBtn);

        // ── After invalid save ───────────────────────────────────────────────
        await waitFor(selectors.inputError, { timeout: 500 });

        assert
          .dom(selectors.inputError)
          .exists('identifier error icon appears after save');

        // Hover the icon → tooltip content matches the expected error message
        await triggerEvent(
          find(`${selectors.inputError} [data-test-ak-tooltip-root]`),
          'mouseenter'
        );

        assert
          .dom(selectors.inputErrorTooltipContent)
          .containsText(t(expectedErrorKey));

        // Correct the identifier
        await fillIn(find(selectors.identifierInput), correctedValue);

        // ── After correction ─────────────────────────────────────────────────
        await waitUntil(() => !find(selectors.inputError), { timeout: 500 });

        assert
          .dom(selectors.inputError)
          .doesNotExist('identifier error icon clears on input');
      }
    );

    test.each(
      'value errors surface per action type with correct tooltip and clear on input',
      [
        // count valueKind, integerInRange validator (out-of-range max)
        [
          ScenarioStepAction.TAP,
          '1',
          '99',
          'dastAutomation.validation.tapValueRange',
        ],
        // duration valueKind, integerInRange validator (out-of-range max)
        [
          ScenarioStepAction.WAIT,
          '30',
          '99',
          'dastAutomation.validation.waitValueRange',
        ],
        // else branch (secure-text), required validator (empty value)
        [
          ScenarioStepAction.ENTER_TEXT,
          'some text',
          '',
          'dastAutomation.validation.valueRequired',
        ],
        // else branch (text), maxLength validator (over-length)
        [
          ScenarioStepAction.SELECT,
          'option',
          'a'.repeat(33),
          'dastAutomation.validation.selectTooLong',
        ],
      ],
      async function (
        assert,
        [action, initialValue, invalidValue, expectedErrorKey]
      ) {
        const sdRecord = this.server.create('scenario-detail', { type: OTHER });

        const stepRecord = this.server.create('scenario-step', {
          action,
          identifier: 'btn',
          value: initialValue,
          is_secure: false,
        });

        const scenarioDetail = pushScenarioDetail(this.store, sdRecord, {
          steps: [stepRecord],
        });

        this.set('scenarioDetail', scenarioDetail);

        await render(TEMPLATE);

        // ── Pre-state ────────────────────────────────────────────────────────
        assert.dom(selectors.inputError).doesNotExist();

        // Enter the invalid value (makes step dirty)
        await fillIn(find(selectors.valueInput), invalidValue);

        await click(selectors.saveBtn);

        // ── After invalid save ───────────────────────────────────────────────
        await waitFor(selectors.inputError, { timeout: 500 });

        assert
          .dom(selectors.inputError)
          .exists('value error icon appears after save');

        // Hover the icon → tooltip content matches the expected error message
        await triggerEvent(
          find(`${selectors.inputError} [data-test-ak-tooltip-root]`),
          'mouseenter'
        );

        assert
          .dom(selectors.inputErrorTooltipContent)
          .containsText(t(expectedErrorKey));

        // Correct the value
        await fillIn(find(selectors.valueInput), initialValue);

        // ── After correction ─────────────────────────────────────────────────
        await waitUntil(() => !find(selectors.inputError), { timeout: 500 });

        assert
          .dom(selectors.inputError)
          .doesNotExist('value error icon clears on input');
      }
    );

    // ─── Save flow (LOGIN) ────────────────────────────────────────────────────

    test('save for LOGIN type calls bulkCreateRoles and bulkUpdateRoleSteps and shows success', async function (assert) {
      const sdRecord = this.server.create('scenario-detail', { type: LOGIN });

      const scenarioDetail = pushScenarioDetail(this.store, sdRecord);

      this.set('scenarioDetail', scenarioDetail);

      let bulkCreateCalled = false;
      let bulkUpdateStepsCalled = false;

      this.server.post(
        '/v2/projects/:projectId/scenarios/:scenarioId/role/bulk_create',
        (schema, request) => {
          bulkCreateCalled = true;
          const body = JSON.parse(request.requestBody);

          return body.roles.map((r, i) => ({
            id: `created-role-${i + 1}`,
            name: r.name,
          }));
        }
      );

      this.server.put(
        '/v2/projects/:projectId/scenarios/:scenarioId/role/:roleId/steps/bulk_update',
        (schema, request) => {
          bulkUpdateStepsCalled = true;

          return {
            id: sdRecord.id,
            type: LOGIN,
            is_deleted: false,
            name: sdRecord.name,
            roles: [{ id: request.params.roleId, name: 'User Role #1' }],
            steps: [
              {
                id: 'step-1',
                action: ScenarioStepAction.TAP,
                order: 1,
                identifier: 'btn',
                value: '1',
                is_secure: false,
                role: request.params.roleId,
              },
            ],
          };
        }
      );

      await render(TEMPLATE);

      // Add a step via the empty-state popover — creates a new role + step
      await click(selectors.emptyAddBtn);

      await click(
        selectors.addStepsPopoverItem('dastAutomation.stepActions.tap')
      );

      // Fill in a valid identifier so validation passes
      await fillIn(find(selectors.identifierInput), 'btn');

      assert.dom(selectors.saveBtn).isNotDisabled();

      await click(selectors.saveBtn);

      const notify = this.owner.lookup('service:notifications');

      assert.strictEqual(
        notify.successMsg,
        t('dastAutomation.scenarioUpdated'),
        'shows save success notification'
      );

      assert.true(bulkCreateCalled, 'called bulkCreateRoles');
      assert.true(bulkUpdateStepsCalled, 'called bulkUpdateRoleSteps');

      assert.dom(selectors.saveBtn).isDisabled();
    });

    test('saving a renamed persisted role calls the update endpoint and shows success', async function (assert) {
      const role1Record = this.server.create('scenario-user-role');
      const sdRecord = this.server.create('scenario-detail', { type: LOGIN });

      const scenarioDetail = pushScenarioDetail(this.store, sdRecord, {
        roles: [role1Record],
      });

      this.set('scenarioDetail', scenarioDetail);

      let updateRoleCalled = false;

      this.server.put(
        '/v2/projects/:projectId/scenarios/:scenarioId/roles/:roleId',
        (schema, request) => {
          updateRoleCalled = true;

          const body = JSON.parse(request.requestBody);

          return { id: request.params.roleId, name: body.name };
        }
      );

      await render(TEMPLATE);

      assert.dom(selectors.saveBtn).isDisabled();

      await click(selectors.editRoleNameBtn);
      await fillIn(find(selectors.roleNameInput), 'Renamed Role');
      await click(selectors.confirmRoleNameBtn);

      assert.dom(selectors.saveBtn).isNotDisabled();

      await click(selectors.saveBtn);

      const notify = this.owner.lookup('service:notifications');

      assert.true(updateRoleCalled, 'called the update role endpoint');

      assert.strictEqual(
        notify.successMsg,
        t('dastAutomation.scenarioUpdated'),
        'shows save success notification'
      );

      assert.dom(selectors.saveBtn).isDisabled();
      assert.dom(selectors.roleName).containsText('Renamed Role');
    });

    // ─── Cancel / reset ───────────────────────────────────────────────────────

    test('clicking reset after dirtying a step reverts changes and disables save', async function (assert) {
      const sdRecord = this.server.create('scenario-detail', { type: OTHER });

      const stepRecord = this.server.create('scenario-step', {
        action: ScenarioStepAction.TAP,
        identifier: 'original-id',
        value: '3',
      });

      const scenarioDetail = pushScenarioDetail(this.store, sdRecord, {
        steps: [stepRecord],
      });

      this.set('scenarioDetail', scenarioDetail);

      await render(TEMPLATE);

      // ── Pre-state ──────────────────────────────────────────────────────────
      assert.dom(selectors.saveBtn).isDisabled();

      // Dirty the step
      await fillIn(find(selectors.identifierInput), 'changed-id');
      assert.dom(selectors.saveBtn).isNotDisabled();

      // Reset
      await click(selectors.cancelBtn);

      // ── Post-reset ─────────────────────────────────────────────────────────
      assert.dom(selectors.saveBtn).isDisabled();
    });

    test('cancel for LOGIN type after adding a new role reverts to the original role list', async function (assert) {
      const role1Record = this.server.create('scenario-user-role');
      const sdRecord = this.server.create('scenario-detail', { type: LOGIN });

      const scenarioDetail = pushScenarioDetail(this.store, sdRecord, {
        roles: [role1Record],
      });

      this.set('scenarioDetail', scenarioDetail);
      await render(TEMPLATE);

      // ── Pre-state: 1 role table ────────────────────────────────────────────
      assert.strictEqual(findAll(selectors.roleName).length, 1);
      assert.dom(selectors.saveBtn).isDisabled();

      // Add a new role via the last table's "new user role" button
      await click(selectors.newUserRoleBtn);

      // ── Mid-state: 2 role tables, save enabled ─────────────────────────────
      assert.strictEqual(findAll(selectors.roleName).length, 2);
      assert.dom(selectors.saveBtn).isNotDisabled();

      await click(selectors.cancelBtn);

      // ── Post-cancel: back to 1 role table, save disabled ───────────────────
      assert.strictEqual(findAll(selectors.roleName).length, 1);
      assert.dom(selectors.saveBtn).isDisabled();
    });

    test('scenario-level cancel after inline-confirming a role rename reverts the name', async function (assert) {
      const role1Record = this.server.create('scenario-user-role');
      const sdRecord = this.server.create('scenario-detail', { type: LOGIN });

      const scenarioDetail = pushScenarioDetail(this.store, sdRecord, {
        roles: [role1Record],
      });

      this.set('scenarioDetail', scenarioDetail);

      await render(TEMPLATE);

      const originalName = role1Record.name;

      // ── Pre-state ──────────────────────────────────────────────────────────
      assert.dom(selectors.roleName).containsText(originalName);
      assert.dom(selectors.saveBtn).isDisabled();

      // Rename the role and confirm inline (commits the name, marks role dirty)
      await click(selectors.editRoleNameBtn);
      await fillIn(find(selectors.roleNameInput), 'Renamed Role');
      await click(selectors.confirmRoleNameBtn);

      // ── Mid-state: new name shown, save enabled ────────────────────────────
      assert.dom(selectors.roleName).containsText('Renamed Role');
      assert.dom(selectors.saveBtn).isNotDisabled();

      // Scenario-level cancel (reset)
      await click(selectors.cancelBtn);

      // ── Post-cancel: original name restored, save disabled ─────────────────
      assert.dom(selectors.roleName).containsText(originalName);
      assert.dom(selectors.saveBtn).isDisabled();
    });

    // ─── Role management — add ────────────────────────────────────────────────

    test('clicking new user role from the last table adds a role and enables save', async function (assert) {
      const role1Record = this.server.create('scenario-user-role');
      const sdRecord = this.server.create('scenario-detail', { type: LOGIN });

      const scenarioDetail = pushScenarioDetail(this.store, sdRecord, {
        roles: [role1Record],
      });

      this.set('scenarioDetail', scenarioDetail);
      await render(TEMPLATE);

      assert.strictEqual(findAll(selectors.roleName).length, 1);
      assert.dom(selectors.saveBtn).isDisabled();

      await click(selectors.newUserRoleBtn);

      assert.strictEqual(
        findAll(selectors.roleName).length,
        2,
        'renders a second role table'
      );

      assert.dom(selectors.saveBtn).isNotDisabled();
    });

    test('new user role button is disabled and shows tooltip when at MAX_LOGIN_ROLES', async function (assert) {
      const sdRecord = this.server.create('scenario-detail', { type: LOGIN });

      const roles = Array.from({ length: MAX_LOGIN_ROLES }, () =>
        this.server.create('scenario-user-role')
      );

      const scenarioDetail = pushScenarioDetail(this.store, sdRecord, {
        roles,
      });

      this.set('scenarioDetail', scenarioDetail);
      await render(TEMPLATE);

      assert.strictEqual(
        findAll(selectors.roleName).length,
        MAX_LOGIN_ROLES,
        `renders ${MAX_LOGIN_ROLES} role tables`
      );

      assert.dom(selectors.newUserRoleBtn).isDisabled();

      await triggerEvent(find(selectors.newUserRoleTooltip), 'mouseenter');

      assert
        .dom('[data-test-ak-tooltip-content]')
        .containsText(
          t('dastAutomation.maxUserRolesReached', { maxRoles: MAX_LOGIN_ROLES })
        );
    });

    // ─── Role management — name editing ───────────────────────────────────────

    test('editing a role name and confirming enables the save button', async function (assert) {
      const role1Record = this.server.create('scenario-user-role');
      const sdRecord = this.server.create('scenario-detail', { type: LOGIN });

      const scenarioDetail = pushScenarioDetail(this.store, sdRecord, {
        roles: [role1Record],
      });

      this.set('scenarioDetail', scenarioDetail);
      await render(TEMPLATE);

      assert.dom(selectors.saveBtn).isDisabled();

      await click(selectors.editRoleNameBtn);
      await fillIn(find(selectors.roleNameInput), 'Renamed Role');
      await click(selectors.confirmRoleNameBtn);

      assert.dom(selectors.roleName).containsText('Renamed Role');
      assert.dom(selectors.saveBtn).isNotDisabled();
    });

    test('cancelling a role name edit reverts the name and does not enable save', async function (assert) {
      const role1Record = this.server.create('scenario-user-role');
      const sdRecord = this.server.create('scenario-detail', { type: LOGIN });

      const scenarioDetail = pushScenarioDetail(this.store, sdRecord, {
        roles: [role1Record],
      });

      this.set('scenarioDetail', scenarioDetail);
      await render(TEMPLATE);

      const originalName = role1Record.name;

      await click(selectors.editRoleNameBtn);

      assert.dom(selectors.roleNameInput).exists();

      await fillIn(find(selectors.roleNameInput), 'Discarded Name');
      await click(selectors.cancelRoleNameBtn);

      assert.dom(selectors.roleNameInput).doesNotExist();
      assert.dom(selectors.roleName).containsText(originalName);
      assert.dom(selectors.saveBtn).isDisabled();
    });

    // ─── Role management — delete ─────────────────────────────────────────────

    test('cancelling the delete role confirm box keeps the role in place', async function (assert) {
      const role1Record = this.server.create('scenario-user-role');
      const sdRecord = this.server.create('scenario-detail', { type: LOGIN });

      const scenarioDetail = pushScenarioDetail(this.store, sdRecord, {
        roles: [role1Record],
      });

      this.set('scenarioDetail', scenarioDetail);
      await render(TEMPLATE);

      assert.dom(selectors.confirmBoxConfirmBtn).doesNotExist();

      await click(selectors.deleteRoleBtn);

      assert.dom(selectors.confirmBoxConfirmBtn).exists();
      assert.dom(selectors.confirmBoxCancelBtn).exists();

      await click(selectors.confirmBoxCancelBtn);

      assert.dom(selectors.confirmBoxConfirmBtn).doesNotExist();
      assert.strictEqual(
        findAll(selectors.roleName).length,
        1,
        'role is still rendered after cancelling'
      );
    });

    test('deleting an unsaved (new) role removes it without an API call', async function (assert) {
      const role1Record = this.server.create('scenario-user-role');
      const sdRecord = this.server.create('scenario-detail', { type: LOGIN });

      const scenarioDetail = pushScenarioDetail(this.store, sdRecord, {
        roles: [role1Record],
      });

      this.set('scenarioDetail', scenarioDetail);
      await render(TEMPLATE);

      // Add a new (unsaved) role
      await click(selectors.newUserRoleBtn);
      assert.strictEqual(findAll(selectors.roleName).length, 2);

      // Delete the new (second) role
      const deleteButtons = findAll(selectors.deleteRoleBtn);
      await click(deleteButtons[1]);
      await click(selectors.confirmBoxConfirmBtn);

      assert.strictEqual(
        findAll(selectors.roleName).length,
        1,
        'new role is removed'
      );

      assert.dom(selectors.roleName).containsText(role1Record.name);
    });

    test('deleting a saved role calls DELETE, reloads the scenario, and shows success notification', async function (assert) {
      const role1Record = this.server.create('scenario-user-role');
      const role2Record = this.server.create('scenario-user-role');
      const sdRecord = this.server.create('scenario-detail', { type: LOGIN });

      const scenarioDetail = pushScenarioDetail(this.store, sdRecord, {
        roles: [role1Record, role2Record],
      });

      this.set('scenarioDetail', scenarioDetail);

      this.server.delete(
        '/v2/projects/:projectId/scenarios/:scenarioId/roles/:roleId',
        () => new Response(204)
      );

      this.server.get('/v2/projects/:projectId/scenarios/:scenarioId', () => ({
        id: sdRecord.id,
        type: LOGIN,
        is_deleted: false,
        name: sdRecord.name,
        roles: [role1Record.toJSON()],
        steps: [],
      }));

      await render(TEMPLATE);

      assert.strictEqual(findAll(selectors.roleName).length, 2);

      // Delete the second role
      const deleteButtons = findAll(selectors.deleteRoleBtn);
      await click(deleteButtons[1]);
      await click(selectors.confirmBoxConfirmBtn);

      await waitUntil(() => !find(selectors.confirmBoxConfirmBtn), {
        timeout: 150,
      });

      const notify = this.owner.lookup('service:notifications');

      assert.strictEqual(
        notify.successMsg,
        t('dastAutomation.roleDeleted'),
        'shows roleDeleted success notification'
      );

      assert.strictEqual(
        findAll(selectors.roleName).length,
        1,
        'role is removed from the list after deletion'
      );

      assert.dom(selectors.roleName).containsText(role1Record.name);
    });

    test('API error on delete role shows error notification and keeps the role', async function (assert) {
      const role1Record = this.server.create('scenario-user-role');
      const sdRecord = this.server.create('scenario-detail', { type: LOGIN });

      const scenarioDetail = pushScenarioDetail(this.store, sdRecord, {
        roles: [role1Record],
      });

      this.set('scenarioDetail', scenarioDetail);

      this.server.delete(
        '/v2/projects/:projectId/scenarios/:scenarioId/roles/:roleId',
        () => new Response(500)
      );

      await render(TEMPLATE);

      await click(selectors.deleteRoleBtn);
      await click(selectors.confirmBoxConfirmBtn);

      const notify = this.owner.lookup('service:notifications');

      await waitUntil(() => notify.errorMsg, { timeout: 150 });

      assert.strictEqual(
        notify.errorMsg,
        'The backend responded with an error',
        'shows error notification'
      );

      assert.notOk(notify.successMsg, 'does not show a success notification');

      assert.strictEqual(
        findAll(selectors.roleName).length,
        1,
        'role remains after a failed deletion'
      );
    });
  }
);
