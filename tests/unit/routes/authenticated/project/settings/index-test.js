import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | authenticated/project/settings/index', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    const route = this.owner.lookup(
      'route:authenticated/project/settings/index'
    );
    assert.ok(route);
  });
});
