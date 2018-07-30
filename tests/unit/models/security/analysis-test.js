import { moduleForModel, test } from 'ember-qunit';

moduleForModel('security/analysis', 'Unit | Model | security/analysis', {
  // Specify the other units that are required for this test.
  needs: [
    'model:security/file',
    'model:owasp',
    'model:pcidss',
    'model:security/attachment',
    'model:security/vulnerability'
  ]
});

test('it exists', function(assert) {
  let model = this.subject();
  // let store = this.store();
  assert.ok(!!model);
});
