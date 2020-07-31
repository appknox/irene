import { module, test } from 'qunit';
import { filterPlatform, filterPlatformValues } from 'irene/helpers/filter-platform';

module('Unit | Helper | filter platform', function() {
  test('it works', function(assert) {
    assert.equal(filterPlatform([{key:1,reverse:true}]), "1-true", "Key/Reverse");


    assert.deepEqual(filterPlatformValues("1-true"), ["1", true], "Reverse False/2");
    assert.deepEqual(filterPlatformValues("2-false"), ["2", false], "Reverse False/2");
  });
});
