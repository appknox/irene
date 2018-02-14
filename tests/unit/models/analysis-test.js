/*
 * DS102: Remove unnecessary code created because of implicit returns
 */
import { moduleForModel, test } from 'ember-qunit';

moduleForModel('analysis', 'Unit | Model | analysis', {
  // Specify the other units that are required for this test.
  needs: ['model:file', 'model:vulnerability']
});

test('it exists', function(assert) {
  const model = this.subject();
  // store = @store()
  return assert.ok(!!model);
});
