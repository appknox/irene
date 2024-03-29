import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Adapter | owaspmobile2024', function (hooks) {
  setupTest(hooks);

  // Replace this with your real tests.
  test('it exists', function (assert) {
    let adapter = this.owner.lookup('adapter:owaspmobile2024');
    assert.ok(adapter);
  });
});
