import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, find, render, triggerEvent } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';

// ─── Selectors ───────────────────────────────────────────────────────────────

const selectors = {
  lockBtn: '[data-test-dastAutomationScenario-stepsTable-rowLockBtn]',
  lockIcon: '[data-test-dastAutomationScenario-stepsTable-rowLockIcon]',
  deleteBtn: '[data-test-dastAutomationScenario-stepsTable-rowDeleteBtn]',
  deleteIcon: '[data-test-dastAutomationScenario-stepsTable-rowDeleteIcon]',
  lockTooltip: '[data-test-dastAutomationScenario-stepsTable-rowLockTooltip]',
  tooltipContent: '[data-test-ak-tooltip-content]',

  maskingLoader:
    '[data-test-dastAutomationScenario-stepsTable-rowMaskingLoader]',

  deleteTooltip:
    '[data-test-dastAutomationScenario-stepsTable-rowDeleteTooltip]',
};

// ─── Template ────────────────────────────────────────────────────────────────

const TEMPLATE = hbs`
  <ProjectSettings::DastAutomation::ScenarioViewV2::StepsTable::RowActions
    @step={{this.step}}
    @disabled={{this.disabled}}
    @isSecureText={{this.isSecureText}}
    @disableDelete={{this.disableDelete}}
    @isMasking={{this.isMasking}}
    @maskingDisabled={{this.maskingDisabled}}
    @onToggleSecure={{this.onToggleSecure}}
    @onDelete={{this.onDelete}}
    @scenarioDetail={{this.scenarioDetail}}
  />
`;

// ─── Test suite ──────────────────────────────────────────────────────────────

