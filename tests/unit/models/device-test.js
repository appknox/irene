import { moduleForModel, test } from 'ember-qunit';

moduleForModel('device', 'Unit | Model | device', {
  needs: []
});

test('it exists', function(assert) {
  const model = this.subject();
  assert.ok(!!model);
});
