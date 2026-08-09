import { module, test } from 'qunit';

import { setupTest } from 'ember-qunit';

module('Unit | Adapter | store-release-readiness-scan', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    let adapter = this.owner.lookup('adapter:store-release-readiness-scan');
    assert.ok(adapter);
  });
});
