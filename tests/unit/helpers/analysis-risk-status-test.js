/* eslint-disable prettier/prettier, qunit/no-assert-equal */
import { module, test } from 'qunit';
import ENUMS from 'irene/enums';
import { analysisRiskStatus } from 'irene/helpers/analysis-risk-status';


module('Unit | Helper | analysis risk status', function() {
  test('it return risk status for completed analysis', function(assert) {
    const status = ENUMS.ANALYSIS.COMPLETED;

    let unknown = analysisRiskStatus([ENUMS.RISK.UNKNOWN, status]);
    assert.equal(unknown.cssclass, 'is-default');
    assert.equal(unknown.icon, 'close');
    assert.equal(unknown.label, 'Untested');

    let passed = analysisRiskStatus([ENUMS.RISK.NONE, status]);
    assert.equal(passed.cssclass, 'is-success');
    assert.equal(passed.icon, 'done');
    assert.equal(passed.label, 'Passed');

    let low = analysisRiskStatus([ENUMS.RISK.LOW, status]);
    assert.equal(low.cssclass, 'is-info');
    assert.equal(low.icon, 'warning');
    assert.equal(low.label, 'Low');

    let medium = analysisRiskStatus([ENUMS.RISK.MEDIUM, status]);
    assert.equal(medium.cssclass, 'is-warning');
    assert.equal(medium.icon, 'warning');
    assert.equal(medium.label, 'Medium');

    let high = analysisRiskStatus([ENUMS.RISK.HIGH, status]);
    assert.equal(high.cssclass, 'is-danger');
    assert.equal(high.icon, 'warning');
    assert.equal(high.label, 'High');

    let critical = analysisRiskStatus([ENUMS.RISK.CRITICAL, status]);
    assert.equal(critical.cssclass, 'is-critical');
    assert.equal(critical.icon, 'warning');
    assert.equal(critical.label, 'Critical');
  });

  test('it return error status for errored analysis', function(assert) {
    let riskStatus = analysisRiskStatus([ENUMS.RISK.UNKNOWN, ENUMS.ANALYSIS.ERROR]);
    assert.equal(riskStatus.cssclass, 'is-errored');
    assert.equal(riskStatus.icon, 'warning');
    assert.equal(riskStatus.label, 'Errored');
  });

  test('it return not-started status for waiting analysis', function(assert) {
    let riskStatus = analysisRiskStatus([ENUMS.RISK.UNKNOWN, ENUMS.ANALYSIS.WAITING]);
    assert.equal(riskStatus.cssclass, 'is-waiting');
    assert.equal(riskStatus.icon, 'remove-circle');
    assert.equal(riskStatus.label, 'Not started');
  });

  test('it return scanning status for running analysis', function(assert) {
    let riskStatus = analysisRiskStatus([ENUMS.RISK.UNKNOWN, ENUMS.ANALYSIS.RUNNING]);
    assert.equal(riskStatus.cssclass, 'is-progress');
    assert.equal(riskStatus.icon, 'loader');
    assert.equal(riskStatus.label, 'Scanning');
  });

  test('it return risk status if status param is empty', function(assert) {
    let riskStatus = analysisRiskStatus([ENUMS.RISK.UNKNOWN]);
    assert.equal(riskStatus.cssclass, 'is-default');
    assert.equal(riskStatus.icon, 'close');
    assert.equal(riskStatus.label, 'Untested');

    let undefinedStatus = analysisRiskStatus([ENUMS.RISK.UNKNOWN, undefined]);
    assert.equal(undefinedStatus.cssclass, 'is-default');
    assert.equal(undefinedStatus.icon, 'close');
    assert.equal(undefinedStatus.label, 'Untested');

    let emptyStrStatus = analysisRiskStatus([ENUMS.RISK.UNKNOWN, '']);
    assert.equal(emptyStrStatus.cssclass, 'is-default');
    assert.equal(emptyStrStatus.icon, 'close');
    assert.equal(emptyStrStatus.label, 'Untested');

    let nullStatus = analysisRiskStatus([ENUMS.RISK.UNKNOWN, null]);
    assert.equal(nullStatus.cssclass, 'is-default');
    assert.equal(nullStatus.icon, 'close');
    assert.equal(nullStatus.label, 'Untested');
  });

  test('it return empty if risk param is empty & completed status', function(assert) {
    const status = ENUMS.ANALYSIS.COMPLETED;

    let undefinedRisk = analysisRiskStatus([undefined, status]);
    assert.equal(undefinedRisk.cssclass, '');
    assert.equal(undefinedRisk.icon, '');
    assert.equal(undefinedRisk.label, '');

    let emptyStrRisk = analysisRiskStatus(['', status]);
    assert.equal(emptyStrRisk.cssclass, '');
    assert.equal(emptyStrRisk.icon, '');
    assert.equal(emptyStrRisk.label, '');

    let nullRisk = analysisRiskStatus([null, status]);
    assert.equal(nullRisk.cssclass, '');
    assert.equal(nullRisk.icon, '');
    assert.equal(nullRisk.label, '');
  });

  test('it return status if risk param is empty & non-completed status', function(assert) {
    const status = ENUMS.ANALYSIS.ERROR;

    let undefinedRisk = analysisRiskStatus([undefined, status]);
    assert.equal(undefinedRisk.cssclass, 'is-errored');
    assert.equal(undefinedRisk.icon, 'warning');
    assert.equal(undefinedRisk.label, 'Errored');

    let emptyStrRisk = analysisRiskStatus(['', status]);
    assert.equal(emptyStrRisk.cssclass, 'is-errored');
    assert.equal(emptyStrRisk.icon, 'warning');
    assert.equal(emptyStrRisk.label, 'Errored');

    let nullRisk = analysisRiskStatus([null, status]);
    assert.equal(nullRisk.cssclass, 'is-errored');
    assert.equal(nullRisk.icon, 'warning');
    assert.equal(nullRisk.label, 'Errored');
  });

  test('it return empty values for invalid risk & invalid status', function(assert) {
    let invalidRiskStatus = analysisRiskStatus([5, 4]);
    assert.equal(invalidRiskStatus.cssclass, '');
    assert.equal(invalidRiskStatus.icon, '');
    assert.equal(invalidRiskStatus.label, '');

    let invalidStatus2 = analysisRiskStatus([-2, -2]);
    assert.equal(invalidStatus2.cssclass, '');
    assert.equal(invalidStatus2.icon, '');
    assert.equal(invalidStatus2.label, '');
  });

  test('it return empty values for valid risk & invalid status', function(assert) {
    let invalidStatus = analysisRiskStatus([ENUMS.RISK.UNKNOWN, -5]);
    assert.equal(invalidStatus.cssclass, '');
    assert.equal(invalidStatus.icon, '');
    assert.equal(invalidStatus.label, '');
  });

  test('it return empty values for invalid risk & completed status', function(assert) {
    let invalidRiskCompletedStatus = analysisRiskStatus([-2, ENUMS.ANALYSIS.COMPLETED]);
    assert.equal(invalidRiskCompletedStatus.cssclass, '');
    assert.equal(invalidRiskCompletedStatus.icon, '');
    assert.equal(invalidRiskCompletedStatus.label, '');
  });

  test('it return empty values for invalid risk & non-completed status', function(assert) {
    let invalidRiskErroredStatus = analysisRiskStatus([-2, ENUMS.ANALYSIS.ERROR]);
    assert.equal(invalidRiskErroredStatus.cssclass, 'is-errored');
    assert.equal(invalidRiskErroredStatus.icon, 'warning');
    assert.equal(invalidRiskErroredStatus.label, 'Errored');
  });

  test('it works for non integer inputs', function(assert) {
    let boolInput1 = analysisRiskStatus([true]);
    assert.equal(boolInput1.cssclass, '');
    assert.equal(boolInput1.icon, '');
    assert.equal(boolInput1.label, '');

    let boolInput2 = analysisRiskStatus([true, false]);
    assert.equal(boolInput2.cssclass, '');
    assert.equal(boolInput2.icon, '');
    assert.equal(boolInput2.label, '');

    let boolInput3 = analysisRiskStatus([true, ENUMS.ANALYSIS.COMPLETED]);
    assert.equal(boolInput3.cssclass, '');
    assert.equal(boolInput3.icon, '');
    assert.equal(boolInput3.label, '');

    let objInput1 = analysisRiskStatus([{}]);
    assert.equal(objInput1.cssclass, '');
    assert.equal(objInput1.icon, '');
    assert.equal(objInput1.label, '');

    let objInput2 = analysisRiskStatus([{}, ENUMS.ANALYSIS.COMPLETED]);
    assert.equal(objInput2.cssclass, '');
    assert.equal(objInput2.icon, '');
    assert.equal(objInput2.label, '');
  });

  test('it works for empty input', function(assert) {
    let emptyInput = analysisRiskStatus([]);
    assert.equal(emptyInput.cssclass, '');
    assert.equal(emptyInput.icon, '');
    assert.equal(emptyInput.label, '');
  });

  test('it return status for overriddenRisk with risk class & status label', function(assert) {
    let overriddenCriticalWaiting = analysisRiskStatus([ENUMS.RISK.CRITICAL, ENUMS.ANALYSIS.WAITING, true]);
    assert.equal(overriddenCriticalWaiting.cssclass, 'is-critical');
    assert.equal(overriddenCriticalWaiting.icon, 'remove-circle');
    assert.equal(overriddenCriticalWaiting.label, 'Not started');
  });

  test('it return status for overriddenRisk with status class & label if risk is invalid', function(assert) {
    let overriddenInvalidWaiting = analysisRiskStatus([-2, ENUMS.ANALYSIS.WAITING, true]);
    assert.equal(overriddenInvalidWaiting.cssclass, 'is-waiting');
    assert.equal(overriddenInvalidWaiting.icon, 'remove-circle');
    assert.equal(overriddenInvalidWaiting.label, 'Not started');
  });
});