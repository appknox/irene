import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Serializer | am app sync', function (hooks) {
  setupTest(hooks);

  // Replace this with your real tests.
  test('it exists', function (assert) {
    let store = this.owner.lookup('service:store');
    let serializer = store.serializerFor('am-app-sync');

    assert.ok(serializer);
  });

  test('it serializes records', function (assert) {
    let store = this.owner.lookup('service:store');
    let record = store.createRecord('am-app-sync', {});

    let serializedRecord = record.serialize();

    assert.ok(serializedRecord);
  });
});
