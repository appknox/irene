import { moduleForModel, test } from 'ember-qunit';

moduleForModel('project', 'Unit | Model | project', {
  needs: ["model:user", "model:file", "model:collaboration"]
});

test('it exists', function(assert) {
  const model = this.subject();
  assert.ok(!!model);
});
