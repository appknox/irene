import {
  module,
  test
} from 'qunit';
import {
  setupRenderingTest
} from 'ember-qunit';
import {
  render
} from '@ember/test-helpers';
import {
  hbs
} from 'ember-cli-htmlbars';

module('Integration | Helper | plus-one', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    this.set('inputValue', 1);

    await render(hbs `{{plus-one inputValue}}`);

    assert.equal(this.element.textContent.trim(), 2);
  });
});
