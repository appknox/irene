import { roleHumanized } from 'irene/helpers/role-humanized';
import { module, test } from 'qunit';

module('Unit | Helper | role humanized');

test('it works', function(assert) {
  const result = roleHumanized(42);
  assert.ok(result);
});
