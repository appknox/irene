import { moduleForModel, test } from 'ember-qunit';

moduleForModel('invoice', 'Unit | Model | invoice', {
  needs: ['model:plan']
});

test('it exists', function(assert) {
  const model = this.subject();
  assert.ok(!!model);
});
