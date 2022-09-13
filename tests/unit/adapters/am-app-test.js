import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Unit | Adapter | am app', function (hooks) {
  setupTest(hooks);

  // Replace this with your real tests.
  test('it exists', function (assert) {
    let adapter = this.owner.lookup('adapter:am-app');
    assert.ok(adapter);
  });
});
