import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Unit | Route | authenticated/production-scan', function (hooks) {
  setupTest(hooks);

  test('production scan route exists', function (assert) {
    let route = this.owner.lookup('route:authenticated/production-scan');
    assert.ok(route, 'Route Exists');
  });
});
