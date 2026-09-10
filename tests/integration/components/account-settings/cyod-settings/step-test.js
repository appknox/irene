import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl } from 'ember-intl/test-support';

// ─── Selectors ─────────────────────────────────────────────────────────────────
const selectors = {
  step: (number) => `[data-test-cyodSettings-step='${number}']`,
  title: '[data-test-cyodSettings-stepTitle]',
  body: '[data-test-step-body]',
};

// ─── Templates ─────────────────────────────────────────────────────────────────
const WITH_BODY = hbs`<AccountSettings::CyodSettings::Step
  @number='2'
  @title='Download Mercer'
>
  <span data-test-step-body>Pick the installer for your platform</span>
</AccountSettings::CyodSettings::Step>`;

const TITLE_ONLY = hbs`<AccountSettings::CyodSettings::Step
  @number='5'
  @title='Run the proxy'
/>`;

module(
  'Integration | Component | account-settings/cyod-settings/step',
  function (hooks) {
    setupRenderingTest(hooks);
    setupIntl(hooks, 'en');

    test('it numbers the step and renders its title and body', async function (assert) {
      await render(WITH_BODY);

      assert
        .dom(selectors.step('2'))
        .hasAttribute('data-test-cyodSettings-step', '2');
      assert.dom(selectors.title).hasText('Download Mercer');
      assert
        .dom(selectors.body)
        .hasText('Pick the installer for your platform');
    });

    test('the number badge is hidden from assistive technology', async function (assert) {
      await render(WITH_BODY);

      assert
        .dom(`${selectors.step('2')} [aria-hidden='true']`)
        .hasText('2', 'the badge repeats the order the DOM already conveys');
    });

    test('a step with no body renders just its title', async function (assert) {
      await render(TITLE_ONLY);

      assert.dom(selectors.step('5')).exists();
      assert.dom(selectors.title).hasText('Run the proxy');
      assert.dom(selectors.body).doesNotExist();
    });
  }
);
