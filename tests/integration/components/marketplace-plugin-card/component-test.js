import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';

import '@ember/test-helpers';

module('Integration | Component | marketplace plugin card', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', function(assert) {
    assert.ok(true);
    assert.equal(this.$().text().trim(), '');
  });
});
