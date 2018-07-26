import { moduleForModel, test } from 'ember-qunit';

moduleForModel('security/project', 'Unit | Model | security/project', {
  // Specify the other units that are required for this test.
  needs: [
    'model:user',
    'model:security/file'
  ]
});

test('it exists', function(assert) {
  let model = this.subject();
  // let store = this.store();
  assert.ok(!!model);
});
