import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module(
  'Unit | Serializer | partner/partnerclient report unlockkey',
  function (hooks) {
    setupTest(hooks);

    // Replace this with your real tests.
    test('it exists', function (assert) {
      let store = this.owner.lookup('service:store');
      let serializer = store.serializerFor(
        'partner/partnerclient-report-unlockkey'
      );

      assert.ok(serializer);
    });

    test('it serializes records', function (assert) {
      let store = this.owner.lookup('service:store');
      let record = store.createRecord(
        'partner/partnerclient-report-unlockkey',
        {}
      );

      let serializedRecord = record.serialize();

      assert.ok(serializedRecord);
    });
  }
);
