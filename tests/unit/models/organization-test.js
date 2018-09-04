import { moduleForModel, test } from 'ember-qunit';

moduleForModel('organization', 'Unit | Model | organization', {
  // Specify the other units that are required for this test.
  needs: [
    'model:user',
    'model:organization-team',
    'model:organization-member',
    'model:organization-project',
    'model:organization-namespace'
  ]
});

test('it exists', function(assert) {
  let model = this.subject();
  // let store = this.store();
  assert.ok(!!model);
});
