
import { manualScanStatus } from 'irene/helpers/manual-scan-status';
import { module, test } from 'qunit';
import ENUMS from 'irene/enums';

module('Unit | Helper | manual scan status', function() {
  test('it returns empty label for empty inputs', function(assert) {
    let empty = manualScanStatus([]);
    assert.equal(empty, '');

    let noInput = manualScanStatus();
    assert.equal(noInput, '');
  });

  test('it returns correct label for status none', function(assert) {
    let none = manualScanStatus([ENUMS.MANUAL.NONE]);
    assert.equal(none, 'Not started');
  });

  test('it returns correct label for status requested', function(assert) {
    let requested = manualScanStatus([ENUMS.MANUAL.REQUESTED]);
    assert.equal(requested, 'Requested');
  });

  test('it returns correct label for status assessing', function(assert) {
    let assessing = manualScanStatus([ENUMS.MANUAL.ASSESSING]);
    assert.equal(assessing, 'In progress');
  });

  test('it returns correct label for status done', function(assert) {
    let done = manualScanStatus([ENUMS.MANUAL.DONE]);
    assert.equal(done, 'Completed');
  });

  test('it supports both string & int status values', function(assert) {
    let intInput = manualScanStatus([0]);
    assert.equal(intInput, 'Not started');

    let strInput = manualScanStatus(['0']);
    assert.equal(strInput, 'Not started');
  });

  test('it returns empty label for invalid inputs', function(assert) {
    let unknown = manualScanStatus([ENUMS.MANUAL.UNKNOWN]);
    assert.equal(unknown, '');

    let randomVal = manualScanStatus([5]);
    assert.equal(randomVal, '');

    let none = manualScanStatus([true]);
    assert.equal(none, '');

    let undef = manualScanStatus([undefined]);
    assert.equal(undef, '');

    let obj = manualScanStatus([{}]);
    assert.equal(obj, '');
  });
});
