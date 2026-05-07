import { module, test } from 'qunit';

import { setupTest } from 'ember-qunit';

module('Unit | Adapter | store-release-readiness-finding', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    let adapter = this.owner.lookup('adapter:store-release-readiness-finding');
    assert.ok(adapter);
  });
});
