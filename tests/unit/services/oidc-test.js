import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Service | oidc', function (hooks) {
  setupTest(hooks);

  // TODO: Replace this with your real tests.
  test('it exists', function (assert) {
    let service = this.owner.lookup('service:oidc');
    assert.ok(service);
  });
});
