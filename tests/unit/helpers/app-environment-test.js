import { appEnvironment } from 'irene/helpers/app-environment';
import { module, test } from 'qunit';

module('Unit | Helper | app environment');

test('it works', function(assert) {
  const result = appEnvironment(42);
  assert.ok(result);
});
