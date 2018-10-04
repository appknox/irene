import { moduleForModel, test } from 'ember-qunit';

moduleForModel('project-team', 'Unit | Model | project team', {
  needs: []
});

test('it exists', function(assert) {
  let model = this.subject();
  assert.ok(!!model);
});
