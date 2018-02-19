import { moduleForModel, test } from 'ember-qunit';

moduleForModel('user', 'Unit | Model | user', {
  needs: ['model:project', 'model:submission', 'model:collaboration', 'model:pricing','model:team']
});

test('it exists', function(assert) {
  const model = this.subject();
  assert.ok(!!model);
});
