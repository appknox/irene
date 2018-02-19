import { deviceType } from 'irene/helpers/device-type';
import { module, test } from 'qunit';

module('Unit | Helper | device type');

test('it works', function(assert) {
  const result = deviceType(42);
  assert.ok(result);
});
