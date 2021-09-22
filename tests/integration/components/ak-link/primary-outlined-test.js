import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | ak-link/primary-outlined', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders anchor tag with given route', async function (assert) {
    this.set('route', 'login');

    await render(hbs`<AkLink::PrimaryOutlined @route={{this.route}}/>`);

    assert
      .dom(`[data-test-link-primary-outlined]`)
      .hasAttribute('href', '/login');
  });

  test('it should render inner content', async function (assert) {
    await render(
      hbs`<AkLink::PrimaryOutlined>Test Link</AkLink::PrimaryOutlined>`
    );

    assert.dom(`[data-test-link-primary-outlined]`).containsText('Test Link');
  });
});
