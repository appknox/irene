import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Serializer | drf', function (hooks) {
  setupTest(hooks);

  // Replace this with your real tests.
  test('it exists', function (assert) {
    let store = this.owner.lookup('service:store');
    let serializer = store.serializerFor('drf');

    assert.ok(serializer);
  });
});
