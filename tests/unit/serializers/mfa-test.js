import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Serializer | mfa', function (hooks) {
  setupTest(hooks);

  // Replace this with your real tests.
  test('it serializes records', function (assert) {
    let record = this.owner.lookup('service:store').createRecord('mfa');

    let serializedRecord = record.serialize();

    assert.ok(serializedRecord);
  });
});
