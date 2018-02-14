/*
 * DS102: Remove unnecessary code created because of implicit returns
 */
import { moduleForModel, test } from 'ember-qunit';

moduleForModel('personaltoken', 'Unit | Model | personaltoken', {
  // Specify the other units that are required for this test.
  needs: []
});

test('it exists', function(assert) {
  const model = this.subject();
  // store = @store()
  return assert.ok(!!model);
});
