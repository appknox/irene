import { moduleForModel, test } from 'ember-qunit';

moduleForModel('organization-user', 'Unit | Model | organization user', {
  needs: []
});

test('it exists', function(assert) {
  const model = this.subject();
  assert.ok(!!model);
});
