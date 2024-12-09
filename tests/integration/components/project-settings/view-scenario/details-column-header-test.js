import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, triggerEvent } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl, t } from 'ember-intl/test-support';

import { compareInnerHTMLWithIntlTranslation } from 'irene/tests/test-utils';

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
    setupIntl(hooks, 'en');

    test('it renders', async function (assert) {
      assert.expect(6);

      await render(hbs`
        <ProjectSettings::ViewScenario::DetailsColumnHeader 
          @project={{this.project}} 
          @scenario={{this.defaultScenario}} 
        />
      `);

      assert
        .dom(selectors.inputTypeColumnHeader)
        .exists()
        .containsText(t('dastAutomation.inputType'));

      // Tootlip selector input type column
      await triggerEvent(selectors.inputTypeColumnHeaderTooltip, 'mouseenter');

      compareInnerHTMLWithIntlTranslation(assert, {
        element: this.element.querySelector(
          selectors.inputTypeColumnHeaderTooltipContent
        ),
        message: t('dastAutomation.inputTypeColumnHeaderInfo'),
        doIncludesCheck: true,
      });

      assert.dom(selectors.inputTypeColumnHeaderTooltipIcon).exists();

      assert
        .dom(selectors.inputValueColumnHeader)
        .exists()
        .containsText(t('dastAutomation.inputValue'));
    });
  }
);
