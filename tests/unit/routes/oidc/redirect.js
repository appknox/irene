import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | oidc/redirect', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    const route = this.owner.lookup('route:oidc/redirect');
    assert.ok(route);
  });
});
