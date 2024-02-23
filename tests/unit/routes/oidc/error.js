import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | oidc/error', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    const route = this.owner.lookup('route:oidc/error');
    assert.ok(route);
  });
});
