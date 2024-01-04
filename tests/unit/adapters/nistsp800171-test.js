import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Adapter | nistsp800171', function (hooks) {
  setupTest(hooks);

  // Replace this with your real tests.
  test('it exists', function (assert) {
    let adapter = this.owner.lookup('adapter:nistsp800171');
    assert.ok(adapter);
  });
});
