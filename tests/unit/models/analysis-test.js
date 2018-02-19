import { moduleForModel, test } from 'ember-qunit';

moduleForModel('analysis', 'Unit | Model | analysis', {

  needs: ['model:file', 'model:vulnerability']
});

test('it exists', function(assert) {
  const model = this.subject();
  assert.ok(!!model);
});
