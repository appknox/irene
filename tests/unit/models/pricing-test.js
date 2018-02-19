import { moduleForModel, test } from 'ember-qunit';

moduleForModel('pricing', 'Unit | Model | pricing', {
  needs: ['model:invoice']
});

test('it exists', function(assert) {
  const model = this.subject();
  assert.ok(!!model);
});
