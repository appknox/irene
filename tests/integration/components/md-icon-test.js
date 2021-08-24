import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | md-icon', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders icon text inside span', async function (assert) {
    this.set('name', 'regular');
    await render(hbs`<MdIcon @name={{this.name}}/>`);

    assert.dom(`[data-test-md-icon]`).hasText(this.name);
  });

  test('it renders nothing, if name is not provided', async function (assert) {
    await render(hbs`<MdIcon/>`);

    assert.dom(`[data-test-md-icon]`).hasText('');
  });
});
