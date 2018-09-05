import { moduleForModel, test } from 'ember-qunit';

moduleForModel('organization-namespace', 'Unit | Model | organization namespace', {
  needs: [
    'model:organization',
    'model:organization-user'
  ]
});

test('it exists', function(assert) {
  const model = this.subject();
  assert.ok(!!model);
});
