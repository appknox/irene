/* eslint-disable prettier/prettier, qunit/no-assert-equal */

import { riskLabelClass } from 'irene/helpers/risk-label-class';
import { module, test } from 'qunit';

module('Unit | Helper | risk label class', function() {
  test('it return correct class for valid risks', function(assert) {
    let unknown = riskLabelClass([-1]);
    assert.equal(unknown, 'is-default');

    let passed = riskLabelClass([0]);
    assert.equal(passed, 'is-success');

    let low = riskLabelClass([1]);
    assert.equal(low, 'is-info');

    let medium = riskLabelClass([2]);
    assert.equal(medium, 'is-warning');

    let high = riskLabelClass([3]);
    assert.equal(high, 'is-danger');

    let critical = riskLabelClass([4]);
    assert.equal(critical, 'is-critical');
  });

  test('it works for invalid risk values', function(assert) {
    let invalid1 = riskLabelClass([5]);
    assert.equal(invalid1, '');

    let invalid2 = riskLabelClass([-2]);
    assert.equal(invalid2, '');
  });

  test('it works for non integer inputs', function(assert) {
    let boolInput = riskLabelClass([true]);
    assert.equal(boolInput, '');

    let objInput = riskLabelClass([{}]);
    assert.equal(objInput, '');
  });

  test('it works for empty input', function(assert) {
    let nullInput = riskLabelClass([]);
    assert.equal(nullInput, '');
  });
});
