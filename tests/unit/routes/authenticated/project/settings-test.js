/*
 * DS102: Remove unnecessary code created because of implicit returns
 */
import { moduleFor, test } from 'ember-qunit';

moduleFor('route:authenticated/project/settings', 'Unit | Route | authenticated/project/settings', {
  // Specify the other units that are required for this test.
  // needs: ['controller:foo']
});

test('it exists', function(assert) {
  const route = this.subject();
  return assert.ok(route);
});
