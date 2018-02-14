/*
 * DS102: Remove unnecessary code created because of implicit returns
 */
import { moduleForModel, test } from 'ember-qunit';

moduleForModel('team', 'Unit | Model | team', {
  // Specify the other units that are required for this test.
  needs: ["model:team", "model:user", "model:collaboration"]
});

test('it exists', function(assert) {
  const model = this.subject();
  // store = @store()
  return assert.ok(!!model);
});
