import { moduleForModel, test } from 'ember-qunit';

moduleForModel('file', 'Unit | Model | file', {
  needs: ['model:project', 'model:analysis', 'model:user']
});

test('it exists', function(assert) {
  const model = this.subject();
  assert.ok(!!model);
});
