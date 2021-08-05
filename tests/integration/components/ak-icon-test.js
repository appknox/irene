import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | ak-icon', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders given icon text', async function (assert) {
    this.set('name', 'face');

    await render(hbs`<AkIcon @name={{this.name}}/>`);

    assert.dom(`[data-test-icon]`).hasText(this.name);
  });
});