module(
  'Integration | Component | project-settings/dast-automation/scenario-view-v2/steps-table/row-actions',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en');

    hooks.beforeEach(async function () {
      const store = this.owner.lookup('service:store');

      const stepRecord = this.server.create('scenario-step', {
        is_secure: false,
      });

      const step = store.push(
        store.normalize('scenario-step', stepRecord.toJSON())
      );

      // OTHER-type scenario default created
      const scenarioRecord = this.server.create('scenario-detail', { type: 1 });

      const scenarioDetail = store.push(
        store.normalize('scenario-detail', scenarioRecord.toJSON())
      );

      this.setProperties({
        step,
        scenarioDetail,
        disabled: false,
        isSecureText: false,
        disableDelete: false,
        isMasking: false,
        maskingDisabled: false,
        toggleSecureCalledWith: null,
        deleteCalledWith: null,
        onToggleSecure: (s) => this.set('toggleSecureCalledWith', s),
        onDelete: (s) => this.set('deleteCalledWith', s),
      });
    });

    // ─── Disabled mode ────────────────────────────────────────────────────────

    test('renders non-interactive lock and delete buttons with correct icons when disabled', async function (assert) {
      this.set('disabled', true);

      await render(TEMPLATE);

      assert.dom(selectors.lockBtn).exists();
      assert.dom(selectors.lockIcon).hasAttribute('icon', /lock/);

      assert.dom(selectors.deleteBtn).exists();
      assert.dom(selectors.deleteIcon).hasAttribute('icon', /delete/);

      assert.dom(selectors.maskingLoader).doesNotExist();
      assert.dom(selectors.lockTooltip).doesNotExist();
    });

    // ─── Masking state ────────────────────────────────────────────────────────

    test('shows masking loader instead of lock button when isMasking is true', async function (assert) {
      this.set('isMasking', true);

      await render(TEMPLATE);

      assert.dom(selectors.maskingLoader).exists();
      assert.dom(selectors.lockBtn).doesNotExist();
    });

    // ─── Lock tooltip text ────────────────────────────────────────────────────

    test('lock tooltip shows cannotSecureNonInput when isSecureText is false', async function (assert) {
      this.set('isSecureText', false);

      await render(TEMPLATE);

      await triggerEvent(find(selectors.lockTooltip), 'mouseenter');

      assert
        .dom(selectors.tooltipContent)
        .containsText(t('dastAutomation.cannotSecureNonInput'));
    });

    test('lock tooltip shows clickToMask for a saved, unsecured step with isSecureText true', async function (assert) {
      this.set('isSecureText', true);

      await render(TEMPLATE);

      await triggerEvent(find(selectors.lockTooltip), 'mouseenter');

      assert
        .dom(selectors.tooltipContent)
        .containsText(t('dastAutomation.clickToMask'));
    });

    test('lock tooltip shows cannotMaskAlreadyMasked for a saved, secured step', async function (assert) {
      const store = this.owner.lookup('service:store');

      const stepRecord = this.server.create('scenario-step', {
        is_secure: true,
      });

      const step = store.push(
        store.normalize('scenario-step', stepRecord.toJSON())
      );

      this.setProperties({ step, isSecureText: true });

      await render(TEMPLATE);

      await triggerEvent(find(selectors.lockTooltip), 'mouseenter');

      assert
        .dom(selectors.tooltipContent)
        .containsText(t('dastAutomation.cannotMaskAlreadyMasked'));
    });

    test('lock tooltip shows stepUnsavedCannotMask for a new (unsaved) step', async function (assert) {
      const store = this.owner.lookup('service:store');
      const step = store.createRecord('scenario-step', { isSecure: false });

      this.setProperties({ step, isSecureText: true });

      await render(TEMPLATE);

      await triggerEvent(find(selectors.lockTooltip), 'mouseenter');

      assert
        .dom(selectors.tooltipContent)
        .containsText(t('dastAutomation.stepUnsavedCannotMask'));
    });

    // ─── maskingDisabled ──────────────────────────────────────────────────────

    test('lock button is disabled when maskingDisabled is true', async function (assert) {
      this.set('maskingDisabled', true);

      await render(TEMPLATE);

      assert.dom(selectors.lockBtn).isDisabled();
    });

    // ─── Delete button state ──────────────────────────────────────────────────

    test('delete button is enabled when disableDelete is false', async function (assert) {
      this.set('disableDelete', false);

      await render(TEMPLATE);

      assert.dom(selectors.deleteBtn).isNotDisabled();
      assert.dom(selectors.tooltipContent).doesNotExist();
    });

    test('delete button is disabled and shows atLeastOneStepRequired tooltip for OTHER-type scenario', async function (assert) {
      this.set('disableDelete', true);

      await render(TEMPLATE);

      assert.dom(selectors.deleteBtn).isDisabled();

      await triggerEvent(find(selectors.deleteTooltip), 'mouseenter');

      assert
        .dom(selectors.tooltipContent)
        .containsText(t('dastAutomation.atLeastOneStepRequired'));
    });

    test('delete button is disabled and shows roleAtLeastOneStepRequired tooltip for LOGIN-type scenario', async function (assert) {
      const store = this.owner.lookup('service:store');
      const scenarioRecord = this.server.create('scenario-detail', { type: 0 });

      const scenarioDetail = store.push(
        store.normalize('scenario-detail', scenarioRecord.toJSON())
      );

      this.setProperties({ scenarioDetail, disableDelete: true });

      await render(TEMPLATE);

      assert.dom(selectors.deleteBtn).isDisabled();

      await triggerEvent(find(selectors.deleteTooltip), 'mouseenter');

      assert
        .dom(selectors.tooltipContent)
        .containsText(t('dastAutomation.roleAtLeastOneStepRequired'));
    });

    // ─── Callbacks ────────────────────────────────────────────────────────────

    test('clicking the lock button calls onToggleSecure with the step', async function (assert) {
      await render(TEMPLATE);

      await click(selectors.lockBtn);

      assert.strictEqual(this.toggleSecureCalledWith, this.step);
    });

    test('clicking the delete button calls onDelete with the step', async function (assert) {
      await render(TEMPLATE);

      await click(selectors.deleteBtn);

      assert.strictEqual(this.deleteCalledWith, this.step);
    });
  }
);
