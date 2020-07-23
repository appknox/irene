import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';

import '@ember/test-helpers';

module('Integration | Component | captured apis', function(hooks) {
  setupRenderingTest(hooks);

  test('dummy test', function(assert) {
    assert.ok(true);
    assert.equal(this.$().text().trim(), '');
  });
});
