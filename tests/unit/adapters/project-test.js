import {
  module,
  test
} from 'qunit';
import {
  setupTest
} from 'ember-qunit';

module('Unit | Adapter | project', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    console.log('promect test caled')
    const adapter = this.owner.lookup('adapter:application');
    assert.ok(adapter);
  });
});
