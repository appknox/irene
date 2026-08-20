import { analysisStatus } from 'irene/helpers/analysis-status';
import { module, test } from 'qunit';

module('Unit | Helper | analysis status', function () {
  // Replace this with your real tests.
  test('it works', function (assert) {
    const result = analysisStatus([42]);
    assert.strictEqual(result, '');
  });
});
