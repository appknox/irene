import { moduleForModel, test } from 'ember-qunit';

moduleForModel('organization-user', 'Unit | Model | organization user', {
  needs: ['model:organization-user']
});

test('it exists', function(assert) {
  let model = this.subject();
  // let store = this.store();
  assert.ok(!!model);
});
