import { module, test } from 'qunit';

import { setupTest } from 'irene/tests/helpers';

module('Unit | Adapter | sk app', function (hooks) {
  setupTest(hooks);

  // Replace this with your real tests.
  test('it exists', function (assert) {
    let adapter = this.owner.lookup('adapter:sk-app');
    assert.ok(adapter);
  });
});
