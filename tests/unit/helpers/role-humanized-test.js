/*
 * DS102: Remove unnecessary code created because of implicit returns
 */
import { roleHumanized } from 'irene/helpers/role-humanized';
import { module, test } from 'qunit';

module('Unit | Helper | role humanized');

// Replace this with your real tests.
test('it works', function(assert) {
  const result = roleHumanized(42);
  return assert.ok(result);
});
