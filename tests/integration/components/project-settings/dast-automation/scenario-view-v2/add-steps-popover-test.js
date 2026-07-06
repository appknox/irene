import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, findAll, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl, t } from 'ember-intl/test-support';
import { STEP_ACTION_CONFIGS } from 'irene/components/project-settings/dast-automation/scenario-view-v2/steps-table/step-actions';

// ─── Selectors ───────────────────────────────────────────────────────────────

const selectors = {
  triggerBtn: '[data-test-add-steps-trigger]',
  popover: '[data-test-dastAutomationScenario-stepsTable-addStepsPopover]',
  allItems: '[data-test-dastAutomationScenario-stepsTable-addStepsPopoverItem]',

  popoverItem: (label) =>
    `[data-test-dastAutomationScenario-stepsTable-addStepsPopoverItem="${label}"]`,
};

// ─── Template ────────────────────────────────────────────────────────────────

const TEMPLATE = hbs`
  {{!-- This is a test button to open the popover when clicked. It is not part of the component. --}}
  <button
    type="button"
    data-test-add-steps-trigger
    {{on 'click' this.handleOpen}}
  >
    Add Step
  </button>

  <ProjectSettings::DastAutomation::ScenarioViewV2::AddStepsPopover
    @anchorRef={{this.anchorRef}}
    @closeHandler={{this.handleClose}}
    @addStep={{this.addStep}}
  />
`;

// ─── Test suite ──────────────────────────────────────────────────────────────

module(
  'Integration | Component | project-settings/dast-automation/scenario-view-v2/add-steps-popover',
  function (hooks) {
    setupRenderingTest(hooks);
    setupIntl(hooks, 'en');

    hooks.beforeEach(async function () {
      this.setProperties({
        anchorRef: null,
        addStepCallArg: null,
        handleOpen: (event) => this.set('anchorRef', event.currentTarget),
        handleClose: () => this.set('anchorRef', null),
        addStep: (config) => this.set('addStepCallArg', config),
      });
    });

    // ─── Rendering ─────────────────────────────────────────────────────────────

    test('popover is closed by default', async function (assert) {
      await render(TEMPLATE);

      assert.dom(selectors.popover).doesNotExist();
    });

    // ─── Popover open ───────────────────────────────────────────────────────────

    test('opening the popover renders all step action items with correct labels', async function (assert) {
      await render(TEMPLATE);

      await click(selectors.triggerBtn);

      assert.dom(selectors.popover).exists();

      assert.strictEqual(
        findAll(selectors.allItems).length,
        STEP_ACTION_CONFIGS.length,
        `renders all ${STEP_ACTION_CONFIGS.length} step action items`
      );

      // Check that all step action items are rendered with the correct labels
      STEP_ACTION_CONFIGS.forEach((config) => {
        const itemSelector = selectors.popoverItem(config.label);

        assert.dom(itemSelector).containsText(t(config.label));

        assert
          .dom(`${itemSelector} [data-test-ak-icon]`)
          .hasAttribute('icon', new RegExp(config.icon));
      });
    });

    // ─── addStep callback ───────────────────────────────────────────────────────

    test('clicking an item calls @addStep with the correct config', async function (assert) {
      await render(TEMPLATE);

      await click(selectors.triggerBtn);

      const firstConfig = STEP_ACTION_CONFIGS[0];

      await click(selectors.popoverItem(firstConfig.label));

      assert.deepEqual(this.addStepCallArg, firstConfig);
    });
  }
);
