import { paginateClass } from 'irene/helpers/paginate-class';
import { module, test } from 'qunit';

module('Unit | Helper | paginate class');

test('it works', function(assert) {
  const result = paginateClass([{offset:1,page:12}]);
  assert.ok(result);
});
