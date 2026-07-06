import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { find, render, triggerEvent } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl } from 'ember-intl/test-support';

// ─── Selectors ───────────────────────────────────────────────────────────────

const selectors = {
  errorIcon: '[data-test-dastAutomationScenario-stepsTable-inputError]',
  tooltipRoot: '[data-test-ak-tooltip-root]',
  yieldedContent: '[data-test-yielded-content]',

  errorIconSymbol:
    '[data-test-dastAutomationScenario-stepsTable-inputErrorIcon]',

  tooltipContent:
    '[data-test-dastAutomationScenario-stepsTable-inputErrorTooltipContent]',
};

// ─── Template ────────────────────────────────────────────────────────────────

const TEMPLATE = hbs`
  <ProjectSettings::DastAutomation::ScenarioViewV2::StepsTable::InputErrorWrapper
    @errorMessage={{this.errorMessage}}
  >
    <div data-test-yielded-content>Input field</div>
  </ProjectSettings::DastAutomation::ScenarioViewV2::StepsTable::InputErrorWrapper>
`;

// ─── Test suite ──────────────────────────────────────────────────────────────

module(
  'Integration | Component | project-settings/dast-automation/scenario-view-v2/steps-table/input-error-wrapper',
  function (hooks) {
    setupRenderingTest(hooks);
    setupIntl(hooks, 'en');

    hooks.beforeEach(async function () {
      this.set('errorMessage', null);
    });

    // ─── No error ──────────────────────────────────────────────────────────────

    test('renders yielded content with no error icon when errorMessage is not set', async function (assert) {
      await render(TEMPLATE);

      assert.dom(selectors.yieldedContent).exists();
      assert.dom(selectors.errorIcon).doesNotExist();
    });

    // ─── With error ────────────────────────────────────────────────────────────

    test('shows error icon when errorMessage is provided', async function (assert) {
      this.set('errorMessage', 'This field is required');

      await render(TEMPLATE);

      assert.dom(selectors.yieldedContent).exists();
      assert.dom(selectors.errorIcon).exists();
      assert.dom(selectors.errorIconSymbol).hasAttribute('icon', /error/);
    });

    test('hovering the error icon shows the error message in the tooltip', async function (assert) {
      this.set('errorMessage', 'This field is required');

      await render(TEMPLATE);

      await triggerEvent(find(selectors.tooltipRoot), 'mouseenter');

      assert
        .dom(selectors.tooltipContent)
        .containsText('This field is required');
    });
  }
);
