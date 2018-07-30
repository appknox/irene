import { moduleForModel, test } from 'ember-qunit';

moduleForModel('security/file', 'Unit | Model | security/file', {
  // Specify the other units that are required for this test.
  needs: [
    'model:user',
    'model:security/project',
    'model:security/analysis'
  ]
});

test('it exists', function(assert) {
  let model = this.subject();
  // let store = this.store();
  assert.ok(!!model);
});
