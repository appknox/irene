import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Unit | Route | authenticated/app-monitoring', function (hooks) {
  setupTest(hooks);

  test('app monitoring route exists', function (assert) {
    let route = this.owner.lookup('route:authenticated/app-monitoring');
    assert.ok(route, 'Route Exists');
  });
});
