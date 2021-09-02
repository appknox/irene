import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | ak-link/primary-outlined', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders anchor tag with given route', async function (assert) {
    this.set('route', 'authenticated.organization');

    await render(hbs`<AkLink::PrimaryOutlined @route={{this.route}}/>`);

    assert
      .dom(`[data-test-link-primary-outlined]`)
      .hasAttribute('href', '/organization');
  });

  test('it should render link with given text and icon should not be there', async function (assert) {
    this.set('text', 'redirect');

    await render(hbs`<AkLink::PrimaryOutlined @text={{this.text}}/>`);

    assert.dom(`[data-test-link-primary-outlined]`).containsText(this.text);

    assert.dom(`[data-test-link-primary-outlined-icon]`).doesNotExist();
  });

  test('it should render icon inside anchor tag', async function (assert) {
    this.set('icon', 'tick');

    await render(hbs`<AkLink::PrimaryOutlined @icon={{this.icon}}/>`);

    assert
      .dom(
        `[data-test-link-primary-outlined] [data-test-link-primary-outlined-icon]`
      )
      .hasText(this.icon);
  });
});
