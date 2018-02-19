import { planDuration } from 'irene/helpers/plan-duration';
import { module, test } from 'qunit';

module('Unit | Helper | plan duration');

test('it works', function(assert) {
  const result = planDuration(42);
  assert.ok(result);
});
