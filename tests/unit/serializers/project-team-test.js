import { moduleForModel, test } from 'ember-qunit';

moduleForModel('project-team', 'Unit | Serializer | project team', {
  needs: ['serializer:project-team']
});

test('it serializes records', function(assert) {
  let record = this.subject();

  let serializedRecord = record.serialize();

  assert.ok(serializedRecord);
});
