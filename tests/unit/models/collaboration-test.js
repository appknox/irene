/*
 * DS102: Remove unnecessary code created because of implicit returns
 */
import { moduleForModel, test } from 'ember-qunit';

moduleForModel('collaboration', 'Unit | Model | collaboration', {
  // Specify the other units that are required for this test.
  needs: ['model:project', 'model:user', 'model:team']
});

test('it exists', function(assert) {
  const model = this.subject();
  // store = @store()
  return assert.ok(!!model);
});
