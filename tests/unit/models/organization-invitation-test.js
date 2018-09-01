import { moduleForModel, test } from 'ember-qunit';

moduleForModel('organization-invitation', 'Unit | Model | organization invitation', {
  needs: ['model:organization-team', 'model:organization-member']
});

test('it exists', function(assert) {
  const model = this.subject();
  assert.ok(!!model);
});
