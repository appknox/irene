import { module, test } from 'qunit';

import apiMethodChipColor from 'irene/utils/api-method-chip-color';

module('Unit | Utility | api-method-chip-color', function () {
  test.each(
    'it maps each known method to its chip color',
    [
      ['GET', 'info'],
      ['POST', 'success'],
      ['PUT', 'warn'],
      ['PATCH', 'secondary'],
      ['DELETE', 'error'],
    ],
    function (assert, [method, color]) {
      assert.strictEqual(apiMethodChipColor(method), color);
    }
  );

  test('it ignores the case of the method', function (assert) {
    assert.strictEqual(apiMethodChipColor('get'), 'info');
    assert.strictEqual(apiMethodChipColor('Delete'), 'error');
  });

  test.each(
    'it falls back to the default color',
    [['OPTIONS'], [''], [undefined]],
    function (assert, [method]) {
      assert.strictEqual(apiMethodChipColor(method), 'default');
    }
  );
});
