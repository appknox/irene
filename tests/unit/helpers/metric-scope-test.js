/* eslint-disable prettier/prettier */

import { metricScope } from 'irene/helpers/metric-scope';
import { module, test } from 'qunit';

module('Unit | Helper | metric scope', function() {
  // Replace this with your real tests.
  test('it works', function(assert) {
    let result = metricScope([42]);
    assert.ok(result);
  });
});
