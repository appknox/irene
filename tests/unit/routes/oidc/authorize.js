import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | oidc/authorize', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    const route = this.owner.lookup('route:oidc/authorize');
    assert.ok(route);
  });
});
