import { filterPlatform } from 'irene/helpers/filter-platform';
import { module, test } from 'qunit';

module('Unit | Helper | filter platform');

test('it works', function(assert) {
  const result = filterPlatform([{key:1,reverse:true}]);
  assert.ok(result);
});
