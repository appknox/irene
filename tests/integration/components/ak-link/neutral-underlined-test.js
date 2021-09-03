import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module(
  'Integration | Component | ak-link/neutral-underlined',
  function (hooks) {
    setupRenderingTest(hooks);

    test('it renders anchor tag with text and given route and icon not present', async function (assert) {
      this.set('text', 'redirect');
      this.set('route', 'login');

      await render(
        hbs`<AkLink::NeutralUnderlined @route={{this.route}} @text={{this.text}}/>`
      );

      assert
        .dom(`[data-test-link-neutral-underlined]`)
        .hasAttribute('href', '/login');
      assert.dom(`[data-test-link-neutral-underlined]`).containsText(this.text);
      assert.dom(`[data-test-link-neutral-underlined-icon]`).doesNotExist();
    });

    test('it should show icon', async function (assert) {
      this.set('text', 'redirect');
      this.set('route', 'not-found');
      this.set('icon', 'tick');

      await render(
        hbs`<AkLink::NeutralUnderlined @route={{this.route}} @text={{this.text}} @icon={{this.icon}}/>`
      );

      assert.dom(`[data-test-link-neutral-underlined-icon]`).hasText(this.icon);
    });
  }
);
