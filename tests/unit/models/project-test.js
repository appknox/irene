/*
 * DS102: Remove unnecessary code created because of implicit returns
 */
import { moduleForModel, test } from 'ember-qunit';

moduleForModel('project', 'Unit | Model | project', {
  // Specify the other units that are required for this test.
  needs: ["model:user", "model:file", "model:collaboration"]
});

test('it exists', function(assert) {
  const model = this.subject();
  // store = @store()
  return assert.ok(!!model);
});
