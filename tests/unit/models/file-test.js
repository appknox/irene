/*
 * DS102: Remove unnecessary code created because of implicit returns
 */
import { moduleForModel, test } from 'ember-qunit';

moduleForModel('file', 'Unit | Model | file', {
  // Specify the other units that are required for this test.
  needs: ['model:project', 'model:analysis', 'model:user']
});

test('it exists', function(assert) {
  const model = this.subject();
  // store = @store()
  return assert.ok(!!model);
});
