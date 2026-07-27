import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { find, render, triggerEvent } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';

import { compareInnerHTMLWithIntlTranslation } from 'irene/tests/test-utils';

// ─── Selectors ───────────────────────────────────────────────────────────────

const selectors = {
  inputTypeHeader:
    '[data-test-projectSettings-scenarioDetails-inputTypeColumnHeader]',
  inputValueHeader:
    '[data-test-projectSettings-scenarioDetails-inputValueColumnHeader]',
  tooltip:
    '[data-test-projectSettings-scenarioDetails-inputTypeColumnHeader-tooltip]',
  tooltipIcon:
    '[data-test-projectSettings-scenarioDetails-inputTypeColumnHeader-tooltipIcon]',
  tooltipContent:
    '[data-test-projectSettings-scenarioDetails-inputTypeColumnHeader-tooltipContent]',
};

// ─── Template ────────────────────────────────────────────────────────────────

const TEMPLATE = hbs`
  <ProjectSettings::DastAutomation::ScenarioView::DetailsColumnHeader />
`;

// ─── Test suite ──────────────────────────────────────────────────────────────

module(
  'Integration | Component | project-settings/dast-automation/scenario-view/details-column-header',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en');

    // ─── Render ──────────────────────────────────────────────────────────────

    test('renders inputType and inputValue column headers', async function (assert) {
      await render(TEMPLATE);

      assert
        .dom(selectors.inputTypeHeader)
        .containsText(t('dastAutomation.inputType'));
      assert
        .dom(selectors.inputValueHeader)
        .containsText(t('dastAutomation.inputValue'));
    });

    // ─── Tooltip ─────────────────────────────────────────────────────────────

    test('hovering the info icon shows the inputTypeColumnHeaderInfo tooltip', async function (assert) {
      assert.expect(3);

      await render(TEMPLATE);

      assert.dom(selectors.tooltipIcon).exists();
      assert.dom(selectors.tooltipContent).doesNotExist();

      await triggerEvent(find(selectors.tooltip), 'mouseenter');

      compareInnerHTMLWithIntlTranslation(assert, {
        selector: selectors.tooltipContent,
        message: t('dastAutomation.inputTypeColumnHeaderInfo'),
        doIncludesCheck: true,
      });
    });
  }
);
