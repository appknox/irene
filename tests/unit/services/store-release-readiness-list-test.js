import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Service | store-release-readiness-list', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    const service = this.owner.lookup('service:store-release-readiness-list');
    assert.ok(service);
  });
});
