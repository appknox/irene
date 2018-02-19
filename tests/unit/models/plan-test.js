import { moduleForModel, test } from 'ember-qunit';

moduleForModel('plan', 'Unit | Model | plan', {
  needs: ['model:invoice']
});

test('it exists', function(assert) {
  const model = this.subject();
  assert.ok(!!model);
});
