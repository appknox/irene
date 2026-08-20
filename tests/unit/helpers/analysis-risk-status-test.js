import { module, test } from 'qunit';
import ENUMS from 'irene/enums';
import { analysisRiskStatus } from 'irene/helpers/analysis-risk-status';

module('Unit | Helper | analysis risk status', function () {
  test('it return risk status for completed analysis', function (assert) {
    const status = ENUMS.ANALYSIS.COMPLETED;

    const unknown = analysisRiskStatus([ENUMS.RISK.UNKNOWN, status]);
    assert.strictEqual(unknown.cssclass, 'is-default');
    assert.strictEqual(unknown.icon, 'fa-close');
    assert.strictEqual(unknown.label, 'Untested');

    const passed = analysisRiskStatus([ENUMS.RISK.NONE, status]);
    assert.strictEqual(passed.cssclass, 'is-success');
    assert.strictEqual(passed.icon, 'fa-check');
    assert.strictEqual(passed.label, 'Passed');

    const low = analysisRiskStatus([ENUMS.RISK.LOW, status]);
    assert.strictEqual(low.cssclass, 'is-info');
    assert.strictEqual(low.icon, 'fa-warning');
    assert.strictEqual(low.label, 'Low');

    const medium = analysisRiskStatus([ENUMS.RISK.MEDIUM, status]);
    assert.strictEqual(medium.cssclass, 'is-warning');
    assert.strictEqual(medium.icon, 'fa-warning');
    assert.strictEqual(medium.label, 'Medium');

    const high = analysisRiskStatus([ENUMS.RISK.HIGH, status]);
    assert.strictEqual(high.cssclass, 'is-danger');
    assert.strictEqual(high.icon, 'fa-warning');
    assert.strictEqual(high.label, 'High');

    const critical = analysisRiskStatus([ENUMS.RISK.CRITICAL, status]);
    assert.strictEqual(critical.cssclass, 'is-critical');
    assert.strictEqual(critical.icon, 'fa-warning');
    assert.strictEqual(critical.label, 'Critical');
  });

  test('it return error status for errored analysis', function (assert) {
    const riskStatus = analysisRiskStatus([
      ENUMS.RISK.UNKNOWN,
      ENUMS.ANALYSIS.ERROR,
    ]);

    assert.strictEqual(riskStatus.cssclass, 'is-errored');
    assert.strictEqual(riskStatus.icon, 'fa-warning');
    assert.strictEqual(riskStatus.label, 'Errored');
  });

  test('it return not-started status for waiting analysis', function (assert) {
    const riskStatus = analysisRiskStatus([
      ENUMS.RISK.UNKNOWN,
      ENUMS.ANALYSIS.WAITING,
    ]);

    assert.strictEqual(riskStatus.cssclass, 'is-waiting');
    assert.strictEqual(riskStatus.icon, 'fa-minus-circle');
    assert.strictEqual(riskStatus.label, 'Not started');
  });

  test('it return scanning status for running analysis', function (assert) {
    const riskStatus = analysisRiskStatus([
      ENUMS.RISK.UNKNOWN,
      ENUMS.ANALYSIS.RUNNING,
    ]);

    assert.strictEqual(riskStatus.cssclass, 'is-progress');
    assert.strictEqual(riskStatus.icon, 'fa-spinner fa-spin');
    assert.strictEqual(riskStatus.label, 'Scanning');
  });

  test('it return risk status if status param is empty', function (assert) {
    const riskStatus = analysisRiskStatus([ENUMS.RISK.UNKNOWN]);
    assert.strictEqual(riskStatus.cssclass, 'is-default');
    assert.strictEqual(riskStatus.icon, 'fa-close');
    assert.strictEqual(riskStatus.label, 'Untested');

    const undefinedStatus = analysisRiskStatus([ENUMS.RISK.UNKNOWN, undefined]);
    assert.strictEqual(undefinedStatus.cssclass, 'is-default');
    assert.strictEqual(undefinedStatus.icon, 'fa-close');
    assert.strictEqual(undefinedStatus.label, 'Untested');

    const emptyStrStatus = analysisRiskStatus([ENUMS.RISK.UNKNOWN, '']);
    assert.strictEqual(emptyStrStatus.cssclass, 'is-default');
    assert.strictEqual(emptyStrStatus.icon, 'fa-close');
    assert.strictEqual(emptyStrStatus.label, 'Untested');

    const nullStatus = analysisRiskStatus([ENUMS.RISK.UNKNOWN, null]);
    assert.strictEqual(nullStatus.cssclass, 'is-default');
    assert.strictEqual(nullStatus.icon, 'fa-close');
    assert.strictEqual(nullStatus.label, 'Untested');
  });

  test('it return empty if risk param is empty & completed status', function (assert) {
    const status = ENUMS.ANALYSIS.COMPLETED;

    const undefinedRisk = analysisRiskStatus([undefined, status]);
    assert.strictEqual(undefinedRisk.cssclass, '');
    assert.strictEqual(undefinedRisk.icon, '');
    assert.strictEqual(undefinedRisk.label, '');

    const emptyStrRisk = analysisRiskStatus(['', status]);
    assert.strictEqual(emptyStrRisk.cssclass, '');
    assert.strictEqual(emptyStrRisk.icon, '');
    assert.strictEqual(emptyStrRisk.label, '');

    const nullRisk = analysisRiskStatus([null, status]);
    assert.strictEqual(nullRisk.cssclass, '');
    assert.strictEqual(nullRisk.icon, '');
    assert.strictEqual(nullRisk.label, '');
  });

  test('it return status if risk param is empty & non-completed status', function (assert) {
    const status = ENUMS.ANALYSIS.ERROR;

    const undefinedRisk = analysisRiskStatus([undefined, status]);
    assert.strictEqual(undefinedRisk.cssclass, 'is-errored');
    assert.strictEqual(undefinedRisk.icon, 'fa-warning');
    assert.strictEqual(undefinedRisk.label, 'Errored');

    const emptyStrRisk = analysisRiskStatus(['', status]);
    assert.strictEqual(emptyStrRisk.cssclass, 'is-errored');
    assert.strictEqual(emptyStrRisk.icon, 'fa-warning');
    assert.strictEqual(emptyStrRisk.label, 'Errored');

    const nullRisk = analysisRiskStatus([null, status]);
    assert.strictEqual(nullRisk.cssclass, 'is-errored');
    assert.strictEqual(nullRisk.icon, 'fa-warning');
    assert.strictEqual(nullRisk.label, 'Errored');
  });

  test('it return empty values for invalid risk & invalid status', function (assert) {
    const invalidRiskStatus = analysisRiskStatus([5, 4]);
    assert.strictEqual(invalidRiskStatus.cssclass, '');
    assert.strictEqual(invalidRiskStatus.icon, '');
    assert.strictEqual(invalidRiskStatus.label, '');

    const invalidStatus2 = analysisRiskStatus([-2, -2]);
    assert.strictEqual(invalidStatus2.cssclass, '');
    assert.strictEqual(invalidStatus2.icon, '');
    assert.strictEqual(invalidStatus2.label, '');
  });

  test('it return empty values for valid risk & invalid status', function (assert) {
    const invalidStatus = analysisRiskStatus([ENUMS.RISK.UNKNOWN, -5]);
    assert.strictEqual(invalidStatus.cssclass, '');
    assert.strictEqual(invalidStatus.icon, '');
    assert.strictEqual(invalidStatus.label, '');
  });

  test('it return empty values for invalid risk & completed status', function (assert) {
    const invalidRiskCompletedStatus = analysisRiskStatus([
      -2,
      ENUMS.ANALYSIS.COMPLETED,
    ]);

    assert.strictEqual(invalidRiskCompletedStatus.cssclass, '');
    assert.strictEqual(invalidRiskCompletedStatus.icon, '');
    assert.strictEqual(invalidRiskCompletedStatus.label, '');
  });

  test('it return empty values for invalid risk & non-completed status', function (assert) {
    const invalidRiskErroredStatus = analysisRiskStatus([
      -2,
      ENUMS.ANALYSIS.ERROR,
    ]);
    assert.strictEqual(invalidRiskErroredStatus.cssclass, 'is-errored');
    assert.strictEqual(invalidRiskErroredStatus.icon, 'fa-warning');
    assert.strictEqual(invalidRiskErroredStatus.label, 'Errored');
  });

  test('it works for non integer inputs', function (assert) {
    const boolInput1 = analysisRiskStatus([true]);
    assert.strictEqual(boolInput1.cssclass, '');
    assert.strictEqual(boolInput1.icon, '');
    assert.strictEqual(boolInput1.label, '');

    const boolInput2 = analysisRiskStatus([true, false]);
    assert.strictEqual(boolInput2.cssclass, '');
    assert.strictEqual(boolInput2.icon, '');
    assert.strictEqual(boolInput2.label, '');

    const boolInput3 = analysisRiskStatus([true, ENUMS.ANALYSIS.COMPLETED]);
    assert.strictEqual(boolInput3.cssclass, '');
    assert.strictEqual(boolInput3.icon, '');
    assert.strictEqual(boolInput3.label, '');

    const objInput1 = analysisRiskStatus([{}]);
    assert.strictEqual(objInput1.cssclass, '');
    assert.strictEqual(objInput1.icon, '');
    assert.strictEqual(objInput1.label, '');

    const objInput2 = analysisRiskStatus([{}, ENUMS.ANALYSIS.COMPLETED]);
    assert.strictEqual(objInput2.cssclass, '');
    assert.strictEqual(objInput2.icon, '');
    assert.strictEqual(objInput2.label, '');
  });

  test('it works for empty input', function (assert) {
    const emptyInput = analysisRiskStatus([]);
    assert.strictEqual(emptyInput.cssclass, '');
    assert.strictEqual(emptyInput.icon, '');
    assert.strictEqual(emptyInput.label, '');
  });

  test('it return status for overriddenRisk with risk class & status label', function (assert) {
    const overriddenCriticalWaiting = analysisRiskStatus([
      ENUMS.RISK.CRITICAL,
      ENUMS.ANALYSIS.WAITING,
      true,
    ]);

    assert.strictEqual(overriddenCriticalWaiting.cssclass, 'is-critical');
    assert.strictEqual(overriddenCriticalWaiting.icon, 'fa-minus-circle');
    assert.strictEqual(overriddenCriticalWaiting.label, 'Not started');
  });

  test('it return status for overriddenRisk with status class & label if risk is invalid', function (assert) {
    const overriddenInvalidWaiting = analysisRiskStatus([
      -2,
      ENUMS.ANALYSIS.WAITING,
      true,
    ]);

    assert.strictEqual(overriddenInvalidWaiting.cssclass, 'is-waiting');
    assert.strictEqual(overriddenInvalidWaiting.icon, 'fa-minus-circle');
    assert.strictEqual(overriddenInvalidWaiting.label, 'Not started');
  });
});
