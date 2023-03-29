import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Adapter | am app store instance', function (hooks) {
  setupTest(hooks);

  // Replace this with your real tests.
  test('it exists', function (assert) {
    let adapter = this.owner.lookup('adapter:am-app-store-instance');
    assert.ok(adapter);
  });
});
