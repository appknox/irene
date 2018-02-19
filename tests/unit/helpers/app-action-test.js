import { appAction } from 'irene/helpers/app-action';
import { module, test } from 'qunit';

module('Unit | Helper | app action');

test('it works', function(assert) {
  const result = appAction(42);
  assert.ok(result);
});
