import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Adapter | pcidss4', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    let adapter = this.owner.lookup('adapter:pcidss4');
    assert.ok(adapter);
  });
});
