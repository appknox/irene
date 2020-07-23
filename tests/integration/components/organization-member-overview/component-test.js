import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';

import '@ember/test-helpers';

module('Integration | Component | organization member overview', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', function(assert) {
    assert.ok(true);
    assert.equal(this.$().text().trim(), '');
  });
});