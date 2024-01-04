import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Adapter | nistsp80053', function (hooks) {
  setupTest(hooks);

  // Replace this with your real tests.
  test('it exists', function (assert) {
    let adapter = this.owner.lookup('adapter:nistsp80053');
    assert.ok(adapter);
  });
});
