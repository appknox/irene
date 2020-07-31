import { module, test } from 'qunit';
import { isEqualTo } from 'irene/helpers/is-equal';

module('Unit | Helper | is equal', function() {
  test('it works', function(assert) {
    assert.equal(isEqualTo(["test","test"]), true, "LHS=RHS");
  });
});
