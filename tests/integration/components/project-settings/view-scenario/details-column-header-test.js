import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, triggerEvent } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl } from 'ember-intl/test-support';

const selectors = {
  inputTypeColumnHeaderTooltip:
    '[data-test-projectSettings-scenarioDetails-inputTypeColumnHeader-tooltip]',
  inputTypeColumnHeaderTooltipContent:
    '[data-test-projectSettings-scenarioDetails-inputTypeColumnHeader-tooltipContent]',
  inputTypeColumnHeaderTooltipIcon:
    '[data-test-projectSettings-scenarioDetails-inputTypeColumnHeader-tooltipIcon]',
  inputTypeColumnHeader:
    '[data-test-projectSettings-scenarioDetails-inputTypeColumnHeader]',
  inputValueColumnHeader:
    '[data-test-projectSettings-scenarioDetails-inputValueColumnHeader]',
};

module(
  'Integration | Component | project-settings/view-scenario/details-column-header',
  function (hooks) {
    setupRenderingTest(hooks);
    setupIntl(hooks);

    test('it renders', async function (assert) {
      await render(hbs`
        <ProjectSettings::ViewScenario::DetailsColumnHeader 
          @project={{this.project}} 
          @scenario={{this.defaultScenario}} 
        />
      `);

      assert
        .dom(selectors.inputTypeColumnHeader)
        .exists()
        .containsText('t:dastAutomation.inputType:()');

      // Tootlip selector input type column
      await triggerEvent(selectors.inputTypeColumnHeaderTooltip, 'mouseenter');

      assert
        .dom(selectors.inputTypeColumnHeaderTooltipContent)
        .exists()
        .containsText('t:dastAutomation.inputTypeColumnHeaderInfo:()');

      assert.dom(selectors.inputTypeColumnHeaderTooltipIcon).exists();

      assert
        .dom(selectors.inputValueColumnHeader)
        .exists()
        .containsText('t:dastAutomation.inputValue:()');
    });
  }
);
