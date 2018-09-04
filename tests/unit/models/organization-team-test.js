import { moduleForModel, test } from 'ember-qunit';

moduleForModel('organization-team', 'Unit | Model | organization team', {
  needs: [
    'model:organization-team',
    'model:user',
    'model:organization',
    'model:organization-team-member'
  ]
});

test('it exists', function(assert) {
  let model = this.subject();
  // let store = this.store();
  assert.ok(!!model);
});
