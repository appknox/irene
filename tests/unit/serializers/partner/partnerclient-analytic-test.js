import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Serializer | partner/partnerclient analytic', function(hooks) {
  setupTest(hooks);

  // Replace this with your real tests.
  test('it exists', function(assert) {
    let store = this.owner.lookup('service:store');
    let serializer = store.serializerFor('partner/partnerclient-analytic');

    assert.ok(serializer);
  });

  test('it serializes records', function(assert) {
    let store = this.owner.lookup('service:store');
    let record = store.createRecord('partner/partnerclient-analytic', {});

    let serializedRecord = record.serialize();

    assert.ok(serializedRecord);
  });
});
