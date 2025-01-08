import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | authenticated/security/file', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    assert.expect(1);

    let route = this.owner.lookup('route:authenticated/security/file');

    assert.ok(route);
  });
});
