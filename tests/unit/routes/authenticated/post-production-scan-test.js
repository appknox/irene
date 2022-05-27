import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Unit | Route | authenticated/post-production-scan', function (hooks) {
  setupTest(hooks);

  test('post production scan route exists', function (assert) {
    let route = this.owner.lookup('route:authenticated/post-production-scan');
    assert.ok(route);
  });
});
