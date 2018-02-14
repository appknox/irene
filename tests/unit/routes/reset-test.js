/*
 * DS102: Remove unnecessary code created because of implicit returns
 */
import { moduleFor, test } from 'ember-qunit';

moduleFor('route:reset', 'Unit | Route | reset', {
  // Specify the other units that are required for this test.
  // needs: ['controller:foo']
});

test('it exists', function(assert) {
  const route = this.subject();
  return assert.ok(route);
});
