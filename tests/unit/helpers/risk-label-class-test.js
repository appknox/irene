
import { riskLabelClass } from 'irene/helpers/risk-label-class';
import { module, test } from 'qunit';

module('Unit | Helper | risk label class');

// Replace this with your real tests.
test('it works', function(assert) {
  let result = riskLabelClass([1]);
  assert.ok(result);
  assert.equal(result, `is-info`);
});
