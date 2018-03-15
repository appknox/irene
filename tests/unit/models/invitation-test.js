import { moduleForModel, test } from 'ember-qunit';

moduleForModel('invitation', 'Unit | Model | invitation', {
  needs: ['model:team', 'model:user']
});

test('it exists', function(assert) {
  const model = this.subject();
  assert.ok(!!model);
});
