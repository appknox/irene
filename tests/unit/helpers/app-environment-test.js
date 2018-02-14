/*
 * DS102: Remove unnecessary code created because of implicit returns
 */
import { appEnvironment } from 'irene/helpers/app-environment';
import { module, test } from 'qunit';

module('Unit | Helper | app environment');

// Replace this with your real tests.
test('it works', function(assert) {
  const result = appEnvironment(42);
  return assert.ok(result);
});
