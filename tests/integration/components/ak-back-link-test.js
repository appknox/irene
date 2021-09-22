import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | ak-back-link', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders back link with label', async function (assert) {
    this.set('label', 'redirect');
    this.set('route', 'login');

    await render(
      hbs`<AkBackLink @route={{this.route}} @label={{this.label}}/>`
    );

    assert
      .dom(`[data-test-link-neutral-underlined]`)
      .hasAttribute('href', '/login');
    assert.dom(`[data-test-link-neutral-underlined]`).containsText(this.label);
    assert
      .dom(`[data-test-link-neutral-underlined-icon]`)
      .hasText('arrow_back');
  });
});
