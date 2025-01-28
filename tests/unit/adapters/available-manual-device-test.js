import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Adapter | available manual device', function (hooks) {
  setupTest(hooks);

  // Replace this with your real tests.
  test('it exists', function (assert) {
    let adapter = this.owner.lookup('adapter:available-manual-device');
    assert.ok(adapter);
  });
});
