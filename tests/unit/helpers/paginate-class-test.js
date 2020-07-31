import { module, test } from 'qunit';
import { paginateClass } from 'irene/helpers/paginate-class';

module('Unit | Helper | paginate class', function() {
  test('it works', function(assert) {
    assert.equal(paginateClass([1,12]), "is-default", "Default");
    assert.equal(paginateClass([1,1]), "is-primary", "Primary");
  });
});
