/*
 * DS102: Remove unnecessary code created because of implicit returns
 */
import { appAction } from 'irene/helpers/app-action';
import { module, test } from 'qunit';

module('Unit | Helper | app action');

// Replace this with your real tests.
test('it works', function(assert) {
  const result = appAction(42);
  return assert.ok(result);
});
