import { moduleForModel, test } from 'ember-qunit';

moduleForModel('collaboration', 'Unit | Model | collaboration', {
  needs: ['model:project', 'model:user', 'model:team']
});

test('it exists', function(assert) {
  const model = this.subject();
  assert.ok(!!model);
});
