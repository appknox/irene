import { module, test } from 'qunit';

import { setupTest } from 'irene/tests/helpers';

module('Unit | Adapter | commondrf nested', function (hooks) {
  setupTest(hooks);

  // Replace this with your real tests.
  test('it exists', function (assert) {
    let adapter = this.owner.lookup('adapter:commondrf-nested');
    assert.ok(adapter);
  });
});
